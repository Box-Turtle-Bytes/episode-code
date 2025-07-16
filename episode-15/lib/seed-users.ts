import { DynamoDB } from 'aws-sdk';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';

const USERS_TABLE = process.env.USERS_TABLE;
const dynamo = new DynamoDB.DocumentClient();

export const handler = async (event: CloudFormationCustomResourceEvent): Promise<{ PhysicalResourceId: string }> => {
    if (event.RequestType === 'Delete') {
        return { PhysicalResourceId: 'seed-users' };
    }
    // Seed 100 users
    const putRequests = [];
    for (let i = 1; i <= 100; i++) {
        putRequests.push({
            PutRequest: {
                Item: {
                    userId: `user${i}`,
                    name: `User ${i}`,
                    email: `user${i}@example.com`,
                },
            },
        });
    }
    // Batch write in chunks of 25
    for (let i = 0; i < putRequests.length; i += 25) {
        await dynamo.batchWrite({
            RequestItems: {
                [USERS_TABLE]: putRequests.slice(i, i + 25),
            },
        }).promise();
    }
    return { PhysicalResourceId: 'seed-users' };
};
