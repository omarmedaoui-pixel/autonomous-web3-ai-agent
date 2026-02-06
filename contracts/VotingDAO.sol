// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title VotingDAO
 * @dev 基于NFT的DAO投票治理合约
 */
contract VotingDAO is Ownable {
    // NFT合约引用
    IERC721 public nftContract;

    // 投票状态枚举
    enum VoteStatus { Active, Passed, Rejected, Executed }

    // 提案结构
    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        VoteStatus status;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    // 提案映射
    mapping(uint256 => Proposal) public proposals;

    // 提案计数器
    uint256 public proposalCount;

    // 投票时长（默认7天）
    uint256 public votingDuration;

    // 法定人数（最小投票权要求）
    uint256 public quorum;

    // 通过率（支持票需超过此比例）
    uint256 public passThreshold;

    // 事件
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 endTime
    );

    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );

    event ProposalExecuted(uint256 indexed proposalId);

    event ProposalStatusChanged(
        uint256 indexed proposalId,
        VoteStatus newStatus
    );

    /**
     * @dev 构造函数
     * @param _nftContract NFT合约地址
     */
    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
        votingDuration = 7 days;
        quorum = 10; // 10个投票权
        passThreshold = 51; // 51%支持率
    }

    /**
     * @dev 创建提案
     * @param title 提案标题
     * @param description 提案描述
     */
    function createProposal(
        string memory title,
        string memory description
    ) public returns (uint256) {
        require(
            nftContract.balanceOf(msg.sender) > 0,
            "Must own NFT to create proposal"
        );

        proposalCount++;
        uint256 proposalId = proposalCount;

        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.title = title;
        proposal.description = description;
        proposal.proposer = msg.sender;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + votingDuration;
        proposal.status = VoteStatus.Active;

        emit ProposalCreated(proposalId, msg.sender, title, proposal.endTime);
        emit ProposalStatusChanged(proposalId, VoteStatus.Active);

        return proposalId;
    }

    /**
     * @dev 对提案投票
     * @param proposalId 提案ID
     * @param support true=支持，false=反对
     */
    function vote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(proposal.status == VoteStatus.Active, "Proposal not active");
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        // 计算投票权重（拥有的NFT数量）
        uint256 weight = nftContract.balanceOf(msg.sender);

        require(weight > 0, "Must own NFT to vote");

        proposal.hasVoted[msg.sender] = true;

        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        emit Voted(proposalId, msg.sender, support, weight);
    }

    /**
     * @dev 结束投票并计算结果
     * @param proposalId 提案ID
     */
    function endVoting(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(proposal.status == VoteStatus.Active, "Already processed");
        require(
            block.timestamp >= proposal.endTime,
            "Voting period not ended"
        );

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;

        // 检查是否达到法定人数
        if (totalVotes < quorum) {
            proposal.status = VoteStatus.Rejected;
            emit ProposalStatusChanged(proposalId, VoteStatus.Rejected);
            return;
        }

        // 检查是否通过
        if (
            proposal.forVotes >
            (totalVotes * passThreshold) / 100
        ) {
            proposal.status = VoteStatus.Passed;
        } else {
            proposal.status = VoteStatus.Rejected;
        }

        emit ProposalStatusChanged(proposalId, proposal.status);
    }

    /**
     * @dev 执行通过的提案
     * @param proposalId 提案ID
     */
    function executeProposal(uint256 proposalId) public onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(proposal.status == VoteStatus.Passed, "Proposal not passed");
        require(!proposal.executed, "Already executed");

        proposal.executed = true;
        proposal.status = VoteStatus.Executed;

        emit ProposalExecuted(proposalId);
        emit ProposalStatusChanged(proposalId, VoteStatus.Executed);

        // 这里可以添加提案执行的逻辑
        // 例如：调用合约、转移资金等
    }

    /**
     * @dev 获取提案详情
     * @param proposalId 提案ID
     */
    function getProposal(uint256 proposalId)
        public
        view
        returns (
            uint256 id,
            string memory title,
            string memory description,
            address proposer,
            uint256 startTime,
            uint256 endTime,
            uint256 forVotes,
            uint256 againstVotes,
            VoteStatus status,
            bool executed
        )
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");

        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.proposer,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.status,
            proposal.executed
        );
    }

    /**
     * @dev 检查地址是否已投票
     * @param proposalId 提案ID
     * @param voter 投票者地址
     */
    function hasVoted(uint256 proposalId, address voter)
        public
        view
        returns (bool)
    {
        return proposals[proposalId].hasVoted[voter];
    }

    /**
     * @dev 设置投票时长
     * @param _duration 新的投票时长
     */
    function setVotingDuration(uint256 _duration) public onlyOwner {
        votingDuration = _duration;
    }

    /**
     * @dev 设置法定人数
     * @param _quorum 最小投票权要求
     */
    function setQuorum(uint256 _quorum) public onlyOwner {
        quorum = _quorum;
    }

    /**
     * @dev 设置通过阈值
     * @param _threshold 通过率（百分比）
     */
    function setPassThreshold(uint256 _threshold) public onlyOwner {
        require(_threshold > 0 && _threshold <= 100, "Invalid threshold");
        passThreshold = _threshold;
    }

    /**
     * @dev 获取提案统计信息
     * @param proposalId 提案ID
     */
    function getProposalStats(uint256 proposalId)
        public
        view
        returns (
            uint256 totalVotes,
            uint256 supportPercentage,
            bool isActive,
            bool canExecute
        )
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");

        totalVotes = proposal.forVotes + proposal.againstVotes;

        if (totalVotes > 0) {
            supportPercentage = (proposal.forVotes * 100) / totalVotes;
        }

        isActive = proposal.status == VoteStatus.Active;
        canExecute =
            proposal.status == VoteStatus.Passed && !proposal.executed;

        return (totalVotes, supportPercentage, isActive, canExecute);
    }
}
