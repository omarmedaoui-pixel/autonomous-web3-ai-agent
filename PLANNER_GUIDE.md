# Web3 AI Agent - Planner Module Guide

## 📖 Overview

The Planner module is an intelligent task analysis and execution planning system for Web3 development. It automatically analyzes user tasks, identifies contract types, and generates detailed execution plans.

## 🎯 Features

- **Intelligent Task Analysis** - Automatically identifies contract types (ERC20, NFT, DAO, Staking)
- **Feature Extraction** - Detects required features from task descriptions
- **Execution Planning** - Generates step-by-step deployment plans
- **Batch Processing** - Handle multiple tasks efficiently
- **Modular Architecture** - Easy to extend and customize

## 🏗️ Architecture

```
agent/
├── planner.js              # Main planner controller
├── planner-cli.js          # CLI interface
├── executor.js             # Plan execution engine
├── analyzers/
│   └── taskAnalyzer.js     # Task analysis module
└── planners/
    └── planGenerator.js    # Plan generation module
```

### Components

1. **TaskAnalyzer** - Analyzes user tasks and extracts information
2. **PlanGenerator** - Generates execution plans based on analysis
3. **PlanExecutor** - Executes generated plans
4. **Planner** - Main controller coordinating all components

## 🚀 Usage

### Basic Usage

```bash
# Single task
node agent/planner-cli.js "Create an ERC20 token called MyToken"

# Generate plan without executing
node agent/planner-cli.js "Deploy an NFT collection" --no-execute

# Batch processing
node agent/planner-cli.js --file tasks-planner.example.txt

# Verbose mode
node agent/planner-cli.js "Create a DAO" --verbose
```

### Supported Task Types

#### ERC20 Tokens
```
"Create an ERC20 token with minting"
"Deploy a deflationary token with 2% tax"
"Build a governance token for voting"
```

#### NFT Collections
```
"Create an NFT collection called DigitalArt"
"Deploy an NFT contract with voting rights"
"Build a gaming NFT with batch minting"
```

#### DAO Contracts
```
"Create a DAO with proposal system"
"Deploy a governance DAO with timelock"
"Build a charity DAO for community decisions"
```

#### Staking Contracts
```
"Create a staking contract with rewards"
"Deploy a liquidity pool staking system"
"Build a locked staking with vesting"
```

## 📊 Analysis Process

### 1. Task Analysis

The analyzer examines the task and identifies:

- **Type**: ERC20, NFT, DAO, Staking, or General
- **Subtype**: Standard, deflationary, reward, etc.
- **Complexity**: Simple, medium, or complex
- **Confidence**: 0.0 to 1.0
- **Features**: Mintable, burnable, pausable, etc.
- **Contract Name**: Extracted or generated

### 2. Plan Generation

Based on analysis, the generator creates:

```json
{
  "type": "ERC20",
  "contractName": "MyToken",
  "needsTest": true,
  "needsDeploy": true,
  "needsCompile": true,
  "estimatedGas": 2000000,
  "estimatedTime": "5-10 minutes",
  "steps": [...],
  "features": ["mintable", "burnable"],
  "contractConfig": {...}
}
```

### 3. Execution

The executor follows the plan:

1. Compile contracts
2. Run tests
3. Start local network
4. Deploy contract
5. Verify deployment
6. Initialize features
7. Interaction tests

## 💻 Programmatic Usage

```javascript
const Planner = require("./agent/planner");

async function example() {
  // Initialize planner
  const planner = new Planner(hre);

  // Process a single task
  const result = await planner.process(
    "Create an ERC20 token called MyToken",
    { autoExecute: true }
  );

  console.log(result);

  // Batch processing
  const tasks = [
    "Create an ERC20 token",
    "Deploy an NFT collection",
    "Build a DAO contract"
  ];

  const batchResult = await planner.processBatch(tasks);
  console.log(batchResult);
}
```

## 🔧 Configuration

### Task Analysis Configuration

The analyzer uses keywords and patterns to identify tasks:

```javascript
// In agent/analyzers/taskAnalyzer.js

keywords: {
  types: {
    ERC20: ["token", "erc20", "coin", "cryptocurrency"],
    NFT: ["nft", "erc721", "non-fungible", "collectible"],
    DAO: ["dao", "governance", "voting", "proposal"],
    STAKING: ["stake", "staking", "farm", "yield"]
  }
}
```

### Plan Templates

Templates define default behavior for each contract type:

```javascript
// In agent/planners/planGenerator.js

ERC20: {
  defaultContractName: "MyToken",
  needsTest: true,
  needsDeploy: true,
  estimatedGas: 2000000,
  estimatedTime: "5-10 minutes"
}
```

## 📝 Example Output

### Single Task Execution

