// totalBorrow.js

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

// Store total borrow data in memory
let totalBorrowCache = null;

// Fetch and update total borrow amount
export async function fetchTotalBorrow() {
    const userAccount = getUserAccount();
    const compoundProxyAddress = getCompoundProxyAddress();

    if (!userAccount || !compoundProxyAddress) {
        console.warn("User account or Compound proxy address is not set.");
        updateTotalBorrowDisplay('--');
        return;
    }

    try {
        const cometABI = getABI('CometABI');
        if (!cometABI) {
            console.error('CometABI not found.');
            return;
        }

        const cometContract = new web3.eth.Contract(cometABI, compoundProxyAddress);
        const totalBorrowWei = await cometContract.methods.totalBorrow().call();
        const totalBorrowEther = web3.utils.fromWei(totalBorrowWei, 'ether');

        // Update cache and UI display
        totalBorrowCache = totalBorrowEther;
        updateTotalBorrowDisplay(totalBorrowEther);

    } catch (error) {
        console.error("Error fetching total borrow:", error);
        updateTotalBorrowDisplay('--'); // Fallback display
    }
}

// Retrieve cached total borrow data
export function getCachedTotalBorrow() {
    return totalBorrowCache;
}

// Update UI with the latest total borrow amount
function updateTotalBorrowDisplay(amount) {
    const totalBorrowElement = document.getElementById('totalBorrow');
    if (totalBorrowElement) {
        totalBorrowElement.innerText = `${amount} ETH`;
    } else {
        console.warn("Total borrow display element not found.");
    }
}

// Refresh total borrow data on relevant changes
export async function refreshTotalBorrow() {
    const userAccount = getUserAccount();
    const compoundProxyAddress = getCompoundProxyAddress();

    if (userAccount && compoundProxyAddress) {
        console.log("Refreshing total borrow data for account:", userAccount);
        await fetchTotalBorrow();
    } else {
        console.warn("User account or Compound proxy address is not set. Cannot refresh total borrow.");
    }
}
