import React from 'react';
import type { Token } from '~/utils/db';
import { formatSmartNumber } from '~/utils/functions';
import InterstateButton from '../InterstateButton';
import InterstateTooltip from '../InterstateTooltip';

interface TableRowProps {
  token: Token;
  i: number;
  selectedTimeframe: '5m' | '1h' | '6h' | '24h';
  onQuickBuy?: (token: Token) => void;
  quickBuyAmount?: number | string;
  animationState?: Record<string, string>;
  sortedRows?: { token: Token; i: number }[];
  onClick?: () => void;
  key?: string;
}

function formatPercentChange(val: number): string {
  if (val === 0) return '0.00';
  const sign = val > 0 ? '+' : '';
  return sign + formatSmartNumber(val);
}

export default function TableRow({ 
  token, 
  i, 
  selectedTimeframe, 
  onQuickBuy, 
  quickBuyAmount = 0.05,
  animationState = {},
  onClick 
}: TableRowProps) {
  return (
    <tr
      className={`cursor-pointer transition hover:bg-neutral-800/60 ${animationState[token.pair_address] || ''}`}
      onClick={onClick}
    >
      {/* Pair Info */}
      <td className="w-auto px-3 py-2 align-middle">
        <div className="flex items-center gap-2">
          <InterstateTooltip
            width={300}
            height={undefined}
            xOffset="ml-0"
            label={
              <div className="p-2">
                {/* Enlarged Picture (top, centered) */}
                <div className="mb-2 flex justify-center">
                  <img
                    src={token.logo}
                    alt={token.name}
                    width={200}
                    height={200}
                    className="border border-neutral-700"
                  />
                </div>

                {/* Token Details below image - Re-arranged to match image */}
                <div className="mb-2 text-center">
                  <div className="text-xl font-bold text-white">
                    {token.name}
                  </div>
                  <div className="text-base font-medium text-neutral-400 mb-2">
                    ({token.symbol})
                  </div>
                  <p className="text-lg font-semibold text-white">
                    ${formatSmartNumber(token.usd_price)} <span className={`text-base ${token.price_percent_change_1h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatPercentChange(token.price_percent_change_1h)}%</span>
                  </p>
                </div>
              </div>
            }
          >
            <img
              src={token.logo}
              alt={token.name}
              width={48}
              height={48}
              className="rounded"
            />
          </InterstateTooltip>
          <div>
            <div className="font-medium text-white">
              {token.name}
            </div>
            <div className="text-sm text-neutral-400">
              {token.symbol}
            </div>
          </div>
        </div>
      </td>

      {/* Market Cap */}
      <td className="px-3 py-2">
        <div className="font-medium text-white">
          ${formatSmartNumber(token.total_fully_diluted_valuation)}
        </div>
        <div className={`text-sm ${token.price_percent_change_1h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatPercentChange(token.price_percent_change_1h)}%
        </div>
      </td>

      {/* Liquidity */}
      <td className="px-3 py-2">
        <div className="font-medium text-white">
          ${formatSmartNumber(token.total_liquidity_usd)}
        </div>
      </td>

      {/* Volume */}
      <td className="px-3 py-2">
        <div className="font-medium text-white">
          ${formatSmartNumber(token.total_buy_volume_24h + token.total_sell_volume_24h)}
        </div>
      </td>

      {/* TXNS */}
      <td className="px-3 py-2">
        <div className="font-medium text-white">
          {formatSmartNumber(token.total_buys_24h + token.total_sells_24h)}
        </div>
        <div className="text-sm text-neutral-400">
          {formatSmartNumber(token.unique_wallets_24h)} buyers
        </div>
      </td>

      {/* Audit Log */}
      <td className="px-3 py-2">
        <div className="text-sm text-neutral-400">
          {token.description || 'No audit data'}
        </div>
      </td>

      {/* Action */}
      <td className="px-3 py-2">
        {onQuickBuy && (
          <InterstateButton
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onQuickBuy(token);
            }}
            className="w-full"
          >
            Quick Buy {quickBuyAmount} SOL
          </InterstateButton>
        )}
      </td>
    </tr>
  );
} 