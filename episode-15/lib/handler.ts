import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

const USERS_TABLE = process.env.USERS_TABLE;
const dynamo = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const result = await dynamo.scan({ TableName: USERS_TABLE }).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(result.Items ?? []),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: (err as Error).message }),
        };
    }
};
