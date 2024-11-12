// vote.js

/**
 * @file vote.js
 * @description Handles voting on proposals.
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

// Vote Module
export const voteModule = {
  userAccount: null,
  governorContract: null,

  /**
   * Initialize the vote module
   */
  initialize: async function () {
    // Get user account
    this.userAccount = getUserAccount();

    if (!this.userAccount) {
      console.warn('User account not set.');
      return;
    }

    // Load ABI
    const governorABI = getABI('GovernorBravoABI');
    if (!governorABI) {
      console.error('Governor Bravo ABI not loaded.');
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
   * Cast a vote on a proposal
   * @param {number} proposalId - The ID of the proposal
   * @param {number} support - 0: Against, 1: For, 2: Abstain
   */
  castVote: async function (proposalId, support) {
    try {
      // Show loading indicator if you have one
      // showLoading(true);

      // Check if the user has voting power
      const votes = await governance.compTokenContract.methods.getCurrentVotes(this.userAccount).call();
      if (votes === '0') {
        if (typeof toastr !== 'undefined') {
          toastr.error('You have no voting power. Please delegate your COMP tokens first.');
        }
        // showLoading(false);
        return;
      }

      // Cast the vote
      await this.governorContract.methods.castVote(proposalId, support).send({ from: this.userAccount });

      if (typeof toastr !== 'undefined') {
        toastr.success('Vote cast successfully!');
      }

      // Refresh proposals and voting history if needed
      // await fetchProposal.displayProposals();
      // await fetchVotingHistory();

      // showLoading(false);
    } catch (error) {
      console.error('Error casting vote:', error);
      if (typeof toastr !== 'undefined') {
        toastr.error('Failed to cast vote. You might not have voting power or the voting period has ended.');
      }
      // showLoading(false);
    }
  },
};

// Initialize the vote module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await voteModule.initialize();
});
