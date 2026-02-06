const hre = require("hardhat");

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 部署 MyToken 合约");
  console.log("=".repeat(60) + "\n");

  const [deployer] = await hre.ethers.getSigners();

  console.log("📝 部署账户信息:");
  console.log("   地址:", deployer.address);
  console.log("   余额:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  console.log("⏳ 正在部署 MyToken 合约...");

  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy();

  await myToken.waitForDeployment();

  const address = await myToken.getAddress();

  console.log("✅ MyToken 合约部署成功!");
  console.log("   合约地址:", address, "\n");

  // 获取代币信息
  const tokenInfo = await myToken.getTokenInfo();

  console.log("📊 代币信息:");
  console.log("   名称:", tokenInfo.name);
  console.log("   符号:", tokenInfo.symbol);
  console.log("   精度:", tokenInfo.decimals);
  console.log("   总供应量:", hre.ethers.formatEther(tokenInfo.totalSupply));
  console.log("   最大供应量:", hre.ethers.formatEther(tokenInfo.maxSupply), "\n");

  // 验证部署者余额
  const deployerBalance = await myToken.balanceOf(deployer.address);
  console.log("💰 部署者代币余额:");
  console.log("   ", hre.ethers.formatEther(deployerBalance), tokenInfo.symbol, "\n");

  console.log("=".repeat(60));
  console.log("✨ 部署完成!\n");

  // 验证提示
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 在区块浏览器上验证合约:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${address}\n`);
  }

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });
