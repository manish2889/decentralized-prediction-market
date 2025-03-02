import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { getWeb3, getPredictionMarketContract, getCurrentAccount, isMetaMaskInstalled, switchToSepoliaNetwork } from './utils/web3';
import CreateMarket from './components/CreateMarket';
import MarketList from './components/MarketList';
import PredictionForm from './components/PredictionForm';
import ConnectWallet from './components/ConnectWallet';
import './App.css';

const SEPOLIA_CHAIN_ID = import.meta.env.VITE_SEPOLIA_CHAIN_ID;

const App = () => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [contractError, setContractError] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (!isMetaMaskInstalled()) {
          setError('Please install MetaMask to use this application');
          return;
        }

        const web3 = await getWeb3();
        const currentAccount = await getCurrentAccount();
        
        // Check if we're on the correct network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== SEPOLIA_CHAIN_ID) {
          try {
            await switchToSepoliaNetwork();
          } catch (error) {
            setNetworkError(true);
            setError('Please switch to Sepolia Test Network');
            return;
          }
        }

        // Try to get the contract
        try {
          await getPredictionMarketContract();
        } catch (error) {
          console.error('Contract error:', error);
          setContractError(true);
          setError('Smart contract not found on this network. Please make sure you have deployed the contract to Sepolia.');
          return;
        }

        setAccount(currentAccount);
        setIsWalletConnected(true);
        await refreshMarkets();
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to initialize application');
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Setup event listeners for network and account changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => window.location.reload());
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setIsWalletConnected(false);
          setAccount(null);
        } else {
          setAccount(accounts[0]);
          window.location.reload();
        }
      });
    }

    return () => {
      // Cleanup event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', () => {});
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const refreshMarkets = async () => {
    try {
      const contract = await getPredictionMarketContract();
      const marketCount = await contract.methods.getMarketCount().call();
      const marketsData = await Promise.all(
        Array(parseInt(marketCount)).fill().map((_, i) =>
          contract.methods.getMarketDetails(i).call()
        )
      );
      setMarkets(marketsData.map(market => ({
        question: market[0],
        totalBets: market[1],
        resolved: market[2],
        outcome: market[3]
      })));
    } catch (error) {
      console.error('Error fetching markets:', error);
      if (error.message.includes('Contract not deployed')) {
        setContractError(true);
        setError('Smart contract not found. Please make sure you have deployed the contract to Sepolia.');
      } else {
        setError('Failed to fetch markets. Please ensure you are connected to the correct network.');
      }
    }
  };

  const selectMarket = (index) => {
    setSelectedMarket(markets[index]);
    setSelectedMarketId(index);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || networkError || contractError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-red-600 text-center">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium">{error}</h3>
            {networkError && (
              <button
                onClick={() => switchToSepoliaNetwork()}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Switch to Sepolia Network
              </button>
            )}
            {contractError && (
              <div className="mt-4 text-sm text-gray-600">
                <p>To fix this:</p>
                <ol className="list-decimal list-inside mt-2 text-left">
                  <li>Deploy your smart contract to Sepolia testnet</li>
                  <li>Update your contract ABI and address</li>
                  <li>Make sure you're connected to Sepolia network</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isWalletConnected) {
    return <ConnectWallet />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Decentralized Prediction Market
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Network: Sepolia
              </span>
              <span className="text-sm text-gray-500">
                Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900">Create a New Market</h2>
                  <CreateMarket refreshMarkets={refreshMarkets} />
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900">Active Markets</h2>
                  <MarketList markets={markets} selectMarket={selectMarket} />
                </div>
              </div>
            </div>

            {selectedMarket && (
              <div className="col-span-1">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900">Make a Prediction</h2>
                    <PredictionForm
                      selectedMarket={selectedMarket}
                      marketId={selectedMarketId}
                      onSuccess={refreshMarkets}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
