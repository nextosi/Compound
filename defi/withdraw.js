// withdraw.js

/**
 * @file withdraw.js
 * @description Handles withdraw actions for the DeFi dashboard.
 * @version 1.2
 */

// Import required modules
import { getUserAccount, getChainId } from '../core/state.js';
import { getABI } from '../core/abiLoader.js';
import { getCompoundMarkets } from '../core/markets.js';
import { tokens } from '../core/tokens.js';
import Web3 from 'web3';

// Initialize web3
let web3;
if (typeof window !== 'undefined' && window.ethereum) {
    web3 = new Web3(window.ethereum);
} else {
    console.error('Web3 provider not found. Please install MetaMask or another Web3 wallet.');
}

// Withdraw Module
export const withdrawModule = {
    web3: web3,
    userAccount: null,
    chainId: null,
    cometContracts: {},

    /**
     * Initialize the withdraw module
     */
    initialize: async function () {
        // Load ABI
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
            return;
        }

        // Initialize contracts
        await this.initializeContracts(cometABI);

        // Bind UI events
        this.bindUIEvents();
    },

    /**
     * Initialize Comet Contracts
     */
    initializeContracts: async function (cometABI) {
        try {
            // Initialize Comet Contracts for the current chain
            const currentChainId = this.chainId;
            const currentMarkets = getCompoundMarkets(currentChainId);
            if (!currentMarkets || currentMarkets.length === 0) {
                console.warn('No markets found for the current network.');
                return;
            }

            for (const market of currentMarkets) {
                const checksumAddress = web3.utils.toChecksumAddress(market.address);
                this.cometContracts[market.symbol] = new web3.eth.Contract(cometABI, checksumAddress);
            }
        } catch (error) {
            console.error('Error initializing contracts:', error);
        }
    },

    /**
     * Bind event listeners to the withdraw form
     */
    bindUIEvents: function () {
        const withdrawForms = document.querySelectorAll('.withdraw-form');
        withdrawForms.forEach((form) => {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.handleWithdraw(form);
            });
        });
    },

    /**
     * Handle the withdraw action
     * @param {HTMLFormElement} form - The withdraw form element
     */
    handleWithdraw: async function (form) {
        try {
            const marketSymbol = form.getAttribute('data-market-symbol');
            const amount = form.querySelector('.withdraw-amount').value;

            const cometContract = this.cometContracts[marketSymbol];
            if (!cometContract) {
                alert(`Comet contract for ${marketSymbol} not found.`);
                return;
            }

            // Get base token address
            const baseTokenAddress = await cometContract.methods.baseToken().call();
            const checksumBaseTokenAddress = web3.utils.toChecksumAddress(baseTokenAddress);

            // Get token info
            const tokenInfo = Object.values(tokens).find(
                (token) =>
                    token.address[this.chainId] &&
                    web3.utils.toChecksumAddress(token.address[this.chainId]) === checksumBaseTokenAddress
            );
            if (!tokenInfo) {
                alert('Token information not found for the base token.');
                return;
            }
            const decimals = tokenInfo.decimals;

            // Convert amount to smallest unit
            const amountInWei = web3.utils.toBN(
                web3.utils.toWei(amount, decimals === 18 ? 'ether' : 'mwei')
            );

            // Withdraw tokens
            await cometContract.methods
                .withdraw(baseTokenAddress, amountInWei.toString())
                .send({ from: this.userAccount });

            // Display success message
            console.log('Tokens withdrawn successfully.');

            // Refresh account data if necessary
            // You can implement account data refresh here
        } catch (error) {
            console.error('Error withdrawing tokens:', error);
        }
    },
};

// Initialize withdraw module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await withdrawModule.initialize();
});
