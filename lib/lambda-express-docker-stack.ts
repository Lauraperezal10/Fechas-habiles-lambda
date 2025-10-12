import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class LambdaExpressDockerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const expressLambda = new lambda.DockerImageFunction(this, 'ExpressLambda', {
      code: lambda.DockerImageCode.fromImageAsset('.', {
        file: 'Dockerfile',
      }),
    });

    new apigw.LambdaRestApi(this, 'ApiGateway', {
      handler: expressLambda,
      proxy: true, // Rutea cualquier ruta al Express
    });
  }
}
