/**
 * Plan Generator - 执行计划生成模块
 *
 * 根据分析结果生成详细的执行计划
 */

class PlanGenerator {
  constructor(hre) {
    this.hre = hre;
    this.templates = this._initializeTemplates();
  }

  /**
   * 生成执行计划
   * @param {object} analysis - 分析结果
   * @param {string} originalTask - 原始任务
   * @returns {object} 执行计划
   */
  async generate(analysis, originalTask) {
    const type = analysis.type;
    const template = this.templates[type] || this.templates.GENERAL;

    // 基于模板生成计划
    const plan = {
      type,
      contractName: analysis.contractName || template.defaultContractName,
      needsTest: template.needsTest,
      needsDeploy: template.needsDeploy,
      needsCompile: template.needsCompile,
      estimatedGas: template.estimatedGas,
      estimatedTime: template.estimatedTime,
      steps: [],
      features: analysis.features || [],
      complexity: analysis.complexity,
      subtype: analysis.subtype,
      dependencies: template.dependencies || [],
      scripts: []
    };

    // 生成执行步骤
    plan.steps = this._generateSteps(analysis, template);

    // 添加测试脚本
    if (plan.needsTest) {
      plan.scripts.push(this._getTestScript(type));
    }

    // 添加部署脚本
    if (plan.needsDeploy) {
      plan.scripts.push(this._getDeployScript(type));
    }

    // 添加交互脚本
    plan.scripts.push(this._getInteractScript(type));

    // 生成合约配置
    plan.contractConfig = this._generateContractConfig(analysis);

    return plan;
  }

  /**
   * 生成执行步骤
   */
  _generateSteps(analysis, template) {
    const steps = [];
    const type = analysis.type;

    // 步骤 1: 编译合约
    steps.push({
      order: 1,
      description: "Compile smart contracts",
      command: "npm run compile",
      contract: null,
      method: null,
      optional: false
    });

    // 步骤 2: 运行测试
    if (template.needsTest) {
      steps.push({
        order: 2,
        description: `Run tests for ${type} contract`,
        command: `npm run test:${type.toLowerCase()}`,
        contract: analysis.contractName,
        method: "test",
        optional: false
      });
    }

    // 步骤 3: 启动本地网络（如果需要）
    steps.push({
      order: 3,
      description: "Start local blockchain network",
      command: "npm run node",
      contract: null,
      method: null,
      optional: true,
      parallel: true,
      note: "Run in separate terminal"
    });

    // 步骤 4: 部署合约
    if (template.needsDeploy) {
      steps.push({
        order: 4,
        description: `Deploy ${analysis.contractName} contract`,
        command: type === "GENERAL"
          ? `npx hardhat run scripts/deploy-${analysis.contractName.toLowerCase()}.js`
          : this._getDeployCommand(type),
        contract: analysis.contractName,
        method: "deploy",
        optional: false,
        network: "localhost"
      });
    }

    // 步骤 5: 验证部署
    steps.push({
      order: 5,
      description: "Verify contract deployment",
      contract: analysis.contractName,
      method: "verify",
      optional: false,
      checks: ["address", "balance", "initial state"]
    });

    // 步骤 6: 初始化功能
    if (analysis.features && analysis.features.length > 0) {
      steps.push({
        order: 6,
        description: `Initialize features: ${analysis.features.join(", ")}`,
        contract: analysis.contractName,
        method: "initialize",
        features: analysis.features,
        optional: true
      });
    }

    // 步骤 7: 交互测试
    steps.push({
      order: 7,
      description: "Perform interaction tests",
      command: this._getInteractCommand(type),
      contract: analysis.contractName,
      method: "interact",
      optional: true
    });

    return steps;
  }

  /**
   * 生成合约配置
   */
  _generateContractConfig(analysis) {
    const config = {
      name: analysis.contractName,
      type: analysis.type,
      solidityVersion: "^0.8.27",
      compilerSettings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    };

    // 类型特定配置
    switch (analysis.type) {
      case "ERC20":
        config.erc20Config = {
          name: analysis.contractName,
          symbol: this._generateSymbol(analysis.contractName),
          decimals: 18,
          initialSupply: "1000000000000000000000000", // 1 million tokens
          features: analysis.features
        };
        break;

      case "NFT":
        config.nftConfig = {
          name: analysis.contractName,
          symbol: this._generateSymbol(analysis.contractName, "NFT"),
          baseURI: "ipfs://",
          features: analysis.features
        };
        break;

      case "DAO":
        config.daoConfig = {
          name: analysis.contractName,
          quorum: 51, // 51% majority
          votingDelay: 0,
          votingPeriod: 100, // blocks
          features: analysis.features
        };
        break;

      case "STAKING":
        config.stakingConfig = {
          name: analysis.contractName,
          rewardToken: "RewardToken",
          rewardRate: "1000000000000000000", // 1 token per block
          lockPeriod: 0, // 0 = no lock
          features: analysis.features
        };
        break;
    }

    return config;
  }

