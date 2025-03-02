import React, { useState } from 'react';
import { getPredictionMarketContract, getWeb3 } from '../utils/web3';
import { toast } from 'react-hot-toast';

const PredictionForm = ({ selectedMarket, marketId, onSuccess }) => {
  const [prediction, setPrediction] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prediction || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const web3 = await getWeb3();
      const contract = await getPredictionMarketContract();
      const accounts = await web3.eth.getAccounts();
      const amountInWei = web3.utils.toWei(amount, 'ether');
      
      await contract.methods.placeBet(marketId, prediction === 'yes').send({
        from: accounts[0],
        value: amountInWei,
      });

      toast.success('Prediction placed successfully!');
      setPrediction('');
      setAmount('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error placing prediction:', error);
      toast.error('Failed to place prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedMarket) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Selected Market
        </label>
        <div className="mt-1 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-900">{selectedMarket.question}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Your Prediction
        </label>
        <select
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
          disabled={loading}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="">Select your prediction</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Bet Amount (ETH)
        </label>
        <div className="mt-1">
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="0.1"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Placing Prediction...' : 'Place Prediction'}
      </button>
    </form>
  );
};

export default PredictionForm;