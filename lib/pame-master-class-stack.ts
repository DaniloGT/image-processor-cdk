import {
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  EventType,
} from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import {
  Code,
  Function, Runtime,
} from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import {
  LambdaIntegration,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import {
  Effect, PolicyStatement,
} from 'aws-cdk-lib/aws-iam';

export default class PameMasterClassStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Bucket
    const InvokerBucket = new Bucket(this, 'invokerBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      bucketName: 'image-processor-bucket-veryuniquename',
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
    });

    // Api
    const api = new RestApi(this, 's3-uploader-api', {
      restApiName: 'S3 uploader api',
    });

    // Lambda uploader and api trigger
    const LambdaUploader = new Function(this, 'LambdaUploader', {
      code: Code.fromAsset(path.join(__dirname, 'lambda-uploader')),
      environment: {
        BUCKET_NAME: InvokerBucket.bucketName,
      },
      handler: 'index.uploader-handler',
      runtime: Runtime.PYTHON_3_9,
    });

    LambdaUploader.addToRolePolicy(new PolicyStatement({
      actions: [
        's3:PutObject',
      ],
      effect: Effect.ALLOW,
      resources: [
        `${InvokerBucket.bucketArn}/raw/*`,
      ],
    }));

    const uploadPath = api.root.addResource('upload');

    uploadPath.addMethod('POST', new LambdaIntegration(LambdaUploader));

    // Processor lambda and s3 trigger
    const LambdaProcessor = new Function(this, 'LambdaProcessor', {
      code: Code.fromAsset(path.join(__dirname, 'lambda-processor')),
      environment: {
        BUCKET_NAME: InvokerBucket.bucketName,
      },
      handler: 'index.processor-handler',
      runtime: Runtime.PYTHON_3_9,
    });

    InvokerBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(LambdaProcessor),
      { prefix: 'raw/*' },
    );

    LambdaProcessor.addToRolePolicy(new PolicyStatement({
      actions: [
        's3:ReadObject',
      ],
      effect: Effect.ALLOW,
      resources: [
        `${InvokerBucket.bucketArn}/raw/*`,
      ],
    }));

    LambdaProcessor.addToRolePolicy(new PolicyStatement({
      actions: [
        's3:PutObject',
      ],
      effect: Effect.ALLOW,
      resources: [
        `${InvokerBucket.bucketArn}/done/*`,
      ],
    }));
  }
}
