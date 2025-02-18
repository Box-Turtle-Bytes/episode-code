import { BedrockRuntimeClient, ConverseCommand, ToolUseBlock } from '@aws-sdk/client-bedrock-runtime';
import { config } from 'dotenv';
import { inspect } from 'util';
import { traceable } from 'langsmith/traceable';

async function main(): Promise<void> {
    config();
    // Langsmith
    const client = new BedrockRuntimeClient();
    const response = await client.send(
        new ConverseCommand({
            modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            text: 'What is 400 dollars in euros?',
                        },
                    ],
                },
            ],
            toolConfig: {
                tools: [
                    {
                        toolSpec: {
                            inputSchema: {
                                json: {
                                    type: 'object',
                                    properties: {
                                        amount: {
                                            type: 'number',
                                            description: 'The amount of the source currency to be converted.',
                                        },
                                        source_currency: {
                                            type: 'string',
                                            description: 'The currency of the amount provided. e.g USD for US Dollars.',
                                        },
                                        target_currency: {
                                            type: 'string',
                                            description: 'The currency to convert the amount to. e.g EUR for Euros.',
                                        },
                                    },
                                    required: ['amount', 'source_currency', 'target_currency'],
                                },
                            },
                            name: 'currency_converter',
                        },
                    },
                ],
            },
        }),
    );
    console.log(inspect(response));
    console.log(JSON.stringify(response.output?.message?.content));
    if (response.stopReason === 'tool_use') {
        const toolUse = response.output?.message?.content![1].toolUse as ToolUseBlock;
        if (toolUse?.name === 'currency_converter' && toolUse?.input) {
            const inputArgs = toolUse.input as { amount: string; source_currency: string; target_currency: string };
            const amount = currency_converter(parseFloat(inputArgs.amount), inputArgs.source_currency, inputArgs.target_currency);
            console.log(amount);
            console.log(toolUse.toolUseId);
            const invokeSecondBedrockCall = traceable(
                async () => {
                    const response2 = await client.send(
                        new ConverseCommand({
                            modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
                            messages: [
                                {
                                    role: 'user',
                                    content: [
                                        {
                                            text: 'What is a dollar in euros?',
                                        },
                                    ],
                                },
                                response.output?.message!,
                                {
                                    role: 'user',
                                    content: [
                                        {
                                            toolResult: {
                                                toolUseId: toolUse.toolUseId,
                                                content: [{ json: { converted_currency: amount } }],
                                            },
                                        },
                                    ],
                                },
                            ],
                            toolConfig: {
                                tools: [
                                    {
                                        toolSpec: {
                                            inputSchema: {
                                                json: {
                                                    type: 'object',
                                                    properties: {
                                                        amount: {
                                                            type: 'number',
                                                            description: 'The amount of the source currency to be converted.',
                                                        },
                                                        source_currency: {
                                                            type: 'string',
                                                            description: 'The currency of the amount provided. e.g USD for US Dollars.',
                                                        },
                                                        target_currency: {
                                                            type: 'string',
                                                            description: 'The currency to convert the amount to. e.g EUR for Euros.',
                                                        },
                                                    },
                                                    required: ['amount', 'source_currency', 'target_currency'],
                                                },
                                            },
                                            name: 'currency_converter',
                                        },
                                    },
                                ],
                            },
                        }),
                    );
                    console.log(inspect(response2));
                    console.log(JSON.stringify(response2.output?.message?.content));
                },
                { run_type: 'tool', name: 'second_bedrock_call' },
            );
            await invokeSecondBedrockCall();
        }
    }
}

function currency_converter(amount: number, source_currency: string, target_currency: string): number {
    if (source_currency === 'USD' && target_currency === 'EUR') {
        return amount * 0.85;
    }
    return amount;
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
