import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { CloudFrontWebDistribution, Distribution } from '@aws-cdk/aws-cloudfront';
import * as cdk from '@aws-cdk/core';
import path from 'path';
import { ARecord, IPublicHostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { ICertificate } from '@aws-cdk/aws-certificatemanager';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';

/**
 * PAJ - Stack to create
 * 1. S3 bucket
 * 2. S3 bucket deployment
 * 3. Cloudfront
 */
interface IPortfolioSiteStackProps extends cdk.StackProps {
  hostedZone: IPublicHostedZone;
  certificate: ICertificate;
  dnsName: string;
}

export class PortfolioSiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: IPortfolioSiteStackProps) {
    super(scope, id, props);

    // create S3 bucket
    const websiteBucket = new Bucket(this, 'PortfolioSiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    });

    // create bucket deployment
    new BucketDeployment(this, 'PortfolioSiteDeploy', {
      sources:[Source.asset(path.join(__dirname, '..', 'build'))],
      destinationBucket: websiteBucket
    });

    // create a simple cloudfront resource to get shorten URL
    // const cloudFront1 = new CloudFrontWebDistribution(this, 'PortfolioSiteDistribution', {
    //   originConfigs: [
    //     {
    //       s3OriginSource: {
    //         s3BucketSource: websiteBucket
    //       },
    //       behaviors: [{ isDefaultBehavior: true }]
    //     }
    //   ]
    // });

    // create cloudfront with domain + hosted zone + certificate
    const cloudFront = new Distribution(this, 'PortfolioSiteDistribution', {
      defaultBehavior: {
        origin: new S3Origin(websiteBucket)
      },
      domainNames:[props.dnsName],
      certificate: props.certificate
    });

    // create ARecord to point cloudfront to dns
    new ARecord(this, 'PortfolioSiteARecordApex', {
      zone: props.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFront))
    });

    // create output for S3 deployment process
    new cdk.CfnOutput(this, 'PortfolioSiteBucketNameExport', {
      value: websiteBucket.bucketName,
      exportName: 'PortfolioSiteBucketName'
    });

    // create out for cloudfront deployment process
    new cdk.CfnOutput(this, 'PortfolioSiteURL', {
      value: cloudFront.distributionDomainName,
      exportName: 'PortfolioSiteURL'
    });

  }
}
