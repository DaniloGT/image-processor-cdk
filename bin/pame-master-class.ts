#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import PameMasterClassStack from '../lib/pame-master-class-stack';

const app = new cdk.App();

new PameMasterClassStack(app, 'PameMasterClassStack', {});
