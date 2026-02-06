/**
 * Task Analyzer - 任务分析模块
 *
 * 负责分析用户任务，识别任务类型、复杂度和所需资源
 */

class TaskAnalyzer {
  constructor(hre) {
    this.hre = hre;
    this.keywords = this._initializeKeywords();
    this.patterns = this._initializePatterns();
  }

  /**
   * 分析用户任务
   * @param {string} task - 任务描述
   * @returns {object} 分析结果
   */
  async analyze(task) {
    const taskLower = task.toLowerCase();

    // 1. 识别任务类型
    const type = this._identifyType(taskLower);

    // 2. 识别子类型
    const subtype = this._identifySubtype(taskLower, type);

    // 3. 提取关键词
    const keywords = this._extractKeywords(taskLower);

    // 4. 评估复杂度
    const complexity = this._assessComplexity(task, type, keywords);

    // 5. 计算置信度
    const confidence = this._calculateConfidence(task, type, keywords);

    // 6. 识别所需功能
    const features = this._identifyFeatures(task, type, keywords);

    // 7. 识别合约名称（如果提及）
    const contractName = this._extractContractName(task, type);

    return {
      type,
      subtype,
      keywords,
      complexity,
      confidence,
      features,
      contractName,
      originalTask: task,
      timestamp: Date.now()
    };
  }

  /**
   * 识别任务类型
   */
  _identifyType(task) {
    const typeScores = {};

    // 基于关键词评分
    for (const [type, typeKeywords] of Object.entries(this.keywords.types)) {
      let score = 0;
      for (const keyword of typeKeywords) {
        if (task.includes(keyword)) {
          score += keyword.length; // 关键词越长，权重越高
        }
      }
      if (score > 0) {
        typeScores[type] = score;
      }
    }

    // 基于模式匹配
    for (const [type, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(task)) {
          typeScores[type] = (typeScores[type] || 0) + 10;
        }
      }
    }

    // 返回得分最高的类型
    if (Object.keys(typeScores).length === 0) {
      return "GENERAL"; // 默认类型
    }

    return Object.entries(typeScores)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * 识别子类型
   */
  _identifySubtype(task, type) {
    const subtypes = {
      ERC20: ["standard", "deflationary", "reward", "governance"],
      NFT: ["art", "collectible", "utility", "gaming"],
      DAO: ["voting", "investment", "charity", "community"],
      STAKING: ["single", "lp", "reward", "locked"],
      GENERAL: ["simple", "complex", "multi-step"]
    };

    const typeSubtypes = subtypes[type] || subtypes.GENERAL;

    // 简单的关键词匹配
    for (const subtype of typeSubtypes) {
      if (task.includes(subtype)) {
        return subtype;
      }
    }

    // 基于功能的启发式推断
    if (type === "ERC20") {
      if (task.includes("burn") || task.includes("deflation")) return "deflationary";
      if (task.includes("reward") || task.includes("farm")) return "reward";
      if (task.includes("vote") || task.includes("govern")) return "governance";
    }

    if (type === "NFT") {
      if (task.includes("art") || task.includes("creative")) return "art";
      if (task.includes("game") || task.includes("play")) return "gaming";
      if (task.includes("utility") || task.includes("access")) return "utility";
    }

    return "standard"; // 默认子类型
  }

  /**
   * 提取关键词
   */
  _extractKeywords(task) {
    const keywords = new Set();
    const allKeywords = [
      ...Object.values(this.keywords.types).flat(),
      ...this.keywords.features,
      ...this.keywords.actions
    ];

    for (const keyword of allKeywords) {
      if (task.includes(keyword)) {
        keywords.add(keyword);
      }
    }

    return Array.from(keywords);
  }

  /**
   * 评估复杂度
   */
  _assessComplexity(task, type, keywords) {
    let complexityScore = 0;

    // 基于关键词数量
    complexityScore += keywords.length * 2;

    // 基于任务长度
    complexityScore += Math.min(task.length / 50, 10);

    // 基于类型
    const typeComplexity = {
      ERC20: 5,
      NFT: 6,
      DAO: 8,
      STAKING: 7,
      GENERAL: 3
    };
    complexityScore += typeComplexity[type] || 3;

    // 高级功能加分
    const advancedFeatures = ["governance", "timelock", "multisig", "vesting", "airdrop"];
    for (const feature of advancedFeatures) {
      if (task.includes(feature)) {
        complexityScore += 5;
      }
    }

    // 分类
    if (complexityScore < 10) return "simple";
    if (complexityScore < 20) return "medium";
    return "complex";
  }

