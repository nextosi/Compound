// transactionHistory.js

/**
 * @file transactionHistory.js
 * @description Tracks and displays user transaction history by fetching events directly from the blockchain.
 * @version 2.2
 */

// Import required modules
import { getUserAccount, getChainId } from '../core/state.js';
import { getABI } from '../core/abiLoader.js';
import { getCompoundMarkets } from '../core/markets.js';

// Initialize web3
let web3;
if (typeof window !== 'undefined' && window.ethereum) {
  web3 = new Web3(window.ethereum);
} else {
  console.error(
    'Web3 provider not found. Please install MetaMask or another Web3 wallet.'
  );
}

// Transaction History Module
export const transactionHistoryModule = {
  web3: web3,
  userAccount: null,
  chainId: null,
  cometContracts: {},

  /**
   * Initialize the transaction history module
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

    // Fetch transaction history
    await this.fetchTransactionHistory();
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
        const checksumAddress = web3.utils.toChecksumAddress(market.address);
        this.cometContracts[market.symbol] = new web3.eth.Contract(
          cometABI,
          checksumAddress
        );
      }
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  },

  /**
   * Fetch Transaction History by querying contract events
   */
  fetchTransactionHistory: async function () {
    try {
      const transactions = [];

      for (const cometContract of Object.values(this.cometContracts)) {
        // Fetch past events related to the user
        const fromBlock = 0; // Adjust this to limit the range
        const toBlock = 'latest';

        // Fetch all relevant events
        const eventNames = ['Supply', 'Withdraw', 'Transfer', 'Borrow', 'Repay'];

        for (const eventName of eventNames) {
          try {
            const events = await cometContract.getPastEvents(eventName, {
              filter: { user: this.userAccount }, // Adjust filter as needed
              fromBlock,
              toBlock,
            });

            transactions.push(...events);
          } catch (error) {
            console.warn(`Error fetching events for ${eventName}:`, error);
          }
        }
      }

      // Sort transactions by block number (descending)
      transactions.sort((a, b) => b.blockNumber - a.blockNumber);

      // Display transactions
      this.displayTransactions(transactions);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  },

  /**
   * Display Transactions in the UI
   * @param {Array} transactions - Array of event objects
   */
  displayTransactions: function (transactions) {
    const transactionContainer = document.getElementById('transactionHistory');
    if (!transactionContainer) {
      console.warn('Transaction history container not found.');
      return;
    }

    transactionContainer.innerHTML = ''; // Clear existing transactions

    transactions.forEach((event) => {
      const txHash = event.transactionHash;
      const blockNumber = event.blockNumber;
      const eventName = event.event;
      const eventValues = event.returnValues;

      web3.eth.getBlock(blockNumber).then((block) => {
        const timestamp = block.timestamp * 1000;
        const txElement = document.createElement('div');
        txElement.className = 'transaction-item';
        txElement.innerHTML = `
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Hash:</strong> <a href="https://etherscan.io/tx/${txHash}" target="_blank">${txHash}</a></p>
          <p><strong>Block Number:</strong> ${blockNumber}</p>
          <p><strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString()}</p>
          <p><strong>Details:</strong> ${JSON.stringify(eventValues)}</p>
          <hr>
        `;
        transactionContainer.appendChild(txElement);
      });
    });
  },
};

// Initialize transaction history module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await transactionHistoryModule.initialize();
});
