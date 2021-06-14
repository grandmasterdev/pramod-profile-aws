import * as cdk from '@aws-cdk/core';

interface IPortfolioSiteDnsStackProps extends cdk.StackProps {

}

export class PortfolioSiteDnsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: IPortfolioSiteDnsStackProps) {
    super(scope, id, props);
    // Code for managing DNS, Hosted Zone & Certificate
  }
}
