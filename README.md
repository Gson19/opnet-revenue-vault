# OP_NET Revenue Vault with Auto-Compounding

Production-ready reference implementation of a single-asset **Revenue Vault with Auto-Compounding** for OP_NET, focused on making a BTC-pegged asset work on Bitcoin L1 via OP_NET.

The system includes:
- `RevenueVault` and `MockYieldSource` Solidity contracts.
- A dark-themed React + TypeScript + Tailwind SPA.
- A simple `deploy-vault.js` script using `ethers` v6.

## Structure

- `contracts/`
  - `RevenueVault.sol`: Single-asset auto-compounding vault with pluggable yield source.
  - `MockYieldSource.sol`: Mock strategy that simulates yield for demos/tests.
- `frontend/`
  - React + TypeScript + Vite + Tailwind UI.
- `scripts/`
  - `deploy-vault.js`: Deployment helper using `ethers` v6.

## Prerequisites

- Node.js >= 18
- npm or pnpm
- Access to an OP_NET RPC endpoint
- A funded deployer key on OP_NET (for deployments)

## Install dependencies

```bash
npm install
cd frontend && npm install
```

## Configure environment

Copy `.env.example` to `.env` in the project root and fill in:

- `OP_NET_RPC_URL`: OP_NET RPC endpoint.
- `DEPLOYER_PRIVATE_KEY`: Private key for deployments.
- `UNDERLYING_TOKEN_ADDRESS`: Address of the BTC-pegged or ecosystem token on OP_NET.

Then copy the frontend variables:

```bash
cd frontend
cp ../.env.example .env.local
```

Update in `frontend/.env.local`:

- `VITE_OP_NET_RPC_URL`: OP_NET RPC endpoint used by the UI.
- `VITE_REVENUE_VAULT_ADDRESS`: Set after deploying `RevenueVault`.
- `VITE_UNDERLYING_SYMBOL`: Display symbol (e.g. `wBTC-OPN`, `PILL`, `MOTO-LP`).
- `VITE_UNDERLYING_DECIMALS`: Token decimals (e.g. `8` for BTC-pegged).
- `VITE_OPSCAN_BASE_URL`: Base URL for OPScan (optional, for linking).

## Compile contracts

Use your preferred OP_NET-compatible Solidity toolchain (e.g. Foundry, Hardhat).
Compile `contracts/RevenueVault.sol` and `contracts/MockYieldSource.sol`, then output
standard JSON artifacts into `artifacts/`:

- `artifacts/RevenueVault.json`
- `artifacts/MockYieldSource.json`

Each JSON file should contain:

- `abi`: Contract ABI.
- `bytecode`: Compiled bytecode.

## Deploy to OP_NET

With `.env` configured and `artifacts/` present:

```bash
npm run deploy:vault
```

This script will:

- Deploy `RevenueVault` to OP_NET, using your configured underlying token.
- Deploy `MockYieldSource` linked to the vault.
- Set the mock yield source on the vault.
- Print the deployed vault address.

Set the printed vault address into `frontend/.env.local` under `VITE_REVENUE_VAULT_ADDRESS`.

## Run the frontend locally

```bash
cd frontend
npm run dev
```

Then open the printed URL (typically `http://localhost:5173`) in a browser with an
OP_NET-compatible wallet injected (e.g. `window.opnet` or `window.ethereum` speaking OP_NET).

## dApp UX overview

- **Connect wallet**: Uses an injected OP_NET provider and connects via `eth_requestAccounts`.
- **Vault dashboard**:
  - TVL (`totalUnderlying()`).
  - User deposited amount (underlying `balanceOf`).
  - User vault shares (`balanceOf` on `RevenueVault`).
  - Current `getPricePerShare()`.
  - Simulated APY badge for demo purposes.
- **Actions**:
  - Deposit: Calls `deposit(amount)` on the vault (handles ERC20 approve if needed).
  - Withdraw: Calls `withdraw(shares)` on the vault.
  - Compound now: Calls `autoCompound()` on the vault.
- **History / activity**:
  - Mocked list of deposits/withdraws/compound actions for UX demo. Can be wired to
    real events from an indexer or OPScan later.

## OP_NET and Bitcoin L1 considerations

- The vault is intentionally **single-asset** for v1, typically a BTC-pegged token
  bridged from Bitcoin L1 into OP_NET.
- Yield is abstracted behind `IYieldSource` so you can:
  - Plug in a Motoswap LP-based strategy that holds LP tokens and harvests fees.
  - Integrate staking, lending, or other OP_NET-native protocols.
- The `autoCompound()` function is permissionless and can be called by:
  - A dedicated OP_NET keeper bot.
  - A UI button (as in this demo).
  - Any external automation wired to OPScan events.

## Where to integrate OPScan and Motoswap

- **OPScan**:
  - Frontend `config.ts` exposes `opScanBaseUrl`. Use it to build links like:
    `\${opScanBaseUrl}/address/\${VITE_REVENUE_VAULT_ADDRESS}`.
  - Extend the UI to show "View on OPScan" links for the vault and recent tx hashes.

- **Motoswap or other yield sources**:
  - Replace `MockYieldSource` with a strategy contract that:
    - Accepts underlying deposits from the vault.
    - Holds and manages LP tokens / staked positions.
    - Implements `harvest()` to:
      - Claim rewards.
      - Swap rewards into the underlying token via Motoswap.
      - Transfer harvested underlying back to the vault.
  - Wire the new strategy by calling `setYieldSource()` on `RevenueVault`.

## Security notes

- The vault includes:
  - Basic non-zero amount checks for deposits/withdraws.
  - A minimal nonReentrant guard on `deposit`, `withdraw`, and `autoCompound`.
- For production:
  - Add access controls / timelocks for changing `yieldSource`.
  - Use a battle-tested ERC20 and safe-transfer helpers.
  - Consider pausing mechanisms and more granular accounting per yield source.
  - Thoroughly audit any real strategy logic, especially around reward harvesting
    and Motoswap integration.

