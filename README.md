# Web3 AI Agent 🤖⛓️

<div align="center">

![GitHub](https://img.shields.io/github/license/yourusername/web3-ai-agent)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.0-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-%5E2.22.0-ffb84d)

**A next-generation AI-powered agent framework for interacting with smart contracts on the Ethereum blockchain**

[Features](#-features) • [Quick Start](#-quick-start) • [CLI Usage](#-cli-usage) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

Web3 AI Agent is a powerful framework that combines artificial intelligence with blockchain technology. It provides both a **programmatic API** and a **command-line interface** for automating smart contract interactions, monitoring events, and executing complex workflows on Ethereum.

### ✨ Key Highlights

- 🚀 **CLI Interface** - Execute tasks directly from command line
- 📊 **Batch Processing** - Handle multiple tasks efficiently
- 📁 **File-Based Tasks** - Define workflows in text files
- 👁️ **Real-Time Monitoring** - Listen to blockchain events as they happen
- 🧪 **Comprehensive Testing** - Full test suite with coverage reports
- 🔧 **Developer Friendly** - Easy to extend and customize

---

## 🚀 Features

### Core Capabilities

- **Smart Contract Integration** - Seamless interaction with Solidity contracts
- **Task Execution Engine** - Deploy and execute tasks on-chain
- **Real-Time Event Monitoring** - Listen to and analyze blockchain events
- **State Analysis** - Deep analysis of contract states and data
- **Batch Processing** - Execute multiple tasks in a single transaction
- **Activity Reporting** - Generate detailed execution reports
- **Extensible Architecture** - Easy to add new capabilities

### Smart Contracts Included

- **Web3AIAgent.sol** - Core agent contract with task management
- **MyToken.sol** - ERC20 token implementation
- **Web3NFT.sol** - ERC721 NFT contract with metadata
- **VotingDAO.sol** - Decentralized voting system

---

## 🎯 Quick Start

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/web3-ai-agent.git
cd web3-ai-agent

# Install dependencies
npm install

# Compile contracts
npm run compile
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific contract tests
npm run test:token
npm run test:nft
npm run test:dao

# Run with coverage
npm run test:coverage
```

### 5-Minute Demo

```bash
# 1. Start local network (Terminal 1)
npm run node

# 2. Deploy and execute tasks (Terminal 2)
node agent/agent.js "Analyze market trends" --deploy

# That's it! Your agent is now running on blockchain! 🎉
```

---

## 💻 CLI Usage

The Web3 AI Agent provides a powerful CLI for automated task execution.

### Basic Commands

```bash
# Deploy contract and execute a task
node agent/agent.js "Your task description" --deploy

# Use existing contract
node agent/agent.js "Task description" --address <CONTRACT_ADDRESS>

# Execute multiple tasks (batch mode)
node agent/agent.js "Task1,Task2,Task3" --batch --address <CONTRACT_ADDRESS>

# Execute tasks from file
node agent/agent.js --file tasks.txt --address <CONTRACT_ADDRESS>

# Enable event monitoring
node agent/agent.js "Task" --monitor --address <CONTRACT_ADDRESS>
```

### CLI Options

| Option | Short | Description |
|--------|-------|-------------|
| `--deploy` | `-d` | Deploy new contract |
| `--address <addr>` | `-a` | Use existing deployed contract |
| `--network <net>` | `-n` | Specify network (hardhat, localhost, sepolia) |
| `--monitor` | `-m` | Enable real-time event monitoring |
| `--batch` | `-b` | Execute multiple tasks |
| `--file <path>` | `-f` | Read tasks from file |
| `--help` | `-h` | Show help message |

### Advanced Examples

```bash
# Deploy to specific network
node agent/agent.js "Execute strategy" --network sepolia --deploy

# Using npm script
npm run agent:cli "Your task" -- --deploy

# Interactive demo
./demo-cli.sh
```

### Output Example

```
============================================================
🚀 Web3 AI Agent
============================================================

👤 Account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💰 Balance: 10000.0 ETH

📜 Deploying Web3AIAgent contract...
✅ Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

📦 Executing 3 tasks in batch...

[1/3] Monitor ETH price
✅ Transaction confirmed in block: 2
💰 Gas used: 160877

[2/3] Analyze DeFi yields
✅ Transaction confirmed in block: 3
💰 Gas used: 126701

[3/3] Generate trading signals
✅ Transaction confirmed in block: 4
💰 Gas used: 126761

============================================================
📊 Batch Execution Summary
============================================================
✅ Successful: 3
❌ Failed: 0
📈 Success Rate: 100.0%

✅ Agent execution completed!
```

---

## 📁 Project Structure

```
web3-ai-agent/
├── agent/                 # AI Agent framework
│   ├── agent.js          # CLI entry point (executable)
│   └── index.js          # Agent class implementation
├── contracts/            # Solidity smart contracts
│   ├── Web3AIAgent.sol   # Core agent contract
│   ├── MyToken.sol       # ERC20 token
│   ├── Web3NFT.sol       # ERC721 NFT
│   └── VotingDAO.sol     # DAO voting system
├── scripts/              # Deployment and utility scripts
│   ├── deploy.js         # Deploy main contract
│   ├── deploy-token.js   # Deploy token contract
│   ├── run-agent.js      # Run agent demo
│   ├── demo-nft-dao.js   # NFT & DAO demo
│   └── interact-token.js # Token interaction demo
├── test/                 # Contract tests
│   ├── Web3AIAgent.test.js
│   ├── MyToken.test.js
│   ├── Web3NFT.test.js
│   └── VotingDAO.test.js
├── artifacts/            # Compiled contracts (gitignored)
├── cache/                # Hardhat cache (gitignored)
├── hardhat.config.js     # Hardhat configuration
├── package.json          # Project dependencies
├── tasks.example.txt     # Example tasks file
├── demo-cli.sh          # Interactive demo script
├── AGENT_CLI_GUIDE.md   # Complete CLI guide
├── CLI_QUICK_REF.md     # Quick reference card
└── README.md            # This file
```

---

## 🛠️ Technical Stack

### Blockchain & Smart Contracts
- **Solidity** ^0.8.0 - Smart contract language
- **Hardhat** ^2.28.4 - Ethereum development environment
- **Ethers.js** ^6.16.0 - Blockchain interaction library
- **OpenZeppelin** ^5.4.0 - Secure contract library

### Development Tools
- **Chai** ^4.5.0 - Testing framework
- **Node.js** >= 18.x - Runtime environment
- **npm** - Package manager

### Smart Contract Features
- ERC20 Token standard
- ERC721 NFT standard with metadata
- DAO governance with voting
- Access control (Ownable)
- Event emission and monitoring

---

## 📖 Documentation

- **[CLI Quick Reference](CLI_QUICK_REF.md)** - Quick command reference card
- **[Complete CLI Guide](AGENT_CLI_GUIDE.md)** - Detailed CLI documentation
- **[Update Log](AGENT_CLI_UPDATE.md)** - Recent changes and updates

---

## 🧪 Testing

The project includes comprehensive tests for all smart contracts:

```bash
# Run all tests
npm test

# Test specific contracts
npm run test:token      # Test ERC20 token
npm run test:nft        # Test ERC721 NFT
npm run test:dao        # Test DAO voting

# Coverage report
npm run test:coverage
```

### Test Coverage

- ✅ Contract deployment
- ✅ Task creation and execution
- ✅ Event emission
- ✅ Access control
- ✅ Token transfers
- ✅ NFT minting and metadata
- ✅ DAO voting mechanism

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Private key for deployment (use hardhat default for local)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# API Keys (optional, for future features)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

### Hardhat Config

Edit `hardhat.config.js` to configure:
- Solidity compiler version
- Network settings (localhost, sepolia, mainnet)
- Gas settings
- Etherscan verification

---

## 🚀 Deployment

### Local Network

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy contracts
npm run deploy:local
```

### Testnet (Sepolia)

```bash
# Configure .env with your keys
# Deploy to Sepolia
npm run deploy:sepolia
```

### Mainnet

⚠️ **Caution**: Only deploy to mainnet after thorough testing!

```bash
# Configure mainnet settings in hardhat.config.js
# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

---

## 📖 Programmatic Usage

```javascript
const Web3AIAgent = require("./agent/index.js");

// Initialize agent
const agent = new Web3AIAgent(
  contractAddress,
  contractABI,
  signer
);

// Analyze contract state
const analysis = await agent.analyze();
console.log(analysis);

// Execute a task
await agent.executeTask("Analyze market data");

// Monitor events (real-time)
await agent.monitorEvents();

// Generate activity report
agent.generateReport();
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `Network error` | Run `npm run node` in another terminal |
| `Contract not found` | Re-deploy with `--deploy` flag |
| `Out of gas` | Check account balance |
| `Private key error` | Check `.env` file configuration |

### Getting Help

- 📖 Check the [CLI Guide](AGENT_CLI_GUIDE.md)
- 📋 Review [Quick Reference](CLI_QUICK_REF.md)
- 🐛 [Open an issue](https://github.com/yourusername/web3-ai-agent/issues)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links & Resources

### Documentation
- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity Documentation](https://docs.soliditylang.org/)

### Related Projects
- [Hardhat](https://github.com/NomicFoundation/hardhat)
- [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [ethers.js](https://github.com/ethers-io/ethers.js/)

---

## 🎓 Roadmap

### Current Features ✅
- CLI interface for task execution
- Batch task processing
- File-based task configuration
- Real-time event monitoring
- Multiple smart contract templates
- Comprehensive test suite

### Planned Features 🚧
- [ ] LLM integration (GPT-4, Claude)
- [ ] Multi-chain support (BSC, Polygon, Arbitrum)
- [ ] Advanced analytics dashboard
- [ ] Subgraph integration
- [ ] MEV protection strategies
- [ ] Gas optimization strategies
- [ ] Task scheduling (cron-based)
- [ ] Web-based management UI
- [ ] Plugin system for extensions

---

## ⭐ Star History

If you find this project helpful, please consider giving it a star! ⭐

<div align="center">

**Built with ❤️ using Hardhat, ethers.js, and Solidity**

[⬆ Back to Top](#web3-ai-agent-⛓️)

</div>
