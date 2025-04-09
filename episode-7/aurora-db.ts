import * as dotenv from 'dotenv';
import { ExecuteStatementCommand, RDSDataClient } from '@aws-sdk/client-rds-data';

dotenv.config();

export async function main() {
    const client = new RDSDataClient({});
    const result = await client.send(
        new ExecuteStatementCommand({
            resourceArn: 'arn:aws:rds:us-west-2:831926593673:cluster:episode7stack-serverlessclusterd09d5d78-9w6ulgfowmkh',
            secretArn: 'arn:aws:secretsmanager:us-west-2:831926593673:secret:ServerlessClusterSecret9585-R5wjfjO9PzX5-KLXd24',
            database: 'episode7',
            sql: 'INSERT INTO posts (id, description) VALUES (:id, :description) RETURNING id',
            parameters: [
                { name: 'id', value: { longValue: 1 } },
                { name: 'description', value: { stringValue: 'Hello, World2!' } },
            ],
        }),
    );

    console.log(`Inserted post with id: ${result.generatedFields![0].longValue}`);
}

main().catch(console.error);
