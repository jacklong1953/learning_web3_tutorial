const { ethers, deployments } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("test fundme contract", async function () {
    // 定义全局变量
    let fundMe
    let firstAccount
    let secondAccount
    let FundMeSecondAccount
    let mockV3Aggregator

    // 执行每个测试前，先部署合约
    beforeEach(async function () {
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        secondAccount = (await getNamedAccounts()).secondAccount
        const fundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
        mockV3Aggregator = await deployments.get("MockV3Aggregator")

        // 获取一个合约对象
        // FundMeSecondAccount = await ethers.getContract("FundMe", secondAccount)
        const secondSigner = await ethers.getSigner(secondAccount); // 获取一个签名者对象
        FundMeSecondAccount = fundMe.connect(secondSigner) // 使用签名者对象连接合约
    })

    it("test if the owner is msg.sender", async function() {
        // const [firstAccount] = await ethers.getSigners()
        // const fundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe = await fundMeFactory.deploy(180)
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.owner()), firstAccount)
    })

    it("test if the dataFeed is asigned correctly", async function() {
        // const fundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe = await fundMeFactory.deploy(180)
        // await fundMe.waitForDeployment()
        assert.equal((await fundMe.dataFeed()), mockV3Aggregator.address)
    })

    it("window closed, value grater than minimum, fund failed", async function() {
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        // value is greater minimum value
        // 这里的revertedWith是chai的断言，表示期望这个操作会失败，并且失败的原因是"Window is closed."（这个错误信息是合约中定义的）
        await expect(fundMe.fund({value: ethers.parseEther("0.1")})).to.be.revertedWith("Window is closed.")
    })

    it("window open, value less than minimum, fund failed", async function() {
        await expect(fundMe.fund({value: ethers.parseEther("0.01")})).to.be.revertedWith("Send more eth...")
    })

    it("window open, value greater than minimum, fund success", async function() {
        await fundMe.fund({value: ethers.parseEther("0.1")})
        const balance = await fundMe.fundersToAmount(firstAccount)
        expect(balance).to.equal(ethers.parseEther("0.1"))
    })

    it("not owner, window closed, target reached, getFund failed", async function() {
        await fundMe.fund({value: ethers.parseEther("1")})

        await helpers.time.increase(200)
        await helpers.mine()

        await expect(FundMeSecondAccount.getFund()).to.be.revertedWith("This function can be called by owner.")
    })

    it ("window open, target reached", async function() {
        await fundMe.fund({value: ethers.parseEther("1")})
        await expect(fundMe.getFund()).to.be.revertedWith("Window is not closed.")
    })

    it ("window closed, target not reached", async function() {
        await fundMe.fund({value: ethers.parseEther("0.1")})

        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundMe.getFund()).to.be.revertedWith("Target is no reached.")
    })

    it ("window closed, target reached, getFund success", async function() {
        await fundMe.fund({value: ethers.parseEther("1")})

        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundMe.getFund()).to.emit(fundMe, "fundWithdrawByOwner").withArgs(ethers.parseEther("1"))
    })

    it ("window open, target not reached, funder has balance", async function() {
        await fundMe.fund({value: ethers.parseEther("0.1")})
        await expect(fundMe.refund()).to.be.revertedWith("Window is not closed.")
    })

    it ("window closed, target reached, funder has balance", async function() {
        await fundMe.fund({value: ethers.parseEther("3000")})

        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundMe.refund()).to.be.revertedWith("Target is reached.")
    })

    it ("window closed, target reached, funder has no balance", async function() {
        await fundMe.fund({value: ethers.parseEther("1")})

        await helpers.time.increase(200)
        await helpers.mine()

        await expect(FundMeSecondAccount.refund()).to.be.revertedWith("There is no fund for you.")
    })

    it ("window closed, target reached, funder has balance", async function() {
        await fundMe.fund({value: ethers.parseEther("0.1")})

        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundMe.refund()).to.emit(fundMe, "refundByOwner").withArgs(firstAccount, ethers.parseEther("0.1"))
    })
    
})