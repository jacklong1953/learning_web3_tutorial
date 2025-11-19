// function deployFunction(){
//     console.log("Deploying FundMe...")
// }

const { network } = require("hardhat")
const { developmentChains, networkConfig, LOCK_TIME, CONFIRMATIONS } = require("../helper-hardhat-config")

// modeule.exports.default = deployFunction

// module.exports = async(hre) => {
//     console.log("Deploying FundMe...")
//     const getNamdeAccounts = await hre.getNamdeAccounts
//     const deployments = await hre.deployments
// }

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { firstAccount } = (await getNamedAccounts())
    const { deploy } = deployments

    let dataFeedAddr
    let confirmations
    if (developmentChains.includes(network.name)) {
        dataFeedAddr = (await deployments.get("MockV3Aggregator")).address
        confirmations = 0
    } else {
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed
        confirmations = CONFIRMATIONS
    }

    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [LOCK_TIME, dataFeedAddr],
        log: true,
        waitConfirmations: confirmations
    })
    // remove deployments directory or add --reset flag if you redeploy contract

    // Verify the contract
    if (hre.network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME, dataFeedAddr]
        })
    } else {
        console.log("Network is not sepolia, verification is skipped")
    }
}

module.exports.tags = ["all", "fundme"]