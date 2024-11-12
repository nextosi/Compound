// governance.js

/**
 * @file governance.js
 * @description Core governance module that initializes and manages common functionalities.
 * @version 2.7
 */

// Import required modules and functions
import { getUserAccount, getChainId } from '../core/state.js';
import { getABI } from '../core/abiLoader.js';
import Web3 from 'web3';

// Import toastr if you're using it via a module system; otherwise, ensure it's included in your HTML
// import toastr from 'toastr';

// Define contract addresses per network
const contractAddresses = {
  1: { // Mainnet
    compTokenAddress: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    governorBravoAddress: '0xc0Da02939E1441F497fd74F78cE7Decb17B66529',
  },
  // Add other networks as needed
};

let web3;
if (typeof window !== 'undefined' && window.ethereum) {
  web3 = new Web3(window.ethereum);
} else {
  console.error('Web3 provider not found. Please install MetaMask or another Web3 wallet.');
}

// Governance Module
export const governance = {
  governorContract: null,
  compTokenContract: null,
  compTokenAddress: null,
  governorBravoAddress: null,
  userAccount: null,
  chainId: null,

  /**
   * Initialize Governance Module
   */
  initialize: async function () {
    console.log('Governance initialize function called.');
    try {
      // Get user account and chain ID
      this.userAccount = getUserAccount();
      this.chainId = getChainId();

      if (!this.userAccount || !this.chainId) {
        console.warn('User account or chain ID is not set.');
        return;
      }

      // Set contract addresses based on chain ID
      const addresses = contractAddresses[this.chainId];
      if (!addresses) {
        console.error('Contract addresses not found for the current network.');
        return;
      }
      this.compTokenAddress = addresses.compTokenAddress;
      this.governorBravoAddress = addresses.governorBravoAddress;

      // Load ABIs
      const governorABI = getABI('GovernorBravoABI');
      const compTokenABI = getABI('CompTokenABI');

      if (!governorABI || !compTokenABI) {
        console.error('Required ABIs not found.');
        return;
      }

      // Initialize contracts
      const checksumGovernorAddress = web3.utils.toChecksumAddress(this.governorBravoAddress);
      this.governorContract = new web3.eth.Contract(governorABI, checksumGovernorAddress);

      const checksumCompAddress = web3.utils.toChecksumAddress(this.compTokenAddress);
      this.compTokenContract = new web3.eth.Contract(compTokenABI, checksumCompAddress);

      // Fetch and display governance data
      await this.fetchGovernanceData();

      // Set up event listeners for governance-related UI elements
      this.setupEventListeners();

      // Listen for account changes to refresh governance data
      this.listenToAccountChanges();

      console.log('Governance module initialized successfully.');
    } catch (error) {
      console.error('Error initializing Governance module:', error);
      if (typeof toastr !== 'undefined') {
        toastr.error('Failed to initialize Governance module.');
      }
    }
  },

  /**
   * Fetch and display governance-related data
   */
  fetchGovernanceData: async function () {
    console.log('Fetching governance data...');
    try {
      // Fetch COMP balance directly from the contract
      const compBalance = await this.compTokenContract.methods.balanceOf(this.userAccount).call();
      const compFormatted = web3.utils.fromWei(compBalance.toString(), 'ether'); // Assuming COMP has 18 decimals

      const votingPower = await this.compTokenContract.methods.getCurrentVotes(this.userAccount).call();
      const votingPowerFormatted = web3.utils.fromWei(votingPower.toString(), 'ether'); // Assuming COMP has 18 decimals

      console.log(`COMP Balance: ${compFormatted}, Voting Power: ${votingPowerFormatted}`);

      // Update UI Elements
      const compBalanceElement = document.getElementById('compBalance');
      const votingPowerElement = document.getElementById('votingPower');

      if (compBalanceElement) {
        compBalanceElement.innerText = `${parseFloat(compFormatted).toFixed(4)} COMP`;
      } else {
        console.warn("Element with id 'compBalance' not found in HTML.");
      }

      if (votingPowerElement) {
        votingPowerElement.innerText = `${parseFloat(votingPowerFormatted).toFixed(4)} Voting Power`;
      } else {
        console.warn("Element with id 'votingPower' not found in HTML.");
      }

      // Show the governance section
      const governanceSection = document.getElementById('governanceSection');
      if (governanceSection) {
        governanceSection.style.display = 'block';
      } else {
        console.warn("Element with id 'governanceSection' not found in HTML.");
      }

      // Hide the loading spinner
      const loadingSpinner = document.getElementById('loadingSpinner');
      if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
      }

      // Fetch and display proposals
      if (typeof fetchProposal !== 'undefined' && fetchProposal.displayProposals) {
        await fetchProposal.displayProposals();
      } else {
        console.warn('fetchProposal module not available or displayProposals function missing.');
      }

      console.log('Governance data fetched successfully.');
    } catch (error) {
      console.error('Error fetching governance data:', error);
      if (typeof toastr !== 'undefined') {
        toastr.error('Failed to fetch governance data.');
      }
    }
  },

  /**
   * Set up event listeners for governance-related UI elements
   */
  setupEventListeners: function () {
    console.log('Setting up governance event listeners.');
    // Initialize other governance modules if they exist
    if (typeof createProposal !== 'undefined' && createProposal.setupEventListeners) {
      createProposal.setupEventListeners();
    } else {
      console.warn('createProposal module not available or setupEventListeners function missing.');
    }

    if (typeof delegate !== 'undefined' && delegate.setupEventListeners) {
      delegate.setupEventListeners();
    } else {
      console.warn('delegate module not available or setupEventListeners function missing.');
    }
  },

  /**
   * Listen for account changes to refresh governance data
   */
  listenToAccountChanges: function () {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        this.userAccount = accounts[0];
        await this.fetchGovernanceData();
      });

      window.ethereum.on('chainChanged', async (chainIdHex) => {
        this.chainId = parseInt(chainIdHex, 16);
        await this.initialize();
      });
    } else {
      console.warn('window.ethereum is not available.');
    }
  },

  /**
   * Utility function to shorten Ethereum addresses for display
   * @param {string} address - Full Ethereum address
   * @returns {string} - Shortened address (e.g., 0x1234...abcd)
   */
  shortenAddress: function (address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  },
};

// Initialize Governance Module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await governance.initialize();
});
