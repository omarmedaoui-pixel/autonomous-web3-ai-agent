const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken (MyToken)", function () {
  let myToken;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const myTokenFactory = await ethers.getContractFactory("MyToken");
    myToken = await myTokenFactory.deploy();
    await myToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await myToken.name()).to.equal("MyToken");
      expect(await myToken.symbol()).to.equal("MYTO");
    });

    it("Should mint initial supply to owner", async function () {
      const ownerBalance = await myToken.balanceOf(owner.address);
      expect(await myToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct initial supply", async function () {
      const expectedSupply = ethers.parseEther("1000000");
      expect(await myToken.totalSupply()).to.equal(expectedSupply);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await myToken.transfer(addr1.address, 50);
      const addr1Balance = await myToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await myToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await myToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
      expect(await myToken.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await myToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner
      await expect(
        myToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance");

      // Owner balance shouldn't change
      expect(await myToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint new tokens", async function () {
      const mintAmount = 1000;
      await myToken.mint(addr1.address, mintAmount);
      expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should fail if non-owner tries to mint", async function () {
      await expect(
        myToken.connect(addr1).mint(addr2.address, 100)
      ).to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Burning", function () {
    it("Should allow token holders to burn tokens", async function () {
      const initialBalance = await myToken.balanceOf(owner.address);
      const burnAmount = 100;

      await myToken.burn(burnAmount);
      expect(await myToken.balanceOf(owner.address)).to.equal(
        initialBalance - burnAmount
      );
    });
  });

  describe("Token Info", function () {
    it("Should return correct token information", async function () {
      const info = await myToken.getTokenInfo();
      expect(info[0]).to.equal("MyToken");
      expect(info[1]).to.equal("MYTO");
      expect(info[3]).to.equal(18);
    });
  });
});
