// healthFactor.js

/**
 * @file healthFactor.js
 * @description Calculates and displays the user's health factor using prices from priceData.js.
 * @version 1.4
 */

// Import required modules
import { getUserAccount, getChainId } from '../core/state.js';
import { getCompoundMarkets } from '../core/markets.js';
import { tokens } from '../core/tokens.js';
import { getCachedAccountData } from '../helpers/accountData.js';
import { getAssetPrices } from '../core/priceData.js';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';

// Initialize web3
let web3;
if (typeof window !== 'undefined' && window.ethereum) {
    web3 = new Web3(window.ethereum);
} else {
    console.error('Web3 provider not found. Please install MetaMask or another Web3 wallet.');
}

// Health Factor Module
export const healthFactorModule = {
    web3: web3,
    userAccount: null,
    chainId: null,
    assetPrices: {},

    /**
     * Initialize the health factor module
     */
    initialize: async function () {
        // Get user account and chain ID
        this.userAccount = getUserAccount();
        this.chainId = getChainId();

        if (!this.userAccount || !this.chainId) {
            console.warn('User account or chain ID is not set.');
            return;
        }

        // Get asset prices
        this.assetPrices = await getAssetPrices();

        // Calculate and display health factor
        await this.calculateHealthFactor();

        // Set up event listeners for data updates
        // Assume there are events or methods to listen for updates
    },

    /**
     * Calculate and display the health factor
     */
    calculateHealthFactor: async function () {
        try {
            const accountData = getCachedAccountData();
            if (!accountData) {
                console.warn('Account data not available.');
                return;
            }

            let totalCollateralValue = new BigNumber(0);
            let totalBorrowValue = new BigNumber(0);

            // Example: Fetch user supplies and calculate collateral value
            for (const [tokenSymbol, balance] of Object.entries(accountData.supplies || {})) {
                const tokenInfo = tokens[tokenSymbol];
                if (!tokenInfo) continue;

                const decimals = tokenInfo.decimals;
                const price = new BigNumber(this.assetPrices[tokenSymbol] || 0);

                const amount = new BigNumber(balance).multipliedBy(new BigNumber(10).pow(decimals));
                const value = amount.multipliedBy(price).dividedBy(new BigNumber(1e8));

                totalCollateralValue = totalCollateralValue.plus(value);
            }

            // Fetch user borrows and calculate borrow value
            for (const [tokenSymbol, balance] of Object.entries(accountData.borrows || {})) {
                const tokenInfo = tokens[tokenSymbol];
                if (!tokenInfo) continue;

                const decimals = tokenInfo.decimals;
                const price = new BigNumber(this.assetPrices[tokenSymbol] || 0);

                const amount = new BigNumber(balance).multipliedBy(new BigNumber(10).pow(decimals));
                const value = amount.multipliedBy(price).dividedBy(new BigNumber(1e8));

                totalBorrowValue = totalBorrowValue.plus(value);
            }

            // Calculate health factor
            let healthFactor;
            if (totalBorrowValue.gt(0)) {
                healthFactor = totalCollateralValue.dividedBy(totalBorrowValue).toNumber();
            } else {
                healthFactor = Infinity;
            }

            // Update UI
            const healthFactorElement = document.getElementById('healthFactor');
            if (healthFactorElement) {
                healthFactorElement.innerText = healthFactor === Infinity ? '∞' : healthFactor.toFixed(2);
            }

            // Update progress bar
            const progressBar = document.getElementById('healthProgressBar');
            if (progressBar) {
                const percentage = healthFactor === Infinity ? 100 : Math.min((healthFactor / 2) * 100, 100);
                progressBar.style.width = `${percentage}%`;
                progressBar.setAttribute('aria-valuenow', percentage);
            }

            // Display alerts if necessary
            const liquidationAlert = document.getElementById('liquidationAlert');
            if (healthFactor < 1 && liquidationAlert) {
                liquidationAlert.style.display = 'block';
            } else if (liquidationAlert) {
                liquidationAlert.style.display = 'none';
            }
        } catch (error) {
            console.error('Error calculating health factor:', error);
        }
    },
};

// Initialize the module when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await healthFactorModule.initialize();
});
