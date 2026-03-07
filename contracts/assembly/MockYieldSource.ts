import {
    Contract,
    Storage,
    SafeMath,
    Revert,
    u256,
    address
} from 'opnet';

// Storage pointers
const OWNER_POINTER = 0;
const UNDERLYING_TOKEN_POINTER = 1;
const VAULT_POINTER = 2;
const TOTAL_DEPOSITS_POINTER = 3;
const YIELD_RATE_POINTER = 4; // Basis points (10000 = 100%)

export class MockYieldSource extends Contract {
    onDeployment(): void {
        Storage.store<address>(OWNER_POINTER, this.tx.sender);
        Storage.store<u256>(YIELD_RATE_POINTER, u256.from(100)); // 1% default
    }

    initialize(
        underlyingToken: address,
        vault: address
    ): void {
        Revert.ifNotOwner(this, this.tx.sender);
        
        const currentToken = Storage.load<address>(UNDERLYING_TOKEN_POINTER);
        Revert.if(currentToken != address(0), "Already initialized");
        
        Storage.store<address>(UNDERLYING_TOKEN_POINTER, underlyingToken);
        Storage.store<address>(VAULT_POINTER, vault);
    }

    // Simulate yield generation - called by anyone
    generateYield(): void {
        const totalDeposits = Storage.load<u256>(TOTAL_DEPOSITS_POINTER);
        if (totalDeposits == u256.Zero) return;
        
        const yieldRate = Storage.load<u256>(YIELD_RATE_POINTER);
        const yieldAmount = SafeMath.div(
            SafeMath.mul(totalDeposits, yieldRate),
            u256.from(10000)
        );
        
        if (yieldAmount > u256.Zero) {
            // In a real implementation, this would come from external yield
            // For mock, we just track that yield is available
            Storage.store<u256>(
                TOTAL_DEPOSITS_POINTER,
                SafeMath.add(totalDeposits, yieldAmount)
            );
        }
    }

    // Harvest available yield and send to vault
    harvest(): u256 {
        const vault = Storage.load<address>(VAULT_POINTER);
        Revert.if(vault == address(0), "Not initialized");
        
        const totalDeposits = Storage.load<u256>(TOTAL_DEPOSITS_POINTER);
        const yieldRate = Storage.load<u256>(YIELD_RATE_POINTER);
        
        // Calculate yield (simplified - in real implementation would track separately)
        const yieldAmount = SafeMath.div(
            SafeMath.mul(totalDeposits, yieldRate),
            u256.from(10000)
        );
        
        if (yieldAmount > u256.Zero) {
            // In mock implementation, we assume we have the tokens
            // In real implementation, this would transfer actual yield tokens
            // For now, just return the calculated amount
        }
        
        return yieldAmount;
    }

    // Set yield rate (only owner)
    setYieldRate(rate: u256): void {
        Revert.ifNotOwner(this, this.tx.sender);
        Revert.if(rate > u256.from(10000), "Rate too high"); // Max 100%
        Storage.store<u256>(YIELD_RATE_POINTER, rate);
    }

    // Getters
    getOwner(): address {
        return Storage.load<address>(OWNER_POINTER);
    }

    getUnderlyingToken(): address {
        return Storage.load<address>(UNDERLYING_TOKEN_POINTER);
    }

    getVault(): address {
        return Storage.load<address>(VAULT_POINTER);
    }

    getTotalDeposits(): u256 {
        return Storage.load<u256>(TOTAL_DEPOSITS_POINTER);
    }

    getYieldRate(): u256 {
        return Storage.load<u256>(YIELD_RATE_POINTER);
    }
}
