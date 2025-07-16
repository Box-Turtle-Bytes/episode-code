#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Episode15Stack } from './episode-15-stack';

const app = new cdk.App();
new Episode15Stack(app, 'Episode15Stack', {});