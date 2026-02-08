/**
 * Tester Agent - Generates Test Files for Smart Contracts
 *
 * 功能：
 * - 为生成的合约创建测试文件
 * - 使用Hardhat和ethers.js
 * - 保存到test/目录
 */

const fs = require("fs");
const path = require("path");

class TesterAgent {
  constructor(hre) {
    this.hre = hre;
    this.testDir = path.join(process.cwd(), "test");
  }

  /**
   * 根据计划生成测试文件
   * @param {object} plan - planner生成的执行计划
   * @returns {object} 生成结果
   */
  async generate(plan) {
    console.log("\n" + "=".repeat(70));
    console.log("🧪 Tester Agent - Generating Test Files");
    console.log("=".repeat(70));

    try {
      // 确保test目录存在
      this._ensureDir(this.testDir);

      // 根据合约类型生成测试
      const testCode = this._generateTestCode(plan);

      // 保存测试文件
      const fileName = `${plan.contractName}.test.js`;
      const filePath = path.join(this.testDir, fileName);
      fs.writeFileSync(filePath, testCode, "utf8");

      console.log(`\n✓ Test file generated: ${fileName}`);
      console.log(`  Location: test/${fileName}`);
      console.log(`  Size: ${testCode.length} bytes`);

      return {
        success: true,
        fileName,
        filePath,
        contractName: plan.contractName,
        code: testCode
      };

    } catch (error) {
      console.error(`\n✗ Error generating test: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 生成测试代码
   * @param {object} plan - 执行计划
   * @returns {string} 测试代码
   */
  _generateTestCode(plan) {
    const { contractName, type, specifications } = plan;

    // 根据合约类型生成不同的测试
    switch (type) {
      case "ERC20":
        return this._generateERC20Test(contractName, specifications);
      case "ERC721":
        return this._generateERC721Test(contractName, specifications);
      case "DAO":
        return this._generateDAOTest(contractName, specifications);
      case "Voting":
        return this._generateVotingTest(contractName, specifications);
      default:
        return this._generateGenericTest(contractName);
    }
  }

  /**
   * 生成ERC20测试
   */
  _generateERC20Test(name, specs = {}) {
    const tokenName = specs.tokenName || name;
    const symbol = specs.symbol || name.substring(0, 4).toUpperCase();
    const supply = specs.initialSupply || "1000000";

    return `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("${tokenName} (${name})", function () {
  let ${this._camelCase(name)};
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const ${this._camelCase(name)}Factory = await ethers.getContractFactory("${name}");
    ${this._camelCase(name)} = await ${this._camelCase(name)}Factory.deploy();
    await ${this._camelCase(name)}.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await ${this._camelCase(name)}.name()).to.equal("${tokenName}");
      expect(await ${this._camelCase(name)}.symbol()).to.equal("${symbol}");
    });

    it("Should mint initial supply to owner", async function () {
      const ownerBalance = await ${this._camelCase(name)}.balanceOf(owner.address);
      expect(await ${this._camelCase(name)}.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct initial supply", async function () {
      const expectedSupply = ethers.parseEther("${supply}");
      expect(await ${this._camelCase(name)}.totalSupply()).to.equal(expectedSupply);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await ${this._camelCase(name)}.transfer(addr1.address, 50);
      const addr1Balance = await ${this._camelCase(name)}.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await ${this._camelCase(name)}.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await ${this._camelCase(name)}.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
      expect(await ${this._camelCase(name)}.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await ${this._camelCase(name)}.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner
      await expect(
        ${this._camelCase(name)}.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWithCustomError(${this._camelCase(name)}, "ERC20InsufficientBalance");

      // Owner balance shouldn't change
      expect(await ${this._camelCase(name)}.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint new tokens", async function () {
      const mintAmount = 1000;
      await ${this._camelCase(name)}.mint(addr1.address, mintAmount);
      expect(await ${this._camelCase(name)}.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should fail if non-owner tries to mint", async function () {
      await expect(
        ${this._camelCase(name)}.connect(addr1).mint(addr2.address, 100)
      ).to.be.revertedWithCustomError(${this._camelCase(name)}, "OwnableUnauthorizedAccount");
    });
  });

  describe("Burning", function () {
    it("Should allow token holders to burn tokens", async function () {
      const initialBalance = await ${this._camelCase(name)}.balanceOf(owner.address);
      const burnAmount = 100;

      await ${this._camelCase(name)}.burn(burnAmount);
      expect(await ${this._camelCase(name)}.balanceOf(owner.address)).to.equal(
        initialBalance - burnAmount
      );
    });
  });

  describe("Token Info", function () {
    it("Should return correct token information", async function () {
      const info = await ${this._camelCase(name)}.getTokenInfo();
      expect(info[0]).to.equal("${tokenName}");
      expect(info[1]).to.equal("${symbol}");
      expect(info[3]).to.equal(18);
    });
  });
});
`;
  }

  /**
   * 生成ERC721测试
   */
  _generateERC721Test(name, specs = {}) {
    const tokenName = specs.tokenName || name;
    const symbol = specs.symbol || name.substring(0, 4).toUpperCase();

    return `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("${tokenName} (${name})", function () {
  let ${this._camelCase(name)};
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const ${this._camelCase(name)}Factory = await ethers.getContractFactory("${name}");
    ${this._camelCase(name)} = await ${this._camelCase(name)}Factory.deploy();
    await ${this._camelCase(name)}.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await ${this._camelCase(name)}.name()).to.equal("${tokenName}");
      expect(await ${this._camelCase(name)}.symbol()).to.equal("${symbol}");
    });

    it("Should start with zero supply", async function () {
      expect(await ${this._camelCase(name)}.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint NFTs", async function () {
      const uri = "ipfs://QmTest123";
      await ${this._camelCase(name)}.safeMint(addr1.address, uri);

      expect(await ${this._camelCase(name)}.ownerOf(0)).to.equal(addr1.address);
      expect(await ${this._camelCase(name)}.tokenURI(0)).to.equal(uri);
      expect(await ${this._camelCase(name)}.totalSupply()).to.equal(1);
    });

    it("Should increment token ID correctly", async function () {
      const uri1 = "ipfs://QmTest1";
      const uri2 = "ipfs://QmTest2";

      await ${this._camelCase(name)}.safeMint(addr1.address, uri1);
      await ${this._camelCase(name)}.safeMint(addr2.address, uri2);

      expect(await ${this._camelCase(name)}.totalSupply()).to.equal(2);
      expect(await ${this._camelCase(name)}.ownerOf(0)).to.equal(addr1.address);
      expect(await ${this._camelCase(name)}.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should fail if non-owner tries to mint", async function () {
      await expect(
        ${this._camelCase(name)}.connect(addr1).safeMint(addr2.address, "ipfs://QmTest")
      ).to.be.revertedWithCustomError(${this._camelCase(name)}, "OwnableUnauthorizedAccount");
    });
  });

  describe("Token URI", function () {
    it("Should return correct token URI", async function () {
      const uri = "ipfs://QmTest123";
      await ${this._camelCase(name)}.safeMint(addr1.address, uri);

      expect(await ${this._camelCase(name)}.tokenURI(0)).to.equal(uri);
    });

    it("Should revert for non-existent token", async function () {
      await expect(
        ${this._camelCase(name)}.tokenURI(999)
      ).to.be.reverted;
    });
  });

  describe("Ownership", function () {
    it("Should track NFT ownership correctly", async function () {
      const uri = "ipfs://QmTest123";
      await ${this._camelCase(name)}.safeMint(addr1.address, uri);

      expect(await ${this._camelCase(name)}.ownerOf(0)).to.equal(addr1.address);

      // Note: ERC721 doesn't have built-in transfer function
      // Transfer would need to be implemented or use safeTransferFrom
    });
  });
});
`;
  }

  /**
   * 生成DAO测试
   */
  _generateDAOTest(name, specs = {}) {
    return this._generateVotingTest(name, specs);
  }

  /**
   * 生成投票测试
   */
  _generateVotingTest(name, specs = {}) {
    return `const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("${name} DAO", function () {
  let ${this._camelCase(name)};
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const ${this._camelCase(name)}Factory = await ethers.getContractFactory("${name}");
    ${this._camelCase(name)} = await ${this._camelCase(name)}Factory.deploy();
    await ${this._camelCase(name)}.waitForDeployment();
  });

