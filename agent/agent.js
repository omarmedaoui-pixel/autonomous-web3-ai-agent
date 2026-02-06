#!/usr/bin/env node
/**
 * Web3 AI Agent CLI
 * Usage: node agent/agent.js "Task description" [options]
 *
 * Options:
 *   --address <contract>  Use existing deployed contract
 *   --network <network>   Network to use (localhost, sepolia, etc.)
 *   --deploy              Deploy new contract
 *   --monitor             Enable event monitoring
 *   --file <path>         Read tasks from file (one per line)
 *   --batch               Execute multiple tasks (comma-separated)
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const Web3AIAgent = require("./index.js");

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    task: null,
    address: null,
    network: "hardhat",
    deploy: false,
    monitor: false,
    file: null,
    batch: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--address":
      case "-a":
        options.address = args[++i];
        break;
      case "--network":
      case "-n":
        options.network = args[++i];
        break;
      case "--deploy":
      case "-d":
        options.deploy = true;
        break;
      case "--monitor":
      case "-m":
        options.monitor = true;
        break;
      case "--file":
      case "-f":
        options.file = args[++i];
        break;
      case "--batch":
      case "-b":
        options.batch = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        if (!arg.startsWith("--") && !arg.startsWith("-")) {
          if (options.batch || arg.includes(",")) {
            // Handle batch tasks
            options.task = arg.split(",").map(t => t.trim());
          } else {
            options.task = arg;
          }
        }
    }
  }

  return options;
}

function printHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              Web3 AI Agent - CLI Interface                    ║
╚════════════════════════════════════════════════════════════════╝

Usage:
  node agent/agent.js "Task description" [options]

Options:
  -a, --address <contract>  Use existing deployed contract
  -n, --network <network>   Network to use (default: hardhat)
  -d, --deploy              Deploy new contract
  -m, --monitor             Enable event monitoring
  -f, --file <path>         Read tasks from file (one per line)
  -b, --batch               Execute multiple tasks (comma-separated)
  -h, --help                Show this help message

Examples:
  # Deploy new contract and execute task
  node agent/agent.js "Analyze ETH price" --deploy

  # Use existing contract
  node agent/agent.js "Monitor DeFi yields" --address 0x123...

  # With monitoring
  node agent/agent.js "Generate trading signals" --monitor

  # Batch execute multiple tasks
  node agent/agent.js "Task1,Task2,Task3" --batch --address 0x123...

  # Read tasks from file
  node agent/agent.js --file tasks.txt --address 0x123...

  # On specific network
  node agent/agent.js "Execute strategy" --network sepolia --deploy

  # Using npm script
  npm run agent:cli "Your task" --deploy
`);
}

/**
 * Deploy a new Web3AIAgent contract
 */
async function deployContract(signer) {
  console.log("📜 Deploying Web3AIAgent contract...");

  const Web3AIAgentContract = await hre.ethers.getContractFactory("Web3AIAgent");
  const contract = await Web3AIAgentContract.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✅ Contract deployed to: ${contractAddress}\n`);

  return { contract, address: contractAddress };
}

/**
 * Get existing contract instance
 */
async function getContract(address, signer) {
  console.log(`🔗 Connecting to contract at: ${address}`);

  // Get ABI from artifacts
  const artifact = await hre.artifacts.readArtifact("Web3AIAgent");
  const contract = new hre.ethers.Contract(address, artifact.abi, signer);

  // Verify contract is accessible
  try {
    const name = await contract.name();
    console.log(`✅ Connected to contract: ${name}\n`);
  } catch (error) {
    throw new Error(`Failed to connect to contract: ${error.message}`);
  }

  return contract;
}

/**
 * Execute multiple tasks in batch
 */
async function executeBatchTasks(agent, tasks) {
  console.log(`\n📦 Executing ${tasks.length} tasks in batch...\n`);

  const results = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    console.log(`\n[${i + 1}/${tasks.length}] ${task}`);

    try {
      const receipt = await agent.executeTask(task);
      results.push({ task, success: true, receipt });
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Task failed: ${error.message}`);
      results.push({ task, success: false, error: error.message });
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Batch Execution Summary");
  console.log("=".repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((successful / tasks.length) * 100).toFixed(1)}%\n`);

  return results;
}

/**
 * Execute agent task
 */
async function executeTask(options) {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 Web3 AI Agent");
  console.log("=".repeat(60) + "\n");

  // Get signer
  const [owner] = await hre.ethers.getSigners();
  console.log(`👤 Account: ${owner.address}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(owner.address))} ETH\n`);

  let contract, address;

  // Deploy or connect to contract
  if (options.deploy) {
    ({ contract, address } = await deployContract(owner));
  } else if (options.address) {
    contract = await getContract(options.address, owner);
    address = options.address;
  } else {
    console.log("⚠️  No contract specified. Use --deploy or --address <address>");
    console.log("💡 Run with --help for usage information\n");
    process.exit(1);
  }

  // Initialize agent
  const agent = new Web3AIAgent(
    address,
    contract.interface.format(),
    owner
  );

  // Start monitoring if requested
  if (options.monitor) {
    await agent.monitorEvents();
    console.log("👁️  Event monitoring enabled\n");
  }

  // Analyze contract state
  console.log("📊 Analyzing contract state...\n");
  const analysis = await agent.analyze();

  // Execute task(s) if provided
  if (options.task) {
    const tasks = Array.isArray(options.task) ? options.task : [options.task];

    if (tasks.length > 1) {
      await executeBatchTasks(agent, tasks);
    } else {
      console.log(`🎯 Executing task: "${tasks[0]}"\n`);
      await agent.executeTask(tasks[0]);

      // Wait a bit for transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Analyze again
    console.log("\n📊 Updated contract state:\n");
    await agent.analyze();

    // Generate report
    agent.generateReport();
  } else {
    console.log("ℹ️  No task specified. Agent initialized and ready.\n");
    console.log("💡 Provide a task argument to execute:");
    console.log('   node agent/agent.js "Your task here" --address ' + address + "\n");
  }

  // Keep monitoring if enabled
  if (options.monitor) {
    console.log("⏳ Monitoring events... Press Ctrl+C to stop\n");
    // Keep process alive
  } else {
    console.log("\n✅ Agent execution completed!\n");
  }

  return { agent, address };
}

/**
 * Read tasks from file
 */
function readTasksFromFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, "utf-8");

    // Split by lines and filter empty lines/comments
    const tasks = content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#"));

    console.log(`📄 Loaded ${tasks.length} tasks from ${filePath}`);
    return tasks;
  } catch (error) {
    throw new Error(`Failed to read tasks from file: ${error.message}`);
  }
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  // Handle file input
  if (options.file) {
    options.task = readTasksFromFile(options.file);
  }

  // Check if task is provided when not in help mode
  if (!options.task && !options.deploy && !process.argv.includes("--help")) {
    console.log("⚠️  No task specified.\n");
    printHelp();
    process.exit(1);
  }

  // Set network if specified
  if (options.network && options.network !== "hardhat") {
    hre.changeNetwork(options.network);
  }

  try {
    await executeTask(options);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    if (error.message.includes("network")) {
      console.log("💡 Make sure the network is running or use --network hardhat");
    }
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n🛑 Shutting down agent...\n");
  process.exit(0);
});

// Run
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { executeTask, parseArgs };
