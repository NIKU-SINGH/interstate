import React, { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { useWatchlist } from './WatchlistContext';
import type { Token } from '../utils/db';
import InterstatePopout from './InterstatePopout';

interface TokenImageProps {
  token: Token;
  size?: number;
  className?: string;
}

export default function TokenImage({ token, size = 32, className = '' }: TokenImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const isWatched = isInWatchlist(token.mint);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click events
    if (isWatched) {
      removeFromWatchlist(token.mint);
    } else {
      addToWatchlist(token);
    }
  };

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: 'inline-block' }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-yellow-400 bg-neutral-800 cursor-pointer"
      >
        <img
          src={token.logo}
          alt={token.name}
          width={size}
          height={size}
          className="h-8 w-8 object-cover"
        />
      </div>
      {/* Star overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <button
          onClick={handleWatchlistClick}
          className="text-xl transition-transform hover:scale-110"
        >
          {isWatched ? (
            <FaStar className="text-yellow-400" />
          ) : (
            <FaRegStar className="text-white hover:text-yellow-400" />
          )}
        </button>
      </div>

      <InterstatePopout
        open={isHovered}
        onClose={() => setIsHovered(false)}
        align="top-right"
        className="w-64 bg-red-700 border-4 border-yellow-400 rounded-xl shadow-2xl z-[99999] flex items-center justify-center"
        overlayClassName="bg-green-400 z-[99999]"
      >
        <div className="w-48 h-48 rounded-lg overflow-hidden bg-neutral-800 flex items-center justify-center border-2 border-neutral-700">
          <img
            src={token.logo}
            alt={token.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div style={{color: 'white', fontWeight: 'bold'}}>TEST: Popout is rendering!</div>
      </InterstatePopout>
    </div>
  );
}