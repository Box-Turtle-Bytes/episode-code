#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Episode8Stack } from './episode-8-stack';

const app = new cdk.App();
new Episode8Stack(app, 'Episode8Stack', {
});