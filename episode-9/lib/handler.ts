import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEventV2) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Process the event and return a response
    const response: APIGatewayProxyResultV2 = {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello from Lambda!',
            input: event,
        }),
    };

    return response;
};
