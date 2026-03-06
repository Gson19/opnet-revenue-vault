// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RevenueVault.sol";

/**
 * @title MockYieldSource
 * @notice Simple pluggable yield source for local testing / demos.
 *
 * This contract simulates yield generation by allowing an operator to "inject"
 * additional underlying into the system, representing:
 * - Trading fees from Motoswap LP positions.
 * - External protocol incentives.
 * - Any other off-chain simulated yield stream.
 *
 * OP_NET notes:
 * - In a real deployment, this contract would be replaced by an adapter that
 *   holds Motoswap LP tokens or interacts with other OP_NET-native protocols.
 * - The `harvest` function is expected to convert any pending rewards to the
 *   same underlying token used by the vault and leave them within the vault.
 */
contract MockYieldSource is IYieldSource {
    IERC20 public immutable underlying;
    address public immutable vault;
    address public operator;

    event OperatorChanged(address indexed oldOperator, address indexed newOperator);
    event YieldInjected(address indexed from, uint256 amount);

    modifier onlyVault() {
        require(msg.sender == vault, "MockYieldSource: not vault");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operator, "MockYieldSource: not operator");
        _;
    }

    constructor(address _underlying, address _vault, address _operator) {
        require(_underlying != address(0), "MockYieldSource: underlying is zero");
        require(_vault != address(0), "MockYieldSource: vault is zero");
        require(_operator != address(0), "MockYieldSource: operator is zero");

        underlying = IERC20(_underlying);
        vault = _vault;
        operator = _operator;
    }

    function setOperator(address _operator) external onlyOperator {
        require(_operator != address(0), "MockYieldSource: operator is zero");
        address old = operator;
        operator = _operator;
        emit OperatorChanged(old, _operator);
    }

    /**
     * @notice Deposits underlying from the vault into this mock strategy.
     * @dev For the mock, we simply hold the tokens here.
     */
    function deposit(uint256 amount) external override onlyVault {
        require(amount > 0, "MockYieldSource: amount is zero");
        require(
            underlying.transferFrom(msg.sender, address(this), amount),
            "MockYieldSource: transferFrom failed"
        );
    }

    /**
     * @notice Withdraws underlying back to the vault.
     */
    function withdraw(uint256 amount) external override onlyVault {
        require(amount > 0, "MockYieldSource: amount is zero");
        require(
            underlying.transfer(msg.sender, amount),
            "MockYieldSource: transfer failed"
        );
    }

    /**
     * @notice Simulates yield by transferring additional underlying directly to the vault.
     * @dev In a real strategy, this would:
     *      - Claim rewards from Motoswap or other OP_NET protocol.
     *      - Swap rewards into the underlying token.
     *      - Transfer the resulting underlying to the vault.
     */
    function harvest() external override onlyVault returns (uint256 harvested) {
        uint256 bal = underlying.balanceOf(address(this));
        if (bal == 0) {
            return 0;
        }
        require(
            underlying.transfer(msg.sender, bal),
            "MockYieldSource: transfer failed"
        );
        harvested = bal;
    }

    /**
     * @notice Reports total underlying held on behalf of the vault.
     */
    function totalUnderlying() external view override returns (uint256) {
        return underlying.balanceOf(address(this));
    }

    /**
     * @notice Operator-only helper for demos: inject "yield" by sending underlying
     *         tokens directly to this contract (they will be harvested to the vault).
     */
    function injectYield(uint256 amount) external onlyOperator {
        require(amount > 0, "MockYieldSource: amount is zero");
        require(
            underlying.transferFrom(msg.sender, address(this), amount),
            "MockYieldSource: transferFrom failed"
        );
        emit YieldInjected(msg.sender, amount);
    }
}

