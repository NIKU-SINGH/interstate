import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Token } from '../utils/db';

interface WatchlistContextType {
  watchlist: Token[];
  addToWatchlist: (token: Token) => void;
  removeFromWatchlist: (tokenAddress: string) => void;
  isInWatchlist: (tokenAddress: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<Token[]>([]);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (e) {
        console.error('Failed to parse watchlist from localStorage');
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (token: Token) => {
    setWatchlist(prev => {
      if (!prev.some(t => t.mint === token.mint)) {
        return [...prev, token];
      }
      return prev;
    });
  };

  const removeFromWatchlist = (tokenAddress: string) => {
    setWatchlist(prev => prev.filter(token => token.mint !== tokenAddress));
  };

  const isInWatchlist = (tokenAddress: string) => {
    return watchlist.some(token => token.mint === tokenAddress);
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
} 