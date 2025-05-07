import { Construct } from 'constructs';
import * as path from 'path';
import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import { aws_lambda, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Alias, InvokeMode } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class BedrockKnowledgeBaseStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create a knowledge base using Vector store (default is OpenSearch Serverless)
        const knowledgeBase = new bedrock.VectorKnowledgeBase(this, 'KnowledgeBase', {
            embeddingsModel: bedrock.BedrockFoundationModel.TITAN_EMBED_TEXT_V2_1024,
            instruction: 'Use this knowledge base to answer questions about the provided documents.',
        });

        // Add an S3 data source to the knowledge base
        const datasource = new bedrock.S3DataSource(this, 'DataSource', {
            bucket: Bucket.fromBucketArn(this, 'DocBucket', 'arn:aws:s3:::data-bucket-turtles'),
            knowledgeBase: knowledgeBase,
            dataSourceName: 'documents',
            chunkingStrategy: bedrock.ChunkingStrategy.fixedSize({
                maxTokens: 500,
                overlapPercentage: 20,
            }),
        });

        // Create a Lambda function to make queries to the knowledge base
        const queryFunction = new NodejsFunction(this, 'QueryFunction', {
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: path.join(__dirname, './handler.ts'),
            environment: {
                KNOWLEDGE_BASE_ID: knowledgeBase.knowledgeBaseId,
            },
            initialPolicy: [
                new PolicyStatement({
                    actions: ['bedrock:*'],
                    resources: ['*'],
                }),
            ],
            memorySize: 2048,
            timeout: Duration.minutes(2),
        });
        knowledgeBase.grantRetrieveAndGenerate(queryFunction);
        const alias = new Alias(this, 'Alias', {
            aliasName: 'current',
            version: queryFunction.currentVersion,
        });
        alias.addFunctionUrl({

            invokeMode: InvokeMode.RESPONSE_STREAM,
        });
    }
}
