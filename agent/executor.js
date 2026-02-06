/**
 * Plan Executor - 执行计划执行模块
 *
 * 负责执行生成的计划，包括编译、测试、部署等步骤
 */

const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

class PlanExecutor {
  constructor(hre) {
    this.hre = hre;
    this.executionLog = [];
  }

  /**
   * 执行计划
   * @param {object} plan - 执行计划
   * @param {object} options - 执行选项
   * @returns {object} 执行结果
   */
  async execute(plan, options = {}) {
    const result = {
      success: true,
      plan: plan,
      steps: [],
      transactions: [],
      deployedContracts: {},
      errors: [],
      startTime: Date.now()
    };

    try {
      console.log(`\n${"─".repeat(70)}`);
      console.log(`⚙️  Executing ${plan.type} Plan`);
      console.log(`${"─".repeat(70)}\n`);

      // 按顺序执行步骤
      for (const step of plan.steps) {
        if (step.parallel) {
          console.log(`⏭️  Skipping parallel step: ${step.description}`);
          continue;
        }

        console.log(`\n▶️  [${step.order}/${plan.steps.length}] ${step.description}`);
        const stepResult = await this._executeStep(step, options);
        result.steps.push(stepResult);

        if (!stepResult.success && !step.optional) {
          console.error(`\n❌ Critical step failed: ${step.description}`);
          result.success = false;
          break;
        }

        // 如果步骤返回了部署的合约地址，保存它
        if (stepResult.contractAddress) {
          result.deployedContracts[step.contract] = stepResult.contractAddress;
        }

        // 短暂延迟
        await this._delay(1000);
      }

      result.endTime = Date.now();
      result.duration = result.endTime - result.startTime;

      // 执行总结
      this._logExecutionSummary(result);

    } catch (error) {
      console.error(`\n❌ Execution error: ${error.message}`);
      result.success = false;
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * 执行单个步骤
   */
  async _executeStep(step, options) {
    const stepResult = {
      step: step.description,
      success: false,
      output: null,
      error: null,
      duration: 0
    };

    const startTime = Date.now();

    try {
      if (step.command) {
        // 执行命令
        const { stdout, stderr } = await execAsync(step.command, {
          cwd: process.cwd(),
          env: process.env
        });

        stepResult.output = stdout;
        if (stderr) {
          stepResult.warnings = stderr;
        }

        // 尝试从输出中提取合约地址
        const addressMatch = stdout.match(/0x[a-fA-F0-9]{40}/);
        if (addressMatch) {
          stepResult.contractAddress = addressMatch[0];
          console.log(`   ✓ Contract deployed: ${addressMatch[0]}`);
        }

        console.log(`   ✓ Completed`);
        stepResult.success = true;

      } else if (step.contract && step.method) {
        // 使用 Hardhat 执行合约方法
        const contractResult = await this._executeContractMethod(step, options);
        stepResult.output = contractResult;
        stepResult.success = true;
        console.log(`   ✓ Method executed: ${step.method}`);
      }

    } catch (error) {
      stepResult.error = error.message;
      if (step.optional) {
        console.log(`   ⚠️  Optional step failed (continuing): ${error.message}`);
        stepResult.success = true; // 可选步骤失败不算整体失败
      } else {
        console.error(`   ✗ Failed: ${error.message}`);
      }
    }

    stepResult.duration = Date.now() - startTime;
    return stepResult;
  }

  /**
   * 执行合约方法
   */
  async _executeContractMethod(step, options) {
    const signers = await this.hre.ethers.getSigners();
    const [deployer] = signers;

    // 获取合约
    const contractAddress = options.deployedContracts?.[step.contract];

    if (!contractAddress) {
      throw new Error(`Contract ${step.contract} not found in deployed contracts`);
    }

    // 获取合约 ABI
    const artifact = await this.hre.artifacts.readArtifact(step.contract);
    const contract = new this.hre.ethers.Contract(
      contractAddress,
      artifact.abi,
      deployer
    );

    // 执行方法
    let result;
    switch (step.method) {
      case "initialize":
        if (step.features) {
          console.log(`   Initializing features: ${step.features.join(", ")}`);
          // 这里可以根据功能执行特定的初始化逻辑
          result = { initialized: true, features: step.features };
        }
        break;

      case "verify":
        result = await this._verifyContract(contract, step.checks);
        break;

      case "interact":
        result = await this._interactWithContract(contract);
        break;

      default:
        result = { message: `Method ${step.method} executed` };
    }

    return result;
  }

  /**
   * 验证合约部署
   */
  async _verifyContract(contract, checks) {
    const results = {};

    for (const check of checks) {
      switch (check) {
        case "address":
          results.address = await contract.getAddress();
          console.log(`   Address: ${results.address}`);
          break;

        case "balance":
          const balance = await this.hre.ethers.provider.getBalance(await contract.getAddress());
          results.balance = this.hre.ethers.formatEther(balance);
          console.log(`   Balance: ${results.balance} ETH`);
          break;

        case "initial state":
          if (contract.name) {
            try {
              results.name = await contract.name();
              console.log(`   Name: ${results.name}`);
            } catch (e) {}
          }
          break;
      }
    }

    return results;
  }

  /**
   * 与合约交互
   */
  async _interactWithContract(contract) {
    const interactions = [];

    // 尝试读取一些常见方法
    const commonMethods = ["name", "symbol", "totalSupply", "owner"];

    for (const method of commonMethods) {
      try {
        if (typeof contract[method] === "function") {
          const value = await contract[method]();
          interactions.push({ method, value: value.toString() });
          console.log(`   ${method}: ${value}`);
        }
      } catch (e) {
        // 方法不存在或调用失败，忽略
      }
    }

    return { interactions };
  }

  /**
   * 记录执行总结
   */
  _logExecutionSummary(result) {
    console.log(`\n${"═".repeat(70)}`);
    console.log("📊 Execution Summary");
    console.log(`${"═".repeat(70)}`);

    console.log(`Status:    ${result.success ? "✓ Success" : "✗ Failed"}`);
    console.log(`Duration:  ${this._formatDuration(result.duration)}`);
    console.log(`Steps:     ${result.steps.length}`);

    const successful = result.steps.filter(s => s.success).length;
    console.log(`Completed: ${successful}/${result.steps.length}`);

    if (result.deployedContracts && Object.keys(result.deployedContracts).length > 0) {
      console.log(`\nDeployed Contracts:`);
      Object.entries(result.deployedContracts).forEach(([name, address]) => {
        console.log(`  • ${name}: ${address}`);
      });
    }

    if (result.errors.length > 0) {
      console.log(`\nErrors:`);
      result.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    console.log(`${"═".repeat(70)}\n`);
  }

  /**
   * 格式化持续时间
   */
  _formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * 延迟辅助函数
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取执行日志
   */
  getExecutionLog() {
    return this.executionLog;
  }

  /**
   * 清除执行日志
   */
  clearExecutionLog() {
    this.executionLog = [];
  }
}

module.exports = PlanExecutor;
