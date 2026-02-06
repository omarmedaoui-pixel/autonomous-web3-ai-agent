const hre = require("hardhat");
const Web3AIAgent = require("../agent/index.js");

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 Web3 AI Agent Demo");
  console.log("=".repeat(60) + "\n");

  // Get signers
  const [owner] = await hre.ethers.getSigners();
  console.log(`👤 Account: ${owner.address}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(owner.address))} ETH\n`);

  // Deploy contract
  console.log("📜 Deploying Web3AIAgent contract...");
  const Web3AIAgentContract = await hre.ethers.getContractFactory("Web3AIAgent");
  const contract = await Web3AIAgentContract.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✅ Contract deployed to: ${contractAddress}\n`);

  // Initialize AI Agent
  const agent = new Web3AIAgent(
    contractAddress,
    contract.interface.format(),
    owner
  );

  // Start monitoring events
  await agent.monitorEvents();

  // Analyze contract state
  await agent.analyze();

  // Execute some tasks
  console.log("🎯 Executing AI Agent tasks...\n");

  await agent.executeTask("Analyze ETH price trends");
  await new Promise(resolve => setTimeout(resolve, 1000));

  await agent.executeTask("Monitor DeFi protocol yields");
  await new Promise(resolve => setTimeout(resolve, 1000));

  await agent.executeTask("Generate trading signals");
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Analyze again
  await agent.analyze();

  // Generate report
  agent.generateReport();

  // Keep monitoring for a bit
  console.log("⏳ Monitoring events for 5 seconds...\n");
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Stop monitoring
  agent.stopMonitoring();

  console.log("✨ Demo completed!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
