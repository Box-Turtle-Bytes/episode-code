import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path = require('path');
import {
    ActionGroupExecutor,
    Agent,
    AgentActionGroup,
    ApiSchema,
    BedrockFoundationModel,
    VectorKnowledgeBase,
} from '@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock';

export class Episode8Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // IAM role for Lambda to access AWS services
        const lambdaRole = new iam.Role(this, 'LlmAgentLambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
        });

        // Allow Lambda to access Bedrock or other LLM services
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
                resources: ['*'],
            }),
        );

        const agent = new Agent(this, 'llm-agent', {
            foundationModel: BedrockFoundationModel.ANTHROPIC_CLAUDE_3_5_SONNET_V2_0,
            instruction: 'You are a expert at US Privacy Law. You should answer the question as if you were a lawyer.',
        });

        const kb = VectorKnowledgeBase.fromKnowledgeBaseAttributes(this, 'knowledge-base', {
            knowledgeBaseId: 'NXJ4ESDFIO',
            executionRoleArn: 'arn:aws:iam::831926593673:role/service-role/AmazonBedrockExecutionRoleForKnowledgeBase_eo3uj',
            description: 'US Privacy Law',
        });

        agent.addKnowledgeBase(kb);

        // Lambda function that will host our LLM agent
        const llmAgentFunction = new NodejsFunction(this, 'LlmAgentFunction', {
            runtime: lambda.Runtime.NODEJS_22_X,
            entry: path.join(__dirname, 'handler.ts'),
            role: lambdaRole,
            timeout: cdk.Duration.minutes(5),
            memorySize: 1024,
            environment: {},
        });

        const actionGroup = new AgentActionGroup({
            name: 'proof-reader',
            description: 'Proof read the answer to the law question about privacy',
            executor: ActionGroupExecutor.fromlambdaFunction(llmAgentFunction),
            enabled: true,
            apiSchema: ApiSchema.fromLocalAsset(path.join(__dirname, 'schema.yaml')),
        });

        agent.addActionGroup(actionGroup);
    }
}
