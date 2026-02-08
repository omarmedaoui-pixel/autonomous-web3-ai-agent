#!/usr/bin/env node
/**
 * Web3 AI Agent - Multi-Agent Architecture
 *
 * 主控制器：协调所有Agent工作
 *
 * 执行流程：
 * 用户输入 → planner.js分析任务 → coder.js生成合约 → tester.js生成测试 → deployer.js生成部署脚本
 *
 * Usage: node agent/multi-agent.js "创建ERC20代币 TestToken"
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Import all agents
const Planner = require("./planner");
const CoderAgent = require("./coders/coder");
const TesterAgent = require("./testers/tester");
const DeployerAgent = require("./deployers/deployer");

class MultiAgentController {
  constructor(hre) {
    this.hre = hre;
    this.planner = new Planner(hre);
    this.coder = new CoderAgent(hre);
    this.tester = new TesterAgent(hre);
    this.deployer = new DeployerAgent(hre);
  }

  /**
   * 主入口：处理用户任务
   * @param {string} userTask - 用户的任务描述
   * @param {object} options - 可选参数
   * @returns {object} 执行结果
   */
  async process(userTask, options = {}) {
    console.log("\n" + "=".repeat(70));
    console.log("🤖 Web3 AI Agent - Multi-Agent System");
    console.log("=".repeat(70));
    console.log(`\n📝 Task: "${userTask}"\n`);

    const startTime = Date.now();
    const results = {
      plan: null,
      contract: null,
      test: null,
      deployScript: null,
      success: false,
      errors: []
    };

    try {
      // Step 1: 分析任务并生成计划
      console.log("\n" + "─".repeat(70));
      console.log("🧠 Step 1: Planning");
      console.log("─".repeat(70));
      const planResult = await this.planner.process(userTask, {
        autoExecute: false,
        ...options
      });

      if (!planResult.success) {
        throw new Error("Planning failed");
      }

      results.plan = planResult.plan;
      const plan = planResult.plan;

      // 短暂延迟，展示进度
      await this._delay(500);

      // Step 2: 生成Solidity合约
      console.log("\n" + "─".repeat(70));
      console.log("💻 Step 2: Coding");
      console.log("─".repeat(70));
      const contractResult = await this.coder.generate(plan);

      if (!contractResult.success) {
        results.errors.push("Contract generation failed: " + contractResult.error);
        throw new Error("Contract generation failed");
      }

      results.contract = contractResult;

      // 短暂延迟，展示进度
      await this._delay(500);

      // Step 3: 生成测试文件
      console.log("\n" + "─".repeat(70));
      console.log("🧪 Step 3: Testing");
      console.log("─".repeat(70));
      const testResult = await this.tester.generate(plan);

      if (!testResult.success) {
        results.errors.push("Test generation failed: " + testResult.error);
        throw new Error("Test generation failed");
      }

      results.test = testResult;

      // 短暂延迟，展示进度
      await this._delay(500);

      // Step 4: 生成部署脚本
      console.log("\n" + "─".repeat(70));
      console.log("🚀 Step 4: Deployment Script Generation");
      console.log("─".repeat(70));
      const deployResult = await this.deployer.generate(plan);

      if (!deployResult.success) {
        results.errors.push("Deploy script generation failed: " + deployResult.error);
        throw new Error("Deploy script generation failed");
      }

      results.deployScript = deployResult;

      // 所有步骤完成
      results.success = true;
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      this._logSummary(results, duration);

      // 保存执行报告
      if (options.saveReport !== false) {
        this._saveReport(userTask, results, duration);
      }

      return results;

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      results.errors.push(error.message);

      // 即使失败，也保存部分结果
      if (options.saveReport !== false) {
        this._saveReport(userTask, results, 0);
      }

      throw error;
    }
  }

  /**
   * 批量处理任务
   * @param {string[]} userTasks - 任务数组
   * @param {object} options - 可选参数
   */
  async processBatch(userTasks, options = {}) {
    console.log("\n" + "=".repeat(70));
    console.log("📦 Multi-Agent Batch Processing Mode");
    console.log(`Total tasks: ${userTasks.length}`);
    console.log("=".repeat(70));

    const results = [];

    for (let i = 0; i < userTasks.length; i++) {
      console.log(`\n[${i + 1}/${userTasks.length}] Processing: "${userTasks[i]}"`);

      try {
        const result = await this.process(userTasks[i], options);
        results.push({
          task: userTasks[i],
          success: true,
          data: result
        });

        // 短暂延迟避免过快
        await this._delay(1000);

      } catch (error) {
        console.error(`\nTask failed: ${error.message}`);
        results.push({
          task: userTasks[i],
          success: false,
          error: error.message
        });
      }
    }

    // 批量执行总结
    this._logBatchSummary(results);

    return results;
  }

  /**
   * 日志：执行总结
   */
  _logSummary(results, duration) {
    console.log("\n" + "=".repeat(70));
    console.log("✅ Multi-Agent Execution Complete");
    console.log("=".repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`  Duration:     ${duration}s`);
    console.log(`  Status:       ✓ Success`);

    if (results.plan) {
      console.log(`\n  Plan:`);
      console.log(`    Type:         ${results.plan.type}`);
      console.log(`    Contract:     ${results.plan.contractName}`);
      console.log(`    Steps:        ${results.plan.steps?.length || 0}`);
    }

    if (results.contract) {
      console.log(`\n  Contract:`);
      console.log(`    File:         ${results.contract.fileName}`);
      console.log(`    Location:     contracts/${results.contract.fileName}`);
    }

    if (results.test) {
      console.log(`\n  Test:`);
      console.log(`    File:         ${results.test.fileName}`);
      console.log(`    Location:     test/${results.test.fileName}`);
    }

    if (results.deployScript) {
      console.log(`\n  Deploy Script:`);
      console.log(`    File:         ${results.deployScript.fileName}`);
      console.log(`    Location:     scripts/${results.deployScript.fileName}`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("\n📋 Next Steps:");
    console.log(`  1. Review the generated contract: contracts/${results.contract?.fileName}`);
    console.log(`  2. Run tests: npx hardhat test test/${results.test?.fileName}`);
    console.log(`  3. Deploy: npx hardhat run scripts/${results.deployScript?.fileName} --network <network>`);
    console.log("\n" + "=".repeat(70));
  }

  /**
   * 日志：批量执行总结
   */
  _logBatchSummary(results) {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log("\n" + "=".repeat(70));
    console.log("📊 Batch Execution Summary");
    console.log("=".repeat(70));
    console.log(`✓ Successful: ${successful}`);
    console.log(`✗ Failed:     ${failed}`);
    console.log(`📈 Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`);
    console.log("=".repeat(70) + "\n");
  }

  /**
   * 保存执行报告
   */
  _saveReport(userTask, results, duration) {
    const report = {
      timestamp: new Date().toISOString(),
      task: userTask,
      duration: duration + "s",
      success: results.success,
      plan: results.plan ? {
        type: results.plan.type,
        contractName: results.plan.contractName,
        steps: results.plan.steps?.length || 0
      } : null,
      generated: {
        contract: results.contract?.fileName || null,
        test: results.test?.fileName || null,
        deployScript: results.deployScript?.fileName || null
      },
      errors: results.errors
    };

    const reportsDir = path.join(process.cwd(), "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filename = `report-${Date.now()}.json`;
    const filepath = path.join(reportsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved: ${filepath}`);
  }

  /**
   * 延迟辅助函数
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI入口
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║          Web3 AI Agent - Multi-Agent System                    ║
╚════════════════════════════════════════════════════════════════╝

Usage:
  node agent/multi-agent.js "Task description"
  node agent/multi-agent.js "Task 1" "Task 2" "Task 3"

Examples:
  node agent/multi-agent.js "创建ERC20代币 TestToken"
  node agent/multi-agent.js "创建NFT合约 MyNFT --symbol MNFT"
  node agent/multi-agent.js "创建DAO合约 MyDAO"

For more information, see: MULTI_AGENT_GUIDE.md
`);
    process.exit(1);
  }

  const controller = new MultiAgentController(hre);

  try {
    if (args.length === 1) {
      // Single task
      await controller.process(args[0]);
    } else {
      // Multiple tasks
      await controller.processBatch(args);
    }

    process.exit(0);

  } catch (error) {
    console.error("\n❌ Execution failed:", error.message);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = MultiAgentController;

// Run if called directly
if (require.main === module) {
  main();
}
