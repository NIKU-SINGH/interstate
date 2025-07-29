import React, { useEffect, useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import type { Token } from "../utils/db";
import InterstatePopout from './InterstatePopout';
import InterstateButton from './InterstateButton';
import { useWatchlist } from './WatchlistContext';
import { formatSmartNumber } from '../utils/db';
import { useRouter } from 'next/router';

interface WatchlistModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WatchlistModal({ open, onClose }: WatchlistModalProps) {
  const [show, setShow] = useState(false);
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!open && !show) return null;

  const handleTokenClick = (tokenAddress: string) => {
    router.push(`/trade/${tokenAddress}`);
    onClose();
  };

  return (
    <InterstatePopout open={open} onClose={onClose} align="center" className="bg-neutral-900 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative text-neutral-100">
      <InterstateButton variant="icon" size="sm" onClick={onClose} className="absolute top-3 right-3 text-xl"><span>×</span></InterstateButton>
      <div className="text-lg font-bold mb-4">Watchlist</div>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-800">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-400">Token</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-400">Market Cap</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-400">1h Volume</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-400">Liquidity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {watchlist.map((token) => (
              <tr key={token.mint} className="hover:bg-neutral-800/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTokenClick(token.mint)}>
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-yellow-400 bg-neutral-800">
                      <img
                        src={token.logo}
                        alt={token.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{token.name}</span>
                      <span className="text-xs text-neutral-400">{token.symbol}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">${formatSmartNumber(token.fully_diluted_value)}</td>
                <td className="px-4 py-3 text-sm">${formatSmartNumber(token.total_buy_volume_1h + token.total_sell_volume_1h)}</td>
                <td className="px-4 py-3 text-sm">${formatSmartNumber(token.total_liquidity_usd)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeFromWatchlist(token.mint)}
                    className="text-neutral-400 hover:text-yellow-400 transition-colors"
                  >
                    <FaStar className="text-lg" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {watchlist.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <FaRegStar className="text-4xl text-neutral-500 mb-4" />
            <div className="text-lg font-semibold mb-2">Your watchlist is empty</div>
            <div className="text-neutral-400 text-sm text-center max-w-xs">
              Add tokens to your watchlist by clicking the star icon on any token page
            </div>
          </div>
        )}
      </div>
    </InterstatePopout>
  );
} 