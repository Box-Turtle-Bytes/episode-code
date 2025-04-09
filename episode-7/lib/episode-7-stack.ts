import * as cdk from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, Vpc } from 'aws-cdk-lib/aws-ec2';
import {
    AuroraPostgresEngineVersion,
    DatabaseClusterEngine,
    DatabaseSecret,
    DatabaseCluster,
    ClusterInstance,
    ClusterScalabilityType,
    InstanceType,
} from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export class Episode7Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        new DatabaseSecret(this, 'DatabaseSecret', {
            username: 'btbadmin',
        });
        const vpc = new Vpc(this, 'VPC', {
            maxAzs: 2,
        });

        new DatabaseCluster(this, 'ServerlessCluster', {
            engine: DatabaseClusterEngine.auroraPostgres({
                version: AuroraPostgresEngineVersion.VER_16_6,
            }),
            vpc,
            serverlessV2MinCapacity: 1,
            credentials: { username: 'btbadmin' },
            defaultDatabaseName: 'episode7',
            enableDataApi: true,
            serverlessV2MaxCapacity: 10,
            deletionProtection: false,
            readers: [ClusterInstance.serverlessV2('reader', {})],
            writer: ClusterInstance.serverlessV2('writer', {}),
        });
    }
}
