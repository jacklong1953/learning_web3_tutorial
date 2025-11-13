const { task } = require("hardhat/config")

task("interact-fundme", "Interact with the FundMe contract")
    .addParam("addr", "The address of the FundMe contract")
    .setAction(async (taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    const fundMe = fundMeFactory.attach(taskArgs.addr)

    const [firstAccount, secondAccount] = await ethers.getSigners()
    const fundTxWithAccount1 = await fundMe.fund({ value: ethers.parseEther("0.05") })
    fundTxWithAccount1.wait()
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of FundMe contract: ${balanceOfContract.toString()}`)

    const fundTxWithAccount2 = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.05") })
    fundTxWithAcccount2.wait()
    const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of FundMe contract after second fund: ${balanceOfContractAfterSecondFund.toString()}`)

    const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address)
    const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address)
    console.log(`Balance of first account in FundMe: ${firstAccountBalanceInFundMe.toString()}`)
    console.log(`Balance of second account in FundMe: ${secondAccountBalanceInFundMe.toString()}`)
})

module.exports = {}