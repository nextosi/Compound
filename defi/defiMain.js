// defiMain.js

/**
 * @file defiMain.js
 * @description Initializes the DeFi dashboard and sets up event listeners.
 * @version 1.2
 */

// Import required modules
import { getUserAccount, getChainId } from '../core/state.js';
import { getABI } from '../core/abiLoader.js';
import { getCompoundMarkets } from '../core/markets.js';
import Web3 from 'web3';

// Initialize web3
let web3;
if (typeof window !== 'undefined' && window.ethereum) {
  web3 = new Web3(window.ethereum);
} else {
  console.error(
    'Web3 provider not found. Please install MetaMask or another Web3 wallet.'
  );
}

// DeFi Main module
export const defiMain = {
  web3: web3,
  userAccount: null,
  chainId: null,
  cometContracts: {},

  /**
   * Initialize the DeFi dashboard
   */
  initialize: async function () {
    // Wait for ABIs to be loaded
    const cometABI = getABI('CometABI');
    if (!cometABI) {
      console.error('CometABI not loaded.');
      return;
    }

    // Get user account and chain ID
    this.userAccount = getUserAccount();
    this.chainId = getChainId();

    if (!this.userAccount || !this.chainId) {
      console.warn('User account or chain ID is not set.');
      // Optionally, you can set up event listeners to wait for wallet connection
      // For now, we'll return
      return;
    }

    // Initialize contracts
    await this.initializeContracts();

    // Initialize modules and set up event listeners
    this.setupEventListeners();
    this.updateUI();
  },

  /**
   * Initialize Comet Contracts
   */
  initializeContracts: async function () {
    try {
      // Initialize Comet Contracts for the current chain
      const currentChainId = this.chainId;
      const currentMarkets = getCompoundMarkets(currentChainId);
      if (!currentMarkets || currentMarkets.length === 0) {
        console.warn('No markets found for the current network.');
        return;
      }

      const cometABI = getABI('CometABI');
      if (!cometABI) {
        console.error('CometABI not found.');
        return;
      }

      for (const market of currentMarkets) {
        this.cometContracts[market.symbol] = new web3.eth.Contract(
          cometABI,
          market.address
        );
      }
    } catch (error) {
      console.error('Error initializing contracts:', error);
      // Optionally, display error to the user
    }
  },

  /**
   * Set up event listeners
   */
  setupEventListeners: function () {
    // Assuming we have some event system, or we can set up listeners for account and chain changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        this.userAccount = accounts[0];
        this.updateUI();
      });

      window.ethereum.on('chainChanged', async (chainIdHex) => {
        this.chainId = parseInt(chainIdHex, 16);
        await this.initializeContracts(); // Re-initialize contracts for new chain
        this.updateUI();
      });
    }

    // Add other event listeners as needed
  },

  /**
   * Update the UI based on the wallet connection status
   */
  updateUI: function () {
    const defiDashboardContainer = document.getElementById(
      'defiDashboardContainer'
    );
    if (this.userAccount) {
      // Show DeFi dashboard
      if (defiDashboardContainer) {
        defiDashboardContainer.style.display = 'block';
      }
    } else {
      // Hide DeFi dashboard
      if (defiDashboardContainer) {
        defiDashboardContainer.style.display = 'none';
      }
    }
  },
};

// Initialize the module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await defiMain.initialize();
});
