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
import {
  SnsDestination,
} from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import {
  Code,
  Function,
  LayerVersion,
  Runtime,
} from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import {
  LambdaIntegration,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import {
  Effect, PolicyStatement,
} from 'aws-cdk-lib/aws-iam';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export default class PameMasterClassStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Bucket to store unprocessed images
    const InvokerBucket = new Bucket(this, 'invokerBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      bucketName: 'image-processor-bucket-veryuniquename',
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
    });

    // SNS
    const SnsBucket = new Topic(this, 'SnsBucketTrigger', {
      topicName: 'sns-bucket-topic',
    });

    InvokerBucket.addEventNotification(
      EventType.OBJECT_CREATED_PUT,
      new SnsDestination(SnsBucket),
      { prefix: 'raw/*' },
    );

    // Api
    const api = new RestApi(this, 's3-uploader-api', {
      binaryMediaTypes: ['*/*'],
      restApiName: 'S3 uploader api',
    });

    // Lambda uploader and api trigger
    const LambdaUploader = new Function(this, 'LambdaUploader', {
      code: Code.fromAsset(path.join(__dirname, 'lambda-uploader')),
      environment: {
        BUCKET_NAME: InvokerBucket.bucketName,
      },
      functionName: 'Lambda-image-uploader',
      handler: 'index.uploader_handler',
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

    // Processor lambda, sns trigger
    const RequirementsLayer = new LayerVersion(this, 'LambdaLayer', {
      code: Code.fromAsset(path.join(__dirname, 'lambda-processor-layer/')),
      compatibleRuntimes: [Runtime.PYTHON_3_9],
    });

    const LambdaProcessor = new Function(this, 'LambdaProcessor', {
      code: Code.fromAsset(path.join(__dirname, 'lambda-processor')),
      environment: {
        BUCKET_NAME: InvokerBucket.bucketName,
      },
      functionName: 'Lambda-image-processor',
      handler: 'index.processor_handler',
      layers: [RequirementsLayer],
      runtime: Runtime.PYTHON_3_9,
    });

    LambdaProcessor.addEventSource(new SnsEventSource(SnsBucket));

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
