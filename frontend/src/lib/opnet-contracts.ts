// -----------------------------
// OP_NET Provider Wrapper
// -----------------------------
import { OP_NET_CONFIG } from "../config";

export interface VaultStats {
  tvl: string;
  pricePerShare: string;
  totalShares: string;
  userShares: string;
  userUnderlying: string;
  tokenSymbol: string;
}

export async function getOPNetProvider() {
  const anyWindow = window as any;
  if (!anyWindow.opnet) {
    throw new Error("OP_Wallet not detected. Please install OP_Wallet.");
  }
  return anyWindow.opnet;
}

// -----------------------------
// Read-only RPC Provider
// -----------------------------
export class OPNetReadProvider {
  private rpcUrl: string;

  constructor(rpcUrl: string) {
    this.rpcUrl = rpcUrl;
  }

  async call(contract: string, method: string, args: any[] = []) {
    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "opnet_call",
        params: {
          contract,
          method,
          args
        }
      })
    });

    const json = await response.json();
    return json.result ?? null;
  }
}

// -----------------------------
// Signer for write operations
// -----------------------------
export class OPNetSigner {
  private provider: any;

  constructor(provider: any) {
    this.provider = provider;
  }

  async getAddress() {
    const accounts = await this.provider.requestAccounts();
    return accounts[0];
  }

  async sendInteraction(contract: string, method: string, args: any[] = []) {
    const interaction = {
      contract,
      method,
      args
    };

    const txHash = await this.provider.signAndBroadcastInteraction(interaction);
    return txHash;
  }
}

// -----------------------------
// Contract Wrapper
// -----------------------------
export class OPNetContract {
  private address: string;
  private provider: OPNetReadProvider | OPNetSigner;

  constructor(address: string, provider: OPNetReadProvider | OPNetSigner) {
    this.address = address;
    this.provider = provider;
  }

  async read(method: string, args: any[] = []) {
    if (this.provider instanceof OPNetReadProvider) {
      return await this.provider.call(this.address, method, args);
    }
    throw new Error("Read provider required");
  }

  async write(method: string, args: any[] = []) {
    if (this.provider instanceof OPNetSigner) {
      return await this.provider.sendInteraction(this.address, method, args);
    }
    throw new Error("Signer required for write operations");
  }
}

// -----------------------------
// Helpers
// -----------------------------
export function getReadProvider() {
  return new OPNetReadProvider(OP_NET_CONFIG.rpcUrl);
}

export async function getSigner() {
  const provider = await getOPNetProvider();
  return new OPNetSigner(provider);
}

export async function getVaultContract(provider: any) {
  if (!OP_NET_CONFIG.revenueVaultAddress) {
    throw new Error("RevenueVault address missing in config");
  }
  return new OPNetContract(OP_NET_CONFIG.revenueVaultAddress, provider);
}

// -----------------------------
// Vault Functions
// -----------------------------
export async function getVaultStats(address: string | null) {
  const provider = getReadProvider();
  const vault = await getVaultContract(provider);

  const [
    pricePerShare,
    totalUnderlying,
    totalShares,
    userShares
  ] = await Promise.all([
    vault.read("getPricePerShare"),
    vault.read("totalUnderlying"),
    vault.read("totalShares"),
    address ? vault.read("balanceOf", [address]) : "0"
  ]);

  return {
    tvl: totalUnderlying ?? "0",
    pricePerShare: pricePerShare ?? "0",
    totalShares: totalShares ?? "0",
    userShares: userShares ?? "0",
    userUnderlying: "0", // Would calculate based on shares and price
    tokenSymbol: OP_NET_CONFIG.underlyingTokenSymbol
  };
}

export async function deposit(amount: string) {
  // Validate input
  if (!amount || amount.trim() === '') {
    throw new Error("Amount cannot be empty");
  }
  
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error("Amount must be a positive number");
  }

  // Convert to satoshis using decimals from environment
  const decimals = parseInt(OP_NET_CONFIG.underlyingTokenDecimals.toString());
  const satoshis = Math.floor(amountNum * Math.pow(10, decimals)).toString();
  
  console.log("Deposit conversion:", {
    input: amount,
    amountNum,
    decimals,
    satoshis
  });

  const signer = await getSigner();
  const vault = await getVaultContract(signer);
  
  // Create interaction object with exact shape
  const interaction = {
    contract: OP_NET_CONFIG.revenueVaultAddress,
    method: "deposit",
    args: [satoshis]
  };
  
  console.log("Final interaction object:", interaction);
  
  return await vault.write("deposit", [satoshis]);
}

export async function withdraw(shares: string) {
  const signer = await getSigner();
  const vault = await getVaultContract(signer);
  return await vault.write("withdraw", [shares]);
}

export async function compoundNow() {
  const signer = await getSigner();
  const vault = await getVaultContract(signer);
  return await vault.write("autoCompound");
}
