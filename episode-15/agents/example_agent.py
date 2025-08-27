from strands import Agent, tool
from strands_tools import calculator, current_time, python_repl, agent_graph
from strands.models.openai import OpenAIModel

import sys

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
    agent = Agent(
        model=model,
        tools=[calculator, current_time, python_repl, agent_graph],
        system_prompt="You are a helpful assistant with A2A capabilities"
    )

    # Get message from command line argument, or use a default
    if len(sys.argv) > 1:
        message = " ".join(sys.argv[1:])
    else:
        message = "What is the time right now?"

    print(agent(message))

if __name__ == "__main__":
    main()

class ExampleAgent(Agent):
    def run(self):
        print("ExampleAgent is running!")
