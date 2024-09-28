import React, { useState, useEffect } from 'react';
import { predictionMarketContract, web3 } from '../utils/web3';
import { getEthPrice, getBtcPrice } from '../utils/priceFeeds';

const PredictionForm = ({ selectedMarket, marketId }) => {
  const [ethPrice, setEthPrice] = useState('0.00');
  const [btcPrice, setBtcPrice] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [betAmount, setBetAmount] = useState('');

  useEffect(() => {
    const fetchPricesWithErrorHandling = async () => {
      try {
        await fetchPrices();
      } catch (error) {
        console.error('Error in fetchPricesWithErrorHandling:', error);
        if (error.name === 'QuotaExceededError') {
          console.log('Attempting to clear storage...');
          localStorage.clear();
          sessionStorage.clear();
          console.log('Storage cleared. Retrying...');
          await fetchPrices();
        } else {
          setPriceError('Failed to fetch prices. Please try again later.');
        }
      }
    };

    fetchPricesWithErrorHandling();
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setPriceError('');
      const [eth, btc] = await Promise.all([getEthPrice(), getBtcPrice()]);
      console.log('Fetched prices:', { eth, btc });
      setEthPrice(eth);
      setBtcPrice(btc);
    } catch (error) {
      console.error('Error fetching prices:', error);
      setPriceError('Failed to fetch current prices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const structuredAnalysis = generateStructuredAnalysis(selectedMarket.question, ethPrice, btcPrice);
      setAnalysis(structuredAnalysis);
    } catch (error) {
      console.error('Error generating analysis:', error);
      setAnalysis('Failed to generate analysis. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateStructuredAnalysis = (question, ethPrice, btcPrice) => {
    const btcPriceNum = parseFloat(btcPrice);
    const ethPriceNum = parseFloat(ethPrice);

    const isBtcQuestion = question.toLowerCase().includes('btc') || question.toLowerCase().includes('bitcoin');
    const targetPrice = isBtcQuestion ? 100000 : 10000; // Assuming $100k for BTC and $10k for ETH
    const currentPrice = isBtcQuestion ? btcPriceNum : ethPriceNum;
    const percentageToTarget = ((targetPrice / currentPrice) * 100 - 100).toFixed(2);

    return `
Analysis for the question: "${question}"

1. Market Overview:
   - Current ETH Price: $${ethPrice}
   - Current BTC Price: $${btcPrice}

2. Historical Context:
   ${isBtcQuestion 
     ? "Bitcoin's all-time high is approximately $69,000, reached in November 2021."
     : "Ethereum's all-time high is approximately $4,865, reached in November 2021."}
   The current price represents a ${percentageToTarget}% increase needed to reach the target price.

3. Factors Supporting the Prediction:
   - Increasing institutional adoption of cryptocurrencies
   - Potential approval of spot ETFs
   - Growing interest in cryptocurrencies as a hedge against inflation
   - ${isBtcQuestion ? "Bitcoin halving event expected in 2024" : "Ethereum's transition to Proof-of-Stake and potential deflation"}

4. Challenges to the Prediction:
   - Regulatory uncertainties in major markets
   - Competition from other cryptocurrencies and central bank digital currencies
   - Potential economic downturns affecting risk assets
   - ${isBtcQuestion ? "Environmental concerns about Bitcoin mining" : "Scalability challenges and high gas fees"}

5. Technical Analysis:
   A move to $${targetPrice.toLocaleString()} would require a significant price increase of ${percentageToTarget}% from the current level.

6. Market Sentiment:
   The crypto market has shown high volatility. Sentiment can shift rapidly based on news, regulations, and macroeconomic factors.

7. Conclusion:
   While reaching $${targetPrice.toLocaleString()} ${isBtcQuestion ? "this year" : "in the near future"} is not impossible, it would require substantial market momentum and favorable conditions. The current price would need to increase by ${percentageToTarget}% to reach this target. Investors should consider both the potential for high returns and the significant risks involved in such a prediction.

Disclaimer: This analysis is based on current market conditions and historical trends. Cryptocurrency markets are highly volatile and unpredictable. Always conduct your own research and consider your risk tolerance before making investment decisions.
    `;
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
      {loading && <p>Loading prices from Chainlink oracles...</p>}
      {priceError && <p className="text-red-500">{priceError}</p>}
      {!loading && !priceError && (
        <div className="mt-2">
          <p>Current ETH Price: ${ethPrice}</p>
          <p>Current BTC Price: ${btcPrice}</p>
        </div>
      )}
      <button
        onClick={getAnalysis}
        className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        disabled={isAnalyzing || loading}
      >
        {isAnalyzing ? 'Analyzing...' : 'Get Analysis'}
      </button>
      {isAnalyzing && <p className="mt-2">Generating analysis, please wait...</p>}
      {analysis && !isAnalyzing && (
        <div className="mt-2 p-2 border rounded">
          <h4 className="font-semibold">Analysis:</h4>
          <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
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