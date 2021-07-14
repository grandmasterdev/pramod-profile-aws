import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Distribution, HttpVersion, LambdaEdgeEventType, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import * as cdk from '@aws-cdk/core';
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { CompositePrincipal, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import path from 'path';
import { ARecord, IPublicHostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { ICertificate } from '@aws-cdk/aws-certificatemanager';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { EdgeFunction } from '@aws-cdk/aws-cloudfront/lib/experimental';

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

    // Redirect Code Server Side
    function makeRedirect (target: string): string {
      return `
      exports.handler = function(event, context, callback) {      
        const redirectResponse = {
          status: '301',
          statusDescription: 'Moved Permanently',
          headers: {
            'location': [{
                key: 'Location',
                value: '${target}',
            }],
            'cache-control': [{
                key: 'Cache-Control',
                value: "max-age=3600"
            }],
          },
      };
      callback(null, redirectResponse);
    };`.trim();
    }    

    const code = makeRedirect(`https://${props.dnsName}`);

    const redirectFunction = new EdgeFunction(this, `redirect-lambda`, {
      runtime: Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: Code.fromInline(code),
      role: new Role(this, `redirect-lambda-role`, {
        assumedBy: new CompositePrincipal(
          new ServicePrincipal("lambda.amazonaws.com"),
          new ServicePrincipal("edgelambda.amazonaws.com"),
        ),
        managedPolicies: [
          {
            managedPolicyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
          },
        ],
      })
    });


    // create cloudfront with domain + hosted zone + certificate
    const cloudFront = new Distribution(this, 'PortfolioSiteDistribution', {
      defaultBehavior: {
        origin: new S3Origin(websiteBucket), 
        edgeLambdas: [
          {
            functionVersion: redirectFunction.currentVersion,
            eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
          }
        ],
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      domainNames:[props.dnsName],
      certificate: props.certificate,
      httpVersion: HttpVersion.HTTP2
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
