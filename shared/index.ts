export const NETWORKS = {
    TESTNET: 'testnet',
    MAINNET: 'mainnet'
} as const;

export const RPC_URLS = {
    [NETWORKS.TESTNET]: 'https://testnet.opnet.org',
    [NETWORKS.MAINNET]: 'https://mainnet.opnet.org'
} as const;

export const CHAIN_IDS = {
    [NETWORKS.TESTNET]: 1,
    [NETWORKS.MAINNET]: 2
} as const;

export interface ContractConfig {
    address: string;
    abi: any[];
}

export interface VaultConfig extends ContractConfig {
    underlyingToken: string;
    symbol: string;
}

export interface NetworkConfig {
    name: string;
    rpcUrl: string;
    chainId: number;
    blockExplorer?: string;
}
