// Simple deployment script using ethers v6.
// This is intentionally minimal and OP_NET-agnostic: point OP_NET_RPC_URL to your
// OP_NET endpoint and provide a funded DEPLOYER_PRIVATE_KEY.

import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const rpcUrl = process.env.OP_NET_RPC_URL;
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!rpcUrl || !pk) {
    throw new Error("OP_NET_RPC_URL and DEPLOYER_PRIVATE_KEY must be set in .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  console.log("Deployer:", await wallet.getAddress());

  const contractsDir = path.join(process.cwd(), "artifacts");
  if (!fs.existsSync(contractsDir)) {
    throw new Error(
      "artifacts folder not found. Compile contracts and place ABI/bytecode JSON files under artifacts/"
    );
  }

  const vaultJson = JSON.parse(
    fs.readFileSync(path.join(contractsDir, "RevenueVault.json"), "utf8")
  );
  const mockJson = JSON.parse(
    fs.readFileSync(path.join(contractsDir, "MockYieldSource.json"), "utf8")
  );

  const underlyingAddress = process.env.UNDERLYING_TOKEN_ADDRESS;
  if (!underlyingAddress) {
    throw new Error("UNDERLYING_TOKEN_ADDRESS must be set in .env");
  }

  console.log("Deploying RevenueVault...");
  const VaultFactory = new ethers.ContractFactory(
    vaultJson.abi,
    vaultJson.bytecode,
    wallet
  );
  const vault = await VaultFactory.deploy(
    underlyingAddress,
    "OP_NET Revenue Vault",
    "rv" + (process.env.VAULT_SYMBOL_SUFFIX || "wBTC"),
    await wallet.getAddress()
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("RevenueVault deployed at:", vaultAddress);

  console.log("Deploying MockYieldSource...");
  const MockFactory = new ethers.ContractFactory(
    mockJson.abi,
    mockJson.bytecode,
    wallet
  );
  const yieldSource = await MockFactory.deploy(
    underlyingAddress,
    vaultAddress,
    await wallet.getAddress()
  );
  await yieldSource.waitForDeployment();
  const yieldSourceAddress = await yieldSource.getAddress();
  console.log("MockYieldSource deployed at:", yieldSourceAddress);

  console.log("Linking yield source to vault...");
  const tx = await vault.setYieldSource(yieldSourceAddress);
  await tx.wait();
  console.log("Yield source set.");

  console.log("\nNext steps:");
  console.log("- Set VITE_REVENUE_VAULT_ADDRESS in frontend/.env.local to", vaultAddress);
  console.log("- Optionally set VITE_OPSCAN_BASE_URL to your OPScan instance.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

