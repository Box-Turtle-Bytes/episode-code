import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { Provider } from 'aws-cdk-lib/custom-resources';

export class Episode15Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // DynamoDB Users table
        const usersTable = new dynamodb.Table(this, 'UsersTable', {
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Lambda to get all users
        const getUsersLambda = new NodejsFunction(this, 'GetUsersLambda', {
            runtime: lambda.Runtime.NODEJS_22_X,
            entry: path.join(__dirname, 'handler.ts'),
            handler: 'handler',
            environment: {
                USERS_TABLE: usersTable.tableName,
            },
            timeout: cdk.Duration.seconds(30),
            memorySize: 512,
        });
        usersTable.grantReadData(getUsersLambda);

        // API Gateway endpoint
        const api = new apigateway.RestApi(this, 'UsersApi', {
            restApiName: 'Users Service',
        });
        const usersResource = api.root.addResource('users');
        usersResource.addMethod('GET', new apigateway.LambdaIntegration(getUsersLambda));

        // Custom resource to seed 100 users
        const seedLambda = new NodejsFunction(this, 'SeedUsersLambda', {
            runtime: lambda.Runtime.NODEJS_22_X,
            entry: path.join(__dirname, 'seed-users.ts'),
            handler: 'handler',
            environment: {
                USERS_TABLE: usersTable.tableName,
            },
            timeout: cdk.Duration.seconds(60),
            memorySize: 512,
        });
        usersTable.grantWriteData(seedLambda);

        const provider = new Provider(this, 'SeedUsersProvider', {
            onEventHandler: seedLambda,
        });
        new cdk.CustomResource(this, 'SeedUsersCustomResource', {
            serviceToken: provider.serviceToken,
        });
    }
}
