import { BedrockRuntime, ConversationRole, Message, ToolResultBlock } from '@aws-sdk/client-bedrock-runtime';
import { config } from 'dotenv';

async function main(): Promise<void> {
    config();
    const bedrockRuntime = new BedrockRuntime();

    const accountAccess: { account: string; resource?: string }[] = [];

    const accountAccessReporter = (account: string, toolUseId: string | undefined, resource?: string): ToolResultBlock => {
        console.log('Reporting account access:', account, resource);
        accountAccess.push({ account, resource: resource });
        return { toolUseId, content: [{ text: `Account reported` }] };
    };

    const awsCliCommandRunner = async (command: string, toolUseId: string | undefined): Promise<ToolResultBlock> => {
        console.log(`Running command: ${command}`);
        const { exec } = require('child_process');
        return new Promise((resolve, reject) => {
            exec(command, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    reject({ toolUseId, content: [{ text: `error: ${error.message}` }] });
                }
                console.log(`stdout: ${stdout}`);
                resolve({ toolUseId, content: [{ text: stdout }] });
            });
        });
    };

    const messages: Message[] = [
        {
            role: ConversationRole.USER,
            content: [
                {
                    text: `You are an AWS environment scanner, you have the ability to use cloud control.
                You are logged with a read only access for the AWS CLI.
                Use CLI commands in relation to cloud control to map any aws accounts with access to the account you are logged into.
                You should not use any role-arns or assume roles in your commands.
                You are not in the root account so focus on resource policies and IAM roles.
                Figure out what account you are in and then ignore that account when looking for cross account access.
                You should also look into the trust relationships and identify any that are different than the account you are in.
                Also look at any policies that would allow access to the account you are in and identify the account numbers that aren't the account you are in.
                Finally give recommendations using cloudformation change sets to fix any issues you find.`,
                },
            ],
        },
    ];

    let stopReason;
    let analysisResult;

    // Loop on conversation until end_turn setup tool for LLM
    do {
        analysisResult = await bedrockRuntime.converse({
            modelId: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
            messages: messages,
            toolConfig: {
                tools: [
                    {
                        toolSpec: {
                            name: 'aws-cli-cloud-scanner',
                            description: 'This tool is used to run aws cli commands to scan the cloud environment with cloud control',
                            inputSchema: {
                                json: {
                                    type: 'object',
                                    properties: {
                                        command: {
                                            type: 'string',
                                            description: 'The aws cli command to run',
                                        },
                                    },
                                    required: ['command'],
                                },
                            },
                        },
                    },
                    {
                        toolSpec: {
                            name: 'report-cross-account-access',
                            description: 'This tool is used to report cross account access that is different from the host account',
                            inputSchema: {
                                json: {
                                    type: 'object',
                                    properties: {
                                        account: {
                                            type: 'string',
                                            description: 'The aws account number',
                                        },
                                        resource: {
                                            type: 'string',
                                            description: 'The resource that is being accessed',
                                        },
                                    },
                                    required: ['account'],
                                },
                            },
                        },
                    },
                ],
            },
        });
        stopReason = analysisResult.stopReason;
        // Push the message to the messages array
        if (analysisResult.output?.message) messages.push(analysisResult.output.message);
        // If tool use use the tool input to create the request
        if (analysisResult.stopReason === 'tool_use' && analysisResult.output?.message?.content) {
            const toolUseBlock = analysisResult.output.message.content.find((content) => content.toolUse);
            if (toolUseBlock?.toolUse?.name === 'aws-cli-cloud-scanner') {
                const { command } = toolUseBlock?.toolUse?.input as { [key: string]: string };
                const toolResult = await awsCliCommandRunner(command, toolUseBlock?.toolUse?.toolUseId);
                messages.push({ role: ConversationRole.USER, content: [{ toolResult }] });
            }
            if (toolUseBlock?.toolUse?.name === 'report-cross-account-access') {
                const { account, resource } = toolUseBlock?.toolUse?.input as { account: string; resource?: string };
                const toolResult = accountAccessReporter(account, toolUseBlock?.toolUse?.toolUseId, resource);
                messages.push({ role: ConversationRole.USER, content: [{ toolResult }] });
            }
        }
    } while (stopReason !== 'end_turn');
    console.log('Account access:', accountAccess);
    console.log(analysisResult.output?.message?.content![0].text);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
