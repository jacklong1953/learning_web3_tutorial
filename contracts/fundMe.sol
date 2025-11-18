// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1. 创建一个收款函数
// 2. 记录投资人并且查看
// 3. 在锁定期内，达到目标值，生产商可以提款
// 4. 在锁定期内，没有达到目标值，投资人在锁定期以后退款

contract FundMe {
    AggregatorV3Interface public dataFeed;
    mapping(address => uint256) public fundersToAmount;
    uint256 constant MININUM_VALUE = 100 * 10 ** 18;
    uint256 constant TARGET = 1000 * 10 ** 18;
    uint256 deploymentTimeStamp;
    uint256 lockTime;

    address public owner;
    address erc20Addr;

    bool public getFundSuccess = false;

    constructor(uint256 _lockTime, address dataFeedAddr) {
        // sepolia testnet, data feed address: eth/usd
        // dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        dataFeed = AggregatorV3Interface(dataFeedAddr);
        owner = msg.sender;
        deploymentTimeStamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MININUM_VALUE, "Send more eth...");
        require(block.timestamp > deploymentTimeStamp + lockTime, "Window is closed.");
        fundersToAmount[msg.sender] += msg.value;
    }

    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
      // prettier-ignore
      (
        /* uint80 roundId */
        ,
        int256 answer,
        /*uint256 startedAt*/
        ,
        /*uint256 updatedAt*/
        ,
        /*uint80 answeredInRound*/
      ) = dataFeed.latestRoundData();
      return answer;
    }

    function convertEthToUsd(uint256 ethAmount) internal view returns (uint256) {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        // latestRoundData return usd pecision is 10 ** 8
        return ethPrice * ethAmount / (10 ** 8);
    }

    function transferOwnerShip(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function getFund() external windowClosed onlyOwner{
        require(convertEthToUsd(address(this).balance) >= TARGET, "Target is no reached.");
        
        // transfer: transfer ETH and revert if tx failed
        // payable(msg.sender).transfer(address(this).balance);

        // send: transfer ETH and return false if failed
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "Failed to send fund");

        // call: transfer ETH with data return bool and value of function
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "Tx failed.");
        getFundSuccess = true;
    }

    function refund() external windowClosed {
        require(address(this).balance < TARGET, "Target is reached.");
        require(fundersToAmount[msg.sender] != 0, "There is no fund for you.");
        (bool success, ) = payable(msg.sender).call{value: fundersToAmount[msg.sender]}("");
        require(success, "Refund is failed.");
    }

    modifier windowClosed() {
        require(block.timestamp >= deploymentTimeStamp + lockTime, "Window is closed.");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "This function can be called by owner.");
        _;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner {
        erc20Addr = _erc20Addr;
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr, "You don't have permission to call this function.");
        fundersToAmount[funder] = amountToUpdate;
    }

}