```
╔════════════════════════════════════════════════════════════════╗
║            🧠 Web3 AI Agent - Intelligent Planner               ║
╚════════════════════════════════════════════════════════════════╝

📝 Task: "Create an ERC20 token called MyToken"

🔍 Step 1: Analyzing task...

┌─ Analysis Results:
│  Type:           ERC20
│  Confidence:     85.0%
│  Subtype:        standard
│  Complexity:     medium
│  Keywords:       create, erc20, token
└─────────────────────────────────────────────────────

📋 Step 2: Generating execution plan...

┌─ Execution Plan:
│  Type:           ERC20
│  Contract:       MyToken
│  Needs Test:     ✓
│  Needs Deploy:   ✓
│  Estimated Steps: 7
│
│  Steps:
│    1. Compile smart contracts
│    2. Run tests for ERC20 contract
│    3. Start local blockchain network
│    4. Deploy MyToken contract
│    5. Verify contract deployment
│    6. Initialize features: mintable, burnable
│    7. Perform interaction tests
└─────────────────────────────────────────────────────

⚙️  Step 3: Executing plan...

──────────────────────────────────────────────────────
⚙️  Executing ERC20 Plan
──────────────────────────────────────────────────────

▶️  [1/7] Compile smart contracts
   ✓ Completed

▶️  [2/7] Run tests for ERC20 contract
   ✓ Completed

▶️  [4/7] Deploy MyToken contract
   ✓ Contract deployed: 0x5FbDB2315678afecb367f032d93F642f64180aa3

════════════════════════════════════════════════════════
📊 Execution Summary
════════════════════════════════════════════════════════
Status:    ✓ Success
Duration:  45s
Completed: 5/5

Deployed Contracts:
  • MyToken: 0x5FbDB2315678afecb367f032d93F642f64180aa3
════════════════════════════════════════════════════════

✅ Completed successfully!
```

## 🔍 Advanced Features

### Custom Feature Detection

The planner automatically detects features from task descriptions:

| Feature | Trigger Keywords |
|---------|-----------------|
| mintable | mint, create, issue |
| burnable | burn, destroy, deflation |
| pausable | pause, stop, freeze |
| governance | vote, govern, dao |
| royalty | royalty, fees |
| timelock | timelock, delay |
| vesting | vest, lock, schedule |

### Complexity Assessment

Tasks are classified by complexity:

- **Simple**: Basic contract deployment (< 10 points)
- **Medium**: Contracts with additional features (10-20 points)
- **Complex**: Multi-contract systems (> 20 points)

## 🛠️ Extending the Planner

### Adding New Contract Types

1. **Add keywords** to `taskAnalyzer.js`:

```javascript
keywords: {
  types: {
    YOUR_TYPE: ["keyword1", "keyword2"]
  }
}
```

2. **Add template** to `planGenerator.js`:

```javascript
YOUR_TYPE: {
  defaultContractName: "YourContract",
  needsTest: true,
  needsDeploy: true,
  estimatedGas: 2000000
}
```

3. **Add patterns** to `taskAnalyzer.js`:

```javascript
patterns: {
  YOUR_TYPE: [
    /your pattern/i
  ]
}
```

## 📚 API Reference

### Planner

```javascript
const planner = new Planner(hre);

// Process single task
await planner.process(task, options);

// Process batch tasks
await planner.processBatch(tasks, options);

// Get plan details
planner.getPlan(planId);

// List all plans
planner.listPlans();
```

### TaskAnalyzer

```javascript
const analyzer = new TaskAnalyzer(hre);

// Analyze task
const analysis = await analyzer.analyze(task);
// Returns: { type, subtype, keywords, complexity, confidence, features }
```

### PlanGenerator

```javascript
const generator = new PlanGenerator(hre);

// Generate plan
const plan = await generator.generate(analysis, originalTask);
// Returns: { type, contractName, steps, features, contractConfig }
```

### PlanExecutor

```javascript
const executor = new PlanExecutor(hre);

// Execute plan
const result = await executor.execute(plan, options);
// Returns: { success, steps, transactions, deployedContracts }
```

## 🐛 Troubleshooting

### Issue: "Type not recognized"

**Solution**: Use clearer keywords in your task description
```
❌ "Build a contract"
✅ "Create an ERC20 token"
```

### Issue: "Execution failed at step X"

**Solution**: Check that local network is running
```bash
npm run node  # In separate terminal
```

### Issue: "Contract not found"

**Solution**: Ensure contracts are compiled
```bash
npm run compile
```

## 📖 Related Documentation

- [CLI Quick Reference](CLI_QUICK_REF.md)
- [Agent CLI Guide](AGENT_CLI_GUIDE.md)
- [Main README](README.md)

## 🚧 Future Enhancements

- [ ] LLM integration for natural language understanding
- [ ] Multi-contract dependency resolution
- [ ] Gas optimization suggestions
- [ ] Security audit recommendations
- [ ] Test coverage analysis
- [ ] Automatic documentation generation

---

**Built with ❤️ for Web3 developers**
