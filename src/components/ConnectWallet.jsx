import React, { useState } from 'react';
import { connectWallet, switchToSepoliaNetwork } from '../utils/web3';
import { toast } from 'react-hot-toast';

const ConnectWallet = () => {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await connectWallet();
      await switchToSepoliaNetwork();
      window.location.reload();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connect your wallet
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          To use the Decentralized Prediction Market, please connect your MetaMask wallet
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <button
              onClick={handleConnect}
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Don't have MetaMask?
                  </span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Install MetaMask →
                </a>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Make sure to:</p>
              <ul className="mt-2 list-disc list-inside">
                <li>Install MetaMask</li>
                <li>Connect to Sepolia Test Network</li>
                <li>Have some Sepolia ETH for testing</li>
              </ul>
              <a
                href="https://sepoliafaucet.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-primary-600 hover:text-primary-500"
              >
                Get Sepolia ETH →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet; 