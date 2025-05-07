#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Episode11 } from './cdk-construct';

const app = new cdk.App();
new Episode11(app, 'Episode11', {});
