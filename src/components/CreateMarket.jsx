import React, { useState } from 'react';
import { getPredictionMarketContract, getWeb3 } from '../utils/web3';
import { toast } from 'react-hot-toast';

const CreateMarket = ({ refreshMarkets }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Please enter a valid question');
      return;
    }

    setLoading(true);
    try {
      const web3 = await getWeb3();
      const contract = await getPredictionMarketContract();
      const accounts = await web3.eth.getAccounts();

      await contract.methods.createMarket(question).send({ from: accounts[0] });
      toast.success('Market created successfully!');
      setQuestion('');
      refreshMarkets();
    } catch (error) {
      console.error('Error creating market:', error);
      toast.error('Failed to create market. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700">
          Market Question
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Enter your market question"
            disabled={loading}
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
        {loading ? 'Creating...' : 'Create Market'}
      </button>
    </form>
  );
};

export default CreateMarket;
