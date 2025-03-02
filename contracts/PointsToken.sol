// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract PointsToken is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // 记录积分核销事件
    event PointsRedeemed(address indexed user, uint256 amount, string reason);

    constructor() ERC20("BNB Points", "BNBP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    // 铸造积分
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // 核销积分
    function redeem(uint256 amount, string memory reason) public whenNotPaused {
        require(balanceOf(msg.sender) >= amount, "Insufficient points balance");
        _burn(msg.sender, amount);
        emit PointsRedeemed(msg.sender, amount, reason);
    }

    // 管理员核销指定用户的积分
    function redeemFrom(address from, uint256 amount, string memory reason) 
        public 
        onlyRole(BURNER_ROLE) 
        whenNotPaused 
    {
        require(balanceOf(from) >= amount, "Insufficient points balance");
        _burn(from, amount);
        emit PointsRedeemed(from, amount, reason);
    }

    // 暂停所有转账操作
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    // 恢复所有转账操作
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // 重写转账相关函数，添加暂停功能
    function transfer(address to, uint256 amount) 
        public 
        override 
        whenNotPaused 
        returns (bool) 
    {
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount)
        public
        override
        whenNotPaused
        returns (bool)
    {
        return super.transferFrom(from, to, amount);
    }
}