import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { predictionMarketContract, web3 } from '../utils/web3';

const API_URL = 'https://llamatool.us.gaianet.network/v1';
const LLM_MODEL_NAME = 'llama';
const API_KEY = ''; // Empty string or any value

const PredictionForm = ({ selectedMarket, marketId }) => {
  const [prediction, setPrediction] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [ethPrice, setEthPrice] = useState(null);

  useEffect(() => {
    fetchEthPrice();
  }, []);

  const fetchEthPrice = async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      setEthPrice(response.data.ethereum.usd);
    } catch (error) {
      console.error('Error fetching ETH price:', error);
    }
  };

  const getAnalysis = async () => {
    try {
      const prompt = `
        Provide a brief analysis and potential outcomes for the following prediction market question: 
        "${selectedMarket.question}"
        
        Current Ethereum price: $${ethPrice}
        
        Consider market trends, current events, and potential impacts on the outcome.
      `;

      const response = await axios.post(`${API_URL}/chat/completions`, {
        model: LLM_MODEL_NAME,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
        },
      });
      setAnalysis(response.data.choices[0].message.content.trim());
    } catch (error) {
      console.error('Error getting analysis:', error);
    }
  };

  const placePrediction = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      await predictionMarketContract.methods.placeBet(marketId, prediction === 'true').send({
        from: accounts[0],
        value: web3.utils.toWei(betAmount, 'ether'),
      });
      setPrediction('');
      setBetAmount('');
    } catch (error) {
      console.error('Error placing prediction:', error);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold">{selectedMarket.question}</h3>
      {ethPrice && (
        <p className="text-sm text-gray-600 mb-2">Current ETH Price: ${ethPrice}</p>
      )}
      <button
        onClick={getAnalysis}
        className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Get AI Analysis
      </button>
      {analysis && (
        <div className="mt-2 p-2 border rounded">
          <h4 className="font-semibold">AI Analysis:</h4>
          <p>{analysis}</p>
        </div>
      )}
      <select
        value={prediction}
        onChange={(e) => setPrediction(e.target.value)}
        className="mt-2 w-full p-2 border rounded"
      >
        <option value="">Select your prediction</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
      <input
        type="number"
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
        className="mt-2 w-full p-2 border rounded"
        placeholder="Enter bet amount in ETH"
      />
      <button
        onClick={placePrediction}
        className="mt-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
      >
        Place Prediction
      </button>
    </div>
  );
};

export default PredictionForm;
