// static/js/core/main.js

// Import wallet functions
import { connectWallet, disconnectWallet } from './wallet.js';

/**
 * Initialize all event listeners for the application.
 */
export function initializeEventListeners() {
    console.log("Initializing event listeners...");

    // Connect Wallet Button
    const connectButton = document.getElementById('connectWallet');
    if (connectButton) {
        connectButton.addEventListener('click', async () => {
            console.log("Connect Wallet button clicked.");
            await connectWallet();
        });
    } else {
        console.warn("Connect Wallet button with ID 'connectWallet' not found.");
    }

    // Disconnect Wallet Button
    const disconnectButton = document.getElementById('disconnectWallet');
    if (disconnectButton) {
        disconnectButton.addEventListener('click', () => {
            console.log("Disconnect Wallet button clicked.");
            disconnectWallet();
        });
    } else {
        console.warn("Disconnect Wallet button with ID 'disconnectWallet' not found.");
    }
}

/**
 * Initialize the application.
 */
export function initializeApp() {
    console.log("Initializing App...");
    initializeEventListeners();
}

/**
 * Run the initialization once the window has fully loaded.
 */
window.addEventListener('load', () => {
    console.log("Window loaded.");
    initializeApp();
});
