import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Episode15Stack } from '../lib/episode-15-stack';

test('DynamoDB Users Table Created', () => {
    const app = new cdk.App();
    const stack = new Episode15Stack(app, 'TestStack');
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
        AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    });
});

test('GetUsers Lambda Created', () => {
    const app = new cdk.App();
    const stack = new Episode15Stack(app, 'TestStack');
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Lambda::Function', 2); // GetUsers and SeedUsers
});
