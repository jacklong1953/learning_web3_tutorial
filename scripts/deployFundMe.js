const { ethers } = require("hardhat")
const isOnline = require("is-online")

/*
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

// 你的局域网代理地址（例如：http://192.168.1.100:8080）
const proxyUrl = "http://192.168.28.111:10811";
const agent = new HttpsProxyAgent(proxyUrl);

async function checkUrl(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, { agent }, (response) => {
            resolve(response.statusCode === 200);
        });

        request.on('error', (error) => {
            reject(error);
        });

        request.end();
    });
}
*/

async function main() {
    /*
    // 打印 isOnline 的类型
    console.log("Type of isOnline:", typeof isOnline);
    console.log("isOnline value:", isOnline);

    const online = await checkNetwork();
    if (!online) {
        console.error("Network is offline");
        return;
    }
    console.log("Network is online");

    try {
        const isAccessible = await checkUrl("https://etherscan.io/");
        console.log('URL is accessible:', isAccessible);
    } catch (error) {
        console.error('Error checking URL:', error);
    }

    return;
    */

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

    // return;

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
}

async function checkNetwork() {
    try {
        const online = await isOnline.default();
        if (online) {
            console.log("Network check passed");
            return true;
        }
        console.error("Network check failed");
        return false;
    } catch (error) {
        console.error("Network check error:", error);
        return false;
    }
}

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

main().then().catch((error) => {
    console.error(error)
    process.exit(1)
})