import {
  Duration,
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
  ApiKey,
  LambdaIntegration,
  RestApi,
  UsagePlan,
} from 'aws-cdk-lib/aws-apigateway';
import {
  Effect,
  PolicyStatement,
} from 'aws-cdk-lib/aws-iam';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

interface ApiEditImagesProps extends StackProps {
  readonly mySuperApiKeyValue: string;
}

export default class ApiEditImages extends Stack {
  constructor(scope: Construct, id: string, props: ApiEditImagesProps) {
    const { mySuperApiKeyValue } = props;

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

    // Notify SNS if object is created
    InvokerBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new SnsDestination(SnsBucket),
      { prefix: 'raw/' },
    );

    // Api
    const api = new RestApi(this, 's3-uploader-api', {
      binaryMediaTypes: ['*/*'],
      restApiName: 'S3 uploader api',
    });

    // Create api key
    const apiKey = new ApiKey(this, 'ApiKey', {
      apiKeyName: 'MySuperApiKey',
      value: mySuperApiKeyValue,
    });

    // Creates usage plan
    const usagePlan = new UsagePlan(this, 'ApiUsagePlan', {
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
      name: 'ApiUsagePlan',
    });

    // Attach api key to usage plan
    usagePlan.addApiKey(apiKey);

    // Lambda uploader
    const LambdaUploader = new Function(this, 'LambdaUploader', {
      code: Code.fromAsset(path.join(__dirname, 'lambda-uploader')),
      environment: {
        BUCKET_NAME: InvokerBucket.bucketName,
      },
      functionName: 'Lambda-image-uploader',
      handler: 'index.uploader_handler',
      runtime: Runtime.PYTHON_3_9,
    });

    // Least privilege roles
    LambdaUploader.addToRolePolicy(new PolicyStatement({
      actions: [
        's3:PutObject',
      ],
      effect: Effect.ALLOW,
      resources: [
        `${InvokerBucket.bucketArn}/raw/*`,
      ],
    }));

    // Add api trigger
    const uploadPath = api.root.addResource('upload');

    uploadPath.addMethod(
      'POST',
      new LambdaIntegration(LambdaUploader),
      { apiKeyRequired: true },
    );

    // Processor lambda layer
    const RequirementsLayer = new LayerVersion(this, 'LambdaLayer', {
      code: Code.fromAsset(path.join(__dirname, 'lambda-processor-layer/')),
      compatibleRuntimes: [Runtime.PYTHON_3_9],
    });

    // Processor lambda
    const LambdaProcessor = new Function(this, 'LambdaProcessor', {
      code: Code.fromAsset(path.join(__dirname, 'lambda-processor')),
      environment: {
        BUCKET_NAME: InvokerBucket.bucketName,
      },
      functionName: 'Lambda-image-processor',
      handler: 'index.processor_handler',
      layers: [RequirementsLayer],
      runtime: Runtime.PYTHON_3_9,
      timeout: Duration.seconds(60),
    });

    // SNS lambda trigger
    LambdaProcessor.addEventSource(new SnsEventSource(SnsBucket));

    // Least privilege roles
    LambdaProcessor.addToRolePolicy(new PolicyStatement({
      actions: [
        's3:GetObject',
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

    // Sender Lambda
    const LambdaSender = new Function(this, 'LambdaSender', {
      code: Code.fromAsset(path.join(__dirname, 'lambda-sender')),
      environment: {
        BUCKET_NAME: InvokerBucket.bucketName,
      },
      functionName: 'Lambda-image-sender',
      handler: 'index.sender_handler',
      runtime: Runtime.PYTHON_3_9,
    });

    // Add api trigger
    const downloadPath = api.root.addResource('download');

    downloadPath.addMethod(
      'GET',
      new LambdaIntegration(LambdaSender),
      { apiKeyRequired: true },
    );

    // Least privilege roles
    LambdaSender.addToRolePolicy(new PolicyStatement({
      actions: [
        's3:GetObject',
      ],
      effect: Effect.ALLOW,
      resources: [
        `${InvokerBucket.bucketArn}/done/*`,
      ],
    }));
  }
}
