#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BedrockKnowledgeBaseStack } from './cdk-construct';

const app = new cdk.App();
new BedrockKnowledgeBaseStack(app, 'Episode9Stack', {});
