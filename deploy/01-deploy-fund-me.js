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
    const firstAccount = (await getNamedAccounts()).firstAccount
    console.log("First account is ", firstAccount)
    console.log("Deploying FundMe...")
}