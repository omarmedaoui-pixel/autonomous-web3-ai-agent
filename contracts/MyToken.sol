// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev ERC20 代币合约
 */
contract MyToken is ERC20, Ownable {
    // 代币总量
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18;

    // 铸造事件
    event Minted(address indexed to, uint256 amount);

    // 销毁事件
    event Burned(address indexed from, uint256 amount);

    /**
     * @dev 构造函数，初始化代币
     */
    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {
        // 铸造全部代币给部署者
        _mint(msg.sender, MAX_SUPPLY);
        emit Minted(msg.sender, MAX_SUPPLY);
    }

    /**
     * @dev 铸造新代币（仅所有者）
     * @param to 接收地址
     * @param amount 数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        // 移除最大供应量限制，允许增发
        _mint(to, amount);
        emit Minted(to, amount);
    }

    /**
     * @dev 销毁代币
     * @param amount 销毁数量
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount);
    }

    /**
     * @dev 获取代币信息
     */
    function getTokenInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 totalTokenSupply,
        uint256 maxSupply
    ) {
        return (
            this.name(),
            this.symbol(),
            this.decimals(),
            totalSupply(),
            MAX_SUPPLY
        );
    }

    /**
     * @dev 批量转账
     * @param recipients 接收地址数组
     * @param amounts 金额数组
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length <= 200, "Too many recipients");

        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }
}
