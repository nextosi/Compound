// cancelProposal.js

/**
 * @file cancelProposal.js
 * @description Handles canceling proposals.
 * @version 1.0
 */

// Import required modules
import { governance } from './governance.js';
import { getUserAccount } from '../core/state.js';
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

// Cancel Proposal Module
export const cancelProposalModule = {
  userAccount: null,
  governorContract: null,

  /**
   * Initialize the module
   */
  initialize: async function () {
    // Get user account
    this.userAccount = getUserAccount();

    if (!this.userAccount) {
      console.warn('User account not set.');
      return;
    }

    // Initialize Governor Contract
    this.governorContract = governance.governorContract;

    if (!this.governorContract) {
      console.error('Governor contract not initialized in governance module.');
      return;
    }
  },

  /**
   * Cancel a proposal
   * @param {number} proposalId - The ID of the proposal to cancel
   */
  cancelProposal: async function (proposalId) {
    if (!confirm(`Are you sure you want to cancel Proposal #${proposalId}?`)) {
      return;
    }
    try {
      // Show loading indicator if you have one
      // showLoading(true);

      await this.governorContract.methods.cancel(proposalId).send({ from: this.userAccount });

      if (typeof toastr !== 'undefined') {
        toastr.success('Proposal canceled successfully!');
      }

      // Refresh proposals if needed
      // await fetchProposal.displayProposals();

      // showLoading(false);
    } catch (error) {
      console.error('Error canceling proposal:', error);
      if (typeof toastr !== 'undefined') {
        toastr.error('Failed to cancel proposal. Ensure you are the proposer or have the necessary permissions.');
      }
      // showLoading(false);
    }
  },
};

// Initialize the module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await cancelProposalModule.initialize();
});
