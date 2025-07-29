import React from 'react';
import InterstatePopout from './InterstatePopout';
import type { Token } from '../utils/db';

interface TokenPopoutProps {
  token: Token;
  open: boolean;
  onClose: () => void;
}

export default function TokenPopout({ token, open, onClose }: TokenPopoutProps) {
  return (
    <InterstatePopout
      open={open}
      onClose={onClose}
      align="top-right"
      className="w-64 bg-neutral-800 rounded-lg shadow-lg p-4"
    >
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <img
            src={token.logo}
            alt={token.name}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <h3 className="text-white font-medium">{token.name}</h3>
            <p className="text-neutral-400 text-sm">{token.symbol}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Price</span>
            <span className="text-white">${token.usd_price.toFixed(6)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">24h Change</span>
            <span className={token.price_percent_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}>
              {token.price_percent_change_24h >= 0 ? '+' : ''}{token.price_percent_change_24h.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Market Cap</span>
            <span className="text-white">${token.total_liquidity_usd.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </InterstatePopout>
  );
} 