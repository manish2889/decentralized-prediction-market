import React from 'react';
import { getWeb3 } from '../utils/web3';

const MarketList = ({ markets, selectMarket }) => {
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-4">
      {markets.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No markets available</p>
      ) : (
        <div className="grid gap-4">
          {markets.map((market, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => selectMarket(index)}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {market.question}
              </h3>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Total Bets: {market.totalBets}</span>
                <span className={`px-2 py-1 rounded-full ${
                  market.resolved
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {market.resolved ? 'Resolved' : 'Active'}
                </span>
              </div>
              {market.resolved && (
                <div className="mt-2 text-sm text-gray-600">
                  Outcome: {market.outcome ? 'Yes' : 'No'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketList;
