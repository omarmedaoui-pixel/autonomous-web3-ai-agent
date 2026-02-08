# Web3 AI Agent - Multi-Agent Architecture Guide

## 📖 Overview

The Web3 AI Agent has been upgraded to a **Multi-Agent Architecture** that orchestrates multiple specialized agents to work together on complex tasks.

## 🏗️ Architecture

### Agent Components

```
用户输入
    ↓
┌─────────────────────────────────────────┐
│     Multi-Agent Controller              │
│         (agent/multi-agent.js)          │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  1️⃣ Planner Agent                      │
│     - 分析任务                           │
│     - 生成执行计划                       │
│     - (agent/planner.js)                │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  2️⃣ Coder Agent                        │
│     - 生成Solidity合约                  │
│     - 保存到contracts/                   │
│     - (agent/coders/coder.js)           │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  3️⃣ Tester Agent                       │
│     - 生成测试文件                       │
│     - 使用Hardhat & ethers.js           │
│     - 保存到test/                        │
│     - (agent/testers/tester.js)         │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  4️⃣ Deployer Agent                     │
│     - 生成部署脚本                       │
│     - 保存到scripts/                     │
│     - (agent/deployers/deployer.js)     │
└─────────────────────────────────────────┘
```

## 🚀 Usage

### Basic Usage

```bash
# Single task
node agent/multi-agent.js "创建ERC20代币 TestToken"

# Multiple tasks
node agent/multi-agent.js "创建ERC20代币 Token1" "创建NFT合约 MyNFT"
```

### Examples

#### 1. Create ERC20 Token

```bash
node agent/multi-agent.js "创建ERC20代币 TestToken"
```

**Generated Files:**
- `contracts/TestToken.sol` - Solidity contract
- `test/TestToken.test.js` - Test file
- `scripts/deploy-TestToken.js` - Deployment script

#### 2. Create NFT Contract

```bash
node agent/multi-agent.js "创建NFT合约 MyNFT --symbol MNFT"
```

#### 3. Create DAO Contract

```bash
node agent/multi-agent.js "创建DAO合约 MyDAO --quorum 60"
```

## 📁 Project Structure

```
web3-ai-agent/
├── agent/
│   ├── multi-agent.js          # Main controller
│   ├── planner.js              # Planner agent
│   ├── coders/
│   │   └── coder.js            # Contract generator
│   ├── testers/
│   │   └── tester.js           # Test generator
│   └── deployers/
│       └── deployer.js         # Deployment script generator
├── contracts/                  # Generated contracts
├── test/                       # Generated tests
├── scripts/                    # Generated deployment scripts
├── reports/                    # Execution reports
└── deployments/                # Deployment records
```

## 🔧 Development

### Adding a New Agent

1. Create a new directory under `agent/`:
```bash
mkdir agent/newagents
```

2. Create your agent file:
```javascript
// agent/newagents/myagent.js
class MyAgent {
  constructor(hre) {
    this.hre = hre;
  }

  async generate(plan) {
    // Your implementation
    return { success: true, data: ... };
  }
}

module.exports = MyAgent;
```

3. Import and use in `multi-agent.js`:
```javascript
const MyAgent = require("./newagents/myagent");

// In MultiAgentController constructor
this.myAgent = new MyAgent(hre);

// In process() method
const result = await this.myAgent.generate(plan);
```

### Agent Interface

All agents should follow this interface:

```javascript
class Agent {
  constructor(hre) {
    this.hre = hre;
  }

  /**
   * Generate artifacts based on plan
   * @param {object} plan - Execution plan from planner
   * @returns {Promise<object>} Result with success flag
   */
  async generate(plan) {
    // Implementation
    return {
      success: true,
      fileName: "...",
      filePath: "...",
      data: ...
    };
  }
}
```

## 📊 Execution Flow

```
1. User Input
   ↓
2. Multi-Agent Controller receives task
   ↓
3. Planner Agent analyzes task
   - Task type detection
   - Requirement extraction
   - Plan generation
   ↓
4. Coder Agent generates contract
   - Based on plan type (ERC20, ERC721, DAO, etc.)
   - Saves to contracts/
   ↓
5. Tester Agent generates tests
   - Comprehensive test cases
   - Uses Hardhat + ethers.js
   - Saves to test/
   ↓
6. Deployer Agent generates deployment script
   - Network-agnostic deployment
   - Etherscan verification support
   - Saves to scripts/
   ↓
7. Summary & Report
   - Execution summary
   - Next steps guidance
   - Saves report to reports/
```

## 🎯 Supported Contract Types

| Type | Description | Features |
|------|-------------|----------|
| **ERC20** | Fungible Token | Mint, burn, transfer |
| **ERC721** | Non-Fungible Token | Mint, URI storage, ownership |
| **DAO** | Decentralized Autonomous Organization | Proposals, voting, execution |
| **Voting** | Voting System | Quorum-based voting |

## 📝 Generated Files

### Contract Example (ERC20)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20, Ownable {
    constructor() ERC20("TestToken", "TSTKN") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
```

### Test Example

```javascript
describe("TestToken", function () {
  it("Should deploy successfully", async function () {
    // Test implementation
  });
});
```

### Deploy Script Example

```javascript
async function main() {
  const TestToken = await hre.ethers.deployContract("TestToken");
  await TestToken.waitForDeployment();
  console.log("Deployed to:", await TestToken.getAddress());
}
```

## 🔍 Testing Generated Contracts

```bash
# Run all tests
npx hardhat test

# Run specific test
npx hardhat test test/TestToken.test.js

# Run with coverage
npx hardhat coverage
```

## 🚢 Deploying Generated Contracts

```bash
# Deploy to local network
npx hardhat run scripts/deploy-TestToken.js

# Deploy to testnet (e.g., Sepolia)
npx hardhat run scripts/deploy-TestToken.js --network sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy-TestToken.js --network mainnet
```

## 📚 Next Steps

1. **Review Generated Code**
   ```bash
   cat contracts/TestToken.sol
   ```

2. **Run Tests**
   ```bash
   npx hardhat test
   ```

3. **Compile Contracts**
   ```bash
   npx hardhat compile
   ```

4. **Deploy**
   ```bash
   npx hardhat run scripts/deploy-TestToken.js --network localhost
   ```

## 🐛 Troubleshooting

### Common Issues

1. **"Module not found"**
   - Ensure all dependencies are installed: `npm install`

2. **"Hardhat not found"**
   - Install Hardhat globally: `npm install -g hardhat`

3. **Contract compilation errors**
   - Check OpenZeppelin contracts are installed
   - Run: `npm install @openzeppelin/contracts`

## 📖 Related Documentation

- [AGENT_CLI_GUIDE.md](AGENT_CLI_GUIDE.md) - CLI usage guide
- [PLANNER_GUIDE.md](PLANNER_GUIDE.md) - Planner agent guide
- [CLI_QUICK_REF.md](CLI_QUICK_REF.md) - CLI quick reference

## 🤝 Contributing

To add new features or agents:

1. Follow the agent interface
2. Add comprehensive tests
3. Update documentation
4. Submit PR

## 📄 License

MIT License - See LICENSE file for details
