# OP_NET Revenue Vault - Full Stack Project

Production-ready OP_NET implementation of a single-asset **Revenue Vault with Auto-Compounding** for Bitcoin Layer 1.

## Architecture

- **Contracts**: AssemblyScript WebAssembly contracts
- **Backend**: hyper-express API server with OP_NET SDK
- **Frontend**: React + TypeScript with OP_WALLET integration
- **Shared**: Common types and configuration

## Project Structure

```
opnet-revenue-vault/
├── contracts/           # AssemblyScript smart contracts
│   ├── assembly/       # Contract source files
│   ├── asconfig.json   # AssemblyScript configuration
│   └── package.json    # Contract dependencies
├── backend/            # hyper-express API server
│   ├── src/           # Server source code
│   └── package.json   # Backend dependencies
├── frontend/          # React frontend (existing)
├── shared/           # Shared types and constants
├── .env              # Environment variables
└── opnet.config.json # OP_NET deployment configuration
```

## Prerequisites

- Node.js >= 18
- OP_NET CLI (install via npm)
- Access to OP_NET testnet/mainnet
- OP_WALLET browser extension

## Installation

```bash
# Install all dependencies
npm run install:all

# Or install manually
npm install
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

## Environment Configuration

Copy and update `.env`:

```env
NETWORK=testnet
OP_NET_RPC_URL=https://testnet.opnet.org
DEPLOYER_PRIVATE_KEY=your_private_key_here
UNDERLYING_TOKEN_ADDRESS=token_address_on_opnet

# Backend
PORT=3000
VAULT_ADDRESS=

# Frontend
VITE_OP_NET_RPC_URL=https://testnet.opnet.org
VITE_REVENUE_VAULT_ADDRESS=
VITE_UNDERLYING_SYMBOL=wBTC
VITE_UNDERLYING_DECIMALS=8
```

## Contract Development

### Build Contracts

```bash
npm run build:contracts
```

### Contract Architecture

- **RevenueVault**: OP20-based vault with yield source integration
- **MockYieldSource**: Mock strategy for testing/demos
- Uses OP_NET storage patterns with unique pointers
- SafeMath for all u256 arithmetic
- Owner access control via Revert.ifNotOwner()

## Deployment

### Using OP_NET CLI

```bash
# Deploy to testnet
npx opnet-cli deploy --config opnet.config.json --network testnet

# Deploy to mainnet
npx opnet-cli deploy --config opnet.config.json --network mainnet
```

### Manual Deployment Steps

1. Deploy RevenueVault with underlying token address
2. Deploy MockYieldSource linked to vault
3. Call setYieldSource() on RevenueVault
4. Update VAULT_ADDRESS in .env

## Backend Development

### Start Backend Server

```bash
npm run start:backend
```

### API Endpoints

- `GET /health` - Health check
- `GET /api/vault/tvl` - Total value locked
- `GET /api/vault/balance/:address` - User balance
- `GET /api/vault/price` - Price per share
- `GET /api/vault/transactions` - Recent transactions

## Frontend Development

### Start Frontend

```bash
npm run dev:frontend
```

### Frontend Integration

- Uses OP_WALLET (NOT MetaMask)
- Separate JSONRpcProvider for read operations
- Contract interaction via getContract<T>()
- Simulate before sending transactions

## Security Notes

- All contracts use SafeMath for arithmetic
- Access control on owner functions
- Input validation (zero address, zero amount)
- No private keys in frontend code
- Environment variables for sensitive data

## Testing on Testnet

1. Deploy contracts to OP_NET testnet
2. Get testnet tokens from faucet
3. Test deposit/withdraw flows
4. Verify auto-compounding functionality
5. Test frontend integration

## Production Deployment

1. Audit contracts thoroughly
2. Deploy to OP_NET mainnet
3. Update frontend environment variables
4. Configure production backend
5. Set up monitoring and indexing

## Key Differences from Ethereum

- **Contracts**: AssemblyScript → WebAssembly (not Solidity → EVM)
- **RPC**: OP_NET endpoints (not Ethereum)
- **Wallet**: OP_WALLET (not MetaMask)
- **Libraries**: @btc-vision/* packages (not ethers/web3)
- **Backend**: hyper-express (not Express/Fastify)

## Troubleshooting

### Common Issues

1. **Module not found**: Install OP_NET packages with correct versions
2. **Storage pointer collision**: Ensure unique storage pointers
3. **Wallet connection**: Use OP_WALLET extension, not MetaMask
4. **RPC errors**: Verify OP_NET RPC URL and network

### Getting Help

- Check OP_NET documentation
- Review opnet-development skill docs
- Verify package versions match requirements
- Test on testnet before mainnet
