// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PredictionMarket {
    struct Market {
        string question;
        uint256 totalBets;
        mapping(address => uint256) bets;
        bool resolved;
        bool outcome;
    }

    Market[] public markets;
    address public owner;

    AggregatorV3Interface internal ethPriceFeed;
    AggregatorV3Interface internal btcPriceFeed;

    constructor() {
        owner = msg.sender;
        // Ethereum price feed on Mainnet
        ethPriceFeed = AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);
        // Bitcoin price feed on Mainnet
        btcPriceFeed = AggregatorV3Interface(0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c);
    }

    function createMarket(string memory _question) public {
        Market storage newMarket = markets.push();
        newMarket.question = _question;
        newMarket.resolved = false;
    }

    function placeBet(uint256 _marketId, bool _prediction) public payable {
        require(_marketId < markets.length, "Market does not exist");
        require(!markets[_marketId].resolved, "Market already resolved");
        require(msg.value > 0, "Bet amount must be greater than 0");

        markets[_marketId].bets[msg.sender] += msg.value;
        markets[_marketId].totalBets += msg.value;
    }

    function resolveMarket(uint256 _marketId, bool _outcome) public {
        require(msg.sender == owner, "Only owner can resolve markets");
        require(_marketId < markets.length, "Market does not exist");
        require(!markets[_marketId].resolved, "Market already resolved");

        markets[_marketId].resolved = true;
        markets[_marketId].outcome = _outcome;
    }

    function claimReward(uint256 _marketId) public {
        require(_marketId < markets.length, "Market does not exist");
        require(markets[_marketId].resolved, "Market not yet resolved");
        require(markets[_marketId].bets[msg.sender] > 0, "No bet placed");

        uint256 betAmount = markets[_marketId].bets[msg.sender];
        bool userPrediction = markets[_marketId].bets[msg.sender] > 0;

        if (userPrediction == markets[_marketId].outcome) {
            uint256 reward = (betAmount * markets[_marketId].totalBets) / betAmount;
            payable(msg.sender).transfer(reward);
        }

        markets[_marketId].bets[msg.sender] = 0;
    }

    function getMarketCount() public view returns (uint256) {
        return markets.length;
    }

    function getMarketDetails(uint256 _marketId) public view returns (string memory, uint256, bool, bool) {
        require(_marketId < markets.length, "Market does not exist");
        Market storage market = markets[_marketId];
        return (market.question, market.totalBets, market.resolved, market.outcome);
    }

    function getLatestPrices() public view returns (int256 ethPrice, int256 btcPrice) {
        (, int256 ethPrice,,,) = ethPriceFeed.latestRoundData();
        (, int256 btcPrice,,,) = btcPriceFeed.latestRoundData();
        return (ethPrice, btcPrice);
    }
}
