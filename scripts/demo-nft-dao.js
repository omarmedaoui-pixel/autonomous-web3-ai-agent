const hre = require("hardhat");

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🎨 Web3 NFT + DAO 治理演示");
  console.log("=".repeat(70) + "\n");

  const [owner, addr1, addr2, addr3] = await hre.ethers.getSigners();

  console.log("👤 参与者:");
  console.log("   部署者/所有者:", owner.address);
  console.log("   用户1:", addr1.address);
  console.log("   用户2:", addr2.address);
  console.log("   用户3:", addr3.address, "\n");

  // ============ 第一步：部署合约 ============
  console.log("=" .repeat(70));
  console.log("📜 第一步：部署合约");
  console.log("=".repeat(70) + "\n");

  console.log("⏳ 部署 Web3NFT 合约...");
  const Web3NFT = await hre.ethers.getContractFactory("Web3NFT");
  const web3NFT = await Web3NFT.deploy();
  await web3NFT.waitForDeployment();
  const nftAddress = await web3NFT.getAddress();
  console.log("✅ Web3NFT 合约地址:", nftAddress, "\n");

  console.log("⏳ 部署 VotingDAO 合约...");
  const VotingDAO = await hre.ethers.getContractFactory("VotingDAO");
  const votingDAO = await VotingDAO.deploy(nftAddress);
  await votingDAO.waitForDeployment();
  const daoAddress = await votingDAO.getAddress();
  console.log("✅ VotingDAO 合约地址:", daoAddress, "\n");

  // 设置合理的DAO参数
  await votingDAO.setQuorum(2); // 最低2票即可
  await votingDAO.setVotingDuration(1 * 24 * 60 * 60); // 1天投票期
  console.log("⚙️ DAO参数已设置:");
  console.log("   法定人数: 2票");
  console.log("   投票时长: 1天\n");

  // ============ 第二步：铸造NFT ============
  console.log("=" .repeat(70));
  console.log("🎨 第二步：铸造 NFT");
  console.log("=".repeat(70) + "\n");

  console.log("🤖 铸造AI生成的NFT给用户1...");
  const nft1URI = "ipfs://QmAI1";
  const tx1 = await web3NFT.mintNFT(addr1.address, nft1URI, true);
  await tx1.wait();
  console.log("   ✅ NFT #0 已铸造给用户1 (AI生成)\n");

  console.log("🎨 铸造人工创作的NFT给用户2...");
  const nft2URI = "ipfs://QmArt1";
  const nft3URI = "ipfs://QmArt2";
  await web3NFT.mintNFT(addr2.address, nft2URI, false);
  await web3NFT.mintNFT(addr2.address, nft3URI, false);
  console.log("   ✅ NFT #1, #2 已铸造给用户2 (人工创作)\n");

  // 更新NFT元数据
  await web3NFT.updateMetadata(0, "CyberPunk #1", "AI生成的赛博朋克头像");
  await web3NFT.updateMetadata(1, "Abstract Art #1", "抽象艺术作品");
  await web3NFT.updateMetadata(2, "Abstract Art #2", "抽象艺术作品");
  console.log("   ✅ NFT元数据已更新\n");

  // 查询NFT信息
  const nftInfo = await web3NFT.getNFTInfo(0);
  console.log("📊 NFT #0 信息:");
  console.log("   名称:", nftInfo.name);
  console.log("   描述:", nftInfo.description);
  console.log("   拥有者:", nftInfo.owner);
  console.log("   AI生成:", nftInfo.aiGen);
  console.log("   投票权:", nftInfo.power.toString(), "\n");

  // 设置投票权重
  console.log("⚖️ 设置NFT投票权重...");
  await web3NFT.setVotingPower(0, 3); // NFT #0 有3票
  await web3NFT.setVotingPower(1, 2); // NFT #1 有2票
  await web3NFT.setVotingPower(2, 1); // NFT #2 有1票
  console.log("   ✅ NFT #0: 3票, NFT #1: 2票, NFT #2: 1票\n");

  // 查询各用户的NFT
  console.log("💼 用户NFT持有情况:");
  const addr1NFTs = await web3NFT.getNFTsByOwner(addr1.address);
  const addr2NFTs = await web3NFT.getNFTsByOwner(addr2.address);
  console.log("   用户1 持有:", addr1NFTs.length.toString(), "个NFT");
  console.log("   用户2 持有:", addr2NFTs.length.toString(), "个NFT\n");

  // ============ 第三步：创建DAO提案 ============
  console.log("=" .repeat(70));
  console.log("📮 第三步：创建 DAO 提案");
  console.log("=".repeat(70) + "\n");

  console.log("📝 用户1创建提案 #1：增加社区奖励基金...");
  const tx2 = await votingDAO.connect(addr1).createProposal(
    "增加社区奖励基金",
    "建议将每月社区奖励基金从1000枚代币增加到2000枚代币"
  );
  await tx2.wait();
  console.log("   ✅ 提案 #1 创建成功\n");

  console.log("📝 用户2创建提案 #2：引入新的治理机制...");
  const tx3 = await votingDAO.connect(addr2).createProposal(
    "引入新的治理机制",
    "建议采用二次方投票机制以提高治理公平性"
  );
  await tx3.wait();
  console.log("   ✅ 提案 #2 创建成功\n");

  console.log("📊 当前提案总数:", (await votingDAO.proposalCount()).toString(), "\n");

  // ============ 第四步：投票 ============
  console.log("=" .repeat(70));
  console.log("🗳️  第四步：社区投票");
  console.log("=".repeat(70) + "\n");

  console.log("👍 用户1 对提案 #1 投赞成票 (权重: 3票)...");
  await votingDAO.connect(addr1).vote(1, true);
  console.log("   ✅ 投票成功\n");

  console.log("👍 用户2 对提案 #1 投赞成票 (权重: 2+1=3票)...");
  await votingDAO.connect(addr2).vote(1, true);
  console.log("   ✅ 投票成功\n");

  console.log("👎 用户2 对提案 #2 投反对票 (权重: 3票)...");
  await votingDAO.connect(addr2).vote(2, false);
  console.log("   ✅ 投票成功\n");

  // 获取提案统计
  console.log("📊 提案 #1 投票统计:");
  let stats = await votingDAO.getProposalStats(1);
  console.log("   总票数:", stats.totalVotes.toString());
  console.log("   支持率:", stats.supportPercentage.toString(), "%");
  console.log("   是否活跃:", stats.isActive);
  console.log("");

  // ============ 第五步：快进并结束投票 ============
  console.log("=" .repeat(70));
  console.log("⏰ 第五步：投票结束与结果统计");
  console.log("=".repeat(70) + "\n");

  console.log("⏳ 快进1天（投票期结束）...");
  await hre.ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);
  await hre.ethers.provider.send("evm_mine");
  console.log("   ✅ 时间已快进\n");

  console.log("🔍 结束提案 #1 的投票并统计结果...");
  await votingDAO.endVoting(1);

  let proposal = await votingDAO.getProposal(1);
  console.log("   支持票:", proposal.forVotes.toString());
  console.log("   反对票:", proposal.againstVotes.toString());
  console.log("   状态:", ["Active", "Passed", "Rejected", "Executed"][proposal.status]);
  console.log("");

  console.log("🔍 结束提案 #2 的投票并统计结果...");
  await votingDAO.endVoting(2);

  proposal = await votingDAO.getProposal(2);
  console.log("   支持票:", proposal.forVotes.toString());
  console.log("   反对票:", proposal.againstVotes.toString());
  console.log("   状态:", ["Active", "Passed", "Rejected", "Executed"][proposal.status]);
  console.log("");

  // ============ 第六步：执行通过的提案 ============
  console.log("=" .repeat(70));
  console.log("✅ 第六步：执行通过的提案");
  console.log("=".repeat(70) + "\n");

  proposal = await votingDAO.getProposal(1);
  const statusName = ["活跃", "通过", "拒绝", "已执行"][Number(proposal.status)];

  console.log(`📋 提案 #1 状态: ${statusName}`);

  if (Number(proposal.status) === 1) { // Passed
    console.log("🎯 执行提案 #1...");
    const tx = await votingDAO.executeProposal(1);
    await tx.wait();
    console.log("   ✅ 提案 #1 已执行\n");

    proposal = await votingDAO.getProposal(1);
    console.log("   执行状态:", proposal.executed);
    console.log("   最终状态:", ["活跃", "通过", "拒绝", "已执行"][Number(proposal.status)]);
  } else {
    console.log("⚠️  提案 #1 未通过，无法执行\n");
  }

  // ============ 最终总结 ============
  console.log("=" .repeat(70));
  console.log("📋 最终总结");
  console.log("=".repeat(70) + "\n");

  const totalNFTs = await web3NFT.totalSupply();
  console.log("🎨 NFT 总数:", totalNFTs.toString());
  console.log("📮 提案总数:", (await votingDAO.proposalCount()).toString());

  console.log("\n📊 所有提案状态:");
  for (let i = 1; i <= await votingDAO.proposalCount(); i++) {
    proposal = await votingDAO.getProposal(i);
    const statusStr = ["活跃", "通过", "拒绝", "已执行"][proposal.status];
    console.log(`   提案 #${i}: ${proposal.title}`);
    console.log(`   状态: ${statusStr}`);
    console.log(`   支持票: ${proposal.forVotes}, 反对票: ${proposal.againstVotes}`);
    console.log("");
  }

  console.log("=" .repeat(70));
  console.log("✨ NFT + DAO 演示完成！");
  console.log("=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 错误:", error);
    process.exit(1);
  });
