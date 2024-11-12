// borrow.js

/**
 * @file borrow.js
 * @description Handles borrow actions for the DeFi dashboard.
 * @version 1.2
 */

// Import required modules
import { getUserAccount, getChainId } from '../core/state.js';
import { getABI } from '../core/abiLoader.js';
import { getCompoundMarkets } from '../core/markets.js';
import { tokens } from '../core/tokens.js';

// Initialize web3
let web3;
if (typeof window !== 'undefined' && window.ethereum) {
  web3 = new Web3(window.ethereum);
} else {
  console.error(
    'Web3 provider not found. Please install MetaMask or another Web3 wallet.'
  );
}

// Borrow Module
export const borrowModule = {
  web3: web3,
  userAccount: null,
  chainId: null,
  cometContracts: {},

  /**
   * Initialize the borrow module
   */
  initialize: async function () {
    // Wait for ABIs to be loaded
    const cometABI = await getABI('CometABI');
    if (!cometABI) {
      console.error('CometABI not loaded.');
      return;
    }

    // Get user account and chain ID
    this.userAccount = getUserAccount();
    this.chainId = getChainId();

    if (!this.userAccount || !this.chainId) {
      console.warn('User account or chain ID is not set.');
      return;
    }

    // Initialize contracts
    await this.initializeContracts();

    // Bind UI events
    this.bindUIEvents();
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

      const cometABI = await getABI('CometABI');
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
    }
  },

  /**
   * Bind event listeners to the borrow form
   */
  bindUIEvents: function () {
    const borrowForms = document.querySelectorAll('.borrow-form');
    borrowForms.forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await this.handleBorrow(form);
      });
    });
  },

  /**
   * Handle the borrow action
   * @param {HTMLFormElement} form - The borrow form element
   */
  handleBorrow: async function (form) {
    try {
      const marketSymbol = form.getAttribute('data-market-symbol');
      const amount = form.querySelector('.borrow-amount').value;

      const cometContract = this.cometContracts[marketSymbol];
      if (!cometContract) {
        alert(`Comet contract for ${marketSymbol} not found.`);
        return;
      }

      // Get base token address
      const baseTokenAddress = await cometContract.methods.baseToken().call();

      // Get token info
      const tokenInfo = tokens[marketSymbol];
      if (!tokenInfo) {
        alert('Token information not found for the base token.');
        return;
      }

      const decimals = tokenInfo.decimals;
      const amountInWei = web3.utils.toBN(
        amount * Math.pow(10, decimals)
      );

      // Call the borrow method
      await cometContract.methods
        .borrow(amountInWei)
        .send({ from: this.userAccount });

      alert('Borrow successful!');
    } catch (error) {
      console.error('Error during borrow:', error);
      alert('Borrow failed. See console for details.');
    }
  },
};

// Initialize the borrow module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await borrowModule.initialize();
});
