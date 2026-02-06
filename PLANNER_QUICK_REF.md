# Planner Module - Quick Reference

## 🚀 Quick Start

```bash
# Create an ERC20 token
node agent/planner-cli.js "Create an ERC20 token called RewardToken"

# Deploy an NFT collection
node agent/planner-cli.js "Deploy an NFT collection for digital art"

# Build a DAO
node agent/planner-cli.js "Create a DAO with voting and governance"

# Plan without executing
node agent/planner-cli.js "Build a staking contract" --no-execute

# Batch processing
node agent/planner-cli.js --file tasks-planner.example.txt
```

## 📋 Task Types

### ERC20 Tokens
```
"Create an ERC20 token"
"Deploy a deflationary token with tax"
"Build a governance token"
```

### NFT Collections
```
"Create an NFT collection"
"Deploy an art NFT with royalties"
"Build a gaming NFT"
```

### DAO Contracts
```
"Create a DAO"
"Deploy a voting DAO"
"Build a governance system"
```

### Staking Contracts
```
"Create a staking contract"
"Deploy a yield farming system"
"Build a locked staking contract"
```

## 🎯 Output Format

### Analysis Results
- **Type**: Contract type (ERC20, NFT, DAO, STAKING)
- **Confidence**: 0-100%
- **Complexity**: simple/medium/complex
- **Features**: Extracted features (mintable, burnable, etc.)

### Execution Plan
- **Contract Name**: Auto-extracted or generated
- **Steps**: 6-7 detailed steps
- **Estimated Gas**: Gas estimation
- **Estimated Time**: Time estimation
- **Contract Config**: Full configuration

## 🔧 Options

| Option | Description |
|--------|-------------|
| `--file <path>` | Read tasks from file |
| `--no-execute` | Generate plan without executing |
| `--output <format>` | Output format (json, pretty) |
| `--verbose` | Verbose output |
| `--help` | Show help |

## 📖 Examples

### Example 1: ERC20 Token
```bash
node agent/planner-cli.js "Create an ERC20 token called MyToken with minting and burning"
```

**Output:**
- Type: ERC20
- Confidence: 100%
- Features: mintable, burnable
- Contract: MyToken (MTK)

### Example 2: NFT Collection
```bash
node agent/planner-cli.js "Deploy an NFT collection called DigitalArt with metadata support"
```

**Output:**
- Type: NFT
- Subtype: art
- Features: metadata
- Contract: DigitalArt (DA)

### Example 3: Batch Processing
```bash
cat > tasks.txt << EOF
Create an ERC20 token
Deploy an NFT collection
Build a DAO contract
EOF

node agent/planner-cli.js --file tasks.txt
```

## 🏗️ Architecture

```
Planner (Controller)
  ├── TaskAnalyzer
  │   ├── Type Detection
  │   ├── Feature Extraction
  │   └── Complexity Assessment
  ├── PlanGenerator
  │   ├── Step Generation
  │   ├── Contract Config
  │   └── Script Selection
  └── PlanExecutor
      ├── Compilation
      ├── Testing
      └── Deployment
```

## 💡 Tips

1. **Be Specific**: "Create an ERC20 token" is better than "Build a contract"
2. **Use Keywords**: Include keywords like "token", "NFT", "DAO", "staking"
3. **Specify Features**: Add "with minting", "with voting", etc.
4. **Name Your Contract**: "called MyToken" or "named MyNFT"

## 🔍 Feature Detection

| Feature | Keywords |
|---------|----------|
| mintable | mint, create, issue |
| burnable | burn, destroy, deflation |
| pausable | pause, stop, freeze |
| governance | vote, govern, dao |
| royalty | royalty, fees |
| timelock | timelock, delay |
| vesting | vest, lock, schedule |

## 📚 Documentation

- [PLANNER_GUIDE.md](PLANNER_GUIDE.md) - Complete guide
- [tasks-planner.example.txt](tasks-planner.example.txt) - Example tasks
- [README.md](README.md) - Main documentation

## 🚀 Advanced Usage

### Programmatic API
```javascript
const Planner = require("./agent/planner");

const planner = new Planner(hre);

// Single task
const result = await planner.process("Create an ERC20 token");

// Batch tasks
const results = await planner.processBatch([
  "Create token",
  "Deploy NFT",
  "Build DAO"
]);

// Get plan details
const plan = planner.getPlan(result.planId);
```

---

**Quick Start:** `node agent/planner-cli.js "Create an ERC20 token"`
