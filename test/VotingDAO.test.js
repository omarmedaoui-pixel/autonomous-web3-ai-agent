const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingDAO Contract", function () {
  let votingDAO;
  let web3NFT;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // 部署NFT合约
    const Web3NFT = await ethers.getContractFactory("Web3NFT");
    web3NFT = await Web3NFT.deploy();
    await web3NFT.waitForDeployment();

    // 部署DAO合约
    const VotingDAO = await ethers.getContractFactory("VotingDAO");
    votingDAO = await VotingDAO.deploy(await web3NFT.getAddress());
    await votingDAO.waitForDeployment();

    // 给addr1和addr2铸造NFT以便他们可以投票
    // addr1: 5个NFT = 5票
    // addr2: 5个NFT = 5票
    // 总共10票，刚好达到quorum
    for(let i = 0; i < 5; i++) {
      await web3NFT.mintNFT(addr1.address, `ipfs://QmTest1-${i}`, false);
      await web3NFT.mintNFT(addr2.address, `ipfs://QmTest2-${i}`, false);
    }
  });

  describe("部署", function () {
    it("应该设置正确的NFT合约地址", async function () {
      expect(await votingDAO.nftContract()).to.equal(await web3NFT.getAddress());
    });

    it("应该设置默认参数", async function () {
      expect(await votingDAO.votingDuration()).to.equal(7 * 24 * 60 * 60);
      expect(await votingDAO.quorum()).to.equal(10);
      expect(await votingDAO.passThreshold()).to.equal(51);
    });

    it("应该设置正确的所有者", async function () {
      expect(await votingDAO.owner()).to.equal(owner.address);
    });
  });

  describe("创建提案", function () {
    it("NFT持有者应该能够创建提案", async function () {
      const title = "Test Proposal";
      const description = "This is a test proposal";

      const tx = await votingDAO.connect(addr1).createProposal(title, description);
      const receipt = await tx.wait();

      expect(await votingDAO.proposalCount()).to.equal(1);

      const proposal = await votingDAO.getProposal(1);
      expect(proposal.title).to.equal(title);
      expect(proposal.description).to.equal(description);
      expect(proposal.proposer).to.equal(addr1.address);
      expect(proposal.status).to.equal(0); // Active
    });

    it("非NFT持有者不应该能够创建提案", async function () {
      const title = "Test Proposal";
      const description = "This is a test proposal";

      await expect(
        votingDAO.connect(addr3).createProposal(title, description)
      ).to.be.revertedWith("Must own NFT to create proposal");
    });

    it("应该触发ProposalCreated事件", async function () {
      const title = "Test Proposal";
      const description = "This is a test proposal";

      await expect(votingDAO.connect(addr1).createProposal(title, description))
        .to.emit(votingDAO, "ProposalCreated");
    });

    it("应该设置正确的投票截止时间", async function () {
      const title = "Test Proposal";
      const description = "This is a test proposal";

      await votingDAO.connect(addr1).createProposal(title, description);

      const proposal = await votingDAO.getProposal(1);
      const expectedEndTime = BigInt(proposal.startTime) + BigInt(7 * 24 * 60 * 60);

      expect(BigInt(proposal.endTime)).to.equal(expectedEndTime);
    });
  });

  describe("投票", function () {
    beforeEach(async function () {
      await votingDAO.connect(addr1).createProposal("Test Proposal", "Description");
    });

    it("NFT持有者应该能够投票", async function () {
      await votingDAO.connect(addr1).vote(1, true);

      const proposal = await votingDAO.getProposal(1);
      expect(proposal.forVotes).to.equal(5); // addr1有5个NFT
      expect(await votingDAO.hasVoted(1, addr1.address)).to.equal(true);
    });

    it("应该正确记录反对票", async function () {
      await votingDAO.connect(addr1).vote(1, false);

      const proposal = await votingDAO.getProposal(1);
      expect(proposal.againstVotes).to.equal(5); // addr1有5个NFT
    });

    it("同一地址不应该能够重复投票", async function () {
      await votingDAO.connect(addr1).vote(1, true);

      await expect(
        votingDAO.connect(addr1).vote(1, true)
      ).to.be.revertedWith("Already voted");
    });

    it("非NFT持有者不应该能够投票", async function () {
      await expect(
        votingDAO.connect(addr3).vote(1, true)
      ).to.be.revertedWith("Must own NFT to vote");
    });

    it("多个NFT应该有更多投票权重", async function () {
      // addr2有5个NFT
      await votingDAO.connect(addr2).vote(1, true);

      const proposal = await votingDAO.getProposal(1);
      expect(proposal.forVotes).to.equal(5); // addr2有5个NFT
    });

    it("应该触发Voted事件", async function () {
      await expect(votingDAO.connect(addr1).vote(1, true))
        .to.emit(votingDAO, "Voted")
        .withArgs(1, addr1.address, true, 5); // addr1有5个NFT
    });
  });

  describe("结束投票", function () {
    beforeEach(async function () {
      await votingDAO.connect(addr1).createProposal("Test Proposal", "Description");
    });

    it("应该在投票期结束后才能结束", async function () {
      await expect(
        votingDAO.endVoting(1)
      ).to.be.revertedWith("Voting period not ended");
    });

    it("应该正确计算通过结果", async function () {
      await votingDAO.connect(addr1).vote(1, true);
      await votingDAO.connect(addr2).vote(1, true);

      // 快进7天
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await votingDAO.endVoting(1);

      const proposal = await votingDAO.getProposal(1);
      expect(proposal.status).to.equal(1); // Passed
    });

    it("应该正确计算拒绝结果", async function () {
      await votingDAO.connect(addr1).vote(1, true);
      await votingDAO.connect(addr2).vote(1, false); // 2票反对

      // 快进7天
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await votingDAO.endVoting(1);

      const proposal = await votingDAO.getProposal(1);
      expect(proposal.status).to.equal(2); // Rejected
    });

    it("未达到法定人数应该拒绝", async function () {
      await votingDAO.connect(addr1).vote(1, true);

      // 快进7天
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await votingDAO.endVoting(1);

      const proposal = await votingDAO.getProposal(1);
      expect(proposal.status).to.equal(2); // Rejected (没有达到quorum)
    });
  });

  describe("执行提案", function () {
    beforeEach(async function () {
      await votingDAO.connect(addr1).createProposal("Test Proposal", "Description");

      // 投票通过 - addr1和addr2都投赞成票，总共10票
      await votingDAO.connect(addr1).vote(1, true);
      await votingDAO.connect(addr2).vote(1, true);

      // 快进7天
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await votingDAO.endVoting(1);
    });

    it("所有者应该能够执行通过的提案", async function () {
      await votingDAO.executeProposal(1);

      const proposal = await votingDAO.getProposal(1);
      expect(proposal.executed).to.equal(true);
      expect(proposal.status).to.equal(3); // Executed
    });

    it("不应该重复执行提案", async function () {
      // 首先执行提案 - 应该成功
      await votingDAO.executeProposal(1);

      // 验证提案已执行
      const proposalAfter = await votingDAO.getProposal(1);
      expect(proposalAfter.executed).to.equal(true);
      expect(proposalAfter.status).to.equal(3); // Executed

      // 再次执行应该失败 - 因为状态已经变成Executed，不再是Passed
      await expect(
        votingDAO.executeProposal(1)
      ).to.be.revertedWith("Proposal not passed");
    });

    it("非所有者不应该能够执行提案", async function () {
      await expect(
        votingDAO.connect(addr1).executeProposal(1)
      ).to.be.revertedWithCustomError(votingDAO, "OwnableUnauthorizedAccount");
    });

    it("应该触发ProposalExecuted事件", async function () {
      await expect(votingDAO.executeProposal(1))
        .to.emit(votingDAO, "ProposalExecuted")
        .withArgs(1);
    });
  });

  describe("参数设置", function () {
    it("所有者应该能够设置投票时长", async function () {
      const newDuration = 3 * 24 * 60 * 60;
      await votingDAO.setVotingDuration(newDuration);

      expect(await votingDAO.votingDuration()).to.equal(newDuration);
    });

    it("所有者应该能够设置法定人数", async function () {
      const newQuorum = 20;
      await votingDAO.setQuorum(newQuorum);

      expect(await votingDAO.quorum()).to.equal(newQuorum);
    });

    it("所有者应该能够设置通过阈值", async function () {
      const newThreshold = 60;
      await votingDAO.setPassThreshold(newThreshold);

      expect(await votingDAO.passThreshold()).to.equal(newThreshold);
    });

    it("不应该设置无效的阈值", async function () {
      await expect(
        votingDAO.setPassThreshold(101)
      ).to.be.revertedWith("Invalid threshold");

      await expect(
        votingDAO.setPassThreshold(0)
      ).to.be.revertedWith("Invalid threshold");
    });

    it("非所有者不应该能够设置参数", async function () {
      await expect(
        votingDAO.connect(addr1).setVotingDuration(1 * 24 * 60 * 60)
      ).to.be.revertedWithCustomError(votingDAO, "OwnableUnauthorizedAccount");
    });
  });

  describe("查询功能", function () {
    it("应该能够获取提案统计信息", async function () {
      await votingDAO.connect(addr1).createProposal("Test Proposal", "Description");

      await votingDAO.connect(addr1).vote(1, true);
      await votingDAO.connect(addr2).vote(1, false);

      const stats = await votingDAO.getProposalStats(1);

      expect(stats.totalVotes).to.equal(10); // 5 + 5
      expect(stats.supportPercentage).to.equal(50); // 5/10 = 50%
      expect(stats.isActive).to.equal(true);
      expect(stats.canExecute).to.equal(false);
    });

    it("应该能够检查是否已投票", async function () {
      await votingDAO.connect(addr1).createProposal("Test Proposal", "Description");

      expect(await votingDAO.hasVoted(1, addr1.address)).to.equal(false);

      await votingDAO.connect(addr1).vote(1, true);

      expect(await votingDAO.hasVoted(1, addr1.address)).to.equal(true);
    });
  });

  describe("事件", function () {
    it("应该触发ProposalStatusChanged事件", async function () {
      await votingDAO.connect(addr1).createProposal("Test Proposal", "Description");

      await expect(votingDAO.connect(addr1).createProposal("Test2", "Desc2"))
        .to.emit(votingDAO, "ProposalStatusChanged");
    });
  });
});
