import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { FunctionUrlAuthType, LoggingFormat, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import path from 'path';

export class Episode11 extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const logGroup = new LogGroup(this, 'LogGroup', { retention: RetentionDays.THREE_DAYS });

        const lambda = new NodejsFunction(this, 'Lambda', {
            bundling: { sourceMap: true, keepNames: true },
            entry: path.join(__dirname, './index.ts'),
            runtime: Runtime.NODEJS_22_X,
            memorySize: 1024,
            timeout: Duration.seconds(90),
            logGroup,
            loggingFormat: LoggingFormat.JSON,
        });

        const alias = lambda.addAlias('test');
        const functionUrl = alias.addFunctionUrl({ authType: FunctionUrlAuthType.NONE });
    }
}
