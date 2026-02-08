# Web3 AI Multi-Agent System 🤖⛓️

<div align="center">

![GitHub](https://img.shields.io/github/license/hobostay/web3-ai-agent)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.0-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-%5E2.22.0-ffb84d)

**An AI-powered Multi-Agent system for automatically generating smart contracts**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## 📖 Overview

Web3 AI Multi-Agent System is a cutting-edge framework that uses multiple specialized AI agents to automatically generate, test, and deploy smart contracts. Simply describe what you want in natural language, and the system orchestrates multiple agents to handle the entire development workflow.

### ✨ Key Highlights

- 🧠 **Planner Agent** - Analyzes requirements and creates execution plans
- 💻 **Coder Agent** - Generates production-ready Solidity contracts
- 🧪 **Tester Agent** - Creates comprehensive test suites
- 🚀 **Deployer Agent** - Generates deployment scripts
- 🎯 **CLI Support** - Simple command-line interface
- 📦 **Batch Processing** - Handle multiple contract generation tasks

---

## 🚀 Features

### Multi-Agent Architecture

The system uses a coordinated team of AI agents, each specialized in a specific aspect of smart contract development:

#### 🧠 Planner Agent
- Analyzes user requirements in natural language
- Identifies contract type (ERC20, ERC721, DAO, etc.)
- Generates detailed execution plans
- Extracts specifications and features

#### 💻 Coder Agent
- Generates Solidity smart contracts
- Follows best practices and security standards
- Uses OpenZeppelin libraries
- Supports multiple contract templates

#### 🧪 Tester Agent
- Creates comprehensive test files
- Uses Hardhat and ethers.js
- Covers edge cases and security scenarios
- Generates readable test documentation

#### 🚀 Deployer Agent
- Creates deployment scripts
- Supports multiple networks (localhost, testnet, mainnet)
- Includes Etherscan verification
- Saves deployment records

### Supported Contract Types

| Type | Description | Features |
|------|-------------|----------|
| **ERC20** | Fungible Token | Mint, burn, transfer, owner controls |
| **ERC721** | Non-Fungible Token | Mint, metadata storage, ownership tracking |
| **DAO** | Decentralized Organization | Proposals, voting, quorum-based execution |
| **Voting** | Voting System | Time-based voting, execution logic |

---

## 🎯 Quick Start

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/hobostay/web3-ai-agent.git
cd web3-ai-agent

# Install dependencies
npm install

# Compile contracts
npm run compile
```

### Basic Usage

```bash
# Generate an ERC20 token
node agent/multi-agent.js "创建ERC20代币 MyToken"

# Generate an NFT contract
node agent/multi-agent.js "创建NFT合约 MyNFT"

# Generate a DAO contract
node agent/multi-agent.js "创建DAO合约 MyDAO"

# Multiple tasks
node agent/multi-agent.js "任务1" "任务2" "任务3"
```

### Output Example

```
======================================================================
🤖 Web3 AI Agent - Multi-Agent System
======================================================================

📝 Task: "创建ERC20代币 MyToken"

──────────────────────────────────────────────────────────────────────
🧠 Step 1: Planning
──────────────────────────────────────────────────────────────────────
✓ Task analyzed: ERC20 token
✓ Contract name: MyToken
✓ Plan generated with 6 steps

──────────────────────────────────────────────────────────────────────
💻 Step 2: Coding
──────────────────────────────────────────────────────────────────────
✓ Contract generated: MyToken.sol
  Location: contracts/MyToken.sol
  Size: 996 bytes

──────────────────────────────────────────────────────────────────────
🧪 Step 3: Testing
──────────────────────────────────────────────────────────────────────
✓ Test file generated: MyToken.test.js
  Location: test/MyToken.test.js
  Size: 3367 bytes

──────────────────────────────────────────────────────────────────────
🚀 Step 4: Deployment Script Generation
──────────────────────────────────────────────────────────────────────
✓ Deployment script generated: deploy-MyToken.js
  Location: scripts/deploy-MyToken.js

======================================================================
✅ Multi-Agent Execution Complete (1.51s)
======================================================================

📋 Next Steps:
  1. Review the generated contract: contracts/MyToken.sol
  2. Run tests: npx hardhat test test/MyToken.test.js
  3. Deploy: npx hardhat run scripts/deploy-MyToken.js --network <network>
```

---

## 🏗️ Architecture

### System Flow

```
User Input (Natural Language)
         ↓
┌─────────────────────────────────────┐
│  Multi-Agent Controller             │
│  (agent/multi-agent.js)             │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  1️⃣ Planner Agent                   │
│  • Task analysis                    │
│  • Type detection                   │
│  • Plan generation                  │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  2️⃣ Coder Agent                    │
│  • Solidity code generation         │
│  • Best practices                   │
│  • Security patterns                │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  3️⃣ Tester Agent                   │
│  • Test case generation             │
│  • Hardhat + ethers.js              │
│  • Edge case coverage               │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  4️⃣ Deployer Agent                 │
│  • Deployment scripts               │
│  • Multi-network support            │
│  • Verification support             │
└─────────────────────────────────────┘
```

### Project Structure

```
web3-ai-agent/
├── agent/                          # Multi-Agent System
│   ├── multi-agent.js             # Main controller
│   ├── planner.js                 # Planner agent
│   ├── coders/
│   │   └── coder.js              # Contract generator
│   ├── testers/
│   │   └── tester.js             # Test generator
│   └── deployers/
│       └── deployer.js           # Deployment script generator
├── contracts/                      # Generated Solidity contracts
├── test/                          # Generated test files
├── scripts/                       # Generated deployment scripts
├── reports/                       # Execution reports (gitignored)
├── deployments/                   # Deployment records (gitignored)
├── hardhat.config.js             # Hardhat configuration
├── package.json                  # Dependencies
├── MULTI_AGENT_GUIDE.md          # Complete guide
├── MULTI_AGENT_QUICK_REF.md      # Quick reference
└── README.md                     # This file
```

---

## 💻 Usage

### Command Line Interface

```bash
# Single contract generation
node agent/multi-agent.js "创建ERC20代币 TestToken"

# Multiple contracts
node agent/multi-agent.js "创建ERC20 Token1" "创建NFT NFT1" "创建DAO DAO1"

# View help
node agent/multi-agent.js
```

### After Generation

```bash
# 1. Review the generated contract
cat contracts/MyToken.sol

# 2. Run tests
npx hardhat test test/MyToken.test.js

# 3. Compile to verify
npx hardhat compile

# 4. Deploy to local network
npx hardhat node &                          # Terminal 1
npx hardhat run scripts/deploy-MyToken.js --network localhost  # Terminal 2

# 5. Deploy to testnet
npx hardhat run scripts/deploy-MyToken.js --network sepolia
```

### Generated Files

For each task, the system generates:

1. **Smart Contract** (`contracts/{ContractName}.sol`)
   - Production-ready Solidity code
   - OpenZeppelin imports
   - Security best practices
   - Comprehensive comments

2. **Test File** (`test/{ContractName}.test.js`)
   - Complete test suite
   - Edge case coverage
   - Clear documentation
   - Hardhat + ethers.js

3. **Deployment Script** (`scripts/deploy-{ContractName}.js`)
   - Network-agnostic deployment
   - Etherscan verification
   - Deployment record saving

---

## 🛠️ Technical Stack

### Blockchain & Smart Contracts
- **Solidity** ^0.8.0 - Smart contract language
- **Hardhat** ^2.22.0 - Ethereum development environment
- **Ethers.js** ^6.16.0 - Blockchain interaction
- **OpenZeppelin** ^5.4.0 - Secure contract library

### Development Tools
- **Chai** ^4.5.0 - Testing framework
- **Node.js** >= 18.x - Runtime environment
- **npm** - Package manager

### Agent System
- **Modular Architecture** - Each agent is independent
- **Async/Await** - Non-blocking execution
- **Error Handling** - Graceful failure handling
- **Progress Tracking** - Real-time status updates

---

## 📖 Documentation

- **[Multi-Agent Guide](MULTI_AGENT_GUIDE.md)** - Complete system documentation
- **[Quick Reference](MULTI_AGENT_QUICK_REF.md)** - Command quick reference
- **[Planner Guide](PLANNER_GUIDE.md)** - Planner agent documentation
- **[CLI Guide](AGENT_CLI_GUIDE.md)** - Legacy CLI documentation

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific contract
npm run test:token      # ERC20 token
npm run test:nft        # ERC721 NFT
npm run test:dao        # DAO voting

# Coverage report
npm run test:coverage
```

### Test Coverage

- ✅ Contract deployment
- ✅ Token functionality (mint, burn, transfer)
- ✅ NFT operations (mint, metadata, ownership)
- ✅ DAO governance (proposals, voting, execution)
- ✅ Access control
- ✅ Edge cases

---

## 🚀 Deployment

### Local Network

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy-MyToken.js --network localhost
```

### Testnet (Sepolia)

```bash
# Configure .env with your keys
npx hardhat run scripts/deploy-MyToken.js --network sepolia
```

### Mainnet

⚠️ **Caution**: Only deploy to mainnet after thorough testing!

```bash
npx hardhat run scripts/deploy-MyToken.js --network mainnet
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

```env
# Private key for deployment
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# API Keys
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

---

## 🤝 Contributing

Contributions are welcome!

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Adding New Agents

1. Create agent file in `agent/{agent_type}/`
2. Implement the agent interface
3. Import in `multi-agent.js`
4. Add tests
5. Update documentation

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Module not found` | Run `npm install` |
| `Hardhat not found` | Install globally: `npm install -g hardhat` |
| `Compilation errors` | Check OpenZeppelin is installed |
| `No output files` | Check `reports/` for error details |

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links & Resources

### Documentation
- [Hardhat Documentation](https://hardhat.org/)
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
- Multi-Agent architecture
- Natural language processing
- Automatic contract generation
- Comprehensive test generation
- Deployment script generation
- CLI interface
- Batch processing

### Planned Features 🚧
- [ ] LLM integration (GPT-4, Claude, Gemini)
- [ ] Custom contract templates
- [ ] Gas optimization suggestions
- [ ] Security audit integration
- [ ] Web-based UI
- [ ] Contract verification
- [ ] Multi-chain deployment
- [ ] Agent marketplace

---

## ⭐ Star History

If you find this project helpful, please consider giving it a star! ⭐

<div align="center">

**Built with ❤️ using Node.js, Hardhat, and Solidity**

[⬆ Back to Top](#web3-ai-multi-agent-system-⛓️)

</div>
