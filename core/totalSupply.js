// totalSupply.js

// Import required modules and ABIs
import { getUserAccount, getCompoundProxyAddress } from './state.js';
import { getABI } from './abiLoader.js';
import Web3 from 'web3';

// Initialize Web3
let web3;
if (typeof window !== 'undefined' && window.ethereum) {
    web3 = new Web3(window.ethereum);
} else {
    console.error('Web3 provider not found. Please install MetaMask or another Web3 wallet.');
}

// Store total supply data in memory
let totalSupplyCache = null;

// Fetch and update total supply amount
export async function fetchTotalSupply() {
    const userAccount = getUserAccount();
    const compoundProxyAddress = getCompoundProxyAddress();

    if (!userAccount || !compoundProxyAddress) {
        console.warn("User account or Compound proxy address is not set.");
        updateTotalSupplyDisplay('--');
        return;
    }

    try {
        const cometABI = getABI('CometABI');
        if (!cometABI) {
            console.error('CometABI not found.');
            return;
        }

        const cometContract = new web3.eth.Contract(cometABI, compoundProxyAddress);
        const totalSupplyWei = await cometContract.methods.totalSupply().call();
        const totalSupplyEther = web3.utils.fromWei(totalSupplyWei, 'ether');

        // Update cache and UI display
        totalSupplyCache = totalSupplyEther;
        updateTotalSupplyDisplay(totalSupplyEther);

    } catch (error) {
        console.error("Error fetching total supply:", error);
        updateTotalSupplyDisplay('--'); // Fallback display
    }
}

// Retrieve cached total supply data
export function getCachedTotalSupply() {
    return totalSupplyCache;
}

// Update UI with the latest total supply amount
function updateTotalSupplyDisplay(amount) {
    const totalSupplyElement = document.getElementById('totalSupply');
    if (totalSupplyElement) {
        totalSupplyElement.innerText = `${amount} ETH`;
    } else {
        console.warn("Total supply display element not found.");
    }
}

// Refresh total supply data on relevant changes
export async function refreshTotalSupply() {
    const userAccount = getUserAccount();
    const compoundProxyAddress = getCompoundProxyAddress();

    if (userAccount && compoundProxyAddress) {
        console.log("Refreshing total supply data for account:", userAccount);
        await fetchTotalSupply();
    } else {
        console.warn("User account or Compound proxy address is not set. Cannot refresh total supply.");
    }
}
