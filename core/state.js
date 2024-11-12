// state.js

// Constants for Chain IDs
const CHAIN_IDS = {
    ETHEREUM_MAINNET: 1,
    POLYGON: 137,
    ARBITRUM: 42161,
    AVALANCHE: 43114,
    BSC: 56,
};

// Initialize internal state variables
let userAccount = null;
let compoundProxyAddress = null;
let chainId = null;

// Observer pattern for state change listeners
const listeners = [];

// Subscribe to state changes
export function subscribe(listener) {
    if (typeof listener === 'function') {
        listeners.push(listener);
    } else {
        logError("Listener must be a function");
    }
}

// Unsubscribe from state changes
export function unsubscribe(listener) {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
        listeners.splice(index, 1);
    } else {
        logError("Listener not found");
    }
}

// Notify all subscribed listeners of state changes
function notifyListeners() {
    const currentState = getState();
    listeners.forEach((listener) => listener(currentState));
}

// Update userAccount with validation
export function setUserAccount(newAccount) {
    if (typeof newAccount === 'string' && /^0x[a-fA-F0-9]{40}$/.test(newAccount)) {
        userAccount = newAccount;
        logInfo("User account updated:", userAccount);
        notifyListeners();
    } else {
        logError("Invalid user account format");
    }
}

// Update compoundProxyAddress with validation
export function setCompoundProxyAddress(newAddress) {
    if (typeof newAddress === 'string' && /^0x[a-fA-F0-9]{40}$/.test(newAddress)) {
        compoundProxyAddress = newAddress;
        logInfo("Compound proxy address updated:", compoundProxyAddress);
        notifyListeners();
    } else {
        logError("Invalid compound proxy address format");
    }
}

// Update chainId with validation
export function setChainId(newChainId) {
    if (typeof newChainId === 'number') {
        chainId = newChainId;
        compoundProxyAddress = getCompoundProxyAddressByChainId(newChainId); // Update proxy based on chainId
        if (!compoundProxyAddress) {
            logWarn(`No Compound proxy address found for chain ID: ${newChainId}`);
        }
        logInfo("Chain ID updated:", chainId);
        notifyListeners();
    } else {
        logError("Chain ID must be a number");
    }
}

// Retrieve current state (for debugging or logging purposes)
export function getState() {
    return {
        userAccount,
        compoundProxyAddress,
        chainId,
    };
}

// Getter functions for immutable state access
export function getUserAccount() {
    return userAccount;
}

export function getCompoundProxyAddress() {
    return compoundProxyAddress;
}

export function getChainId() {
    return chainId;
}

// Utility function to retrieve Compound's proxy address by chain ID
function getCompoundProxyAddressByChainId(id) {
    const proxyAddresses = {
        [CHAIN_IDS.ETHEREUM_MAINNET]: "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B",  // Ethereum Mainnet
        [CHAIN_IDS.POLYGON]: "0xA5ED4E203Dbb8f541a5a5dEBC5b37bB4094eF43b",         // Polygon
        [CHAIN_IDS.ARBITRUM]: "0xA5f3865042c7d9985fE4023b21B170663DFeCa46",        // Arbitrum
        [CHAIN_IDS.AVALANCHE]: "0xA5bfe375Fcdcc5B2e9366BAACeFa9C5A0CD45b33",       // Avalanche
        [CHAIN_IDS.BSC]: "0x9aA6f5dA6eF4Bf2a23BB0f264d33b9c75a3659D8",             // Binance Smart Chain (BSC)
    };
    return proxyAddresses[id] || null;
}

// Logging utilities
function logInfo(message, ...optionalParams) {
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
        console.log(`[INFO]: ${message}`, ...optionalParams);
    }
}

function logWarn(message, ...optionalParams) {
    console.warn(`[WARN]: ${message}`, ...optionalParams);
}

function logError(message, ...optionalParams) {
    console.error(`[ERROR]: ${message}`, ...optionalParams);
}
