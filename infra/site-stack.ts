import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  Stack,
  CfnOutput,
  Duration,
  RemovalPolicy,
  type StackProps,
  aws_s3 as s3,
  aws_cloudfront as cf,
  aws_cloudfront_origins as origins,
  aws_lambda as lambda,
  aws_lambda_nodejs as nodejs,
  aws_logs as logs,
  aws_apigatewayv2 as apigw,
  aws_apigatewayv2_integrations as integrations,
  aws_iam as iam,
  aws_budgets as budgets,
} from 'aws-cdk-lib';
import type { Construct } from 'constructs';

export const sliceNames = ['profile', 'projects', 'insights'] as const;
export const appNames = ['shell', ...sliceNames] as const;
export interface SiteProps extends StackProps {
  budgetEmail?: string;
}

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteProps = {}) {
    super(scope, id, props);
    const rewrite = new cf.Function(this, 'SpaRoutes', {
      code: cf.FunctionCode.fromInline(
        readFileSync(resolve('infra/spa-rewrite.js'), 'utf8'),
      ),
      runtime: cf.FunctionRuntime.JS_2_0,
    });
    const headers = new cf.ResponseHeadersPolicy(this, 'Headers', {
      securityHeadersBehavior: {
        contentTypeOptions: { override: true },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.days(365),
          includeSubdomains: true,
          override: true,
        },
        frameOptions: {
          frameOption: cf.HeadersFrameOption.DENY,
          override: true,
        },
        referrerPolicy: {
          referrerPolicy:
            cf.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
      },
      // Federation needs cross-origin script/manifest access. These are public, read-only assets.
      corsBehavior: {
        accessControlAllowCredentials: false,
        accessControlAllowHeaders: ['*'],
        accessControlAllowMethods: ['GET', 'HEAD', 'OPTIONS'],
        accessControlAllowOrigins: ['*'],
        originOverride: true,
      },
    });
    const sites = Object.fromEntries(
      appNames.map((name) => {
        const bucket = new s3.Bucket(this, name + 'Assets', {
          bucketName: `evan-hyer-site-${this.account}-${this.region}-${name}`,
          blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
          encryption: s3.BucketEncryption.S3_MANAGED,
          enforceSSL: true,
          objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
          versioned: true,
          removalPolicy: RemovalPolicy.RETAIN,
          lifecycleRules: [
            {
              noncurrentVersionExpiration: Duration.days(30),
              abortIncompleteMultipartUploadAfter: Duration.days(1),
            },
          ],
        });
        const distribution = new cf.Distribution(this, name + 'Cdn', {
          defaultRootObject: 'index.html',
          priceClass: cf.PriceClass.PRICE_CLASS_100,
          defaultBehavior: {
            origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
            viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: cf.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            // Respect upload Cache-Control, with zero default TTL for manifests/config/HTML.
            cachePolicy: new cf.CachePolicy(this, name + 'Cache', {
              minTtl: Duration.seconds(0),
              defaultTtl: Duration.seconds(0),
              maxTtl: Duration.days(365),
              enableAcceptEncodingGzip: true,
              enableAcceptEncodingBrotli: true,
            }),
            responseHeadersPolicy: headers,
            functionAssociations: [
              {
                function: rewrite,
                eventType: cf.FunctionEventType.VIEWER_REQUEST,
              },
            ],
            compress: true,
          },
        });
        new CfnOutput(this, name + 'Bucket', { value: bucket.bucketName });
        new CfnOutput(this, name + 'Distribution', {
          value: distribution.distributionId,
        });
        new CfnOutput(this, name + 'Url', {
          value: 'https://' + distribution.distributionDomainName,
        });
        return [name, { bucket, distribution }];
      }),
    ) as Record<
      (typeof appNames)[number],
      { bucket: s3.Bucket; distribution: cf.Distribution }
    >;

    for (const name of sliceNames) {
      const allowedOrigins = [
        'https://' + sites.shell.distribution.distributionDomainName,
        'https://' + sites[name].distribution.distributionDomainName,
      ];
      const logGroup = new logs.LogGroup(this, name + 'Logs', {
        logGroupName: '/aws/lambda/evan-hyer-site-' + name,
        retention: logs.RetentionDays.ONE_WEEK,
        removalPolicy: RemovalPolicy.DESTROY,
      });
      const role = new iam.Role(this, name + 'RuntimeRole', {
        roleName: 'evan-hyer-site-' + name + '-runtime',
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      });
      logGroup.grantWrite(role);
      const fn = new nodejs.NodejsFunction(this, name + 'Bff', {
        functionName: 'evan-hyer-site-' + name,
        entry: resolve('slices', name, 'bff/lambda.ts'),
        runtime: lambda.Runtime.NODEJS_24_X,
        architecture: lambda.Architecture.ARM_64,
        memorySize: 256,
        timeout: Duration.seconds(10),
        role,
        logGroup,
        environment: {
          NODE_ENV: 'production',
          CORS_ORIGINS: allowedOrigins.join(','),
        },
        bundling: {
          target: 'node24',
          minify: true,
          sourceMap: false,
          externalModules: [],
        },
      });
      const api = new apigw.HttpApi(this, name + 'Api', {
        apiName: 'evan-hyer-site-' + name,
        defaultIntegration: new integrations.HttpLambdaIntegration(
          name + 'Integration',
          fn,
        ),
        corsPreflight: {
          allowOrigins: allowedOrigins,
          allowMethods: [
            apigw.CorsHttpMethod.GET,
            apigw.CorsHttpMethod.HEAD,
            apigw.CorsHttpMethod.OPTIONS,
          ],
          allowHeaders: ['content-type'],
          maxAge: Duration.hours(1),
        },
      });
      const stage = api.defaultStage!.node.defaultChild as apigw.CfnStage;
      stage.defaultRouteSettings = {
        throttlingBurstLimit: 5,
        throttlingRateLimit: 2,
        detailedMetricsEnabled: false,
      };
      new CfnOutput(this, name + 'ApiUrl', { value: api.apiEndpoint });
    }
    // Created by the separately bootstrapped identity stack; no cross-stack cycle.
    const publisher = iam.Role.fromRoleName(
      this,
      'Publisher',
      'evan-hyer-site-github',
    );
    const publishPolicy = new iam.Policy(this, 'PublishPolicy', {
      statements: appNames.flatMap((name) => [
        new iam.PolicyStatement({
          actions: ['s3:ListBucket'],
          resources: [sites[name].bucket.bucketArn],
        }),
        new iam.PolicyStatement({
          actions: ['s3:GetObject', 's3:PutObject'],
          resources: [sites[name].bucket.arnForObjects('*')],
        }),
        new iam.PolicyStatement({
          actions: [
            'cloudfront:CreateInvalidation',
            'cloudfront:GetInvalidation',
          ],
          resources: [sites[name].distribution.distributionArn],
        }),
      ]),
    });
    publisher.attachInlinePolicy(publishPolicy);
    if (props.budgetEmail) {
      new budgets.CfnBudget(this, 'MonthlyBudget', {
        budget: {
          budgetName: 'evan-hyer-site-account-monthly',
          budgetType: 'COST',
          timeUnit: 'MONTHLY',
          budgetLimit: { amount: 5, unit: 'USD' },
        },
        notificationsWithSubscribers: [50, 100].map((threshold) => ({
          notification: {
            comparisonOperator: 'GREATER_THAN',
            notificationType: 'ACTUAL',
            threshold,
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [
            { subscriptionType: 'EMAIL', address: props.budgetEmail! },
          ],
        })),
      });
    }
  }
}
