// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RevenueVault
 * @notice Simple auto-compounding vault for a single underlying token on OP_NET.
 *
 * OP_NET considerations:
 * - This contract assumes an EVM-compatible execution environment (as provided by OP_NET),
 *   but does NOT make assumptions about L1 (Bitcoin) beyond OP_NET's bridging model.
 * - All balances are tracked in a single ERC20-compatible token that SHOULD represent
 *   a BTC-pegged asset on OP_NET (e.g. bridged BTC, wBTC-style asset).
 * - Yield is abstracted via IYieldSource so the vault can plug into different
 *   OP_NET-native yield sources (e.g. Motoswap LP positions, staking, etc.).
 *
 * The vault:
 * - Accepts deposits of the underlying token.
 * - Mints vault shares representing a pro-rata claim on the vault's total underlying.
 * - Allows withdrawals by burning shares and transferring back underlying.
 * - Supports an auto-compound function that harvests & reinvests yield from
 *   a pluggable strategy, increasing pricePerShare for all depositors.
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

/**
 * @title IYieldSource
 * @notice Minimal interface for yield-generating strategies used by RevenueVault.
 *
 * Implementations can represent:
 * - Motoswap LP positions (vault deposits LP tokens and earns trading fees & incentives).
 * - Single-sided staking contracts.
 * - Other OP_NET-native DeFi protocols.
 *
 * For v1 we keep this deliberately small and synchronous.
 */
interface IYieldSource {
    /**
     * @notice Called by the vault to deposit underlying into the yield source.
     * @param amount Amount of underlying token to deposit.
     */
    function deposit(uint256 amount) external;

    /**
     * @notice Withdraws amount of underlying back to the vault.
     * @dev Implementations SHOULD transfer the underlying back to msg.sender (the vault).
     * @param amount Amount of underlying to withdraw.
     */
    function withdraw(uint256 amount) external;

    /**
     * @notice Harvests any pending rewards and converts them into more underlying.
     * @dev Called during auto-compounding. Implementations may perform swaps,
     *      claim rewards, stake, etc., but MUST leave the resulting underlying
     *      balance in the vault contract.
     * @return harvested Amount of new underlying added to the vault as a result of harvesting.
     */
    function harvest() external returns (uint256 harvested);

    /**
     * @notice Reports total underlying managed by this strategy on behalf of the vault.
     * @dev This should be the amount that can be withdrawn back to the vault.
     */
    function totalUnderlying() external view returns (uint256);
}

/**
 * @title ReentrancyGuard
 * @notice Minimal reentrancy protection guard.
 */
