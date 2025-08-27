from strands import Agent
from strands_tools.a2a_client import A2AClientToolProvider
from strands.models.openai import OpenAIModel

# Replace with your A2A server's host and port
A2A_SERVER_HOST = "localhost"
A2A_SERVER_PORT = 8000

def main():
    model = OpenAIModel(
        client_args={
            "base_url": "http://localhost:1234/v1",
            "api_key": "fake-key",
        },
        model_id="qwen/qwen3-30b-a3b-2507",
        params={
            "max_tokens": 1000,
            "temperature": 0.7,
        }
    )

    provider = A2AClientToolProvider(known_agent_urls=["http://localhost:8000"])

    # Create agent with A2A client tools
    agent = Agent(model=model, tools=provider.tools)
    response = agent("Tell me about A2A with some snark")
    print(response)

if __name__ == "__main__":
    main()
