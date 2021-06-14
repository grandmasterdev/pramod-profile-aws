import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import {PortfolioSiteStack} from '../lib/portfolio-site-stack';
import {PortfolioSiteDnsStack} from '../lib/portfolio-site-dns-stack';
import '@aws-cdk/assert/jest';


test('Expect the DNS Stack to contain - CertificateManager - HostedZone', () => {
  // ARRANGE
  const domainNameApex = 'online-meetings.cloud.dk';
  const app = new cdk.App();    
  // ACT
  const dnsStack = new PortfolioSiteDnsStack(app, 'MyTestDnsStack', {
    dnsName: domainNameApex
  });
  // ASSERT
  expect(dnsStack).toHaveResource('AWS::CertificateManager::Certificate');
  expect(dnsStack).toHaveResource('AWS::Route53::HostedZone');
});

test('Expect Stack to contain - S3 bucket - CloudFront Distribution', () => {  
  // ARRANGE
  const domainNameApex = 'online-meetings.cloud.dk';
  const app = new cdk.App();    
  // ACT
  const dnsStack = new PortfolioSiteDnsStack(app, 'MyTestDnsStack', {
    dnsName: domainNameApex
  });
  const mainStack = new PortfolioSiteStack(app, 'MyTestStack', {
    dnsName: domainNameApex,
    hostedZone: dnsStack.hostedZone,
    certificate: dnsStack.certificate
  });
  // ASSERT
  expect(mainStack).toHaveResource('AWS::S3::Bucket');
  expect(mainStack).toHaveResource('AWS::CloudFront::Distribution');
  
});