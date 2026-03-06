import type { BrowserProvider } from "ethers";

/**
 * Minimal wrapper type for an OP_NET-compatible injected provider.
 * In practice this will likely be exposed as `window.opnet` or `window.ethereum`
 * depending on the OP_NET wallet implementation.
 */
export type OPNetProvider = BrowserProvider;


