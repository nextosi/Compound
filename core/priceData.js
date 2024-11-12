// priceData.js

// Import necessary modules and ABIs
import { getCompoundProxyAddress, getChainId } from './state.js';
import { getABI } from './abiLoader.js';
import { getCompoundMarkets } from './markets.js'; // Import function to get markets
import { tokens } from './tokens.js'; // Import tokens if needed
import Web3 from 'web3';

// Initialize Web3
let web3;
if (typeof window !== 'undefined' && window.ethereum) {
    web3 = new Web3(window.ethereum);
} else {
    console.error('Web3 provider not found. Please install MetaMask or another Web3 wallet.');
}

// Store the price data in memory for easy access
let priceDataCache = {};

// Fetch and update price data
export async function fetchPriceData() {
    try {
        const compoundProxyAddress = getCompoundProxyAddress();
        const chainId = getChainId();

        if (!compoundProxyAddress) {
            console.error("Compound Proxy Address is not set. Cannot fetch price data.");
            return;
        }

        // Set up contract instance with CometABI and compoundProxyAddress
        const cometABI = getABI('CometABI');
        if (!cometABI) {
            console.error('CometABI not found.');
            return;
        }
        const cometContract = new web3.eth.Contract(cometABI, compoundProxyAddress);

        // Fetch assets from markets.js
        const markets = getCompoundMarkets(chainId);
        if (!markets || markets.length === 0) {
            console.warn("No markets found for chain ID:", chainId);
            return;
        }

        const prices = {};

        for (const market of markets) {
            try {
                // Assuming the method to get price is 'getAssetPrice'
                const priceWei = await cometContract.methods.getAssetPrice(market.address).call();
                const price = web3.utils.fromWei(priceWei, "ether"); // Convert to a readable format
                prices[market.symbol] = price;
            } catch (error) {
                console.error(`Error fetching price for asset ${market.symbol}:`, error);
                prices[market.symbol] = '--';
            }
        }

        // Update the cache
        priceDataCache = prices;
        console.log("Price data updated:", priceDataCache);

        // Optionally, update the UI here or trigger an event
        updatePriceDisplay(priceDataCache);

    } catch (error) {
        console.error("Error fetching price data:", error);
    }
}

// Retrieve cached price data for use in other modules
export function getCachedPriceData() {
    return priceDataCache;
}

// Update the UI with the latest price data
function updatePriceDisplay(prices) {
    for (const [symbol, price] of Object.entries(prices)) {
        const priceElement = document.getElementById(`price-${symbol}`);
        if (priceElement) {
            priceElement.textContent = `Price: ${price} ETH`;
        } else {
            console.warn(`Price element for ${symbol} not found.`);
        }
    }
}

// Refresh price data on account or network changes
export async function refreshPriceData() {
    const chainId = getChainId();
    if (chainId) {
        console.log("Refreshing price data for chain:", chainId);
        await fetchPriceData();
    } else {
        console.warn("Chain ID is not set. Cannot refresh price data.");
    }
}
