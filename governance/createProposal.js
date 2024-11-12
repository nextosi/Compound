// createProposal.js

/**
 * @file createProposal.js
 * @description Handles creating new proposals.
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

// Create Proposal Module
export const createProposalModule = {
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

    // Set up event listeners
    this.setupEventListeners();
  },

  /**
   * Set up event listeners for proposal creation
   */
  setupEventListeners: function () {
    const proposalForm = document.getElementById('proposalForm');
    if (proposalForm) {
      proposalForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const proposalData = this.getProposalDataFromForm(proposalForm);
        await this.create(proposalData);
      });
    } else {
      console.warn('Proposal form not found.');
    }
  },

  /**
   * Get proposal data from the form
   * @param {HTMLFormElement} form
   * @returns {Object}
   */
  getProposalDataFromForm: function (form) {
    // Extract data from form inputs
    // This is an example; adjust based on your form structure
    const targets = [form.querySelector('[name="target"]').value];
    const values = [form.querySelector('[name="value"]').value];
    const signatures = [form.querySelector('[name="signature"]').value];
    const calldatas = [form.querySelector('[name="calldata"]').value];
    const description = form.querySelector('[name="description"]').value;

    return {
      targets,
      values,
      signatures,
      calldatas,
      description,
    };
  },

  /**
   * Create a new proposal
   * @param {Object} proposalData - The data for the proposal
   */
  create: async function (proposalData) {
    try {
      // Show loading indicator if you have one
      // showLoading(true);

      await this.governorContract.methods
        .propose(
          proposalData.targets,
          proposalData.values,
          proposalData.signatures,
          proposalData.calldatas,
          proposalData.description
        )
        .send({ from: this.userAccount });

      if (typeof toastr !== 'undefined') {
        toastr.success('Proposal created successfully!');
      }

      // Refresh proposals if needed
      // await fetchProposal.displayProposals();

      // showLoading(false);
    } catch (error) {
      console.error('Error creating proposal:', error);
      if (typeof toastr !== 'undefined') {
        toastr.error('Failed to create proposal. Ensure you have enough voting power and the proposal parameters are correct.');
      }
      // showLoading(false);
    }
  },
};

// Initialize the module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await createProposalModule.initialize();
});
