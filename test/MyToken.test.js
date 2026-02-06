const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken Contract", function () {
  let myToken;
  let owner;
  let addr1;
  let addr2;

  const TOKEN_NAME = "MyToken";
  const TOKEN_SYMBOL = "MTK";
  const TOTAL_SUPPLY = ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy();
    await myToken.waitForDeployment();
  });

  describe("部署", function () {
    it("应该设置正确的名称", async function () {
      expect(await myToken.name()).to.equal(TOKEN_NAME);
    });

    it("应该设置正确的符号", async function () {
      expect(await myToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("应该设置正确的精度", async function () {
      expect(await myToken.decimals()).to.equal(18);
    });

    it("应该铸造全部代币给部署者", async function () {
      const ownerBalance = await myToken.balanceOf(owner.address);
      expect(await myToken.totalSupply()).to.equal(ownerBalance);
    });

    it("应该设置正确的总量", async function () {
      expect(await myToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("应该设置部署者为所有者", async function () {
      expect(await myToken.owner()).to.equal(owner.address);
    });
  });

  describe("转账", function () {
    it("应该成功转账", async function () {
      const transferAmount = ethers.parseEther("100");

      await expect(
        myToken.transfer(addr1.address, transferAmount)
      ).to.emit(myToken, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);

      const addr1Balance = await myToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);
    });

    it("应该更新转账双方的余额", async function () {
      const transferAmount = ethers.parseEther("100");

      const ownerInitialBalance = await myToken.balanceOf(owner.address);

      await myToken.transfer(addr1.address, transferAmount);

      const ownerFinalBalance = await myToken.balanceOf(owner.address);
      const addr1Balance = await myToken.balanceOf(addr1.address);

      expect(ownerFinalBalance).to.equal(ownerInitialBalance - transferAmount);
      expect(addr1Balance).to.equal(transferAmount);
    });

    it("余额不足时应该失败", async function () {
      const transferAmount = ethers.parseEther("1000001");

      await expect(
        myToken.transfer(addr1.address, transferAmount)
      ).to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance");
    });
  });

  describe("铸造", function () {
    it("所有者应该能够铸造代币", async function () {
      const mintAmount = ethers.parseEther("1000");

      await expect(myToken.mint(addr1.address, mintAmount))
        .to.emit(myToken, "Minted")
        .withArgs(addr1.address, mintAmount);

      const addr1Balance = await myToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(mintAmount);
    });

    it("非所有者不应该能够铸造代币", async function () {
      const mintAmount = ethers.parseEther("1000");

      await expect(
        myToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount");
    });

    it("不应该铸造到零地址", async function () {
      const mintAmount = ethers.parseEther("1000");

      await expect(
        myToken.mint(ethers.ZeroAddress, mintAmount)
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("不应该铸造到零地址", async function () {
      const mintAmount = ethers.parseEther("1000");

      await expect(
        myToken.mint(ethers.ZeroAddress, mintAmount)
      ).to.be.revertedWith("Cannot mint to zero address");
    });
  });

  describe("销毁", function () {
    it("应该能够销毁代币", async function () {
      const burnAmount = ethers.parseEther("1000");

      await expect(myToken.burn(burnAmount))
        .to.emit(myToken, "Burned")
        .withArgs(owner.address, burnAmount);

      const ownerBalance = await myToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(TOTAL_SUPPLY - burnAmount);
    });

    it("余额不足时应该无法销毁", async function () {
      const burnAmount = ethers.parseEther("1000001");

      await expect(
        myToken.burn(burnAmount)
      ).to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance");
    });
  });

  describe("批量转账", function () {
    it("所有者应该能够批量转账", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [
        ethers.parseEther("100"),
        ethers.parseEther("200")
      ];

      await myToken.batchTransfer(recipients, amounts);

      expect(await myToken.balanceOf(addr1.address)).to.equal(amounts[0]);
      expect(await myToken.balanceOf(addr2.address)).to.equal(amounts[1]);
    });

    it("非所有者不应该能够批量转账", async function () {
      const recipients = [addr1.address];
      const amounts = [ethers.parseEther("100")];

      await expect(
        myToken.connect(addr1).batchTransfer(recipients, amounts)
      ).to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount");
    });

    it("数组长度不匹配时应该失败", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [ethers.parseEther("100")];

      await expect(
        myToken.batchTransfer(recipients, amounts)
      ).to.be.revertedWith("Arrays length mismatch");
    });

    it("超过200个接收者时应该失败", async function () {
      const recipients = Array(201).fill(addr1.address);
      const amounts = Array(201).fill(ethers.parseEther("1"));

      await expect(
        myToken.batchTransfer(recipients, amounts)
      ).to.be.revertedWith("Too many recipients");
    });
  });

  describe("代币信息", function () {
    it("应该返回正确的代币信息", async function () {
      const info = await myToken.getTokenInfo();

      expect(info.tokenName).to.equal(TOKEN_NAME);
      expect(info.tokenSymbol).to.equal(TOKEN_SYMBOL);
      expect(info.tokenDecimals).to.equal(18);
      expect(info.totalTokenSupply).to.equal(TOTAL_SUPPLY);
      expect(info.maxSupply).to.equal(TOTAL_SUPPLY);
    });
  });

  describe("授权", function () {
    it("应该能够授权", async function () {
      await myToken.approve(addr1.address, ethers.parseEther("1000"));

      expect(await myToken.allowance(owner.address, addr1.address))
        .to.equal(ethers.parseEther("1000"));
    });

    it("应该能够使用授权进行转账", async function () {
      const transferAmount = ethers.parseEther("100");

      await myToken.approve(addr1.address, transferAmount);
      await myToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);

      expect(await myToken.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("授权不足时应该失败", async function () {
      const transferAmount = ethers.parseEther("100");

      await myToken.approve(addr1.address, ethers.parseEther("50"));

      await expect(
        myToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
      ).to.be.revertedWithCustomError(myToken, "ERC20InsufficientAllowance");
    });
  });

  describe("事件", function () {
    it("应该触发 Transfer 事件", async function () {
      const transferAmount = ethers.parseEther("100");

      await expect(myToken.transfer(addr1.address, transferAmount))
        .to.emit(myToken, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);
    });

    it("应该触发 Approval 事件", async function () {
      await expect(myToken.approve(addr1.address, ethers.parseEther("1000")))
        .to.emit(myToken, "Approval")
        .withArgs(owner.address, addr1.address, ethers.parseEther("1000"));
    });
  });
});
