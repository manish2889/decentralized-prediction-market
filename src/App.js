import React, { useState, useEffect } from 'react';
import { initWeb3, predictionMarketContract } from './utils/web3';
import CreateMarket from './components/CreateMarket';
import MarketList from './components/MarketList';
import PredictionForm from './components/PredictionForm';
import './App.css';

const App = () => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isInitialized = false;
    const init = async () => {
      if (!isInitialized) {
        try {
          await initWeb3();
          await refreshMarkets();
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
        isInitialized = true;
      }
    };
    init();
  }, []);

  const refreshMarkets = async () => {
    try {
      if (!predictionMarketContract) {
        throw new Error("Contract not initialized");
      }
      const marketCount = await predictionMarketContract.methods.getMarketCount().call();
      const marketsData = await Promise.all(
        Array(parseInt(marketCount)).fill().map((_, i) =>
          predictionMarketContract.methods.getMarketDetails(i).call()
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
      setError('Failed to fetch markets. Please connect to your metamask and try again later.');
    }
  };

  const selectMarket = (index) => {
    setSelectedMarket(markets[index]);
    setSelectedMarketId(index);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Decentralized AI-Powered Prediction Market</h1>
      </header>
      <main className="app-main">
        <section className="market-creation">
          <h2>Create a New Market</h2>
          <CreateMarket refreshMarkets={refreshMarkets} />
        </section>
        <section className="market-list">
          <h2>Active Markets</h2>
          <MarketList markets={markets} selectMarket={selectMarket} />
        </section>
        {selectedMarket && (
          <section className="prediction-form">
            <h2>Make a Prediction</h2>
            <PredictionForm selectedMarket={selectedMarket} marketId={selectedMarketId} />
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
