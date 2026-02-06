// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Web3NFT
 * @dev ERC721 NFT 合约，支持AI生成和投票权
 */
contract Web3NFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // NFT 完整信息结构
    struct NFTFullInfo {
        uint256 id;
        address owner;
        string uri;
        string name;
        string description;
        string creator;
        uint256 createdAt;
        uint256 power;
        bool aiGen;
    }

    // NFT 元数据结构
    struct NFTMetadata {
        string name;
        string description;
        string creator;
        uint256 createdAt;
        bool exists;
    }

    // 代币ID到元数据的映射
    mapping(uint256 => NFTMetadata) public tokenMetadata;

    // 地址到投票权的映射
    mapping(uint256 => uint256) public votingPower;

    // AI生成标记
    mapping(uint256 => bool) public isAIGenerated;

    // 事件
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string tokenURI,
        bool aiGenerated
    );

    event VotingPowerSet(
        uint256 indexed tokenId,
        uint256 power
    );

    event MetadataUpdated(
        uint256 indexed tokenId,
        string name,
        string description
    );

    /**
     * @dev 构造函数
     */
    constructor() ERC721("Web3 AI Agent NFT", "W3AI") Ownable(msg.sender) {}

    /**
     * @dev 铸造NFT
     * @param to 接收地址
     * @param uri 元数据URI
     * @param aiGenerated 是否由AI生成
     */
    function mintNFT(
        address to,
        string memory uri,
        bool aiGenerated
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        // 初始化元数据
        tokenMetadata[tokenId] = NFTMetadata({
            name: "",
            description: "",
            creator: to == msg.sender ? "Creator" : "Owner",
            createdAt: block.timestamp,
            exists: true
        });

        isAIGenerated[tokenId] = aiGenerated;

        // 设置默认投票权为1
        votingPower[tokenId] = 1;

        emit NFTMinted(tokenId, to, uri, aiGenerated);
        emit VotingPowerSet(tokenId, 1);

        return tokenId;
    }

    /**
     * @dev 批量铸造NFT
     * @param to 接收地址
     * @param uris 元数据URI数组
     */
    function batchMintNFT(
        address to,
        string[] memory uris
    ) public onlyOwner returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](uris.length);

        for (uint256 i = 0; i < uris.length; i++) {
            tokenIds[i] = mintNFT(to, uris[i], false);
        }

        return tokenIds;
    }

    /**
     * @dev 更新NFT元数据
     * @param tokenId 代币ID
     * @param name 名称
     * @param description 描述
     */
    function updateMetadata(
        uint256 tokenId,
        string memory name,
        string memory description
    ) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");

        tokenMetadata[tokenId].name = name;
        tokenMetadata[tokenId].description = description;

        emit MetadataUpdated(tokenId, name, description);
    }

    /**
     * @dev 设置投票权
     * @param tokenId 代币ID
     * @param power 投票权重
     */
    function setVotingPower(uint256 tokenId, uint256 power) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        votingPower[tokenId] = power;

        emit VotingPowerSet(tokenId, power);
    }

    /**
     * @dev 获取NFT完整信息
     * @param tokenId 代币ID
     */
    function getNFTInfo(uint256 tokenId)
        public
        view
        returns (NFTFullInfo memory)
    {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");

        return NFTFullInfo({
            id: tokenId,
            owner: ownerOf(tokenId),
            uri: tokenURI(tokenId),
            name: tokenMetadata[tokenId].name,
            description: tokenMetadata[tokenId].description,
            creator: tokenMetadata[tokenId].creator,
            createdAt: tokenMetadata[tokenId].createdAt,
            power: votingPower[tokenId],
            aiGen: isAIGenerated[tokenId]
        });
    }

    /**
     * @dev 获取账户拥有的所有NFT
     * @param account 地址
     */
    function getNFTsByOwner(address account)
        public
        view
        returns (uint256[] memory)
    {
        uint256 balance = balanceOf(account);
        uint256[] memory tokenIds = new uint256[](balance);

        uint256 currentIndex = 0;
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == account) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }

        return tokenIds;
    }

    /**
     * @dev 获取总供应量
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev 必须重写的函数
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
