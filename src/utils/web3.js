import Web3 from 'web3';
import { toast } from 'react-hot-toast';
import PredictionMarketABI from '../contracts/PredictionMarket.json';

let web3Instance = null;
let contractInstance = null;

const SEPOLIA_CHAIN_ID = import.meta.env.VITE_SEPOLIA_CHAIN_ID;
const ALCHEMY_RPC_URL = import.meta.env.VITE_ALCHEMY_RPC_URL;
const CONTRACT_ADDRESS = '0xE00c55e3872622D68d198E3629241EbB9A6ac415';

const sepoliaNetworkParams = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'SEP',
    decimals: 18,
  },
  rpcUrls: [ALCHEMY_RPC_URL],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

export const switchToSepoliaNetwork = async () => {
  if (!window.ethereum) throw new Error('MetaMask is not installed');

  try {
    // Try to switch to Sepolia network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [sepoliaNetworkParams],
        });
      } catch (addError) {
        throw new Error('Failed to add Sepolia network to MetaMask');
      }
    } else {
      throw switchError;
    }
  }
};

export const getWeb3 = async () => {
  if (web3Instance) return web3Instance;

  if (!window.ethereum) {
    throw new Error('Please install MetaMask to use this application');
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Check and switch to Sepolia network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== SEPOLIA_CHAIN_ID) {
      await switchToSepoliaNetwork();
    }

    web3Instance = new Web3(window.ethereum);
    
    // Handle chain (network) and accounts change
    window.ethereum.on('chainChanged', (chainId) => {
      if (chainId !== SEPOLIA_CHAIN_ID) {
        toast.error('Please switch to Sepolia Test Network');
      }
      window.location.reload();
    });

    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        toast.error('Please connect to MetaMask');
      } else {
        window.location.reload();
      }
    });

    return web3Instance;
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('Please connect to MetaMask');
    }
    throw error;
  }
};

export const getPredictionMarketContract = async () => {
  if (contractInstance) return contractInstance;

  try {
    const web3 = await getWeb3();
    
    contractInstance = new web3.eth.Contract(
      PredictionMarketABI.abi,
      CONTRACT_ADDRESS
    );

    return contractInstance;
  } catch (error) {
    console.error('Error initializing contract:', error);
    throw error;
  }
};

export const getCurrentAccount = async () => {
  const web3 = await getWeb3();
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
};

export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined';
};

export const isConnected = async () => {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0;
  } catch (error) {
    return false;
  }
};

export const connectWallet = async () => {
  try {
    await getWeb3();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

const getLatestPrices = async () => {
  if (!contractInstance) {
    throw new Error("Contract not initialized");
  }
  const prices = await contractInstance.methods.getLatestPrices().call();
  return {
    ethPrice: Web3.utils.fromWei(prices.ethPrice, 'ether'),
    btcPrice: Web3.utils.fromWei(prices.btcPrice, 'ether')
  };
};

export { getLatestPrices };
