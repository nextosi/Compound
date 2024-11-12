// userBalances.js

// Import required modules and ABIs
import { getUserAccount, getChainId } from './state.js';
import { getABI } from './abiLoader.js';
import { tokens } from './tokens.js'; // Assuming tokens.js exports an object 'tokens'
import Web3 from 'web3';

// Initialize Web3
let web3;
if (typeof window !== 'undefined' && window.ethereum) {
    web3 = new Web3(window.ethereum);
} else {
    console.error('Web3 provider not found. Please install MetaMask or another Web3 wallet.');
}

// Store user balances in memory for quick access
let balanceCache = {};

// Fetch and update user balances for all tokens in tokens.js
export async function fetchUserBalances() {
    const userAccount = getUserAccount();
    const chainId = getChainId();

    if (!userAccount || !chainId) {
        console.error("User account or Chain ID is not set. Cannot fetch balances.");
        return;
    }

    try {
        balanceCache = {}; // Reset cache for fresh data
        const erc20ABI = getABI('ERC20');

        // Iterate over tokens in tokens.js and fetch balances
        for (const [symbol, token] of Object.entries(tokens)) {
            const balance = await fetchBalanceForToken(userAccount, token, erc20ABI);
            balanceCache[symbol] = { symbol, balance };
        }

        // Update the UI with the fetched balances
        updateBalanceDisplay(balanceCache);

    } catch (error) {
        console.error("Error fetching user balances:", error);
    }
}

// Helper function to fetch balance for a specific token
async function fetchBalanceForToken(account, token, erc20ABI) {
    try {
        const tokenAddress = token.address[chainId];
        if (!tokenAddress) {
            console.warn(`Token address for ${token.symbol} not found on chain ID ${chainId}.`);
            return '--';
        }

        const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);
        const balance = await tokenContract.methods.balanceOf(account).call();
        const decimals = token.decimals || 18;
        return web3.utils.fromWei(balance, 'ether'); // Adjust based on token decimals if necessary
    } catch (error) {
        console.error(`Error fetching balance for token ${token.symbol}:`, error);
        return '--'; // Fallback display value
    }
}

// Update the UI with the latest balance data
function updateBalanceDisplay(balances) {
    for (const [symbol, { balance }] of Object.entries(balances)) {
        const balanceElement = document.getElementById(`balance-${symbol}`);
        if (balanceElement) {
            balanceElement.textContent = `Balance: ${balance} ${symbol}`;
        } else {
            console.warn(`Balance element for ${symbol} not found in the UI.`);
        }
    }
}

// Retrieve cached balances for use in other modules
export function getCachedBalances() {
    return balanceCache;
}

// Refresh balances on account or network changes
export async function refreshUserBalances() {
    const userAccount = getUserAccount();
    const chainId = getChainId();

    if (userAccount && chainId) {
        console.log("Refreshing user balances for account:", userAccount);
        await fetchUserBalances();
    } else {
        console.warn("User account or Chain ID is not set. Cannot refresh balances.");
    }
}
