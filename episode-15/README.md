# Multi-Agent Strands Agents SDK Project

This project is a Python-based multi-agent application using the Strands Agents SDK. Package and environment management is handled by [uv](https://github.com/astral-sh/uv).

## Features
- Multi-agent architecture
- Strands Agents SDK integration
- uv for fast Python dependency management

## Getting Started

### 1. Install uv
If you don't have uv installed:
```sh
curl -Ls https://astral.sh/uv/install.sh | sh
```

### 2. Create a virtual environment and install dependencies
```sh
uv venv .venv
source .venv/bin/activate
uv pip install strands-agents-sdk
```

### 3. Project Structure
- `agents/` — Place your agent implementations here
- `main.py` — Entry point for the multi-agent system
- `.venv/` — Virtual environment (created by uv)

### 4. Run the Application
```sh
python main.py
```

## Documentation
- See [Strands Agents SDK Quickstart](https://github.com/strands-ai/agents-sdk#quickstart)

---
Replace placeholder agent code in `agents/` with your own logic.
