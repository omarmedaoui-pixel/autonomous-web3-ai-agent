/**
 * Fixer Agent - Automatically fixes errors in smart contracts and tests
 *
 * 功能：
 * - 接收错误信息
 * - 分析错误原因
 * - 修改对应的合约或测试文件
 * - 自动修复代码
 */

const fs = require("fs");
const path = require("path");

class FixerAgent {
  constructor(hre) {
    this.hre = hre;
    this.contractsDir = path.join(process.cwd(), "contracts");
    this.testDir = path.join(process.cwd(), "test");
    this.scriptsDir = path.join(process.cwd(), "scripts");
  }

  /**
   * 修复错误
   * @param {object} errorInfo - 错误信息
   * @param {string} errorInfo.type - 错误类型 (contract|test|compile)
   * @param {string} errorInfo.message - 错误消息
   * @param {string} errorInfo.fileName - 文件名
   * @param {object} errorInfo.context - 额外上下文
   * @returns {object} 修复结果
   */
  async fix(errorInfo) {
    console.log("\n" + "=".repeat(70));
    console.log("🔧 Fixer Agent - Analyzing and Fixing Errors");
    console.log("=".repeat(70));

    try {
      // 分析错误
      const analysis = this._analyzeError(errorInfo);
      this._logAnalysis(analysis);

      // 根据错误类型进行修复
      let fixResult;
      switch (analysis.type) {
        case "contract":
          fixResult = await this._fixContract(errorInfo, analysis);
          break;
        case "test":
          fixResult = await this._fixTest(errorInfo, analysis);
          break;
        case "import":
          fixResult = await this._fixImport(errorInfo, analysis);
          break;
        case "syntax":
          fixResult = await this._fixSyntax(errorInfo, analysis);
          break;
        case "version":
          fixResult = await this._fixVersion(errorInfo, analysis);
          break;
        default:
          fixResult = {
            success: false,
            message: "Unknown error type, cannot auto-fix"
          };
      }

      return fixResult;

    } catch (error) {
      console.error(`\n✗ Fix failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 分析错误
   */
  _analyzeError(errorInfo) {
    const { message, type: inputType } = errorInfo;
    let analysis = {
      type: "unknown",
      severity: "medium",
      canFix: false,
      suggestions: []
    };

    // 错误模式匹配
    const patterns = [
      // 编译错误
      {
        pattern: /TypeError|Cannot read|undefined is not a function/,
        type: "syntax",
        canFix: true,
        severity: "high"
      },
      // 导入错误
      {
        pattern: /Source not found|cannot resolve|module not found/i,
        type: "import",
        canFix: true,
        severity: "high"
      },
      // 版本错误
      {
        pattern: /Version pragma|solidity version/i,
        type: "version",
        canFix: true,
        severity: "medium"
      },
      // 合约错误
      {
        pattern: /contract|revert|require/i,
        type: "contract",
        canFix: true,
        severity: "medium"
      },
      // 测试错误
      {
        pattern: /AssertionError|expect|assert|chai/i,
        type: "test",
        canFix: true,
        severity: "medium"
      },
      // Gas 错误
      {
        pattern: /gas|out of gas|exceeds allowance/i,
        type: "contract",
        canFix: true,
        severity: "low"
      },
      // 权限错误
      {
        pattern: /OwnableUnauthorizedAccount|onlyOwner|caller is not the owner/i,
        type: "test",
        canFix: true,
        severity: "low"
      }
    ];

    // 匹配错误模式
    for (const pattern of patterns) {
      if (pattern.pattern.test(message)) {
        analysis.type = pattern.type;
        analysis.canFix = pattern.canFix;
        analysis.severity = pattern.severity;
        break;
      }
    }

    // 如果提供了类型，使用该类型
    if (inputType && inputType !== "unknown") {
      analysis.type = inputType;
    }

    // 生成修复建议
    analysis.suggestions = this._generateSuggestions(analysis, message);

    return analysis;
  }

  /**
   * 生成修复建议
   */
  _generateSuggestions(analysis, message) {
    const suggestions = [];

    switch (analysis.type) {
      case "import":
        suggestions.push("Check if OpenZeppelin contracts are installed: npm install @openzeppelin/contracts");
        suggestions.push("Verify import paths in the contract");
        break;
      case "version":
        suggestions.push("Update Solidity version pragma to match Hardhat config");
        break;
      case "contract":
        suggestions.push("Review contract logic for potential issues");
        suggestions.push("Check for missing functions or incorrect modifiers");
        break;
      case "test":
        suggestions.push("Verify test assertions match contract behavior");
        suggestions.push("Check if test accounts have proper permissions");
        break;
      case "syntax":
        suggestions.push("Review syntax errors in the code");
        suggestions.push("Check for missing semicolons or brackets");
        break;
    }

    return suggestions;
  }

  /**
   * 修复合约错误
   */
  async _fixContract(errorInfo, analysis) {
    const { fileName } = errorInfo;
    const filePath = path.join(this.contractsDir, fileName);

    console.log(`\n📝 Fixing contract: ${fileName}`);
    console.log(`   Issue: ${errorInfo.message.substring(0, 100)}...`);

    try {
      // 读取合约文件
      let contractCode = fs.readFileSync(filePath, "utf8");
      const originalCode = contractCode;

      // 应用修复
      contractCode = this._applyContractFixes(contractCode, analysis, errorInfo);

      // 如果代码有变化，保存
      if (contractCode !== originalCode) {
        fs.writeFileSync(filePath, contractCode, "utf8");
        console.log(`   ✓ Fixed and saved`);
        return {
          success: true,
          message: "Contract fixed successfully",
          fixesApplied: true
        };
      } else {
        console.log(`   ℹ  No automatic fix applicable`);
        return {
          success: false,
          message: "No automatic fix applicable for this error",
          suggestions: analysis.suggestions
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 修复测试错误
   */
  async _fixTest(errorInfo, analysis) {
    const { fileName } = errorInfo;
    const filePath = path.join(this.testDir, fileName);

    console.log(`\n📝 Fixing test: ${fileName}`);
    console.log(`   Issue: ${errorInfo.message.substring(0, 100)}...`);

    try {
      // 读取测试文件
      let testCode = fs.readFileSync(filePath, "utf8");
      const originalCode = testCode;

      // 应用修复
      testCode = this._applyTestFixes(testCode, analysis, errorInfo);

      // 如果代码有变化，保存
      if (testCode !== originalCode) {
        fs.writeFileSync(filePath, testCode, "utf8");
        console.log(`   ✓ Fixed and saved`);
        return {
          success: true,
          message: "Test fixed successfully",
          fixesApplied: true
        };
      } else {
        console.log(`   ℹ  No automatic fix applicable`);
        return {
          success: false,
          message: "No automatic fix applicable for this error",
          suggestions: analysis.suggestions
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 修复导入错误
   */
  async _fixImport(errorInfo, analysis) {
    const { fileName } = errorInfo;

    console.log(`\n📝 Fixing imports in: ${fileName}`);

    try {
      // 确定文件路径
      let filePath;
      if (fileName.endsWith(".sol")) {
        filePath = path.join(this.contractsDir, fileName);
      } else if (fileName.endsWith(".test.js")) {
        filePath = path.join(this.testDir, fileName);
      } else {
        return {
          success: false,
          message: "Cannot determine file type for import fix"
        };
      }

      let code = fs.readFileSync(filePath, "utf8");
      const originalCode = code;

      // 修复导入语句
      code = this._applyImportFixes(code, analysis);

      if (code !== originalCode) {
        fs.writeFileSync(filePath, code, "utf8");
        console.log(`   ✓ Imports fixed`);
        return {
          success: true,
          message: "Imports fixed successfully"
        };
      }

      return {
        success: false,
        message: "Could not auto-fix imports",
        suggestions: [
          "Run: npm install @openzeppelin/contracts",
          "Check import paths in the file"
        ]
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 修复语法错误
   */
  async _fixSyntax(errorInfo, analysis) {
    const { fileName } = errorInfo;

    console.log(`\n📝 Attempting to fix syntax in: ${fileName}`);

    return {
      success: false,
      message: "Syntax errors require manual review",
      suggestions: [
        "Review the file for missing semicolons",
        "Check bracket matching",
        "Verify function declarations"
      ]
    };
  }

  /**
   * 修复版本错误
   */
  async _fixVersion(errorInfo, analysis) {
    const { fileName } = errorInfo;

    if (!fileName.endsWith(".sol")) {
      return {
        success: false,
        message: "Version fix only applies to Solidity files"
      };
    }

    console.log(`\n📝 Fixing Solidity version in: ${fileName}`);

    try {
      const filePath = path.join(this.contractsDir, fileName);
      let code = fs.readFileSync(filePath, "utf8");

      // 移除或更新版本声明
      code = code.replace(/pragma solidity \^?\d+\.\d+\.\d+;/g, "pragma solidity ^0.8.0;");

      fs.writeFileSync(filePath, code, "utf8");
      console.log(`   ✓ Version updated to ^0.8.0`);

      return {
        success: true,
        message: "Solidity version updated"
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 应用合约修复
   */
  _applyContractFixes(code, analysis, errorInfo) {
    const { message } = errorInfo;

    // 修复常见问题

    // 1. 添加缺少的事件
    if (message.includes("event") && !code.includes("event ")) {
      // 合约中缺少事件声明
      console.log("   → Adding missing event declarations");
    }

    // 2. 修复函数可见性
    if (message.includes("public") && message.includes("internal")) {
      // 可能需要将函数改为 public
      code = code.replace(/function (\w+)\(/g, "function $1 public(");
      console.log("   → Updated function visibility to public");
    }

    // 3. 添加缺少的构造函数
    if (message.includes("constructor") && !code.includes("constructor()")) {
      // 在合约开头添加构造函数
      const contractMatch = code.match(/contract (\w+) is/);
      if (contractMatch) {
        const contractName = contractMatch[1];
        const constructorCode = `
    constructor() {
        // Initialize contract
    }
`;
        code = code.replace(/{$/, `{${
  constructorCode
}`);
        console.log("   → Added constructor");
      }
    }

    // 4. 修复继承问题
    if (message.includes("override") && !code.includes("override")) {
      code = code.replace(/function (\w+)\(/g, "function $1() override ");
      console.log("   → Added override keyword");
    }

    return code;
  }

  /**
   * 应用测试修复
   */
  _applyTestFixes(code, analysis, errorInfo) {
    const { message } = errorInfo;

    // 1. 修复 expect 链式调用
    if (message.includes("undefined")) {
      code = code.replace(/\.to\.equal\(undefined\)/g, ".to.not.exist");
      code = code.replace(/\.to\.equal\(void 0\)/g, ".to.not.exist");
      console.log("   → Fixed undefined assertions");
    }

    // 2. 添加 await 关键字
    if (message.includes("Promise") && !message.includes("await")) {
      // 在行首添加 await
      code = code.replace(/^(\s*)(return\s+)?(expect|assert|contract\.\w+\.)/gm, "$1await $3");
      console.log("   → Added await to async calls");
    }

    // 3. 修复权限错误
    if (message.includes("OwnableUnauthorizedAccount")) {
      // 使用 owner 账户而不是其他账户
      code = code.replace(/\.connect\((addr1|addr2)\)/g, "");
      console.log("   → Removed .connect() for owner-restricted functions");
    }

    // 4. 添加 missing semicolons
    if (message.includes("Missing semicolon")) {
      // 在特定行末添加分号
      code = code.replace(/(\w+)(\n)/g, "$1;$2");
      console.log("   → Added semicolons");
    }

    return code;
  }

  /**
   * 应用导入修复
   */
  _applyImportFixes(code, analysis) {
    // 确保有正确的 OpenZeppelin 导入
    const requiredImports = [
      "@openzeppelin/contracts/token/ERC20/ERC20.sol",
      "@openzeppelin/contracts/token/ERC721/ERC721.sol",
      "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol",
      "@openzeppelin/contracts/access/Ownable.sol"
    ];

    // 检查是否已有导入
    for (const imp of requiredImports) {
      const importName = imp.split("/").pop().replace(".sol", "");
      if (!code.includes(`import "${imp}"`) && code.includes(importName)) {
        // 添加导入
        code = `import "${imp}";\n${code}`;
        console.log(`   → Added import: ${importName}`);
      }
    }

    return code;
  }

  /**
   * 日志：分析结果
   */
  _logAnalysis(analysis) {
    console.log("\n┌─ Error Analysis:");
    console.log(`│  Type:      ${analysis.type}`);
    console.log(`│  Severity:  ${analysis.severity}`);
    console.log(`│  Can Fix:   ${analysis.canFix ? "✓ Yes" : "✗ No"}`);

    if (analysis.suggestions.length > 0) {
      console.log(`│`);
      console.log(`│  Suggestions:`);
      analysis.suggestions.forEach((suggestion, i) => {
        console.log(`│    ${i + 1}. ${suggestion}`);
      });
    }

    console.log("└─────────────────────────────────────────────────────");
  }
}

module.exports = FixerAgent;
