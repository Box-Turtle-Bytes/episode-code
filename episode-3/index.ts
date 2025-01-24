import { BedrockRuntime, ConversationRole, Message } from '@aws-sdk/client-bedrock-runtime';
import sharp from 'sharp';

export async function handler({ image, message }: { image: Uint8Array; message: string }): Promise<string | undefined> {
    const messages: Message[] = [
        {
            role: ConversationRole.USER,
            content: [{ text: 'Hello' }],
        },
        {
            role: ConversationRole.ASSISTANT,
            content: [{ text: 'What is it like out there?' }],
        },
        {
            role: ConversationRole.USER,
            content: [{ image: { format: 'jpeg', source: { bytes: image } } }, { text: message }],
        },
    ];
    const bedrockRuntime = new BedrockRuntime();
    const result = await bedrockRuntime.converse({
        modelId: 'us.meta.llama3-2-11b-instruct-v1:0',
        messages: messages,
    });

    console.log(result.usage);
    return result.output?.message?.content![0].text;
}

async function resizeImageToUint8Array(inputPath: string, size: number = 1120): Promise<Uint8Array> {
    try {
        const resizedImageBuffer = await sharp(inputPath)
            .resize(size, size, {
                fit: sharp.fit.cover,
                position: 'center',
            })
            .toBuffer();

        return new Uint8Array(resizedImageBuffer);
    } catch (error) {
        console.error('Error resizing image:', error);
        throw error;
    }
}

async function main(): Promise<void> {
    const resizedImage = await resizeImageToUint8Array('./snow2.jpeg');
    const result = await handler({
        image: resizedImage,
        message: `It\'s like this...`,
    });
    console.log(result);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
