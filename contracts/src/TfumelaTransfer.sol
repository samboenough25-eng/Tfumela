// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TfumelaTransfer is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint16 public constant BPS = 10_000;
    uint16 public constant MAX_FEE_BPS = 1_000;
    uint256 public constant MAX_FIXED_FEE = 1000e6;

    struct FeeConfig { bool enabled; uint16 feeBps; uint256 fixedFee; uint256 maxFee; }

    address public treasury;
    mapping(address => bool) public supportedToken;
    mapping(address => FeeConfig) public feeConfig;

    error ZeroAddress();
    error ZeroAmount();
    error UnsupportedToken();
    error TokenDisabled();
    error InvalidFee();
    error FeeTooHigh();
    error SameRecipient();
    error EmptyTransferId();

    event SupportedTokenUpdated(address indexed token, bool enabled);
    event FeeConfigUpdated(address indexed token, bool enabled, uint16 feeBps, uint256 fixedFee, uint256 maxFee);
    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event TfumelaTransfer(bytes32 indexed transferId, address indexed sender, address indexed token, address recipient, uint256 amount, uint256 fee, uint256 total);

    constructor(address initialOwner, address initialTreasury) Ownable(initialOwner) {
        if (initialOwner == address(0) || initialTreasury == address(0)) revert ZeroAddress();
        treasury = initialTreasury;
    }

    function sendToken(address token, address recipient, uint256 amount, bytes32 transferId)
        external nonReentrant whenNotPaused
    {
        if (!supportedToken[token]) revert UnsupportedToken();
        FeeConfig memory c = feeConfig[token];
        if (!c.enabled) revert TokenDisabled();
        if (recipient == address(0)) revert ZeroAddress();
        if (recipient == msg.sender) revert SameRecipient();
        if (amount == 0) revert ZeroAmount();
        if (transferId == bytes32(0)) revert EmptyTransferId();

        uint256 fee = calculateFee(token, amount);
        uint256 total = amount + fee;

        IERC20(token).safeTransferFrom(msg.sender, recipient, amount);
        if (fee != 0) IERC20(token).safeTransferFrom(msg.sender, treasury, fee);

        emit TfumelaTransfer(transferId, msg.sender, token, recipient, amount, fee, total);
    }

    function calculateFee(address token, uint256 amount) public view returns (uint256) {
        if (!supportedToken[token]) revert UnsupportedToken();
        FeeConfig memory c = feeConfig[token];
        if (!c.enabled) revert TokenDisabled();
        uint256 variableFee = (amount * c.feeBps) / BPS;
        uint256 fee = c.fixedFee + variableFee;
        if (fee > c.maxFee) revert FeeTooHigh();
        return fee;
    }

    function quote(address token, uint256 amount) external view returns (uint256 fee, uint256 total) {
        fee = calculateFee(token, amount);
        total = amount + fee;
    }

    function setSupportedToken(address token, bool enabled) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        supportedToken[token] = enabled;
        emit SupportedTokenUpdated(token, enabled);
    }

    function setFeeConfig(address token, bool enabled, uint16 feeBps, uint256 fixedFee, uint256 maxFee) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        if (feeBps > MAX_FEE_BPS || fixedFee > MAX_FIXED_FEE || (enabled && maxFee == 0)) revert InvalidFee();
        feeConfig[token] = FeeConfig(enabled, feeBps, fixedFee, maxFee);
        emit FeeConfigUpdated(token, enabled, feeBps, fixedFee, maxFee);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        address old = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(old, newTreasury);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
