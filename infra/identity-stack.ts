import {
  Stack,
  CfnOutput,
  Duration,
  aws_iam as iam,
  type StackProps,
} from 'aws-cdk-lib';
import type { Construct } from 'constructs';
export interface IdentityProps extends StackProps {
  existingProviderArn?: string;
}
export class IdentityStack extends Stack {
  constructor(scope: Construct, id: string, props: IdentityProps = {}) {
    super(scope, id, props);
    const providerArn =
      props.existingProviderArn ||
      new iam.CfnOIDCProvider(this, 'GitHubProvider', {
        url: 'https://token.actions.githubusercontent.com',
        clientIdList: ['sts.amazonaws.com'],
      }).attrArn;
    const provider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GitHub',
      providerArn,
    );
    const role = new iam.Role(this, 'DeploymentRole', {
      roleName: 'evan-hyer-site-github',
      maxSessionDuration: Duration.hours(1),
      assumedBy: new iam.OpenIdConnectPrincipal(provider, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub':
            'repo:evan-hyer/evan-hyer-site:environment:production',
        },
      }),
    });
    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: ['deploy', 'file-publishing', 'lookup'].map(
          (kind) =>
            `arn:${this.partition}:iam::${this.account}:role/cdk-hnb659fds-${kind}-role-${this.account}-${this.region}`,
        ),
      }),
    );
    new CfnOutput(this, 'GitHubRoleArn', { value: role.roleArn });
  }
}
