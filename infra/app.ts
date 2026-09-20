import { App, Tags } from 'aws-cdk-lib';
import { IdentityStack } from './identity-stack';
import { SiteStack } from './site-stack';
const app = new App();
const account =
  process.env.CDK_DEFAULT_ACCOUNT ||
  process.env.AWS_ACCOUNT_ID ||
  '111111111111';
const region =
  process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';
const env = { account, region };
new IdentityStack(app, 'EvanHyerIdentity', {
  env,
  existingProviderArn: app.node.tryGetContext('existingProviderArn'),
});
new SiteStack(app, 'EvanHyerSite', {
  env,
  budgetEmail: app.node.tryGetContext('budgetEmail'),
});
Tags.of(app).add('Project', 'evan-hyer-site');
Tags.of(app).add('ManagedBy', 'CDK');
app.synth();