abstract contract ReentrancyGuard {
    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

/**
 * @title RevenueVault
 * @notice Single-asset auto-compounding vault.
 *
 * Users deposit an underlying asset (BTC-pegged token on OP_NET for v1) and receive
 * vault shares. Price per share increases as yield is harvested & compounded via
 * the configured yield source / strategy.
 */
contract RevenueVault is ReentrancyGuard {
    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event Deposit(address indexed user, uint256 underlyingAmount, uint256 sharesMinted);
    event Withdraw(address indexed user, uint256 underlyingAmount, uint256 sharesBurned);
    event Harvest(address indexed caller, uint256 harvestedAmount, uint256 newTotalUnderlying);
    event YieldSourceUpdated(address indexed oldSource, address indexed newSource);

    // -------------------------------------------------------------------------
    // Immutable configuration
    // -------------------------------------------------------------------------

    /// @notice Underlying token accepted by the vault (e.g. BTC-pegged token on OP_NET).
    IERC20 public immutable underlying;

    /// @notice ERC20-style metadata for vault shares.
    string public name;
    string public symbol;
    uint8 public immutable decimals;

    // -------------------------------------------------------------------------
    // Vault accounting
    // -------------------------------------------------------------------------

    /// @notice Total outstanding vault shares.
    uint256 public totalShares;

    /// @notice Mapping of user => share balance.
    mapping(address => uint256) public balanceOf;

    /// @notice Current yield source strategy (can be zero address for "no strategy" mode).
    IYieldSource public yieldSource;

    /// @notice Address allowed to update the yield source and perform admin ops.
    address public admin;

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier onlyAdmin() {
        require(msg.sender == admin, "RevenueVault: not admin");
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /**
     * @param _underlying Address of the underlying ERC20-compatible token.
     * @param _name Vault share token name.
     * @param _symbol Vault share token symbol.
     * @param _admin Admin address for strategy management.
     */
    constructor(
        address _underlying,
        string memory _name,
        string memory _symbol,
        address _admin
    ) {
        require(_underlying != address(0), "RevenueVault: underlying is zero");
        require(_admin != address(0), "RevenueVault: admin is zero");

        underlying = IERC20(_underlying);
        name = _name;
        symbol = _symbol;
        admin = _admin;
        decimals = IERC20(_underlying).decimals();
    }

    // -------------------------------------------------------------------------
    // Admin functions (OP_NET integration points)
    // -------------------------------------------------------------------------

    /**
     * @notice Sets or updates the yield source strategy.
     * @dev This is where future Motoswap / OP_NET strategies would be wired in.
     *      Admin MUST ensure that the strategy's underlying token matches this vault's.
     */
    function setYieldSource(address _yieldSource) external onlyAdmin {
        address old = address(yieldSource);
        yieldSource = IYieldSource(_yieldSource);
        // Approve unlimited allowance to strategy if set, 0 otherwise.
        if (_yieldSource != address(0)) {
            underlying.approve(_yieldSource, type(uint256).max);
        }
        emit YieldSourceUpdated(old, _yieldSource);
    }

    /**
     * @notice Transfers admin rights to a new address.
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "RevenueVault: new admin is zero");
        admin = newAdmin;
    }

    // -------------------------------------------------------------------------
    // View functions
    // -------------------------------------------------------------------------

    /**
     * @notice Returns total underlying controlled by the vault (in contract + strategy).
     */
    function totalUnderlying() public view returns (uint256) {
        uint256 inVault = underlying.balanceOf(address(this));
        if (address(yieldSource) != address(0)) {
            return inVault + yieldSource.totalUnderlying();
        }
        return inVault;
    }

    /**
     * @notice Returns the current price per share = totalUnderlying / totalShares.
     * @dev If no shares exist, returns 1 * 10^decimals (1:1).
     */
    function getPricePerShare() public view returns (uint256) {
        if (totalShares == 0) {
            return 10 ** uint256(decimals);
        }
        return (totalUnderlying() * (10 ** uint256(decimals))) / totalShares;
    }

    // -------------------------------------------------------------------------
    // Core user actions
    // -------------------------------------------------------------------------

    /**
     * @notice Deposits underlying tokens into the vault and mints shares.
     * @param amount Amount of underlying to deposit.
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "RevenueVault: amount is zero");

        // Pull underlying tokens from user.
        require(
            underlying.transferFrom(msg.sender, address(this), amount),
            "RevenueVault: transferFrom failed"
        );

        // If a strategy is configured, immediately forward underlying to it.
        if (address(yieldSource) != address(0)) {
            yieldSource.deposit(amount);
        }

        // Calculate shares to mint based on current price per share.
        uint256 _totalShares = totalShares;
        uint256 sharesToMint;
        if (_totalShares == 0) {
            // First depositor gets 1:1 mapping.
            sharesToMint = amount;
        } else {
            uint256 _totalUnderlying = totalUnderlying();
            // Use totalUnderlying before including this deposit in strategy to avoid
            // giving the first depositor unfair advantage. For v1 simplicity, we assume
            // deposit() does not itself generate yield on the same block.
            sharesToMint = (amount * _totalShares) / (_totalUnderlying - amount);
        }

        require(sharesToMint > 0, "RevenueVault: zero shares");

        // Mint shares.
        totalShares = _totalShares + sharesToMint;
        balanceOf[msg.sender] += sharesToMint;

        emit Deposit(msg.sender, amount, sharesToMint);
    }

    /**
     * @notice Withdraws underlying by burning shares.
     * @param shares Amount of vault shares to redeem.
     */
    function withdraw(uint256 shares) external nonReentrant {
        require(shares > 0, "RevenueVault: shares is zero");
        uint256 userBalance = balanceOf[msg.sender];
        require(shares <= userBalance, "RevenueVault: insufficient shares");

        uint256 _totalShares = totalShares;
        uint256 _totalUnderlying = totalUnderlying();

        // Calculate user's proportional share of underlying.
        uint256 underlyingAmount = (shares * _totalUnderlying) / _totalShares;
        require(underlyingAmount > 0, "RevenueVault: zero underlying");

        // Burn shares.
        balanceOf[msg.sender] = userBalance - shares;
        totalShares = _totalShares - shares;

        // Ensure we have enough underlying in the vault; if not, withdraw from strategy.
        uint256 inVault = underlying.balanceOf(address(this));
        if (underlyingAmount > inVault && address(yieldSource) != address(0)) {
            uint256 missing = underlyingAmount - inVault;
            yieldSource.withdraw(missing);
        }

        // Transfer underlying to user.
        require(
            underlying.transfer(msg.sender, underlyingAmount),
            "RevenueVault: transfer failed"
        );

        emit Withdraw(msg.sender, underlyingAmount, shares);
    }

    // -------------------------------------------------------------------------
    // Auto-compounding
    // -------------------------------------------------------------------------

    /**
     * @notice Harvests yield from the strategy and compounds it back into the vault.
     * @dev Callable by anyone (keeper, UI button). In a production deployment on OP_NET,
     *      this would typically be called by a keeper bot monitoring OPScan for gas/fee conditions.
     */
    function autoCompound() external nonReentrant returns (uint256 harvested) {
        require(address(yieldSource) != address(0), "RevenueVault: no yield source");

        uint256 beforeBal = totalUnderlying();
        harvested = yieldSource.harvest();
        uint256 afterBal = totalUnderlying();

        require(afterBal >= beforeBal, "RevenueVault: harvest decreased balance");

        uint256 actualHarvest = afterBal - beforeBal;
        require(actualHarvest == harvested, "RevenueVault: inconsistent harvest");

        emit Harvest(msg.sender, harvested, afterBal);
    }
}

