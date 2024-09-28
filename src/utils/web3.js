import Web3 from 'web3';
import PredictionMarketABI from '../contracts/PredictionMarket.json';

let web3;
let predictionMarketContract;

const initWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = PredictionMarketABI.networks[networkId];
      predictionMarketContract = new web3.eth.Contract(
        PredictionMarketABI.abi,
        deployedNetwork && deployedNetwork.address,
      );
    } catch (error) {
      console.error("User denied account access");
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
  } else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
};

const getLatestPrices = async () => {
  if (!predictionMarketContract) {
    throw new Error("Contract not initialized");
  }
  const prices = await predictionMarketContract.methods.getLatestPrices().call();
  return {
    ethPrice: Web3.utils.fromWei(prices.ethPrice, 'ether'),
    btcPrice: Web3.utils.fromWei(prices.btcPrice, 'ether')
  };
};

export { web3, predictionMarketContract, initWeb3, getLatestPrices };
