const DECIMAL = 8
const INITIAL_ANSWER = 300000000000
const LOCK_TIME = 180
const CONFIRMATIONS = 5

const developmentChains = ["hardhat", "local"]
const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    31337: {
        name: "nbn",
        ethUsdDataFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    }
}

module.exports = {
    DECIMAL,
    INITIAL_ANSWER,
    developmentChains,
    networkConfig,
    LOCK_TIME,
    CONFIRMATIONS
}