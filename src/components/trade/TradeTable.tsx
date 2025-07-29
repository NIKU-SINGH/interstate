import React from 'react';
import { formatSmartNumber } from '~/utils/db';
import type { TradeRow } from '~/utils/functions';

function getAge(timestamp: string) {
  if (!timestamp) return '';
  const now = Date.now();
  const t = new Date(timestamp).getTime();
  const diffMs = now - t;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  return `${diffMins}m`;
}

function isBuy(trade: TradeRow) {
  return trade.type === 'Buy';
}

function getAmount(trade: TradeRow) {
  return trade.tokenAmount;
}

function getTotalUSD(trade: TradeRow) {
  return trade.usdValue;
}

function getMarketCap(trade: TradeRow) {
  return trade.marketCap;
}

function getTrader(trade: TradeRow) {
  return trade.transactionHash;
}

function shortAddr(addr: string) {
  if (!addr) return '';
  return addr.slice(0, 3) + '...' + addr.slice(-3);
}

interface TradeTableProps {
  trades: TradeRow[];
  loading: boolean;
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, loading }) => {
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
          {loading ? (
            <tr><td colSpan={6} className="text-center py-6 text-neutral-500">Loading...</td></tr>
          ) : !trades || trades.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-6 text-neutral-500">No trades found.</td></tr>
          ) : (
            trades.map((trade, idx) => {
              const type = isBuy(trade) ? 'Buy' : 'Sell';
              const amount = getAmount(trade);
              const totalUSD = getTotalUSD(trade);
              const age = getAge(trade.createdAt);
              const marketCap = getMarketCap(trade);
              const trader = getTrader(trade);
              return (
                <tr key={trader + idx} className="border-b border-neutral-800 hover:bg-neutral-800/60">
                  <td className="px-2 py-2">{age}</td>
                  <td className={`px-2 py-2 font-semibold ${type === 'Buy' ? 'text-emerald-400' : 'text-red-400'}`}>{type}</td>
                  <td className="px-2 py-2">{formatSmartNumber(Number(marketCap))}</td>
                  <td className="px-2 py-2">{formatSmartNumber(Number(amount))}</td>
                  <td className={`px-2 py-2 font-semibold ${type === 'Buy' ? 'text-emerald-400' : 'text-red-400'}`}>{type === 'Buy' ? '+' : '-'}${formatSmartNumber(Number(totalUSD))}</td>
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

export default TradeTable;