  describe("Proposal Creation", function () {
    it("Should allow creating a proposal", async function () {
      const description = "Should we implement feature X?";

      const tx = await ${this._camelCase(name)}.createProposal(description);
      const receipt = await tx.wait();

      const proposal = await ${this._camelCase(name)}.getProposal(1);

      expect(proposal.id).to.equal(1);
      expect(proposal.proposer).to.equal(owner.address);
      expect(proposal.description).to.equal(description);
      expect(proposal.executed).to.equal(false);
    });

    it("Should increment proposal counter", async function () {
      await ${this._camelCase(name)}.createProposal("Proposal 1");
      await ${this._camelCase(name)}.createProposal("Proposal 2");

      const proposal1 = await ${this._camelCase(name)}.getProposal(1);
      const proposal2 = await ${this._camelCase(name)}.getProposal(2);

      expect(proposal1.id).to.equal(1);
      expect(proposal2.id).to.equal(2);
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await ${this._camelCase(name)}.createProposal("Test proposal");
    });

    it("Should allow voting on a proposal", async function () {
      await ${this._camelCase(name)}.connect(addr1).vote(1);
      await ${this._camelCase(name)}.connect(addr2).vote(1);

      const proposal = await ${this._camelCase(name)}.getProposal(1);
      expect(proposal.voteCount).to.equal(2);
    });

    it("Should prevent double voting", async function () {
      await ${this._camelCase(name)}.connect(addr1).vote(1);

      await expect(
        ${this._camelCase(name)}.connect(addr1).vote(1)
      ).to.be.revertedWith("Already voted");
    });

    it("Should prevent voting after deadline", async function () {
      const proposal = await ${this._camelCase(name)}.getProposal(1);
      const endTime = Number(proposal.endTime);

      // Advance time past voting period
      await time.increaseTo(endTime + 1);

      await expect(
        ${this._camelCase(name)}.connect(addr1).vote(1)
      ).to.be.revertedWith("Voting ended");
    });
  });

