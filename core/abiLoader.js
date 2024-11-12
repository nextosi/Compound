// abiLoader.js

// Utility function to normalize ABI names to match filenames
function normalizeABIName(abiName) {
    return abiName.replace(/ABI$/i, ''); // Remove 'ABI' suffix if present
}

// Import necessary ABIs for initial setup
import cometABI from '../abi/CometABI.json';
import erc20ABI from '../abi/ERC20.json';
import rewardsABI from '../abi/RewardsABI.json';
import governorBravoABI from '../abi/governorBravoABI.json';
import compTokenABI from '../abi/compTokenABI.json';
import bulkerABI from '../abi/BulkerABI.json';
import configuratorABI from '../abi/ConfiguratorABI.json';

// Cache object to store loaded ABIs
const abiCache = {
    CometABI: cometABI,
    ERC20: erc20ABI,
    RewardsABI: rewardsABI,
    GovernorBravoABI: governorBravoABI,
    CompTokenABI: compTokenABI,
    BulkerABI: bulkerABI,
    ConfiguratorABI: configuratorABI,
};

// Function to get an ABI by name, using cache for efficiency
export function getABI(abiName) {
    const normalizedABIName = abiName;
    if (abiCache[normalizedABIName]) {
        return abiCache[normalizedABIName];
    } else {
        console.error(`ABI for ${abiName} not found.`);
        return null;
    }
}

// Export specific ABIs for static imports
export {
    cometABI as CometABI,
    erc20ABI as ERC20,
    rewardsABI as RewardsABI,
    governorBravoABI as GovernorBravoABI,
    compTokenABI as CompTokenABI,
    bulkerABI as BulkerABI,
    configuratorABI as ConfiguratorABI,
};

// Optional: Load ABI dynamically if not imported statically
export async function loadABI(abiName) {
    const normalizedABIName = abiName;
    if (abiCache[normalizedABIName]) {
        return abiCache[normalizedABIName];
    }

    try {
        // Dynamically import the ABI file based on the ABI name
        const abiModule = await import(`../abi/${normalizedABIName}.json`);
        abiCache[normalizedABIName] = abiModule.default; // Cache the loaded ABI
        console.log(`Loaded and cached ABI: ${normalizedABIName}`);
        return abiModule.default;
    } catch (error) {
        console.error(`Error loading ABI: ${normalizedABIName}`, error);
        return null;
    }
}
