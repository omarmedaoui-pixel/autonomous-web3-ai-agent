/**
 * Web3 AI Agent Framework
 * An intelligent agent that interacts with smart contracts
 */

const { ethers } = require("hardhat");

class Web3AIAgent {
  constructor(contractAddress, contractABI, signer) {
    this.contract = new ethers.Contract(contractAddress, contractABI, signer);
    this.tasks = new Map();
    this.memory = [];
  }

  /**
   * Analyze contract state and generate insights
   */
  async analyze() {
    console.log("🤖 AI Agent: Analyzing contract state...\n");

    const name = await this.contract.name();
    const owner = await this.contract.owner();
    const taskCount = await this.contract.taskCount();

    const analysis = {
      contractName: name,
      owner: owner,
      totalTasks: taskCount.toString(),
      insights: []
    };

    // Generate insights based on contract state
    if (taskCount > 0) {
      analysis.insights.push(`Contract has ${taskCount} active tasks`);
    } else {
      analysis.insights.push("No tasks created yet");
    }

    console.log("📊 Analysis Results:");
    console.log(JSON.stringify(analysis, null, 2));
    console.log();

    return analysis;
  }

  /**
   * Execute a task on the smart contract
   */
  async executeTask(taskDescription) {
    console.log(`🎯 AI Agent: Executing task - "${taskDescription}"\n`);

    try {
      const tx = await this.contract.createTask(taskDescription);
      console.log(`⏳ Transaction submitted: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
      console.log(`💰 Gas used: ${receipt.gasUsed.toString()}\n`);

      // Store in memory
      this.memory.push({
        action: "createTask",
        description: taskDescription,
        txHash: tx.hash,
        timestamp: new Date().toISOString()
      });

      return receipt;
    } catch (error) {
      console.error(`❌ Error executing task: ${error.message}\n`);
      throw error;
    }
  }

  /**
   * Monitor contract events in real-time
   */
  async monitorEvents() {
    console.log("👁️  AI Agent: Starting event monitoring...\n");

    this.contract.on("TaskCreated", (taskId, description, creator) => {
      console.log("📝 Event: TaskCreated");
      console.log(`   - Task ID: ${taskId}`);
      console.log(`   - Description: ${description}`);
      console.log(`   - Creator: ${creator}\n`);
    });

    this.contract.on("TaskCompleted", (taskId, completer) => {
      console.log("✅ Event: TaskCompleted");
      console.log(`   - Task ID: ${taskId}`);
      console.log(`   - Completer: ${completer}\n`);
    });

    this.contract.on("AgentAction", (action, agent, timestamp) => {
      console.log("🤖 Event: AgentAction");
      console.log(`   - Action: ${action}`);
      console.log(`   - Agent: ${agent}`);
      console.log(`   - Timestamp: ${timestamp}\n`);
    });
  }

  /**
   * Generate a report of agent activities
   */
  generateReport() {
    console.log("📋 AI Agent Activity Report\n");
    console.log("=" .repeat(50));

    if (this.memory.length === 0) {
      console.log("No activities recorded yet.");
    } else {
      this.memory.forEach((activity, index) => {
        console.log(`\n${index + 1}. ${activity.action}`);
        console.log(`   Description: ${activity.description}`);
        console.log(`   TX Hash: ${activity.txHash}`);
        console.log(`   Timestamp: ${activity.timestamp}`);
      });
    }

    console.log("\n" + "=".repeat(50));
    console.log(`Total Activities: ${this.memory.length}\n`);

    return this.memory;
  }

  /**
   * Stop monitoring events
   */
  stopMonitoring() {
    console.log("🛑 AI Agent: Stopping event monitoring...\n");
    this.contract.removeAllListeners();
  }
}

module.exports = Web3AIAgent;
