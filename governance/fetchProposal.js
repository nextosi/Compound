// fetchProposal.js

/**
 * @file fetchProposal.js
 * @description Handles fetching and displaying existing proposals with pagination.
 * @version 2.8
 */

// Import required modules
import { governance } from './governance.js';
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

// Fetch Proposal Module
export const fetchProposal = {
  currentPage: 1,
  proposalsPerPage: 10,
  totalProposals: 0,
  totalPages: 0,

  /**
   * Initialize the module
   */
  initialize: async function () {
    try {
      // Get the total number of proposals
      const proposalCount = await governance.governorContract.methods.proposalCount().call();
      this.totalProposals = parseInt(proposalCount, 10);
      this.totalPages = Math.ceil(this.totalProposals / this.proposalsPerPage);
      this.currentPage = this.totalPages;

      // Set up event listeners for pagination controls
      this.setupPaginationControls();

      // Display proposals for the current page
      await this.displayProposals();
    } catch (error) {
      console.error('Error initializing proposals:', error);
      if (typeof toastr !== 'undefined') {
        toastr.error('Failed to initialize proposals.');
      }
    }
  },

  /**
   * Set up event listeners for pagination controls
   */
  setupPaginationControls: function () {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const currentPageDisplay = document.getElementById('currentPage');

    if (prevButton && nextButton && currentPageDisplay) {
      prevButton.addEventListener('click', async () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          await this.displayProposals();
        }
      });

      nextButton.addEventListener('click', async () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          await this.displayProposals();
        }
      });
    } else {
      console.warn('Pagination controls not found.');
    }
  },

  /**
   * Display existing proposals in the UI with pagination
   */
  displayProposals: async function () {
    try {
      const proposalsContainer = document.getElementById('governanceContent');
      if (!proposalsContainer) {
        console.warn('Governance content container not found.');
        return;
      }
      proposalsContainer.innerHTML = ''; // Clear existing proposals

      const startProposalId = this.totalProposals - (this.currentPage - 1) * this.proposalsPerPage;
      const endProposalId = Math.max(startProposalId - this.proposalsPerPage + 1, 1);

      // Fetch ProposalCreated events to get descriptions
      const events = await governance.governorContract.getPastEvents('ProposalCreated', {
        fromBlock: 0,
        toBlock: 'latest',
      });

      // Map proposalId to description
      const proposalDescriptions = {};
      events.forEach((event) => {
        const { id, description } = event.returnValues;
        proposalDescriptions[id.toString()] = description;
      });

      // Loop through proposals for the current page
      for (let i = startProposalId; i >= endProposalId; i--) {
        const proposal = await governance.governorContract.methods.proposals(i).call();
        const proposer = proposal.proposer;
        const eta = proposal.eta;
        const startBlock = proposal.startBlock;
        const endBlock = proposal.endBlock;
        const forVotes = web3.utils.fromWei(proposal.forVotes.toString(), 'ether');
        const againstVotes = web3.utils.fromWei(proposal.againstVotes.toString(), 'ether');
        const executed = proposal.executed;
        const canceled = proposal.canceled;
        const description = proposalDescriptions[i.toString()] || 'No Description Available';

        // Determine proposal status
        let status = 'Active';
        if (executed) status = 'Executed';
        if (canceled) status = 'Canceled';

        // Create proposal card
        const proposalCard = document.createElement('div');
        proposalCard.className = 'card mb-3 proposal-card';
        proposalCard.innerHTML = `
          <div class="card-header">
            Proposal #${i} by ${governance.shortenAddress(proposer)}
          </div>
          <div class="card-body">
            <p><strong>Start Block:</strong> ${startBlock}</p>
            <p><strong>End Block:</strong> ${endBlock}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>For Votes:</strong> ${forVotes}</p>
            <p><strong>Against Votes:</strong> ${againstVotes}</p>
            <p><strong>Description:</strong> ${description}</p>
          </div>
        `;

        // Make proposal card clickable
        proposalCard.style.cursor = 'pointer';
        proposalCard.addEventListener('click', () => {
          // Implement showProposalDetails if needed
          console.log(`Proposal #${i} clicked.`);
        });

        proposalsContainer.appendChild(proposalCard);
      }

      // Update pagination controls
      this.updatePaginationControls();
    } catch (error) {
      console.error('Error displaying proposals:', error);
      if (typeof toastr !== 'undefined') {
        toastr.error('Failed to display proposals.');
      }
    }
  },

  /**
   * Update the pagination controls (enable/disable buttons)
   */
  updatePaginationControls: function () {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const currentPageDisplay = document.getElementById('currentPage');

    if (prevButton && nextButton && currentPageDisplay) {
      currentPageDisplay.textContent = this.currentPage;

      prevButton.disabled = this.currentPage >= this.totalPages;
      nextButton.disabled = this.currentPage <= 1;
    }
  },
};

// Initialize the module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await fetchProposal.initialize();
});
