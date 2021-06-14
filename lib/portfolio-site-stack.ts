import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { CloudFrontWebDistribution } from '@aws-cdk/aws-cloudfront';
import * as cdk from '@aws-cdk/core';
import path from 'path';

export class PortfolioSiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
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

    // create cloudfront resource to get shorten URL
    const cloudFront = new CloudFrontWebDistribution(this, 'PortfolioSiteDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket
          },
          behaviors: [{ isDefaultBehavior: true }]
        }
      ]
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
