import React, { useEffect, useState } from 'react';
import { formatSmartNumber } from '~/utils/db';
import { getTradeHistoryByTokenAddress } from '~/utils/functions';
import type { TradeRow } from '~/utils/functions';
import type { Token } from '~/utils/db';
import useTradesWebSocket from '../../hooks/useTradesWebSocket';

function getAge(ts: string | number) {
  const now = Date.now();
  const t = typeof ts === 'string' ? new Date(ts).getTime() : ts;
  const diffMs = now - t;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  return `${diffMins}m`;
}

function shortAddr(addr: string) {
  if (!addr) return '';
  return addr.slice(0, 3) + '...' + addr.slice(-3);
}

function getAgeFromBlockTime(blockTime: string) {
  if (!blockTime) return '';
  return getAge(blockTime);
}

function isBuy(trade: any) {
  // If Sell.Currency.Symbol is WSOL, it's a Buy; if Buy.Currency.Symbol is WSOL, it's a Sell
  return trade?.trade_data?.Trade?.Sell?.Currency?.Symbol === 'WSOL';
}

function getAmount(trade: any) {
  // If Buy, show Buy.Amount; if Sell, show Sell.Amount
  return isBuy(trade)
    ? trade?.trade_data?.Trade?.Buy?.Amount
    : trade?.trade_data?.Trade?.Sell?.Amount;
}

function getTotalUSD(trade: any) {
  // If Buy, use Buy.PriceInUSD * Buy.Amount; if Sell, use Sell.PriceInUSD * Sell.Amount
  if (isBuy(trade)) {
    const amt = parseFloat(trade?.trade_data?.Trade?.Buy?.Amount || '0');
    const priceInUSD = parseFloat(trade?.trade_data?.Trade?.Buy?.PriceInUSD || '0');
    return amt * priceInUSD;
  } else {
    const amt = parseFloat(trade?.trade_data?.Trade?.Sell?.Amount || '0');
    const priceInUSD = parseFloat(trade?.trade_data?.Trade?.Sell?.PriceInUSD || '0');
    return amt * priceInUSD;
  }
}

function getTrader(trade: any) {
  // Use Transaction.Signature
  return trade?.trade_data?.Transaction?.Signature || '';
}

interface TradesProps {
  token: Token;
  trades?: any[];
}

const Trades: React.FC<TradesProps> = ({ token, trades }) => {
  const displayTrades = trades;

  return (
    <div className="w-full">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-neutral-400 border-b border-neutral-800">
            <th className="px-2 py-2 text-left">Age</th>
            <th className="px-2 py-2 text-left">Type</th>
            <th className="px-2 py-2 text-left">MC</th>
            <th className="px-2 py-2 text-left">Amount</th>
            <th className="px-2 py-2 text-left">Total USD</th>
            <th className="px-2 py-2 text-left">Trader</th>
          </tr>
        </thead>
        <tbody>
          {!trades ? (
            <tr><td colSpan={6} className="text-center py-6 text-neutral-500">Loading...</td></tr>
          ) : !displayTrades || displayTrades.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-6 text-neutral-500">No trades found.</td></tr>
          ) : (
            displayTrades.map((trade, idx) => {
              const type = isBuy(trade) ? 'Buy' : 'Sell';
              const amount = getAmount(trade);
              const totalUSD = getTotalUSD(trade);
              const age = getAgeFromBlockTime(trade?.trade_data?.Block?.Time || trade?.timestamp);
              const trader = getTrader(trade);
              return (
                <tr key={trader + idx} className="border-b border-neutral-800 hover:bg-neutral-800/60">
                  <td className="px-2 py-2">{age}</td>
                  <td className={`px-2 py-2 font-semibold ${type === 'Buy' ? 'text-emerald-400' : 'text-red-400'}`}>{type}</td>
                  <td className="px-2 py-2">-</td>
                  <td className="px-2 py-2">{formatSmartNumber(amount)}</td>
                  <td className={`px-2 py-2 font-semibold ${type === 'Buy' ? 'text-emerald-400' : 'text-red-400'}`}>{type === 'Buy' ? '+' : '-'}${formatSmartNumber(totalUSD)}</td>
                  <td className="px-2 py-2">
                    <a
                      href={`https://solscan.io/tx/${trader}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:underline"
                    >
                      {shortAddr(trader)}
                    </a>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Trades;