require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();
require("@chainlink/env-enc").config();
// require("./tasks/deploy-fundMe"); // 引入自定义任务
// require(".tasks/interact-fundMe");
require("./tasks")

// 如果设置了 HTTP_PROXY, 配置全局代理
// if (process.env.HTTP_PROXY) {
//   const { setGlobalDispatcher, ProxyAgent } = require('undici'); // Node.js 18+ 内置
//   setGlobalDispatcher(new ProxyAgent(process.env.HTTP_PROXY));
// } // Hardhat 验证插件使用自己的 HTTP 客户端，不遵循 undici 的全局代理

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  sourcify: {
    enabled: true
  }
};
