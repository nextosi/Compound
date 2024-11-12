// supply.js

/**
 * @file supply.js
 * @description Handles supply actions for the DeFi dashboard.
 * @version 1.3
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

// Supply Module
export const supplyModule = {
    web3: web3,
    userAccount: null,
    chainId: null,
    cometContracts: {},
    tokenContracts: {},

    /**
     * Initialize the supply module
     */
    initialize: async function () {
        // Load ABIs
        const cometABI = getABI('CometABI');
        const erc20ABI = getABI('ERC20');
        if (!cometABI || !erc20ABI) {
            console.error('Required ABIs not loaded.');
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
        await this.initializeContracts(cometABI, erc20ABI);

        // Bind UI events
        this.bindUIEvents();
    },

    /**
     * Initialize Comet and Token Contracts
     */
    initializeContracts: async function (cometABI, erc20ABI) {
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

            // Initialize Token Contracts
            for (const [tokenSymbol, tokenInfo] of Object.entries(tokens)) {
                const tokenAddress = tokenInfo.address[this.chainId];
                if (tokenAddress) {
                    const checksumAddress = web3.utils.toChecksumAddress(tokenAddress);
                    this.tokenContracts[tokenSymbol] = new web3.eth.Contract(erc20ABI, checksumAddress);
                }
            }
        } catch (error) {
            console.error('Error initializing contracts:', error);
        }
    },

    /**
     * Bind event listeners to the supply form
     */
    bindUIEvents: function () {
        const supplyForms = document.querySelectorAll('.supply-form');
        supplyForms.forEach((form) => {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.handleSupply(form);
            });
        });
    },

    /**
     * Handle the supply action
     * @param {HTMLFormElement} form - The supply form element
     */
    handleSupply: async function (form) {
        try {
            const marketSymbol = form.getAttribute('data-market-symbol');
            const amount = form.querySelector('.supply-amount').value;

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
            const tokenSymbol = tokenInfo.symbol;

            const baseTokenContract = this.tokenContracts[tokenSymbol];

            // Get decimals
            const decimals = tokenInfo.decimals;
            const amountInWei = web3.utils.toBN(
                web3.utils.toWei(amount, decimals === 18 ? 'ether' : 'mwei')
            ); // Adjust units based on decimals

            // Approve tokens if necessary
            const allowance = await baseTokenContract.methods
                .allowance(this.userAccount, cometContract.options.address)
                .call();
            if (web3.utils.toBN(allowance).lt(amountInWei)) {
                await baseTokenContract.methods
                    .approve(cometContract.options.address, amountInWei.toString())
                    .send({ from: this.userAccount });
            }

            // Supply tokens
            await cometContract.methods
                .supply(baseTokenAddress, amountInWei.toString())
                .send({ from: this.userAccount });

            // Display success message
            console.log('Tokens supplied successfully.');

            // Refresh account data if necessary
            // You can implement account data refresh here
        } catch (error) {
            console.error('Error supplying tokens:', error);
        }
    },
};

// Initialize supply module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await supplyModule.initialize();
});
