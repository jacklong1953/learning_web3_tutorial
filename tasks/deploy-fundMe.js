const { task } = require("hardhat/config")

task("deploy-fundme", "Deploys the FundMe contract and verifies it on Etherscan").setAction(async (taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    console.log("Deploying FundMe...")
    const fundMe = await fundMeFactory.deploy(600)
    await fundMe.waitForDeployment()
    console.log(`FundMe deployed to ${fundMe.target}`)

    // Verify the contract
    if (hre.network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for 5 blocks to confirm transaction...")
        await fundMe.deploymentTransaction().wait(5)
        await verifyFundMe(fundMe.target, [600])
    } else {
        console.log("verification skipped")
    }
})

async function verifyFundMe(fundMeAddr, args) {
    try {
        await hre.run("verify:verify", {
            address: fundMeAddr,
            constructorArguments: args
        });
        console.log("Contract verification successful!");
    } catch (error) {
        console.error("Contract verification failed:", error);
    }
}

module.exports = {}