  /**
   * 计算置信度
   */
  _calculateConfidence(task, type, keywords) {
    let confidence = 0.5; // 基础置信度

    // 有关键词则增加置信度
    if (keywords.length > 0) {
      confidence += Math.min(keywords.length * 0.1, 0.3);
    }

    // 类型明确则增加置信度
    if (type !== "GENERAL") {
      confidence += 0.2;
    }

    // 任务描述详细则增加置信度
    if (task.length > 20) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * 识别所需功能
   */
  _identifyFeatures(task, type, keywords) {
    const features = [];

    // 通用功能
    if (keywords.includes("mint")) features.push("mintable");
    if (keywords.includes("burn")) features.push("burnable");
    if (keywords.includes("pause")) features.push("pausable");
    if (keywords.includes("owner")) features.push("ownable");

    // ERC20 特有功能
    if (type === "ERC20") {
      if (keywords.includes("snapshot")) features.push("snapshots");
      if (keywords.includes("permit")) features.push("permit");
      if (keywords.includes("vesting")) features.push("vesting");
      if (keywords.includes("airdrop")) features.push("airdrop");
      if (keywords.includes("tax") || keywords.includes("fee")) features.push("tax");
    }

    // NFT 特有功能
    if (type === "NFT") {
      if (keywords.includes("uri")) features.push("metadata");
      if (keywords.includes("batch")) features.push("batch");
      if (keywords.includes("vote") || keywords.includes("governance")) features.push("voting");
      if (keywords.includes("royalty")) features.push("royalty");
    }

    // DAO 特有功能
    if (type === "DAO") {
      if (keywords.includes("vote")) features.push("voting");
      if (keywords.includes("timelock")) features.push("timelock");
      if (keywords.includes("proposal")) features.push("proposal");
      if (keywords.includes("quorum")) features.push("quorum");
    }

    // Staking 特有功能
    if (type === "STAKING") {
      if (keywords.includes("reward")) features.push("rewards");
      if (keywords.includes("lock") || keywords.includes("vest")) features.push("locking");
      if (keywords.includes("pool")) features.push("pools");
    }

    return features;
  }

  /**
   * 提取合约名称
   */
  _extractContractName(task, type) {
    // 尝试提取引号内的名称
    const quotedName = task.match(/"([^"]+)"/);
    if (quotedName) {
      return quotedName[1];
    }

    // 尝试提取"called"、"named"后的名称
    const namedMatch = task.match(/(?:called|named)\s+(\w+)/i);
    if (namedMatch) {
      return this._toPascalCase(namedMatch[1]);
    }

    // 基于类型返回默认名称
    const defaultNames = {
      ERC20: "MyToken",
      NFT: "MyNFT",
      DAO: "MyDAO",
      STAKING: "StakingContract",
      GENERAL: "GenericContract"
    };

    return defaultNames[type] || "MyContract";
  }

  /**
   * 转换为 PascalCase
   */
  _toPascalCase(str) {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "")
      .replace(/^(.)/, (_, c) => c.toUpperCase());
  }

  /**
   * 初始化关键词字典
   */
  _initializeKeywords() {
    return {
      types: {
        ERC20: [
          "token", "erc20", "coin", "cryptocurrency", "fungible",
          "transferable", "divisible", "supply", "balance"
        ],
        NFT: [
          "nft", "erc721", "non-fungible", "collectible", "unique",
          "metadata", "art", "digital asset"
        ],
        DAO: [
          "dao", "governance", "voting", "proposal", "decentralized",
          "organization", "community", "decision"
        ],
        STAKING: [
          "stake", "staking", "farm", "yield", "lock", "reward",
          "pool", "liquidity", "earn"
        ],
        GENERAL: [
          "contract", "smart contract", "deploy", "create", "build"
        ]
      },
      features: [
        "mint", "burn", "pause", "owner", "governance", "voting",
        "tax", "fee", "royalty", "metadata", "uri", "batch",
        "timelock", "multisig", "vesting", "airdrop", "snapshot",
        "permit", "proposal", "quorum", "reward", "pool", "lock"
      ],
      actions: [
        "create", "deploy", "build", "develop", "write", "implement",
        "test", "verify", "optimize"
      ]
    };
  }

  /**
   * 初始化正则表达式模式
   */
  _initializePatterns() {
    return {
      ERC20: [
        /erc20\s+token/i,
        /fungible\s+token/i,
        /\btoken\b.*\btransfer\b/i
      ],
      NFT: [
        /erc721\s+nft/i,
        /non-fungible\s+token/i,
        /nft\s+collection/i
      ],
      DAO: [
        /dao\s+contract/i,
        /governance\s+system/i,
        /voting\s+contract/i
      ],
      STAKING: [
        /staking\s+contract/i,
        /yield\s+farming/i,
        /liquidity\s+pool/i
      ]
    };
  }
}

module.exports = TaskAnalyzer;
