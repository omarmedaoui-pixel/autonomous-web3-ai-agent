const hre = require("hardhat");

async function main() {
  console.log("Deploying Web3AIAgent...");

  const Web3AIAgent = await hre.ethers.getContractFactory("Web3AIAgent");
  const web3AIAgent = await Web3AIAgent.deploy();

  await web3AIAgent.waitForDeployment();

  const address = await web3AIAgent.getAddress();
  console.log(`Web3AIAgent deployed to: ${address}`);

  // Verify deployment
  console.log("\nContract Details:");
  console.log("- Name:", await web3AIAgent.name());
  console.log("- Owner:", await web3AIAgent.owner());
  console.log("- Task Count:", await web3AIAgent.taskCount());

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
