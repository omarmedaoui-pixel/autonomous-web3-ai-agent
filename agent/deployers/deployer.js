/**
 * Deployer Agent - Generates Deployment Scripts and Deploys to Sepolia Testnet
 *
 * 功能：
 * - 为合约创建部署脚本
 * - 自动部署到Sepolia测试网
 * - 保存部署记录到deployments/
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class DeployerAgent {
  constructor(hre) {
    this.hre = hre;
    this.scriptsDir = path.join(process.cwd(), "scripts");
    this.deploymentsDir = path.join(process.cwd(), "deployments");
  }

  /**
   * 根据计划生成部署脚本
   * @param {object} plan - planner生成的执行计划
   * @returns {object} 生成结果
   */
  async generate(plan) {
    console.log("\n" + "=".repeat(70));
    console.log("🚀 Deployer Agent - Generating Deployment Scripts");
    console.log("=".repeat(70));

    try {
      // 确保scripts目录存在
      this._ensureDir(this.scriptsDir);

      // 根据合约类型生成部署脚本
      const scriptCode = this._generateDeployScript(plan);

      // 保存部署脚本
      const fileName = `deploy-${plan.contractName}.js`;
      const filePath = path.join(this.scriptsDir, fileName);
      fs.writeFileSync(filePath, scriptCode, "utf8");

      console.log(`\n✓ Deployment script generated: ${fileName}`);
      console.log(`  Location: scripts/${fileName}`);
      console.log(`  Size: ${scriptCode.length} bytes`);

      return {
        success: true,
        fileName,
        filePath,
        contractName: plan.contractName,
        code: scriptCode
      };

    } catch (error) {
      console.error(`\n✗ Error generating deployment script: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 自动部署合约到Sepolia测试网
   * @param {object} plan - planner生成的执行计划
   * @param {object} options - 部署选项
   * @returns {object} 部署结果
   */
  async deploy(plan, options = {}) {
    console.log("\n" + "=".repeat(70));
    console.log("🚀 Deployer Agent - Auto-Deploying to Sepolia Testnet");
    console.log("=".repeat(70));

    try {
      // 1. 验证环境变量
      const envCheck = this._validateEnvironment();
      if (!envCheck.valid) {
        return {
          success: false,
          error: "Environment configuration required",
          message: envCheck.message,
          requiresConfig: true
        };
      }

      console.log(`\n✓ Environment validated`);
      console.log(`  Network: Sepolia Testnet`);

      // 2. 确保目录存在
      this._ensureDir(this.deploymentsDir);

      // 3. 编译合约
      console.log(`\n📦 Compiling contract: ${plan.contractName}...`);
      try {
        execSync("npx hardhat compile", {
          stdio: "pipe",
          cwd: process.cwd()
        });
        console.log(`✓ Contract compiled successfully`);
      } catch (compileError) {
        return {
          success: false,
          error: "Compilation failed: " + compileError.message
        };
      }

      // 4. 部署合约到Sepolia
      console.log(`\n🌐 Deploying to Sepolia testnet...`);
      console.log(`  Contract: ${plan.contractName}`);

      const deploymentResult = await this._deployToSepolia(plan);

      if (!deploymentResult.success) {
        return deploymentResult;
      }

      // 5. 保存部署记录
      this._saveDeploymentRecord(deploymentResult.deploymentInfo);

      console.log("\n" + "=".repeat(70));
      console.log("✅ Deployment Complete!");
      console.log("=".repeat(70));
      console.log(`\n  Contract deployed at: ${deploymentResult.address}`);
      console.log(`  Network: sepolia`);
      console.log(`  Transaction: ${deploymentResult.txHash}`);
      console.log(`  Deployer: ${deploymentResult.deployer}`);
      console.log(`\n  View on Etherscan:`);
      console.log(`  https://sepolia.etherscan.io/address/${deploymentResult.address}`);
      console.log("\n" + "=".repeat(70));

      return {
        success: true,
        address: deploymentResult.address,
        network: "sepolia",
        txHash: deploymentResult.txHash,
        deployer: deploymentResult.deployer,
        deploymentInfo: deploymentResult.deploymentInfo,
        scriptGenerated: options.generateScript !== false
      };

    } catch (error) {
      console.error(`\n✗ Deployment error: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 验证环境配置
   * @returns {object} 验证结果
   */
  _validateEnvironment() {
    const dotenv = require("dotenv");
    const envPath = path.join(process.cwd(), ".env");

    // 尝试加载.env文件
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }

    const missingVars = [];

    if (!process.env.SEPOLIA_RPC_URL || process.env.SEPOLIA_RPC_URL === "" ||
        process.env.SEPOLIA_RPC_URL.includes("your_infura_project_id")) {
      missingVars.push("SEPOLIA_RPC_URL");
    }

    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "" ||
        process.env.PRIVATE_KEY === "your_private_key_here") {
      missingVars.push("PRIVATE_KEY");
    }

    if (missingVars.length > 0) {
      return {
        valid: false,
        message: `Missing required environment variables: ${missingVars.join(", ")}\n\n` +
                 `Please configure your .env file:\n` +
                 `1. Copy .env.example to .env\n` +
                 `2. Set SEPOLIA_RPC_URL (get from Infura/Alchemy)\n` +
                 `3. Set PRIVATE_KEY (from your wallet)\n\n` +
                 `Example .env configuration:\n` +
                 `SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID\n` +
                 `PRIVATE_KEY=0x...`
      };
    }

    return { valid: true };
  }

  /**
   * 部署合约到Sepolia测试网
   * @param {object} plan - 执行计划
   * @returns {object} 部署结果
   */
  async _deployToSepolia(plan) {
    try {
      // 设置Hardhat网络为Sepolia
      this.hre.config.networks.sepolia = {
        url: process.env.SEPOLIA_RPC_URL,
        accounts: [process.env.PRIVATE_KEY]
      };

      // 获取Signer
      const [deployer] = await this.hre.ethers.getSigners();
      const balance = await this.hre.ethers.provider.getBalance(deployer.address);

      console.log(`  Deployer: ${deployer.address}`);
      console.log(`  Balance: ${this.hre.ethers.formatEther(balance)} ETH`);

      // 检查余额
      if (balance === 0n) {
        return {
          success: false,
          error: "Insufficient balance. Please fund your account with Sepolia ETH."
        };
      }

      // 部署合约
      console.log(`  Deploying contract...`);
      const ContractFactory = await this.hre.ethers.getContractFactory(plan.contractName);
      const contract = await ContractFactory.deploy();

      await contract.waitForDeployment();
      const address = await contract.getAddress();
      const txHash = contract.deploymentTransaction()?.hash || "";

      console.log(`✓ Contract deployed at: ${address}`);

      return {
        success: true,
        address,
        txHash,
        deployer: deployer.address,
        deploymentInfo: {
          contract: plan.contractName,
          address: address,
          network: "sepolia",
          deployer: deployer.address,
          txHash: txHash,
          timestamp: new Date().toISOString(),
          type: plan.type
        }
      };

    } catch (error) {
      console.error(`  Deployment failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 保存部署记录
   * @param {object} deploymentInfo - 部署信息
   */
  _saveDeploymentRecord(deploymentInfo) {
    try {
      this._ensureDir(this.deploymentsDir);

      const record = {
        ...deploymentInfo,
        savedAt: new Date().toISOString()
      };

      // 保存到deployments/deployments.json
      const recordsFile = path.join(this.deploymentsDir, "deployments.json");
      let records = [];

      if (fs.existsSync(recordsFile)) {
        try {
          records = JSON.parse(fs.readFileSync(recordsFile, "utf8"));
        } catch (e) {
          records = [];
        }
      }

      records.push(record);
      fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2));

      // 保存单独的部署记录文件
      const filename = `${deploymentInfo.network}-${deploymentInfo.contract}-${Date.now()}.json`;
      const filepath = path.join(this.deploymentsDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(record, null, 2));

      console.log(`\n📄 Deployment records saved:`);
      console.log(`   - ${recordsFile}`);
      console.log(`   - ${filepath}`);

    } catch (error) {
      console.warn(`Warning: Could not save deployment record: ${error.message}`);
    }
  }

  /**
   * 生成部署脚本代码
   * @param {object} plan - 执行计划
   * @returns {string} 部署脚本代码
   */
  _generateDeployScript(plan) {
    const { contractName, type, specifications } = plan;

    // 根据合约类型生成不同的部署脚本
    switch (type) {
      case "ERC20":
        return this._generateERC20Deploy(contractName, specifications);
      case "ERC721":
        return this._generateERC721Deploy(contractName, specifications);
      case "DAO":
        return this._generateDAODeploy(contractName, specifications);
      case "Voting":
        return this._generateVotingDeploy(contractName, specifications);
      default:
        return this._generateGenericDeploy(contractName);
    }
  }

  /**
   * 生成ERC20部署脚本
   */
  _generateERC20Deploy(name, specs = {}) {
    const args = this._getConstructorArgs(name, specs, "ERC20");

    return `const hre = require("hardhat");

/**
 * Deployment script for ${name}
 * Generated by Web3 AI Agent
 *
 * Usage: npx hardhat run scripts/deploy-${name}.js --network <network>
 */
async function main() {
  console.log("Deploying ${name}...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy contract
  const ${this._camelCase(name)} = await hre.ethers.deployContract("${name}"${args});

  await ${this._camelCase(name)}.waitForDeployment();
  const address = await ${this._camelCase(name)}.getAddress();

  console.log("\\n✅ ${name} deployed successfully!");
  console.log("Contract address:", address);
  console.log("Deployer address:", deployer.address);
  console.log("Transaction hash:", ${this._camelCase(name)}.deploymentTransaction().hash);

  // Verify contract on Etherscan (for mainnet/testnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\\nWaiting for block confirmations...");
    await ${this._camelCase(name)}.deploymentTransaction().wait(5);

    console.log("\\nVerifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [${this._getConstructorArgsList(name, specs, "ERC20")}],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Contract verification failed:", error.message);
    }
  }

  // Save deployment info
  _saveDeploymentInfo({
    network: hre.network.name,
    contractName: "${name}",
    address: address,
    deployer: deployer.address,
    txHash: ${this._camelCase(name)}.deploymentTransaction().hash,
    timestamp: new Date().toISOString()
  });

  return ${this._camelCase(name)};
}

/**
 * Save deployment information to file
 */
function _saveDeploymentInfo(info) {
  const fs = require("fs");
  const path = require("path");

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = info.network + "-" + info.contractName + "-" + Date.now() + ".json";
  const filepath = path.join(deploymentsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(info, null, 2));
  console.log("Deployment info saved to:", filepath);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
  }

  /**
   * 生成ERC721部署脚本
   */
  _generateERC721Deploy(name, specs = {}) {
    const args = this._getConstructorArgs(name, specs, "ERC721");

    return `const hre = require("hardhat");

/**
 * Deployment script for ${name}
 * Generated by Web3 AI Agent
 *
 * Usage: npx hardhat run scripts/deploy-${name}.js --network <network>
 */
async function main() {
  console.log("Deploying ${name}...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy contract
  const ${this._camelCase(name)} = await hre.ethers.deployContract("${name}"${args});

  await ${this._camelCase(name)}.waitForDeployment();
  const address = await ${this._camelCase(name)}.getAddress();

  console.log("\\n✅ ${name} deployed successfully!");
  console.log("Contract address:", address);
  console.log("Deployer address:", deployer.address);
  console.log("Transaction hash:", ${this._camelCase(name)}.deploymentTransaction().hash);

  // Verify contract on Etherscan (for mainnet/testnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\\nWaiting for block confirmations...");
    await ${this._camelCase(name)}.deploymentTransaction().wait(5);

    console.log("\\nVerifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [${this._getConstructorArgsList(name, specs, "ERC721")}],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Contract verification failed:", error.message);
    }
  }

  // Save deployment info
  _saveDeploymentInfo({
    network: hre.network.name,
    contractName: "${name}",
    address: address,
    deployer: deployer.address,
    txHash: ${this._camelCase(name)}.deploymentTransaction().hash,
    timestamp: new Date().toISOString()
  });

  return ${this._camelCase(name)};
}

/**
 * Save deployment information to file
 */
function _saveDeploymentInfo(info) {
  const fs = require("fs");
  const path = require("path");

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = info.network + "-" + info.contractName + "-" + Date.now() + ".json";
  const filepath = path.join(deploymentsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(info, null, 2));
  console.log("Deployment info saved to:", filepath);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
  }

  /**
   * 生成DAO部署脚本
   */
  _generateDAODeploy(name, specs = {}) {
    return this._generateGenericDeploy(name);
  }

  /**
   * 生成投票部署脚本
   */
  _generateVotingDeploy(name, specs = {}) {
    return this._generateGenericDeploy(name);
  }

  /**
   * 生成通用部署脚本
   */
  _generateGenericDeploy(name) {
    return `const hre = require("hardhat");

/**
 * Deployment script for ${name}
 * Generated by Web3 AI Agent
 *
 * Usage: npx hardhat run scripts/deploy-${name}.js --network <network>
 */
async function main() {
  console.log("Deploying ${name}...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy contract
  const ${this._camelCase(name)} = await hre.ethers.deployContract("${name}");

  await ${this._camelCase(name)}.waitForDeployment();
  const address = await ${this._camelCase(name)}.getAddress();

  console.log("\\n✅ ${name} deployed successfully!");
  console.log("Contract address:", address);
  console.log("Deployer address:", deployer.address);
  console.log("Transaction hash:", ${this._camelCase(name)}.deploymentTransaction().hash);

  // Verify contract on Etherscan (for mainnet/testnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\\nWaiting for block confirmations...");
    await ${this._camelCase(name)}.deploymentTransaction().wait(5);

    console.log("\\nVerifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Contract verification failed:", error.message);
    }
  }

  // Save deployment info
  _saveDeploymentInfo({
    network: hre.network.name,
    contractName: "${name}",
    address: address,
    deployer: deployer.address,
    txHash: ${this._camelCase(name)}.deploymentTransaction().hash,
    timestamp: new Date().toISOString()
  });

  return ${this._camelCase(name)};
}

/**
 * Save deployment information to file
 */
function _saveDeploymentInfo(info) {
  const fs = require("fs");
  const path = require("path");

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = info.network + "-" + info.contractName + "-" + Date.now() + ".json";
  const filepath = path.join(deploymentsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(info, null, 2));
  console.log("Deployment info saved to:", filepath);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
  }

  /**
   * 获取构造函数参数
   */
  _getConstructorArgs(name, specs, type) {
    // ERC20和ERC721没有构造参数（在合约内部定义）
    return "";
  }

  /**
   * 获取构造函数参数列表（用于verify）
   */
  _getConstructorArgsList(name, specs, type) {
    return "";
  }

  /**
   * 转换为驼峰命名
   */
  _camelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * 确保目录存在
   */
  _ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

module.exports = DeployerAgent;
