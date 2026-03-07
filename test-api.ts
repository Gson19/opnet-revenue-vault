// Test file to understand OP_NET API
import * as opnet from 'opnet';

console.log('Available exports from opnet:');
console.log(Object.keys(opnet));

// Try to import specific things we need
try {
    const { BitcoinUtils } = opnet;
    console.log('BitcoinUtils available:', !!BitcoinUtils);
} catch (e) {
    console.log('BitcoinUtils not available:', e);
}

try {
    const { JSONRpcProvider } = opnet;
    console.log('JSONRpcProvider available:', !!JSONRpcProvider);
} catch (e) {
    console.log('JSONRpcProvider not available:', e);
}

try {
    const { getContract } = opnet;
    console.log('getContract available:', !!getContract);
} catch (e) {
    console.log('getContract not available:', e);
}
