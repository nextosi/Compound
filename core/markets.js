// markets.js

// Import required modules and ABIs
import { getCompoundProxyAddress, getChainId } from './state.js';
import { getABI } from './abiLoader.js';
import Web3 from 'web3';

// Initialize Web3
let web3;
if (typeof window !== 'undefined' && window.ethereum) {
    web3 = new Web3(window.ethereum);
} else {
    console.error('Web3 provider not found. Please install MetaMask or another Web3 wallet.');
}

// Store market data in memory for easy access
let marketDataCache = {};

// Define supported Compound markets across networks
const compoundMarketsData = {
    1: [ // Ethereum Mainnet
        { symbol: 'cETH', address: '0x4Ddc2D193948926d02f9B1fE9e1daa0718270ED5' },
        { symbol: 'cDAI', address: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643' },
        { symbol: 'cUSDC', address: '0x39AA39c021dfbaE8faC545936693aC917d5E7563' },
        { symbol: 'cUSDT', address: '0xf650C3d88Cc8610c8dE9B9FDb833C838fFaAe96' },
        { symbol: 'cWBTC', address: '0xccF4429DB6322D5C611ee964527D42E5d685DD6a' },
        { symbol: 'cBAT', address: '0x6C8C6B02E7b2BE14d4fA6022dfd6dFc496dD9d70' },
        { symbol: 'cZRX', address: '0xB3319f5D18Bc0D84dd1b4825dcde5d5F7266D407' },
        { symbol: 'cUNI', address: '0x35A18000230DA775CAc24873d00Ff85BccdeD550' },
        { symbol: 'cCOMP', address: '0xBe0eB53F46cd790Cd13851d5EFf43D12404d33E8' }, // Note: cCOMP is not an official market; used placeholder
        { symbol: 'cMKR', address: '0x95b4EF2869EBd94BEb4eEE400a99824BF5DC325b' },
        { symbol: 'cLINK', address: '0xFAaDA5E06Dab1ac1b0a4D0f3f99814BDFB35875C' },
        { symbol: 'cREP', address: '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1' },
        { symbol: 'cTUSD', address: '0x12392f67bdf24fae0af363c24ac620a2f67dad86' },
        { symbol: 'cSUSHI', address: '0x4B0181102A0112A2ef11AbD0a0A33A58DcD090d3' },
        { symbol: 'cYFI', address: '0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946' },
        { symbol: 'cAAVE', address: '0x3FF0eA7D7b8dC1d72c4bE705d9B4608Bdf6Fe808' },
        { symbol: 'cSAI', address: '0xf5dce57282a584d2746faf1593d3121fcac444dc' }
    ],
    137: [ // Polygon
        { symbol: 'cMATIC', address: '0xd0753a2ba919ba9c0f969e6d28b5b77b8c3ca08e' }, // Placeholder address
        { symbol: 'cDAI', address: '0x1a13f4ca1d028320a707d99520abfefca3998b7f' },
        { symbol: 'cUSDC', address: '0x9719d867A500Ef117cC201206B8ab51e794d3F82' },
        { symbol: 'cUSDT', address: '0x5B6E2F8aBd073fCE9CE60d94b86c46cbbAcDb0F7' },
        { symbol: 'cWBTC', address: '0x7D36999a7cF585351dFd5e8b17109458D97ec120' },
        { symbol: 'cWETH', address: '0x27B4692eD7095e920A72b8D8B43a9eECF1A8AD09' }
    ],
    42161: [ // Arbitrum
        { symbol: 'cETH', address: '0x41B5844f4680a8C38fBb695b7F9CFd1F64474a72' }, // Placeholder address
        { symbol: 'cUSDC', address: '0x3eFCF0aD408D542b4b47e3C343F265E4EBeA362E' },
        { symbol: 'cUSDT', address: '0x6f88e0b2e0f3fc5ab88812df5469e0943d2806e3' },
        { symbol: 'cWBTC', address: '0x8a1b86B8503d43147D74C6920a1fD0F1c9E00fF2' }
    ],
    43114: [ // Avalanche
        { symbol: 'cAVAX', address: '0xE519f4cd2803BA53A40E6377E82406e548418660' },
        { symbol: 'cUSDC', address: '0xA7D7079b0FEAD91F3E65f86E8915Cb59c1a4C664' },
        { symbol: 'cUSDT', address: '0xcE1bFFBD5374Da8dC0B4d147d0B8F446b8A2aD01' },
        { symbol: 'cDAI', address: '0x47AFa96Cdc9fAb46904A55a6ad4bf6660B53c38a' },
        { symbol: 'cWETH', address: '0x0A77230d17318075983913bC2145DB16C7366156' },
        { symbol: 'cWBTC', address: '0x2f5f0F2e0A5FfDA05bB90EAb3b49bF28b1Dca76a' }
    ],
    56: [ // Binance Smart Chain (BSC)
        { symbol: 'cBNB', address: '0xF70b9E631cF466B9B7Bf8e82F110b50d0160F0E1' },
        { symbol: 'cBUSD', address: '0x6f00384D5fA5F3F5cF0BbB90BaFE0b16D6B6fd75' },
        { symbol: 'cUSDT', address: '0x135669c2dcBd63F639582b313883F101a4497F76' },
        { symbol: 'cBTCB', address: '0xBbD1d908c7b0D2b32D0eE834D06C8f4A8e655329' },
        { symbol: 'cETH', address: '0x063f5bcb3a59870d4a5a15365E6e9bABfD5Ab14D' }
    ]
};

// Export function to get markets by chain ID
export function getCompoundMarkets(chainId) {
    return compoundMarketsData[chainId] || [];
}

// Fetch and display market data for all supported assets on the selected network
export async function fetchMarketData() {
    const compoundProxyAddress = getCompoundProxyAddress();
    const chainId = getChainId();

    if (!compoundProxyAddress || !chainId) {
        console.warn("Compound proxy address or chain ID is not set. Cannot fetch market data.");
        return;
    }

    try {
        const markets = getCompoundMarkets(chainId);
        marketDataCache = {}; // Reset cache for fresh data

        const cometABI = getABI('CometABI');
        if (!cometABI) {
            console.error('CometABI not found.');
            return;
        }

        const cometContract = new web3.eth.Contract(cometABI, compoundProxyAddress);

        for (const market of markets) {
            const assetData = await fetchMarketDetails(cometContract, market.address);
            marketDataCache[market.address] = { ...assetData, symbol: market.symbol };
        }

        updateMarketDisplay(marketDataCache);

    } catch (error) {
        console.error("Error fetching market data:", error);
    }
}

// Helper function to fetch market details for a specific asset address
async function fetchMarketDetails(cometContract, assetAddress) {
    try {
        // Adjust method names according to the actual ABI
        const supplyRatePerBlock = await cometContract.methods.supplyRatePerBlock().call();
        const borrowRatePerBlock = await cometContract.methods.borrowRatePerBlock().call();
        const totalSupplyWei = await cometContract.methods.totalSupply().call();
        const totalBorrowsWei = await cometContract.methods.totalBorrows().call();

        const supplyRate = (supplyRatePerBlock / 1e18) * 2102400 * 100; // Approximate annual rate
        const borrowRate = (borrowRatePerBlock / 1e18) * 2102400 * 100;

        const totalSupply = web3.utils.fromWei(totalSupplyWei, 'ether');
        const totalBorrows = web3.utils.fromWei(totalBorrowsWei, 'ether');

        return {
            supplyRate: supplyRate.toFixed(2),
            borrowRate: borrowRate.toFixed(2),
            totalSupply,
            totalBorrows,
        };
    } catch (error) {
        console.error("Error fetching market details for asset:", assetAddress, error);
        return {
            supplyRate: '--',
            borrowRate: '--',
            totalSupply: '--',
            totalBorrows: '--',
        };
    }
}

// Update the UI with the latest market data
function updateMarketDisplay(data) {
    for (const [assetAddress, market] of Object.entries(data)) {
        const marketElement = document.getElementById(`market-${assetAddress}`);
        if (marketElement) {
            marketElement.innerHTML = `
                <p>Symbol: ${market.symbol}</p>
                <p>Supply Rate: ${market.supplyRate} %</p>
                <p>Borrow Rate: ${market.borrowRate} %</p>
                <p>Total Supply: ${market.totalSupply} ETH</p>
                <p>Total Borrows: ${market.totalBorrows} ETH</p>
            `;
        } else {
            console.warn(`Market display element for ${assetAddress} not found.`);
        }
    }
}

// Export other necessary functions and variables if needed
export function getCachedMarketData() {
    return marketDataCache;
}
