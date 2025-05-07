import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const MCP_PATH = '/mcp';

const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
});

export const bootstrap = async (mcpServer:McpServer) => {
    const app = express();
    app.use(express.json());

    app.use((req, res, next) => {
        return next();
    });

    // Handle GET requests for server-to-client notifications via SSE
    app.get(MCP_PATH, (req, res) => {
        res.status(405).set('Allow', 'POST').send('Method Not Allowed');
    });

    // Handle DELETE requests for session termination
    app.delete(MCP_PATH, (req, res) => {
        res.status(405).set('Allow', 'POST').send('Method Not Allowed');
    });

    // Handle POST requests for client-to-server communication
    app.post(MCP_PATH, async (req, res) => {
        try {
            await transport.handleRequest(req, res, req.body);
        } catch (err) {
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Internal Server Error',
                    },
                    id: null,
                });
            }
        }
    });

    const port = 3000;
    await mcpServer.connect(transport);
    app.listen(port, () => {});

    return app;
};
