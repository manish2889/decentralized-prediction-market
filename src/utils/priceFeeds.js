import Web3 from 'web3';

// ABI for Chainlink Price Feed
const aggregatorV3InterfaceABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

// Chainlink Price Feed addresses on Ethereum mainnet
const ETH_USD_FEED_ADDRESS = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';
const BTC_USD_FEED_ADDRESS = '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c';

// Initialize Web3 with the Alchemy Ethereum node URL
const web3 = new Web3('https://eth-mainnet.g.alchemy.com/v2/hXhQfjPGOQhoXyl3yAd0jfL88WodwAnf');

const getPrice = async (feedAddress) => {
  try {
    const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, feedAddress);
    const roundData = await priceFeed.methods.latestRoundData().call();
    console.log('Raw roundData:', roundData);
    const price = Number(roundData.answer) / 10**8; // Convert to Number and adjust decimals
    console.log('Calculated price:', price);
    return price.toFixed(2);
  } catch (error) {
    console.error(`Error fetching price from Chainlink oracle:`, error);
    throw error;
  }
};

export const getEthPrice = async () => {
  return await getPrice(ETH_USD_FEED_ADDRESS);
};

export const getBtcPrice = async () => {
  return await getPrice(BTC_USD_FEED_ADDRESS);
};
