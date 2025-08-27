from strands import Agent
from strands_tools import calculator, current_time, python_repl
from strands.multiagent.a2a import A2AServer
from strands.models.openai import OpenAIModel

# Define the agent with the shared local OpenAI model
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
agent = Agent(
    description="Agent for making snarky comments",
    model=model,
    tools=[calculator, current_time, python_repl],
    system_prompt="You are a generator of snarky comments. Please take whatever input you get and respond with a snarky comment."
)

# Create and start the A2A server
if __name__ == "__main__":
    # Listen on default port 8000, or specify another port
    server = A2AServer(agent=agent, host="0.0.0.0", port=8000)
    print("A2A server running on port 8000...")
    server.serve()
