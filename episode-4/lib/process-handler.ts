import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import {
    AllCaches,
    AllTopics,
    AuthClient,
    CredentialProvider,
    ExpiresIn,
    GenerateApiKeyResponse,
    PermissionScopes,
    TopicClient,
    TopicConfigurations,
} from '@gomomento/sdk';
import * as readline from 'readline';

async function setupKeyboardInput(authClient: AuthClient) {
    const response = await authClient.generateApiKey(PermissionScopes.topicPublishSubscribe(AllCaches, AllTopics), ExpiresIn.minutes(30));

    if (response.type === GenerateApiKeyResponse.Success) {
        const topicClient = new TopicClient({
            credentialProvider: CredentialProvider.fromString(response.apiKey),
            configuration: TopicConfigurations.Default.latest(),
        });

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        console.log('Commands: (p) publish message, (q) quit');

        rl.on('line', async (input) => {
            switch (input.trim()) {
                case 'p':
                    await topicClient.publish('btb-episode-4', 'episode-4', 'Hello World');
                    console.log('Message published');
                    break;
                case 'q':
                    rl.close();
                    process.exit(0);
                default:
                    console.log('Unknown command. Commands: (p) publish message, (q) quit');
            }
        });

        // Handle cleanup
        rl.on('close', () => {
            console.log('Exiting...');
            process.exit(0);
        });
    } else {
        console.error('Failed to generate API key');
    }
}
export async function main() {
    const secrets = new SecretsManagerClient({});
    const resp = await secrets.send(new GetSecretValueCommand({ SecretId: 'episode-4/momento' }));

    const secret = JSON.parse(resp.SecretString!);

    const authClient = new AuthClient({
        credentialProvider: CredentialProvider.fromString(secret.apiKey),
    });

    const response = await authClient.generateApiKey(PermissionScopes.topicPublishSubscribe(AllCaches, AllTopics), ExpiresIn.seconds(30));

    if (response.type === GenerateApiKeyResponse.Success) {
        const topicClient = new TopicClient({
            credentialProvider: CredentialProvider.fromString(response.apiKey),
            configuration: TopicConfigurations.Default.latest(),
        });
        topicClient.subscribe('btb-episode-4', 'episode-4', { onItem: (item) => console.log(item), onError: (err) => console.error(err) });
        await setupKeyboardInput(authClient);
    }
}

main()
    .then()
    .catch((e) => {
        console.error(e);
    });
