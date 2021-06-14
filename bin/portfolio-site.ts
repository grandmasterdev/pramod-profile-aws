#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PortfolioSiteStack } from '../lib/portfolio-site-stack';

const app = new cdk.App();
new PortfolioSiteStack(app, 'PortfolioSiteStack', {  
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  
});
