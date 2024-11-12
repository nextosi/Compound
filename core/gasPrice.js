// gasPrice.js

import Web3 from 'web3';

// Initialize Web3
let web3;
if (typeof window !== 'undefined' && window.ethereum) {
    web3 = new Web3(window.ethereum);
} else {
    console.error('Web3 provider not found. Please install MetaMask or another Web3 wallet.');
}

// Set a default update interval (1 minute)
const UPDATE_INTERVAL = 60000; // 60,000 milliseconds = 1 minute
let gasPriceCache = null; // Store the latest gas price
let gasPriceUpdateTimeout = null; // Reference to timeout for periodic updates

// Fetch and update gas price
export async function fetchGasPrice() {
    if (!web3) {
        console.error('Web3 is not initialized.');
        return;
    }

    try {
        const gasPriceWei = await web3.eth.getGasPrice();
        const gasPriceGwei = web3.utils.fromWei(gasPriceWei, 'gwei');
        
        // Update cache and UI
        gasPriceCache = gasPriceGwei;
        updateGasPriceDisplay(gasPriceGwei);

        // Schedule the next update
        scheduleNextGasPriceUpdate();

    } catch (error) {
        console.error("Error fetching gas price:", error);
        updateGasPriceDisplay('--'); // Fallback display
    }
}

// Update the UI with the latest gas price
function updateGasPriceDisplay(price) {
    const gasPriceElement = document.getElementById('gasPrice');
    if (gasPriceElement) {
        gasPriceElement.innerText = `${price} Gwei`;
    } else {
        console.warn("Gas price display element not found.");
    }
}

// Schedule the next gas price update
function scheduleNextGasPriceUpdate() {
    clearTimeout(gasPriceUpdateTimeout); // Clear any existing timeout
    gasPriceUpdateTimeout = setTimeout(fetchGasPrice, UPDATE_INTERVAL);
}

// Clear gas price updates
export function stopGasPriceUpdates() {
    clearTimeout(gasPriceUpdateTimeout);
}

// Initialize gas price display on page load
export function initializeGasPrice() {
    fetchGasPrice(); // Initial fetch
}
