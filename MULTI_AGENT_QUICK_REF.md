# Multi-Agent Quick Reference

## 🚀 Quick Start

```bash
# Basic usage
node agent/multi-agent.js "创建ERC20代币 TestToken"

# Multiple tasks
node agent/multi-agent.js "Task 1" "Task 2" "Task 3"
```

## 📋 Command Examples

| Command | Description |
|---------|-------------|
| `node agent/multi-agent.js "创建ERC20代币 TestToken"` | Create ERC20 token |
| `node agent/multi-agent.js "创建NFT合约 MyNFT"` | Create NFT contract |
| `node agent/multi-agent.js "创建DAO合约 MyDAO"` | Create DAO contract |
| `node agent/multi-agent.js "创建投票合约 Voting"` | Create voting contract |

## 📁 Generated Files

After running, you'll get:

```
contracts/
  └── {ContractName}.sol      # Solidity contract

test/
  └── {ContractName}.test.js  # Test file

scripts/
  └── deploy-{ContractName}.js # Deployment script

reports/
  └── report-{timestamp}.json  # Execution report
```

## 🔧 Next Steps

```bash
# 1. Review contract
cat contracts/TestToken.sol

# 2. Run tests
npx hardhat test

# 3. Deploy to local network
npx hardhat node &                    # Terminal 1
npx hardhat run scripts/deploy-TestToken.js --network localhost  # Terminal 2

# 4. Deploy to testnet
npx hardhat run scripts/deploy-TestToken.js --network sepolia
```

## 🏗️ Architecture Flow

```
Input → Planner → Coder → Tester → Deployer → Output
```

## 📊 Execution Report

JSON report saved to `reports/report-{timestamp}.json`:

```json
{
  "timestamp": "2025-02-08T...",
  "task": "创建ERC20代币 TestToken",
  "success": true,
  "generated": {
    "contract": "TestToken.sol",
    "test": "TestToken.test.js",
    "deployScript": "deploy-TestToken.js"
  }
}
```

## 🎯 Supported Types

- **ERC20**: Fungible tokens
- **ERC721**: NFTs
- **DAO**: Decentralized organizations
- **Voting**: Voting systems

## 📚 Full Guide

See [MULTI_AGENT_GUIDE.md](MULTI_AGENT_GUIDE.md) for complete documentation.
