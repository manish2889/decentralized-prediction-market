import React, { useState } from 'react';
import { predictionMarketContract, web3 } from '../utils/web3';

const CreateMarket = ({ refreshMarkets }) => {
  const [question, setQuestion] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateMarket = async () => {
    if (!question.trim()) {
      alert('Please enter a valid question for the market.');
      return;
    }

    setIsCreating(true);
    try {
      const accounts = await web3.eth.getAccounts();
      await predictionMarketContract.methods.createMarket(question).send({ from: accounts[0] });
      setQuestion('');
      refreshMarkets();
      alert('Market created successfully!');
    } catch (error) {
      console.error('Error creating market:', error);
      alert('Failed to create market. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="create-market">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter a question for the new market..."
        className="create-market-input"
      />
      <button
        onClick={handleCreateMarket}
        disabled={isCreating}
        className="create-market-button"
      >
        {isCreating ? 'Creating...' : 'Create Market'}
      </button>
    </div>
  );
};

export default CreateMarket;
