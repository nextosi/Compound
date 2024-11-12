// delegate.js

/**
 * @file delegate.js
 * @description Handles delegating votes.
 * @version 1.0
 */

// Import required modules
import { governance } from './governance.js';
import { getUserAccount } from '../core/state.js';
import { getABI } from '../core/abiLoader.js';
import Web3 from 'web3';

// Import toastr if needed
// import toastr from 'toastr';

// Initialize web3
let web3;
if (typeof window !== 'undefined' && window.ethereum) {
  web3 = new Web3(window.ethereum);
} else {
  console.error('Web3 provider not found. Please install MetaMask or another Web3 wallet.');
}

// Delegate Module
export const delegateModule = {
  userAccount: null,
  compTokenContract: null,

  /**
   * Initialize the delegate module
   */
  initialize: async function () {
    // Get user account
    this.userAccount = getUserAccount();

    if (!this.userAccount) {
      console.warn('User account not set.');
      return;
    }

    // Initialize COMP Token Contract
    this.compTokenContract = governance.compTokenContract;

    if (!this.compTokenContract) {
      console.error('COMP token contract not initialized in governance module.');
      return;
    }

    // Set up event listeners
    this.setupEventListeners();
  },

  /**
   * Set up event listeners for delegation
   */
  setupEventListeners: function () {
    const delegateForm = document.getElementById('delegateForm');
    if (delegateForm) {
      delegateForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const delegateeAddress = document.getElementById('delegateeAddress').value;
        await this.delegateVotes(delegateeAddress);
      });
    } else {
      console.warn('Delegate form not found.');
    }
  },

  /**
   * Delegate votes to another address
   * @param {string} delegatee - The address to delegate votes to
   */
  delegateVotes: async function (delegatee) {
    try {
      // Show loading indicator if you have one
      // showLoading(true);

      await this.compTokenContract.methods.delegate(delegatee).send({ from: this.userAccount });

      if (typeof toastr !== 'undefined') {
        toastr.success(`Votes delegated to ${delegatee} successfully!`);
      }

      // Update voting power if needed
      // await governance.fetchGovernanceData();

      // showLoading(false);
    } catch (error) {
      console.error('Error delegating votes:', error);
      if (typeof toastr !== 'undefined') {
        toastr.error('Failed to delegate votes. Ensure the address is correct and you have sufficient permissions.');
      }
      // showLoading(false);
    }
  },
};

// Initialize the module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await delegateModule.initialize();
});
