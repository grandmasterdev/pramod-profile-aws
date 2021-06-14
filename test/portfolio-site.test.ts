import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as PortfolioSite from '../lib/portfolio-site-stack';
import '@aws-cdk/assert/jest';

test('Expect Stack to contain one S3 bucket & CloudFront Distribution', () => {  
  // ARRANGE
  const app = new cdk.App();    
  // ACT
  const stack = new PortfolioSite.PortfolioSiteStack(app, 'MyTestStack');
  // ASSERT
  expect(stack).toHaveResource('AWS::S3::Bucket');
  expect(stack).toHaveResource('AWS::CloudFront::Distribution');
});