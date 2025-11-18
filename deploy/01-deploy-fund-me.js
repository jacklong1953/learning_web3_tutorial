// function deployFunction(){
//     console.log("Deploying FundMe...")
// }

// modeule.exports.default = deployFunction

// module.exports = async(hre) => {
//     console.log("Deploying FundMe...")
//     const getNamdeAccounts = await hre.getNamdeAccounts
//     const deployments = await hre.deployments
// }

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { firstAccount } = (await getNamedAccounts())
    const { deploy } = deployments

    await deploy("FundMe", {
        from : firstAccount,
        args : [180],
        log : true
    })
    console.log("Deploying FundMe...")
}

module.exports.tags = ["all", "fundme"]