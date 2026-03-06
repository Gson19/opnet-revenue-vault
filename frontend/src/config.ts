export const OP_NET_CONFIG = {
  // RPC endpoint for OP_NET; replace with actual endpoint when deploying.
  rpcUrl: import.meta.env.VITE_OP_NET_RPC_URL || "http://localhost:8545",
  // Deployed contract addresses; to be set post-deployment.
  revenueVaultAddress: import.meta.env.VITE_REVENUE_VAULT_ADDRESS || "",
  underlyingTokenSymbol: import.meta.env.VITE_UNDERLYING_SYMBOL || "wBTC-OPN",
  underlyingTokenDecimals: Number(import.meta.env.VITE_UNDERLYING_DECIMALS || 8),
  // Optional: base URL for OPScan so we can link users to tx/contract pages.
  opScanBaseUrl: import.meta.env.VITE_OPSCAN_BASE_URL || "https://opscan.example.com"
};

