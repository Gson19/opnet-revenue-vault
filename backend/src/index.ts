// OP_NET Revenue Vault Backend Server
// Simple Express server for demonstration

import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Mock data for demonstration
const mockVaultData = {
    address: process.env.VAULT_ADDRESS || "0x0000000000000000000000000000000000000000000",
    totalUnderlying: "100000000000", // 1000 BTC in satoshis
    totalShares: "100000000000",
    pricePerShare: "100000000", // 1 BTC in satoshis
    name: "Revenue Vault",
    symbol: "RVLT",
    decimals: "8"
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        network: process.env.NETWORK || 'testnet'
    });
});

// Get vault info
app.get('/api/vault', (req: Request, res: Response) => {
    try {
        res.json({
            ...mockVaultData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching vault info:', error);
        res.status(500).json({ error: 'Failed to fetch vault info' });
    }
});

// Get user balance
app.get('/api/balance/:address', (req: Request, res: Response) => {
    try {
        const { address } = req.params;
        
        // Mock balance calculation
        const mockBalance = "50000000"; // 0.5 BTC in satoshis
        
        res.json({
            address,
            balance: mockBalance,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// Get vault metadata
app.get('/api/metadata', (req: Request, res: Response) => {
    try {
        res.json({
            address: mockVaultData.address,
            name: mockVaultData.name,
            symbol: mockVaultData.symbol,
            decimals: mockVaultData.decimals,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching metadata:', error);
        res.status(500).json({ error: 'Failed to fetch metadata' });
    }
});

// Get deployment info
app.get('/api/deployment', (req: Request, res: Response) => {
    try {
        res.json({
            network: process.env.NETWORK || 'testnet',
            rpcUrl: process.env.OP_NET_RPC_URL,
            vaultAddress: process.env.VAULT_ADDRESS,
            underlyingToken: process.env.UNDERLYING_TOKEN_ADDRESS,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching deployment info:', error);
        res.status(500).json({ error: 'Failed to fetch deployment info' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 OP_NET Revenue Vault Backend running on port ${PORT}`);
    console.log(`📍 Network: ${process.env.NETWORK || 'testnet'}`);
    console.log(`🔗 RPC URL: ${process.env.OP_NET_RPC_URL}`);
    console.log(`📦 Vault Address: ${process.env.VAULT_ADDRESS || 'Not configured'}`);
    console.log(`🪙 Underlying Token: ${process.env.UNDERLYING_TOKEN_ADDRESS || 'Not configured'}`);
});

export default app;
