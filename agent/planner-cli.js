#!/usr/bin/env node
/**
 * Web3 AI Agent - Planner CLI
 * 带有智能规划器的命令行界面
 *
 * Usage:
 *   node agent/planner-cli.js "Create an ERC20 token"
 *   node agent/planner-cli.js "Deploy an NFT collection" --no-execute
 *   node agent/planner-cli.js --file tasks-planner.txt
 */

const hre = require("hardhat");
const Planner = require("./planner");
const fs = require("fs");
const path = require("path");

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    task: null,
    file: null,
    autoExecute: true,
    output: "json",
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--file":
      case "-f":
        options.file = args[++i];
        break;
      case "--no-execute":
      case "-n":
        options.autoExecute = false;
        break;
      case "--output":
      case "-o":
        options.output = args[++i];
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        if (!arg.startsWith("--")) {
          options.task = arg;
        }
    }
  }

  return options;
}

/**
 * 打印帮助信息
 */
function printHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         Web3 AI Agent - Intelligent Planner CLI                ║
╚════════════════════════════════════════════════════════════════╝

Usage:
  node agent/planner-cli.js "Task description" [options]

Options:
  -f, --file <path>      Read tasks from file
  -n, --no-execute       Generate plan without executing
  -o, --output <format>  Output format (json, pretty)
  -v, --verbose          Verbose output
  -h, --help             Show this help message

Examples:
  # Create an ERC20 token
  node agent/planner-cli.js "Create an ERC20 token called MyToken"

  # Deploy an NFT without executing
  node agent/planner-cli.js "Deploy an NFT collection" --no-execute

  # Batch process from file
  node agent/planner-cli.js --file tasks-planner.txt

  # Verbose mode
  node agent/planner-cli.js "Create a DAO" --verbose

Task Types Supported:
  • ERC20 Tokens
  • NFT Collections (ERC721)
  • DAO Contracts
  • Staking Contracts
  • General Smart Contracts

Output:
  The planner will:
  1. Analyze your task
  2. Identify contract type and features
  3. Generate execution plan
  4. Execute the plan (unless --no-execute)

Features:
  • Intelligent task analysis
  • Automatic contract type detection
  • Feature extraction from description
  • Step-by-step execution plan
  • Batch processing support
`);
}

/**
 * 从文件读取任务
 */
function readTasksFromFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, "utf-8");

    const tasks = content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#"));

    console.log(`📄 Loaded ${tasks.length} tasks from ${filePath}`);
    return tasks;
  } catch (error) {
    throw new Error(`Failed to read tasks from file: ${error.message}`);
  }
}

/**
 * 格式化输出
 */
function formatOutput(result, format) {
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }

  // Pretty format
  let output = "";

  if (result.analysis) {
    output += `\n📊 Analysis:\n`;
    output += `  Type:       ${result.analysis.type}\n`;
    output += `  Subtype:    ${result.analysis.subtype || "N/A"}\n`;
    output += `  Confidence: ${(result.analysis.confidence * 100).toFixed(1)}%\n`;
    output += `  Complexity: ${result.analysis.complexity}\n`;
    output += `  Features:   ${result.analysis.features?.join(", ") || "None"}\n`;
  }

  if (result.plan) {
    output += `\n📋 Plan:\n`;
    output += `  Contract:   ${result.plan.contractName}\n`;
    output += `  Steps:      ${result.plan.steps?.length || 0}\n`;
    output += `  Test:       ${result.plan.needsTest ? "Yes" : "No"}\n`;
    output += `  Deploy:     ${result.plan.needsDeploy ? "Yes" : "No"}\n`;
  }

  if (result.result && result.result.deployedContracts) {
    output += `\n✅ Deployed Contracts:\n`;
    Object.entries(result.result.deployedContracts).forEach(([name, address]) => {
      output += `  ${name}: ${address}\n`;
    });
  }

  return output;
}

/**
 * 主执行函数
 */
async function main() {
  const options = parseArgs();

  // 从文件读取任务
  if (options.file) {
    options.task = readTasksFromFile(options.file);
  }

  // 检查任务
  if (!options.task) {
    console.error("❌ No task specified. Use --help for usage information.");
    process.exit(1);
  }

  // 初始化 Planner
  const planner = new Planner(hre);

  try {
    let result;

    // 批量处理
    if (Array.isArray(options.task)) {
      console.log("\n📦 Batch Mode");
      result = await planner.processBatch(options.task, {
        autoExecute: options.autoExecute
      });
    } else {
      // 单任务处理
      result = await planner.process(options.task, {
        autoExecute: options.autoExecute
      });
    }

    // 输出结果
    if (options.output === "json") {
      console.log("\n" + formatOutput(result, "json"));
    }

    // 保存计划（如果未执行）
    if (!options.autoExecute && result.planId) {
      const plan = planner.getPlan(result.planId);
      const outputPath = path.join(__dirname, "..", "plans", `${result.planId}.json`);

      // 确保目录存在
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

      fs.writeFileSync(outputPath, JSON.stringify(plan, null, 2));
      console.log(`\n💾 Plan saved to: ${outputPath}`);
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * 优雅退出
 */
process.on("SIGINT", () => {
  console.log("\n\n🛑 Shutting down...\n");
  process.exit(0);
});

// 运行
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n✅ Completed successfully!\n");
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { Planner, main };
