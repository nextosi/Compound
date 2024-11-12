// static/js/core/wallet.js

/**
 * Connect to the user's MetaMask wallet.
 */
export async function connectWallet() {
    if (window.ethereum) {
        try {
            console.log("Attempting to connect to MetaMask...");
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (accounts.length === 0) {
                alert("No accounts found. Please connect to MetaMask.");
                console.warn("No accounts found.");
                return;
            }

            const account = accounts[0];
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });

            // Update the UI with account and network information
            document.getElementById('accountAddress').textContent = account;
            document.getElementById('networkName').textContent = getNetworkName(chainId);

            // Show wallet info and hide Connect button
            document.getElementById('walletInfo').style.display = 'block';
            document.getElementById('connectWallet').style.display = 'none';
            document.getElementById('disconnectWallet').style.display = 'inline-block';

            console.log(`Connected to account: ${account}, Network: ${getNetworkName(chainId)}`);
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
            alert("Failed to connect to MetaMask.");
        }
    } else {
        alert("MetaMask is not installed. Please install MetaMask and try again.");
        console.error("MetaMask not detected.");
    }
}

/**
 * Disconnect the user's wallet by resetting UI elements.
 */
export function disconnectWallet() {
    // Reset account and network information
    document.getElementById('accountAddress').textContent = '--';
    document.getElementById('networkName').textContent = '--';

    // Hide wallet info and show Connect button
    document.getElementById('walletInfo').style.display = 'none';
    document.getElementById('connectWallet').style.display = 'inline-block';
    document.getElementById('disconnectWallet').style.display = 'none';

    console.log("Wallet disconnected.");
}

/**
 * Get the network name based on the chain ID.
 * @param {string} chainId - The chain ID in hexadecimal.
 * @returns {string} - The name of the network.
 */
function getNetworkName(chainId) {
    const networks = {
        '0x1': 'Ethereum Mainnet',
        '0x3': 'Ropsten Testnet',
        '0x4': 'Rinkeby Testnet',
        '0x5': 'Goerli Testnet',
        '0x2a': 'Kovan Testnet',
        // Add more networks as needed
    };

    return networks[chainId] || 'Unknown Network';
}
