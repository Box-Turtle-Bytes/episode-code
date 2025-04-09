import { BedrockAgentRuntimeClient, ConversationRole, RetrieveAndGenerateStreamCommand, RetrieveAndGenerateType, RetrieveCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand, BedrockRuntime } from '@aws-sdk/client-bedrock-runtime';

// Initialize clients outside handler for reuse
const agentRuntimeClient = new BedrockAgentRuntimeClient({ region: 'us-west-2' });
const bedrockRuntimeClient = new BedrockRuntimeClient({ region: 'us-west-2' });
const bedrockRuntime = new BedrockRuntime({ region: 'us-west-2' });

// Type for the request body
interface QueryRequest {
    query: string;
    useKnowledgeBase: boolean;
}

module.exports.handler = awslambda.streamifyResponse(async (event, responseStream, context) => {
    // Parse request body
    const body = JSON.parse(event.body || '{}') as QueryRequest;
    const { query, useKnowledgeBase = true } = body;

    if (!query) {
        responseStream.write('Query is required');
        return;
    }

    // Get environment variables
    const knowledgeBaseId = process.env.KNOWLEDGE_BASE_ID;
    const modelId = 'us.anthropic.claude-3-7-sonnet-20250219-v1:0';

    if (useKnowledgeBase && knowledgeBaseId) {
        console.log('Using Knowledge Base Retrieval');
        const response = await agentRuntimeClient.send(
            new RetrieveAndGenerateStreamCommand({
                input: {
                    text: query,
                },
                retrieveAndGenerateConfiguration: {
                    type: RetrieveAndGenerateType.KNOWLEDGE_BASE,
                    knowledgeBaseConfiguration: {
                        knowledgeBaseId,
                        modelArn: `arn:aws:bedrock:us-west-2:831926593673:inference-profile/us.anthropic.claude-3-7-sonnet-20250219-v1:0`,
                        generationConfiguration: {
                            guardrailConfiguration: {
                                guardrailId: 'x2lct3z6hf49',
                                guardrailVersion: '2',
                            },
                        },
                    },
                },
            }),
        );
        if (response.stream) {
            console.log('Response stream received');
            for await (const chunk of response.stream) {
                if (chunk.output?.text) {
                    console.log('Writing chunk to response stream');
                    responseStream.write(chunk.output.text);
                }
                if (chunk.citation) {
                    console.log('Writing citation to response stream');
                    responseStream.write(JSON.stringify(chunk.citation));
                }
            }
        }
        responseStream.end();
        console.log('Response stream ended');
        return;
    } else if (!useKnowledgeBase && knowledgeBaseId) {
        // Option 2: Separated retrieve + generate approach
        // Step 1: Retrieve information from knowledge base
        const retrieveResponse = await agentRuntimeClient.send(
            new RetrieveCommand({
                knowledgeBaseId,
                retrievalQuery: {
                    text: query,
                },
            }),
        );

        // Step 2: Prepare context from retrieved results
        const retrievedPassages = retrieveResponse.retrievalResults?.map((result, index) => `[${index + 1}] ${result.content?.text || ''}`).join('\n\n') || '';

        // Step 3: Generate response with context using standard Bedrock
        const modelInput = {
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `You are an assistant that answers questions based on the provided context.
                
Context:
${retrievedPassages}

Question: ${query}

Please answer the question based only on the context provided. If the information isn't in the context, say you don't know.`,
                        },
                    ],
                },
            ],
        };

        const generateResponse = await bedrockRuntime.converseStream({
            modelId,
            messages: [
                {
                    role: ConversationRole.USER,
                    content: [{ type: text: modelInput }],
                },
            ],
        });

        if (generateResponse.body) {
            for await (const chunk of generateResponse.body) {
                if (chunk.chunk) {
                    responseStream.write(chunk.chunk.bytes);
                }
            }
        }
        console.log('Response stream ended');
        responseStream.end();

        return;
    }
});
