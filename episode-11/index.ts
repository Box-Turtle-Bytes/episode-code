import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import serverlessExpress from '@codegenie/serverless-express';
import express from 'express';
import { getMcpServer } from './mcp';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { bootstrap } from './bootstrap';

const server = getMcpServer();

let app: express.Application;
export const handler = async (event: APIGatewayProxyEventV2, context: Context) => {
    console.log('Event:', event);

    if (!app) {
        app = await bootstrap(server);
    }

    const handle = serverlessExpress({ app });
    return handle(event, context); // I might need to add an "as <something or other>" to make TypeScript happy
};
