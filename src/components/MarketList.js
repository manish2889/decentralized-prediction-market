import React from 'react';
import { web3 } from '../utils/web3';  // Add this import

const MarketList = ({ markets, selectMarket }) => {
  return (
    <div className="market-list">
      {markets.length === 0 ? (
        <p className="no-markets">No markets available. Create one to get started!</p>
      ) : (
        markets.map((market, index) => (
          <div key={index} className="market-item">
            <button
              onClick={() => selectMarket(index)}
              className="market-button"
            >
              {market.question}
            </button>
            <div className="market-details">
              <span>Total Bets: {web3.utils.fromWei(market.totalBets, 'ether')} ETH</span>
              <span className={market.resolved ? 'resolved' : 'ongoing'}>
                {market.resolved ? 'Resolved' : 'Ongoing'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MarketList;