  describe("Proposal Execution", function () {
    beforeEach(async function () {
      await ${this._camelCase(name)}.createProposal("Test proposal");
    });

    it("Should allow executing proposal after quorum is reached", async function () {
      // Get enough votes to meet quorum
      await ${this._camelCase(name)}.connect(addr1).vote(1);
      await ${this._camelCase(name)}.connect(addr2).vote(1);

      // Advance time past voting period
      const proposal = await ${this._camelCase(name)}.getProposal(1);
      const endTime = Number(proposal.endTime);
      await time.increaseTo(endTime + 1);

      // Execute proposal
      await ${this._camelCase(name)}.executeProposal(1);

      const executedProposal = await ${this._camelCase(name)}.getProposal(1);
      expect(executedProposal.executed).to.equal(true);
    });

    it("Should prevent execution if quorum not reached", async function () {
      // Only one vote (not enough for quorum)
      await ${this._camelCase(name)}.connect(addr1).vote(1);

      // Advance time past voting period
      const proposal = await ${this._camelCase(name)}.getProposal(1);
      const endTime = Number(proposal.endTime);
      await time.increaseTo(endTime + 1);

      await expect(
        ${this._camelCase(name)}.executeProposal(1)
      ).to.be.revertedWith("Quorum not reached");
    });

    it("Should prevent double execution", async function () {
      await ${this._camelCase(name)}.connect(addr1).vote(1);
      await ${this._camelCase(name)}.connect(addr2).vote(1);

      const proposal = await ${this._camelCase(name)}.getProposal(1);
      const endTime = Number(proposal.endTime);
      await time.increaseTo(endTime + 1);

      await ${this._camelCase(name)}.executeProposal(1);

      await expect(
        ${this._camelCase(name)}.executeProposal(1)
      ).to.be.revertedWith("Already executed");
    });
  });

  describe("Proposal Details", function () {
    it("Should return correct proposal information", async function () {
      const description = "Test proposal description";
      await ${this._camelCase(name)}.createProposal(description);

      const proposal = await ${this._camelCase(name)}.getProposal(1);

      expect(proposal.description).to.equal(description);
      expect(proposal.proposer).to.equal(owner.address);
      expect(proposal.voteCount).to.equal(0);
      expect(proposal.executed).to.equal(false);
    });
  });
});
`;
  }

  /**
   * 生成通用测试
   */
  _generateGenericTest(name) {
    return `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("${name}", function () {
  let ${this._camelCase(name)};
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const ${this._camelCase(name)}Factory = await ethers.getContractFactory("${name}");
    ${this._camelCase(name)} = await ${this._camelCase(name)}Factory.deploy();
    await ${this._camelCase(name)}.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await ${this._camelCase(name)}.getAddress()).to.not.equal(ethers.ZeroAddress);
    });

    it("Should set deployer as owner", async function () {
      expect(await ${this._camelCase(name)}.owner()).to.equal(owner.address);
    });
  });

  // Add more tests as needed
});
`;
  }

  /**
   * 转换为驼峰命名
   */
  _camelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * 确保目录存在
   */
  _ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

module.exports = TesterAgent;
