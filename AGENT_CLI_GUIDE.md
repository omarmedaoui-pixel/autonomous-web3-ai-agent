# Web3 AI Agent CLI Guide

## Overview

The Web3 AI Agent CLI provides a command-line interface for interacting with smart contracts and executing automated tasks on the blockchain.

## Quick Start

### 1. Compile Contracts

```bash
npm run compile
```

### 2. Deploy Contract and Execute Task

```bash
node agent/agent.js "Analyze ETH price trends" --deploy
```

## Usage

### Basic Syntax

```bash
node agent/agent.js "Task description" [options]
```

Or using npm script:

```bash
npm run agent:cli "Task description" -- --deploy
```

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--address <contract>` | `-a` | Use existing deployed contract |
| `--network <network>` | `-n` | Network to use (default: hardhat) |
| `--deploy` | `-d` | Deploy new contract |
| `--monitor` | `-m` | Enable event monitoring |
| `--file <path>` | `-f` | Read tasks from file |
| `--batch` | `-b` | Execute multiple tasks |
| `--help` | `-h` | Show help message |

## Examples

### Deploy New Contract

```bash
node agent/agent.js "Initial task" --deploy
```

### Use Existing Contract

```bash
node agent/agent.js "Monitor DeFi yields" --address 0x1234...
```

### Execute Multiple Tasks (Batch)

```bash
node agent/agent.js "Task1,Task2,Task3" --batch --address 0x1234...
```

### Execute Tasks from File

1. Create a tasks file (see `tasks.example.txt`):

```text
Analyze ETH price trends
Monitor DeFi protocol yields
Generate trading signals
```

2. Run:

```bash
node agent/agent.js --file tasks.txt --address 0x1234...
```

### With Event Monitoring

```bash
node agent/agent.js "Generate trading signals" --monitor --address 0x1234...
```

Press `Ctrl+C` to stop monitoring.

### On Specific Network

```bash
# On local network
node agent/agent.js "Execute strategy" --network localhost --deploy

# On Sepolia testnet
node agent/agent.js "Execute strategy" --network sepolia --address 0x1234...
```

## Advanced Usage

### Programmatic Usage

```javascript
const { executeTask, parseArgs } = require("./agent/agent");

const options = {
  task: "Your custom task",
  address: "0x...",
  monitor: true
};

await executeTask(options);
```

### Batch Execution

The CLI supports executing multiple tasks in a single run:

```bash
# Comma-separated
node agent/agent.js "Task1,Task2,Task3" --batch --address 0x...

# From file
node agent/agent.js --file my-tasks.txt --address 0x...
```

### Creating Task Files

Create a text file with one task per line:

```text
# My automated tasks
Analyze market trends
Check portfolio balance
Review smart contract events
```

Comments (lines starting with `#`) are ignored.

## Output Examples

### Successful Execution

```
============================================================
🚀 Web3 AI Agent
============================================================

👤 Account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💰 Balance: 10000.0 ETH

📜 Deploying Web3AIAgent contract...
✅ Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

📊 Analyzing contract state...
🤖 AI Agent: Analyzing contract state...

📊 Analysis Results:
{
  "contractName": "Web3AIAgent",
  "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "totalTasks": "0",
  "insights": ["No tasks created yet"]
}

🎯 Executing task: "Analyze ETH price trends"

🤖 AI Agent: Executing task - "Analyze ETH price trends"
⏳ Transaction submitted: 0x...
✅ Transaction confirmed in block: 1
💰 Gas used: 45678

✅ Agent execution completed!
```

## Troubleshooting

### Network Not Running

If you get a network error:

```bash
# Start local node in another terminal
npm run node
```

### Contract Not Found

Make sure you have:
1. Deployed the contract first, OR
2. Provided the correct contract address with `--address`

### Task File Not Found

Use absolute or relative path:

```bash
# From project root
node agent/agent.js --file ./tasks.txt --address 0x...

# Absolute path
node agent/agent.js --file /path/to/tasks.txt --address 0x...
```

## Development

### Project Structure

```
web3-ai-agent/
├── agent/
│   ├── agent.js       # CLI entry point
│   └── index.js       # Agent class
├── contracts/         # Smart contracts
├── scripts/          # Hardhat scripts
└── tasks.example.txt # Example tasks file
```

### Adding New Features

The agent class (`agent/index.js`) provides:

- `analyze()` - Analyze contract state
- `executeTask(taskDescription)` - Execute a task
- `monitorEvents()` - Start event monitoring
- `generateReport()` - Generate activity report
- `stopMonitoring()` - Stop event monitoring

## License

MIT
