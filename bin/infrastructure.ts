#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import ApiEditImages from '../lib/stack';

const app = new cdk.App();

// Value of apiKey
const mySuperApiKeyValue = app.node.tryGetContext('apiKeyValue');

new ApiEditImages(app, 'ApiEditImagesStack', {
  mySuperApiKeyValue,
});
