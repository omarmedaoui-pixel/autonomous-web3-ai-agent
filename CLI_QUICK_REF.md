# Web3 AI Agent - CLI Quick Reference

## Basic Commands

### Deploy and Execute
```bash
# Deploy new contract and execute a task
node agent/agent.js "Your task description" --deploy

# Using npm script
npm run agent:cli "Your task description" -- --deploy
```

### Using Existing Contract
```bash
# Execute single task
node agent/agent.js "Task description" --address <CONTRACT_ADDRESS>

# Execute with monitoring
node agent/agent.js "Task description" --address <CONTRACT_ADDRESS> --monitor
```

### Batch Execution

#### Comma-Separated Tasks
```bash
node agent/agent.js "Task1,Task2,Task3" --batch --address <CONTRACT_ADDRESS>
```

#### From File
```bash
# Create tasks.txt with one task per line
node agent/agent.js --file tasks.txt --address <CONTRACT_ADDRESS>
```

## Options Reference

| Option | Description | Example |
|--------|-------------|---------|
| `--deploy` | Deploy new contract | `--deploy` |
| `--address <addr>` | Use existing contract | `--address 0x123...` |
| `--network <net>` | Specify network | `--network sepolia` |
| `--monitor` | Enable event monitoring | `--monitor` |
| `--batch` | Execute multiple tasks | `--batch` |
| `--file <path>` | Read tasks from file | `--file tasks.txt` |
| `--help` | Show help message | `--help` |

## Common Workflows

### 1. Quick Start (Deploy + Execute)
```bash
node agent/agent.js "Analyze ETH price trends" --deploy
```

### 2. Development Cycle
```bash
# Terminal 1: Start local network
npm run node

# Terminal 2: Deploy
node agent/agent.js "Initial task" --deploy

# Terminal 2: Execute more tasks
node agent/agent.js "Next task" --address <DEPLOYED_ADDRESS>
```

### 3. Batch Processing
```bash
# Create batch-tasks.txt
echo "Task1
Task2
Task3" > batch-tasks.txt

# Execute
node agent/agent.js --file batch-tasks.txt --address <CONTRACT_ADDRESS>
```

### 4. Monitoring Mode
```bash
# Start monitoring (keeps running)
node agent/agent.js "Monitor task" --monitor --address <CONTRACT_ADDRESS>

# Press Ctrl+C to stop
```

### 5. Testnet Deployment
```bash
# Deploy to Sepolia
node agent/agent.js "Testnet task" --deploy --network sepolia
```

## Example Tasks File

Create `my-tasks.txt`:
```text
# Market Analysis
Analyze ETH price trends
Monitor DeFi protocol yields
Check liquidity pool status

# Portfolio Management
Review token distribution
Calculate portfolio value
Assess market volatility

# Risk Assessment
Evaluate smart contract risk
Monitor gas prices
Track whale movements
```

Execute:
```bash
node agent/agent.js --file my-tasks.txt --address <CONTRACT_ADDRESS>
```

## Output Examples

### Successful Execution
```
✅ Transaction confirmed in block: 2
💰 Gas used: 206126

📊 Batch Execution Summary
✅ Successful: 10
❌ Failed: 0
📈 Success Rate: 100.0%
```

### Activity Report
```
📋 AI Agent Activity Report
1. createTask - Analyze ETH price trends
   TX Hash: 0x123...
   Timestamp: 2026-02-06T04:28:09.506Z
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Network error | Run `npm run node` in another terminal |
| Contract not found | Re-deploy with `--deploy` |
| Invalid task file | Check file path and format |
| Out of gas | Check account balance |

## Tips

1. **Save Contract Addresses**: Store deployed addresses for reuse
2. **Use Batch Mode**: More efficient for multiple tasks
3. **Task Files**: Great for recurring workflows
4. **Monitoring**: Useful for real-time event tracking
5. **Network Selection**: Use appropriate network for development vs production

## Advanced Usage

### Programmatic Access
```javascript
const { executeTask } = require('./agent/agent');
await executeTask({
  task: "Custom task",
  address: "0x...",
  monitor: true
});
```

### Custom Networks
Edit `hardhat.config.js` to add networks.

## Documentation

- Full Guide: [AGENT_CLI_GUIDE.md](AGENT_CLI_GUIDE.md)
- Main README: [README.md](README.md)
- Example Tasks: [tasks.example.txt](tasks.example.txt)
