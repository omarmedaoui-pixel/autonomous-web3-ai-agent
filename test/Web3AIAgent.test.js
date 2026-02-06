const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Web3AIAgent Contract", function () {
  let web3AIAgent;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const Web3AIAgent = await ethers.getContractFactory("Web3AIAgent");
    web3AIAgent = await Web3AIAgent.deploy();
    await web3AIAgent.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await web3AIAgent.owner()).to.equal(owner.address);
    });

    it("Should set the correct name", async function () {
      expect(await web3AIAgent.name()).to.equal("Web3 AI Agent");
    });

    it("Should initialize task count to 0", async function () {
      expect(await web3AIAgent.taskCount()).to.equal(0);
    });
  });

  describe("Task Management", function () {
    it("Should create a new task", async function () {
      await web3AIAgent.createTask("Analyze market data");
      expect(await web3AIAgent.taskCount()).to.equal(1);

      const task = await web3AIAgent.getTask(1);
      expect(task.description).to.equal("Analyze market data");
      expect(task.creator).to.equal(owner.address);
      expect(task.completed).to.equal(false);
    });

    it("Should increment user task count", async function () {
      await web3AIAgent.createTask("Task 1");
      await web3AIAgent.createTask("Task 2");

      expect(await web3AIAgent.getUserTasks(owner.address)).to.equal(2);
    });

    it("Should complete a task", async function () {
      await web3AIAgent.createTask("Test task");
      await web3AIAgent.completeTask(1);

      const task = await web3AIAgent.getTask(1);
      expect(task.completed).to.equal(true);
    });

    it("Should not allow non-creator to complete task", async function () {
      await web3AIAgent.connect(addr1).createTask("Addr1 task");

      await expect(
        web3AIAgent.completeTask(1)
      ).to.be.revertedWith("Not task creator");
    });

    it("Should not complete already completed task", async function () {
      await web3AIAgent.createTask("Test task");
      await web3AIAgent.completeTask(1);

      await expect(
        web3AIAgent.completeTask(1)
      ).to.be.revertedWith("Task already completed");
    });
  });

  describe("Events", function () {
    it("Should emit TaskCreated event", async function () {
      await expect(web3AIAgent.createTask("New task"))
        .to.emit(web3AIAgent, "TaskCreated")
        .withArgs(1, "New task", owner.address);
    });

    it("Should emit TaskCompleted event", async function () {
      await web3AIAgent.createTask("Test task");

      await expect(web3AIAgent.completeTask(1))
        .to.emit(web3AIAgent, "TaskCompleted")
        .withArgs(1, owner.address);
    });

    it("Should emit AgentAction event", async function () {
      await expect(web3AIAgent.createTask("Action test"))
        .to.emit(web3AIAgent, "AgentAction");
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to update owner", async function () {
      await web3AIAgent.updateOwner(addr1.address);
      expect(await web3AIAgent.owner()).to.equal(addr1.address);
    });

    it("Should not allow non-owner to update owner", async function () {
      await expect(
        web3AIAgent.connect(addr1).updateOwner(addr1.address)
      ).to.be.revertedWith("Not owner");
    });

    it("Should allow owner to call emergency stop", async function () {
      const tx = await web3AIAgent.emergencyStop();
      const receipt = await tx.wait();

      // Check that AgentAction event was emitted
      await expect(web3AIAgent.emergencyStop())
        .to.emit(web3AIAgent, "AgentAction");
    });
  });
});
