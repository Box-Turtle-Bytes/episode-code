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

    # provider = A2AClientToolProvider(known_agent_urls=["http://localhost:8000"])

    # Create agent with A2A client tools
    agent = Agent(model=model)
    agent2 = Agent(model=model)
    response = agent(f"Provide a snarky comment about using A2A. Let me know if you used an A2A agent to get the result, and if you did, tell me about the agent.")
    print(f"Response: {response}")
    for i in range(2):
        response = agent2(f"{response}".strip())
        print(f"Response: {response}")
        response = agent(f"{response}".strip())
        print(f"Response: {response}")
        i += 1


if __name__ == "__main__":
    main()
