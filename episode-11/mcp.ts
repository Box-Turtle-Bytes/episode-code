import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function getMcpServer() {
    const server = new McpServer({ name: 'aws-lambda-mcp', version: '1.1.0' });
    server.resource('hello', 'hello://lambda', async (uri) => ({
        contents: [{ uri: uri.href, text: 'Hello from stream-enabled Lambda 🫧' }],
    }));

    server.tool(
        'add',
        'Adds two numbers together',
        { a: z.number().describe('this is the first number to be added'), b: z.number().describe('this is the second number to be added') },
        async ({ a, b }) => ({
            content: [{ type: 'text', text: String(a + b) }],
        }),
    );
    return server;
}
