import serverlessExpress from '@codegenie/serverless-express';
import { createApp } from './app';
export const handler = serverlessExpress({ app: createApp() });
