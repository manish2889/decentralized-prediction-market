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
      if (deployedNetwork) {
        predictionMarketContract = new web3.eth.Contract(
          PredictionMarketABI.abi,
          deployedNetwork.address
        );
      } else {
        console.error('Contract not deployed to detected network.');
        // Handle the error, maybe update UI to inform user
      }
    } catch (error) {
      console.error("User denied account access or wrong network");
      // Handle the error, maybe update UI to prompt user to connect
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
  } else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    // Handle the case where the user doesn't have web3 installed
  }
};

export { web3, predictionMarketContract, initWeb3 };
