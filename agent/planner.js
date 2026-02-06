/**
 * Web3 AI Agent - Planner Module
 *
 * 该模块负责：
 * 1. 接收用户任务
 * 2. 分析任务类型
 * 3. 生成执行计划
 * 4. 将计划传递给执行模块
 */

const TaskAnalyzer = require("./analyzers/taskAnalyzer");
const PlanGenerator = require("./planners/planGenerator");
const PlanExecutor = require("./executor");

class Planner {
  constructor(hre) {
    this.hre = hre;
    this.analyzer = new TaskAnalyzer(hre);
    this.generator = new PlanGenerator(hre);
    this.executor = new PlanExecutor(hre);
    this.plans = new Map(); // 存储已生成的计划
  }

  /**
   * 主入口：处理用户任务
   * @param {string} userTask - 用户的任务描述
   * @param {object} options - 可选参数
   * @returns {object} 执行结果
   */
  async process(userTask, options = {}) {
    console.log("\n" + "=".repeat(70));
    console.log("🧠 Web3 AI Agent - Intelligent Planner");
    console.log("=".repeat(70));
    console.log(`\n📝 Task: "${userTask}"\n`);

    try {
      // 1. 分析任务
      console.log("🔍 Step 1: Analyzing task...");
      const analysis = await this.analyzer.analyze(userTask);
      this._logAnalysis(analysis);

      // 2. 生成执行计划
      console.log("\n📋 Step 2: Generating execution plan...");
      const plan = await this.generator.generate(analysis, userTask);
      this._logPlan(plan);

      // 保存计划
      const planId = this._generatePlanId();
      this.plans.set(planId, { plan, analysis, userTask });

      // 3. 执行计划（如果启用自动执行）
      if (options.autoExecute !== false) {
        console.log("\n⚙️  Step 3: Executing plan...");
        const result = await this.executor.execute(plan, options);
        this._logResult(result);

        return {
          planId,
          analysis,
          plan,
          result,
          success: true
        };
      }

      return {
        planId,
        analysis,
        plan,
        success: true
      };

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
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
    console.log("📦 Batch Processing Mode");
    console.log(`Total tasks: ${userTasks.length}`);
    console.log("=".repeat(70));

    const results = [];

    for (let i = 0; i < userTasks.length; i++) {
      console.log(`\n[${i + 1}/${userTasks.length}] Processing: "${userTasks[i]}"`);

      try {
        const result = await this.process(userTasks[i], {
          ...options,
          autoExecute: options.autoExecute !== false
        });
        results.push({
          task: userTasks[i],
          success: true,
          data: result
        });

        // 短暂延迟避免过快
        await this._delay(500);

      } catch (error) {
        console.error(`Task failed: ${error.message}`);
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
   * 获取计划详情
   * @param {string} planId - 计划ID
   */
  getPlan(planId) {
    return this.plans.get(planId);
  }

  /**
   * 列出所有计划
   */
  listPlans() {
    return Array.from(this.plans.entries()).map(([id, data]) => ({
      id,
      task: data.userTask,
      type: data.plan.type,
      status: data.result ? "completed" : "pending"
    }));
  }

  /**
   * 生成计划ID
   */
  _generatePlanId() {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 日志：分析结果
   */
  _logAnalysis(analysis) {
    console.log("\n┌─ Analysis Results:");
    console.log(`│  Type:           ${analysis.type}`);
    console.log(`│  Confidence:     ${(analysis.confidence * 100).toFixed(1)}%`);
    console.log(`│  Subtype:        ${analysis.subtype || "N/A"}`);
    console.log(`│  Complexity:     ${analysis.complexity || "medium"}`);
    console.log(`│  Keywords:       ${analysis.keywords?.join(", ") || "none"}`);
    console.log("└─────────────────────────────────────────────────────");
  }

  /**
   * 日志：执行计划
   */
  _logPlan(plan) {
    console.log("\n┌─ Execution Plan:");
    console.log(`│  Type:           ${plan.type}`);
    console.log(`│  Contract:       ${plan.contractName}`);
    console.log(`│  Needs Test:     ${plan.needsTest ? "✓" : "✗"}`);
    console.log(`│  Needs Deploy:   ${plan.needsDeploy ? "✓" : "✗"}`);
    console.log(`│  Estimated Steps: ${plan.steps?.length || 0}`);

    if (plan.steps && plan.steps.length > 0) {
      console.log(`│`);
      console.log(`│  Steps:`);
      plan.steps.forEach((step, i) => {
        console.log(`│    ${i + 1}. ${step.description}`);
        if (step.contract) {
          console.log(`│       Contract: ${step.contract}`);
        }
        if (step.method) {
          console.log(`│       Method: ${step.method}`);
        }
      });
    }
    console.log("└─────────────────────────────────────────────────────");
  }

  /**
   * 日志：执行结果
   */
  _logResult(result) {
    console.log("\n┌─ Execution Results:");
    console.log(`│  Status:         ${result.success ? "✓ Success" : "✗ Failed"}`);

    if (result.transactions) {
      console.log(`│  Transactions:   ${result.transactions.length}`);
      result.transactions.forEach((tx, i) => {
        console.log(`│    ${i + 1}. ${tx.description}`);
        console.log(`│       Hash: ${tx.hash}`);
        console.log(`│       Gas:  ${tx.gasUsed}`);
      });
    }

    if (result.deployedContracts) {
      console.log(`│`);
      console.log(`│  Deployed:`);
      Object.entries(result.deployedContracts).forEach(([name, address]) => {
        console.log(`│    ${name}: ${address}`);
      });
    }

    console.log("└─────────────────────────────────────────────────────");
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
   * 延迟辅助函数
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Planner;
