import * as cdk from 'aws-cdk-lib';
import {
  Match, Template,
} from 'aws-cdk-lib/assertions';
import ApiEditImages from '../lib/stack';

const config = {
  mySuperApiKeyValue: 'testApiKey',
};

const app = new cdk.App();
const stack = new ApiEditImages(
  app,
  'MyTestStack',
  config,
);
const template = Template.fromStack(stack);

test('Image bucket created', () => {
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketEncryption: {
      ServerSideEncryptionConfiguration: [
        {
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256',
          },
        },
      ],
    },
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
    VersioningConfiguration: {
      Status: 'Enabled',
    },
  });
});

test('Image bucket policy SSL', () => {
  template.hasResourceProperties('AWS::S3::BucketPolicy', {
    PolicyDocument: {
      Statement: [
        {
          Action: 's3:*',
          Condition: {
            Bool: {
              'aws:SecureTransport': 'false',
            },
          },
          Effect: 'Deny',
          Principal: {
            AWS: '*',
          },
          Resource: [
            {
              'Fn::GetAtt': [
                Match.stringLikeRegexp('invokerBucket*'),
                'Arn',
              ],
            },
            {
              'Fn::Join': [
                '',
                [
                  {
                    'Fn::GetAtt': [
                      Match.stringLikeRegexp('invokerBucket*'),
                      'Arn',
                    ],
                  },
                  '/*',
                ],
              ],
            },
          ],
        },
      ],
      Version: '2012-10-17',
    },
  });
});

test('Upload endpoint with ApiKey', () => {
  template.hasResourceProperties('AWS::ApiGateway::Method', {
    ApiKeyRequired: true,
    HttpMethod: 'POST',
    ResourceId: {
      Ref: Match.stringLikeRegexp('s3uploaderapiupload*'),
    },
    RestApiId: {
      Ref: Match.stringLikeRegexp('s3uploaderapi*'),
    },
  });
});

test('Download endpoint with ApiKey', () => {
  template.hasResourceProperties('AWS::ApiGateway::Method', {
    ApiKeyRequired: true,
    HttpMethod: 'GET',
    ResourceId: {
      Ref: Match.stringLikeRegexp('s3uploaderapidownload*'),
    },
    RestApiId: {
      Ref: Match.stringLikeRegexp('s3uploaderapi*'),
    },
  });
});
