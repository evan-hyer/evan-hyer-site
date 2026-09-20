import { test } from 'node:test';
import assert from 'node:assert/strict';
import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { SiteStack } from '../../infra/site-stack';
import { IdentityStack } from '../../infra/identity-stack';
const app = new App();
const env = { account: '111111111111', region: 'us-east-1' };
const site = Template.fromStack(
  new SiteStack(app, 'TestSite', { env, budgetEmail: 'budget@example.com' }),
);
const identity = Template.fromStack(
  new IdentityStack(new App(), 'TestIdentity', { env }),
);
test('all four origins are retained, encrypted private buckets accessed through OAC', () => {
  site.resourceCountIs('AWS::S3::Bucket', 4);
  site.resourceCountIs('AWS::CloudFront::OriginAccessControl', 4);
  for (const bucket of Object.values(site.findResources('AWS::S3::Bucket'))) {
    assert.equal(bucket.DeletionPolicy, 'Retain');
    assert.deepEqual(bucket.Properties.PublicAccessBlockConfiguration, {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    });
    assert.equal(
      bucket.Properties.BucketEncryption.ServerSideEncryptionConfiguration[0]
        .ServerSideEncryptionByDefault.SSEAlgorithm,
      'AES256',
    );
    assert.equal(bucket.Properties.VersioningConfiguration.Status, 'Enabled');
    assert.equal(bucket.Properties.WebsiteConfiguration, undefined);
  }
  for (const policy of Object.values(
    site.findResources('AWS::S3::BucketPolicy'),
  )) {
    const statements = policy.Properties.PolicyDocument.Statement;
    assert.ok(
      statements.some(
        (s: any) =>
          s.Effect === 'Deny' &&
          s.Condition?.Bool?.['aws:SecureTransport'] === 'false',
      ),
    );
    assert.ok(
      statements.some(
        (s: any) =>
          s.Principal?.Service === 'cloudfront.amazonaws.com' &&
          s.Condition?.StringEquals?.['AWS:SourceArn'],
      ),
    );
    assert.ok(
      !statements.some((s: any) => s.Effect === 'Allow' && s.Principal === '*'),
    );
  }
});
test('CDNs redirect HTTPS, have no blanket error fallback, and respect mutable asset freshness', () => {
  site.resourceCountIs('AWS::CloudFront::Distribution', 4);
  for (const item of Object.values(
    site.findResources('AWS::CloudFront::Distribution'),
  )) {
    const config = item.Properties.DistributionConfig;
    assert.equal(
      config.DefaultCacheBehavior.ViewerProtocolPolicy,
      'redirect-to-https',
    );
    assert.equal(config.CustomErrorResponses, undefined);
    assert.equal(config.PriceClass, 'PriceClass_100');
    assert.ok(config.Origins[0].OriginAccessControlId);
  }
  for (const item of Object.values(
    site.findResources('AWS::CloudFront::CachePolicy'),
  )) {
    assert.equal(item.Properties.CachePolicyConfig.MinTTL, 0);
    assert.equal(item.Properties.CachePolicyConfig.DefaultTTL, 0);
  }
});
test('APIs use bounded serverless compute, restricted CORS, short log retention, and throttling', () => {
  site.resourceCountIs('AWS::Lambda::Function', 3);
  site.resourceCountIs('AWS::ApiGatewayV2::Api', 3);
  for (const item of Object.values(
    site.findResources('AWS::Lambda::Function'),
  )) {
    assert.equal(item.Properties.Runtime, 'nodejs24.x');
    assert.deepEqual(item.Properties.Architectures, ['arm64']);
    assert.equal(item.Properties.Timeout, 10);
    assert.equal(item.Properties.MemorySize, 256);
    assert.equal(item.Properties.VpcConfig, undefined);
    assert.equal(item.Properties.Environment.Variables.NODE_ENV, 'production');
  }
  for (const item of Object.values(
    site.findResources('AWS::ApiGatewayV2::Api'),
  )) {
    assert.equal(item.Properties.ProtocolType, 'HTTP');
    assert.equal(item.Properties.CorsConfiguration.AllowOrigins.length, 2);
    assert.ok(
      !JSON.stringify(item.Properties.CorsConfiguration).includes('localhost'),
    );
    assert.deepEqual(item.Properties.CorsConfiguration.AllowMethods, [
      'GET',
      'HEAD',
      'OPTIONS',
    ]);
  }
  for (const item of Object.values(
    site.findResources('AWS::ApiGatewayV2::Stage'),
  ))
    assert.deepEqual(item.Properties.DefaultRouteSettings, {
      DetailedMetricsEnabled: false,
      ThrottlingBurstLimit: 5,
      ThrottlingRateLimit: 2,
    });
  for (const item of Object.values(site.findResources('AWS::Logs::LogGroup')))
    assert.equal(item.Properties.RetentionInDays, 7);
  for (const kind of [
    'AWS::EC2::VPC',
    'AWS::EC2::NatGateway',
    'AWS::RDS::DBInstance',
    'AWS::ElasticLoadBalancingV2::LoadBalancer',
  ])
    site.resourceCountIs(kind, 0);
});
test('budget notifications are account-wide at 50 and 100 percent of five dollars', () => {
  site.hasResourceProperties('AWS::Budgets::Budget', {
    Budget: {
      BudgetLimit: { Amount: 5, Unit: 'USD' },
      BudgetType: 'COST',
      TimeUnit: 'MONTHLY',
    },
    NotificationsWithSubscribers: Match.arrayWith([
      Match.objectLike({ Notification: Match.objectLike({ Threshold: 50 }) }),
      Match.objectLike({ Notification: Match.objectLike({ Threshold: 100 }) }),
    ]),
  });
});
test('GitHub trust requires the exact repository, production environment, and STS audience', () => {
  identity.hasResourceProperties('AWS::IAM::Role', {
    RoleName: 'evan-hyer-site-github',
    AssumeRolePolicyDocument: {
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: 'sts:AssumeRoleWithWebIdentity',
          Condition: {
            StringEquals: {
              'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
              'token.actions.githubusercontent.com:sub':
                'repo:evan-hyer/evan-hyer-site:environment:production',
            },
          },
        }),
      ]),
    },
  });
  const policies = Object.values(identity.findResources('AWS::IAM::Policy'));
  assert.equal(policies.length, 1);
  assert.deepEqual(
    policies[0].Properties.PolicyDocument.Statement[0].Action,
    'sts:AssumeRole',
  );
  assert.equal(
    policies[0].Properties.PolicyDocument.Statement[0].Resource.length,
    3,
  );
  assert.ok(!JSON.stringify(identity.toJSON()).includes('AdministratorAccess'));
});
test('publication grants are confined to the four buckets and distributions, with no delete permission', () => {
  const publish = Object.values(site.findResources('AWS::IAM::Policy')).find(
    (item) =>
      JSON.stringify(item.Properties.Roles).includes('evan-hyer-site-github'),
  )!;
  assert.ok(publish);
  const document = JSON.stringify(publish.Properties.PolicyDocument);
  assert.ok(!document.includes('s3:DeleteObject'));
  assert.ok(!document.includes('"Resource":"*"'));
  assert.ok(document.includes('cloudfront:CreateInvalidation'));
});
test('an existing GitHub OIDC provider is imported without creating another', () => {
  const template = Template.fromStack(
    new IdentityStack(new App(), 'ImportedIdentity', {
      env,
      existingProviderArn:
        'arn:aws:iam::111111111111:oidc-provider/token.actions.githubusercontent.com',
    }),
  );
  template.resourceCountIs('AWS::IAM::OIDCProvider', 0);
});
