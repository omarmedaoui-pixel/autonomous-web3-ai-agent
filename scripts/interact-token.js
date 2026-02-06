const hre = require("hardhat");

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🪙 MyToken 代币交互演示");
  console.log("=".repeat(60) + "\n");

  const [owner, addr1, addr2] = await hre.ethers.getSigners();

  console.log("👤 账户信息:");
  console.log("   部署者:", owner.address);
  console.log("   账户1:", addr1.address);
  console.log("   账户2:", addr2.address, "\n");

  // 部署合约
  console.log("📜 部署 MyToken 合约...");
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy();
  await myToken.waitForDeployment();

  const address = await myToken.getAddress();
  console.log("✅ 合约部署成功:", address, "\n");

  // 获取代币信息
  const tokenInfo = await myToken.getTokenInfo();
  console.log("📊 代币信息:");
  console.log("   名称:", tokenInfo.tokenName);
  console.log("   符号:", tokenInfo.tokenSymbol);
  console.log("   总供应量:", hre.ethers.formatEther(tokenInfo.totalTokenSupply), tokenInfo.tokenSymbol, "\n");

  // 1. 转账测试
  console.log("💸 测试转账功能:");
  const transferAmount = hre.ethers.parseEther("1000");

  console.log("   转账 1000 MTK 到账户1...");
  const tx1 = await myToken.transfer(addr1.address, transferAmount);
  await tx1.wait();

  let addr1Balance = await myToken.balanceOf(addr1.address);
  console.log("   ✅ 账户1余额:", hre.ethers.formatEther(addr1Balance), tokenInfo.tokenSymbol);

  let ownerBalance = await myToken.balanceOf(owner.address);
  console.log("   ✅ 部署者余额:", hre.ethers.formatEther(ownerBalance), tokenInfo.tokenSymbol, "\n");

  // 2. 授权和委托转账
  console.log("🤝 测试授权功能:");
  const approveAmount = hre.ethers.parseEther("500");

  console.log("   账户1授权给账户2 500 MTK...");
  const tx2 = await myToken.connect(addr1).approve(addr2.address, approveAmount);
  await tx2.wait();

  const allowance = await myToken.allowance(addr1.address, addr2.address);
  console.log("   ✅ 授权额度:", hre.ethers.formatEther(allowance), tokenInfo.tokenSymbol);

  console.log("   账户2使用授权转账 300 MTK...");
  const transferFromAmount = hre.ethers.parseEther("300");
  const tx3 = await myToken.connect(addr2).transferFrom(addr1.address, addr2.address, transferFromAmount);
  await tx3.wait();

  let addr2Balance = await myToken.balanceOf(addr2.address);
  console.log("   ✅ 账户2余额:", hre.ethers.formatEther(addr2Balance), tokenInfo.tokenSymbol);

  addr1Balance = await myToken.balanceOf(addr1.address);
  console.log("   ✅ 账户1余额:", hre.ethers.formatEther(addr1Balance), tokenInfo.tokenSymbol, "\n");

  // 3. 铸造新代币
  console.log("🔨 测试铸造功能:");
  const mintAmount = hre.ethers.parseEther("5000");

  console.log("   铸造 5000 MTK 到账户2...");
  const tx4 = await myToken.mint(addr2.address, mintAmount);
  await tx4.wait();

  addr2Balance = await myToken.balanceOf(addr2.address);
  console.log("   ✅ 账户2余额:", hre.ethers.formatEther(addr2Balance), tokenInfo.tokenSymbol);

  const totalSupply = await myToken.totalSupply();
  console.log("   ✅ 总供应量:", hre.ethers.formatEther(totalSupply), tokenInfo.tokenSymbol, "\n");

  // 4. 销毁代币
  console.log("🔥 测试销毁功能:");
  const burnAmount = hre.ethers.parseEther("100");  // 改为100

  console.log("   账户1销毁 100 MTK...");
  const tx5 = await myToken.connect(addr1).burn(burnAmount);
  await tx5.wait();

  addr1Balance = await myToken.balanceOf(addr1.address);
  console.log("   ✅ 账户1余额:", hre.ethers.formatEther(addr1Balance), tokenInfo.tokenSymbol);

  const finalSupply = await myToken.totalSupply();
  console.log("   ✅ 总供应量:", hre.ethers.formatEther(finalSupply), tokenInfo.tokenSymbol, "\n");

  // 5. 批量转账
  console.log("📦 测试批量转账功能:");
  const recipients = [addr1.address, addr2.address];
  const amounts = [
    hre.ethers.parseEther("100"),
    hre.ethers.parseEther("200")
  ];

  console.log("   批量转账到账户1和账户2...");
  const tx6 = await myToken.batchTransfer(recipients, amounts);
  await tx6.wait();

  addr1Balance = await myToken.balanceOf(addr1.address);
  addr2Balance = await myToken.balanceOf(addr2.address);
  console.log("   ✅ 账户1余额:", hre.ethers.formatEther(addr1Balance), tokenInfo.tokenSymbol);
  console.log("   ✅ 账户2余额:", hre.ethers.formatEther(addr2Balance), tokenInfo.tokenSymbol, "\n");

  // 总结
  console.log("=".repeat(60));
  console.log("📋 最终余额汇总:");
  console.log("=".repeat(60));
  ownerBalance = await myToken.balanceOf(owner.address);
  console.log("   部署者:", hre.ethers.formatEther(ownerBalance), tokenInfo.tokenSymbol);
  console.log("   账户1: ", hre.ethers.formatEther(addr1Balance), tokenInfo.tokenSymbol);
  console.log("   账户2: ", hre.ethers.formatEther(addr2Balance), tokenInfo.tokenSymbol);
  console.log("   总计:  ", hre.ethers.formatEther(finalSupply), tokenInfo.tokenSymbol);

  console.log("\n✨ 所有功能测试完成!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 错误:", error);
    process.exit(1);
  });
