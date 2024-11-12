// tokens.js
/**
 * @file tokens.js
 * @description Centralizes all token-related configurations, including contract addresses, symbols, and decimals across multiple networks.
 * @version 1.2
 */

export const tokens = {
    // ====================================
    // === Governance Token (COMP) ========
    // ====================================
    'COMP': {
        address: {
            1: '0xc00e94Cb662C3520282E6f5717214004A7f26888',         // Ethereum Mainnet
            137: '0x1F9C2eC6d8F0DbC6A05bb214f2D73c1a80636dE1',       // Polygon
            42161: '0x354A6dA3fcde098F8389cad84b0182725c6C91dE',     // Arbitrum
            43114: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',     // Avalanche
            56: '0x4979f9A6B8B54BB124d03634cE7A3d6C6dD1d4D2'         // Binance Smart Chain
        },
        symbol: 'COMP',
        decimals: 18
    },

    // ====================================
    // === Stablecoins ====================
    // ====================================
    'USDC': {
        address: {
            1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48',         // Ethereum Mainnet
            137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',       // Polygon
            42161: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',     // Arbitrum
            43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',     // Avalanche
            43114_2: '0xA7D7079b0FEAD91F3e65f86E8915Cb59c1a4C664',    // Avalanche (USDC.e)
            56: '0x8ac76a51cc950d9822D68b83fe1Ad97B32Cd580d'         // Binance Smart Chain
        },
        symbol: 'USDC',
        decimals: 6
    },
    'USDT': {
        address: {
            1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',         // Ethereum Mainnet
            137: '0xc2132D05D31c914a87C6611C10748AaCB9b0cA92',       // Polygon
            42161: '0xFd086BC7CD5C481DCC9c85e11a3b1045cDe5f3C1',     // Arbitrum
            43114: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',     // Avalanche
            56: '0x55d398326f99059fF775485246999027B3197955'         // Binance Smart Chain
        },
        symbol: 'USDT',
        decimals: 6
    },
    'DAI': {
        address: {
            1: '0x6B175474E89094C44Da98b954EedeAC495271d0F',         // Ethereum Mainnet
            137: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',       // Polygon
            42161: '0xDA10009cBd5D07Dd0CeCc66161FC93D7c9000da1',     // Arbitrum
            43114: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',     // Avalanche
            56: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3'         // Binance Smart Chain
        },
        symbol: 'DAI',
        decimals: 18
    },

    // ====================================
    // === Wrapped Tokens =================
    // ====================================
    'WETH': {
        address: {
            1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',         // Ethereum Mainnet
            137: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',       // Polygon
            42161: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',     // Arbitrum
            43114: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',     // Avalanche
            56: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8'         // Binance Smart Chain
        },
        symbol: 'WETH',
        decimals: 18
    },
    'WBTC': {
        address: {
            1: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',         // Ethereum Mainnet
            137: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',       // Polygon
            42161: '0x2f2a2543b76a4166549f7aab2e75bef0dada6ff0',     // Arbitrum
            43114: '0x50b7545627a5162F82A992c33b87aDc75187B218',     // Avalanche
            56: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c'         // Binance Smart Chain
        },
        symbol: 'WBTC',
        decimals: 8
    },

    // ====================================
    // === Additional Tokens ==============
    // ====================================
    'MKR': {
        address: {
            1: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'          // Ethereum Mainnet
        },
        symbol: 'MKR',
        decimals: 18
    },
    'BAT': {
        address: {
            1: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF'          // Ethereum Mainnet
        },
        symbol: 'BAT',
        decimals: 18
    }
};
