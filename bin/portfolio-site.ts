#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PortfolioSiteStack } from '../lib/site-config';
import { PortfolioSiteDnsStack } from '../lib/dns-config';

const app = new cdk.App();

const domainNameApex = 'pramod-profile.net';

/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */  
// 1. Stack to crete - DNS, HostedZone, Certification
const {hostedZone, certificate} = new PortfolioSiteDnsStack(app, 'PortfolioSiteDnsStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
  dnsName: domainNameApex
});

// 2. Stack to create - S3, CloudFront, Deployment
new PortfolioSiteStack(app, 'PortfolioSiteStack', {  
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
  hostedZone,
  certificate,
  dnsName: domainNameApex
});
