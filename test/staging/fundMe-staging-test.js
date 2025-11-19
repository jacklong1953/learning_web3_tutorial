const { ethers, deployments } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name) ? describe.skip :
describe("test fundme contract", async function () {
    // 定义全局变量
    let fundMe
    let firstAccount

    // 执行集成测试前，先部署合约
    beforeEach(async function () {
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        const fundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
    })

    it ("fund and getFund successfully", async function() {
        await fundMe.fund({value: ethers.parseEther("1")})
        await new Promise(resolve => setTimeout(resolve, 181 * 1000))

        //make sure we can get receipt
        const getFundTx = await fundMe.getFund()
        const getFundReceipt = await getFundTx.wait()

        expect(getFundReceipt).to.be.emit(fundMe, "fundWithdrawByOwner").withArgs(ethers.parseEther("1"))
    })

    it ("fund and refund successfully", async function() {
        await fundMe.fund({value: ethers.parseEther("0.1")})
        await new Promise(resolve => setTimeout(resolve, 181 * 1000))

        //make sure we can get receipt
        const refundTx = await fundMe.refund()
        const refundReceipt = await refundTx.wait()

        expect(refundReceipt).to.be.emit(fundMe, "refundByOwner").withArgs(firstAccount, ethers.parseEther("0.1"))
    })
    
})