  /**
   * 生成代币符号
   */
  _generateSymbol(name, suffix = "") {
    // 取名称的首字母或缩写
    const words = name.split(/(?=[A-Z])/);
    let symbol = words.map(w => w[0]).join("").toUpperCase();

    if (suffix) {
      const suffixWords = suffix.split(/(?=[A-Z])/);
      symbol += suffixWords.map(w => w[0]).join("").toUpperCase();
    }

    return symbol.substring(0, 6) || "TKN";
  }

  /**
   * 获取部署命令
   */
  _getDeployCommand(type) {
    const commands = {
      ERC20: "npm run deploy:token",
      NFT: "npx hardhat run scripts/deploy-nft.js",
      DAO: "npx hardhat run scripts/deploy-dao.js",
      STAKING: "npx hardhat run scripts/deploy-staking.js",
      GENERAL: "npm run deploy"
    };

    return commands[type] || commands.GENERAL;
  }

  /**
   * 获取交互命令
   */
  _getInteractCommand(type) {
    const commands = {
      ERC20: "npm run token:demo",
      NFT: "npx hardhat run scripts/interact-nft.js",
      DAO: "npx hardhat run scripts/interact-dao.js",
      STAKING: "npx hardhat run scripts/interact-staking.js",
      GENERAL: "npx hardhat run scripts/run-agent.js"
    };

    return commands[type] || commands.GENERAL;
  }

  /**
   * 获取测试脚本
   */
  _getTestScript(type) {
    return `test/${this._getContractFileName(type)}.test.js`;
  }

  /**
   * 获取部署脚本
   */
  _getDeployScript(type) {
    return `scripts/deploy-${this._getContractFileName(type).toLowerCase()}.js`;
  }

  /**
   * 获取交互脚本
   */
  _getInteractScript(type) {
    return `scripts/interact-${this._getContractFileName(type).toLowerCase()}.js`;
  }

  /**
   * 获取合约文件名
   */
  _getContractFileName(type) {
    const fileNames = {
      ERC20: "MyToken",
      NFT: "Web3NFT",
      DAO: "VotingDAO",
      STAKING: "StakingContract",
      GENERAL: "Web3AIAgent"
    };

    return fileNames[type] || fileNames.GENERAL;
  }

  /**
   * 初始化模板
   */
  _initializeTemplates() {
    return {
      ERC20: {
        defaultContractName: "MyToken",
        needsTest: true,
        needsDeploy: true,
        needsCompile: true,
        estimatedGas: 2000000,
        estimatedTime: "5-10 minutes",
        dependencies: ["@openzeppelin/contracts"],
        description: "ERC20 Fungible Token"
      },

      NFT: {
        defaultContractName: "MyNFT",
        needsTest: true,
        needsDeploy: true,
        needsCompile: true,
        estimatedGas: 3000000,
        estimatedTime: "10-15 minutes",
        dependencies: ["@openzeppelin/contracts"],
        description: "ERC721 Non-Fungible Token"
      },

      DAO: {
        defaultContractName: "MyDAO",
        needsTest: true,
        needsDeploy: true,
        needsCompile: true,
        estimatedGas: 5000000,
        estimatedTime: "15-20 minutes",
        dependencies: ["@openzeppelin/contracts"],
        description: "Decentralized Autonomous Organization"
      },

      STAKING: {
        defaultContractName: "StakingContract",
        needsTest: true,
        needsDeploy: true,
        needsCompile: true,
        estimatedGas: 4000000,
        estimatedTime: "15-20 minutes",
        dependencies: ["@openzeppelin/contracts"],
        description: "Staking and Reward Distribution"
      },

      GENERAL: {
        defaultContractName: "GenericContract",
        needsTest: false,
        needsDeploy: true,
        needsCompile: true,
        estimatedGas: 1000000,
        estimatedTime: "3-5 minutes",
        dependencies: [],
        description: "General Smart Contract"
      }
    };
  }
}

module.exports = PlanGenerator;
