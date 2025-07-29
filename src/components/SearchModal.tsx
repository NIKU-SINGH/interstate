"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { Token } from "~/utils/db";
import { formatSmartNumber } from "~/utils/db";
import {
  FaTrash,
  FaBolt,
  FaClock,
  FaDollarSign,
  FaChartLine,
  FaWater,
  FaTelegramPlane,
  FaRocket,
  FaFire,
  FaCrown,
  FaGraduationCap,
} from "react-icons/fa";
import InterstatePopout from "./InterstatePopout";
import {
  addToHistory,
  clearHistory,
  getHistory,
  type SearchHistoryItem,
} from "../utils/searchHistory";
import { LuChartNoAxesColumn } from "react-icons/lu";
import { TbDropletHalf2Filled } from "react-icons/tb";
import { CiUser, CiGlobe } from "react-icons/ci";

// Types
export type SortOption = "time" | "market_cap" | "volume_1h" | "liquidity";

export interface SearchFilters {
  isPumpSearch: boolean;
  isBonkSearch: boolean;
  isOg: boolean;
  onlyBonded: boolean;
}

export interface SearchParams {
  query: string;
  sortBy: SortOption;
  filters: SearchFilters;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (query: string) => void;
  onQueryChange?: (query: string) => void;
}

interface SearchState {
  query: string;
  results: Token[];
  loading: boolean;
  history: SearchHistoryItem[];
  sortBy: SortOption;
  filters: SearchFilters;
}

// Constants
const FILTER_OPTIONS = [
  {
    name: "Pump",
    key: "isPumpSearch" as keyof SearchFilters,
    icon: FaRocket,
    activeClasses: "border-green-500/60 bg-green-500/20 text-green-300",
  },
  {
    name: "Bonk",
    key: "isBonkSearch" as keyof SearchFilters,
    icon: FaFire,
    activeClasses: "border-blue-500/60 bg-blue-500/20 text-blue-300",
  },
  {
    name: "OG Mode",
    key: "isOg" as keyof SearchFilters,
    icon: FaCrown,
    activeClasses: "border-yellow-500/60 bg-yellow-500/20 text-yellow-300",
  },
  {
    name: "Graduated",
    key: "onlyBonded" as keyof SearchFilters,
    icon: FaGraduationCap,
    activeClasses: "border-red-500/60 bg-red-500/20 text-red-300",
  },
] as const;

const SORT_BY_OPTIONS = [
  { key: "time" as const, icon: FaClock },
  { key: "market_cap" as const, icon: FaChartLine },
  { key: "volume_1h" as const, icon: LuChartNoAxesColumn },
  { key: "liquidity" as const, icon: TbDropletHalf2Filled },
] as const;

const INITIAL_STATE: SearchState = {
  query: "",
  results: [],
  loading: false,
  history: [],
  sortBy: "time",
  filters: {
    isPumpSearch: false,
    isBonkSearch: false,
    isOg: false,
    onlyBonded: false,
  },
};

// Custom Hooks
const useDebounce = (
  callback: () => void,
  delay: number,
  deps: React.DependencyList,
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(callback, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, deps);
};

const useTokenSearch = () => {
  const controllerRef = useRef<AbortController | null>(null);

  const searchTokens = useCallback(
    async (params: SearchParams): Promise<Token[]> => {
      const { query, filters } = params;
      const trimmedQuery = query.trim();

      if (trimmedQuery.length < 3) {
        return [];
      }

      try {
        if (controllerRef.current) {
          controllerRef.current.abort();
        }

        const controller = new AbortController();
        controllerRef.current = controller;

        const isAddress =
          trimmedQuery.length >= 32 && /^[a-zA-Z0-9]+$/.test(trimmedQuery);
        const searchParam = isAddress ? "tokenaddress" : "name";

        // Build URL parameters (excluding sortBy since it's client-side only)
        const urlParams = new URLSearchParams();
        urlParams.set(searchParam, trimmedQuery);

        if (filters.isPumpSearch) urlParams.set("pump", "true");
        if (filters.isBonkSearch) urlParams.set("bonk", "true");
        if (filters.isOg) urlParams.set("og", "true");
        if (filters.onlyBonded) urlParams.set("bonded", "true");

        const url = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/search?${urlParams.toString()}`;

        const response = await fetch(url, {
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Normalize response data
        let tokens: Token[] = [];
        if (Array.isArray(data?.results)) {
          tokens = data.results;
        } else if (Array.isArray(data?.result)) {
          tokens = data.result;
        } else if (Array.isArray(data)) {
          tokens = data;
        } else if (data?.result) {
          tokens = [data.result];
        } else if (data) {
          tokens = [data];
        }

        return tokens;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw error;
        }
        console.error("Token search error:", error);
        throw error;
      }
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return { searchTokens };
};

// Client-side sorting function
const sortTokens = (tokens: Token[], sortBy: SortOption): Token[] => {
  const sorted = [...tokens];

  switch (sortBy) {
    case "market_cap":
      return sorted.sort((a, b) => {
        const aValue =
          a.total_fully_diluted_valuation || a.fully_diluted_value || 0;
        const bValue =
          b.total_fully_diluted_valuation || b.fully_diluted_value || 0;
        return bValue - aValue;
      });
    case "volume_1h":
      return sorted.sort((a, b) => {
        const aVolume =
          (a.total_buy_volume_24h || 0) + (a.total_sell_volume_24h || 0);
        const bVolume =
          (b.total_buy_volume_24h || 0) + (b.total_sell_volume_24h || 0);
        return bVolume - aVolume;
      });
    case "liquidity":
      return sorted.sort((a, b) => {
        const aLiq = a.total_liquidity_usd || 0;
        const bLiq = b.total_liquidity_usd || 0;
        return bLiq - aLiq;
      });
    case "time":
    default:
      return sorted; // Keep original order for time-based sorting
  }
};

// Component: Filter Button
const FilterButton: React.FC<{
  option: (typeof FILTER_OPTIONS)[number];
  isActive: boolean;
  onClick: () => void;
}> = ({ option, isActive, onClick }) => {
  const IconComponent = option.icon;
  const baseClasses =
    "flex cursor-pointer items-center gap-1 rounded border px-3 py-1 transition select-none";
  const inactiveClasses =
    "border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/40";

  return (
    <button
      className={`${baseClasses} ${isActive ? option.activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      <IconComponent className="h-3 w-3" />
      {option.name}
    </button>
  );
};

// Component: Sort Button
const SortButton: React.FC<{
  option: (typeof SORT_BY_OPTIONS)[number];
  isActive: boolean;
  onClick: () => void;
}> = ({ option, isActive, onClick }) => {
  const IconComponent = option.icon;
  const baseClasses =
    "flex cursor-pointer items-center justify-center rounded border p-1.5 transition select-none";
  const activeClasses = "border-blue-500/60 bg-blue-500/20 text-blue-300";
  const inactiveClasses =
    "border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/40";

  return (
    <button
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      onClick={onClick}
      title={option.key.replace("_", " ").toUpperCase()}
    >
      <IconComponent className="size-3" />
    </button>
  );
};

// Component: Token Item
const TokenItem: React.FC<{
  token: Token | SearchHistoryItem;
  onSelect: (token: Token | SearchHistoryItem) => void;
  type: "result" | "history";
}> = ({ token, onSelect, type }) => {
  const mc = formatSmartNumber(
    token.total_fully_diluted_valuation ||
      (token as Token).fully_diluted_value ||
      0,
  );
  const vol = formatSmartNumber(
    (token.total_buy_volume_24h || 0) + (token.total_sell_volume_24h || 0),
  );
  const liq = formatSmartNumber(token.total_liquidity_usd || 0);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(token.mint);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(token);
  };

  return (
    <li
      className="flex cursor-pointer items-center justify-between gap-4 rounded px-3 py-3 text-sm transition-colors hover:bg-neutral-800/30"
      onClick={() => onSelect(token)}
    >
      <div className="flex w-48 items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {token.logo ? (
            <img
              src={token.logo}
              alt={token.symbol}
              className="h-14 w-14 rounded-lg border border-teal-400/40 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-teal-400/40 bg-neutral-800">
              <span className="text-sm font-bold text-neutral-400">
                {token.symbol?.charAt(0) || "?"}
              </span>
            </div>
          )}
          {/* Overlay icon */}
          <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-teal-400 bg-neutral-900">
            <span className="text-[9px] font-bold text-white">
              {type === "result" ? "S" : "R"}
            </span>
          </div>
        </div>

        {/* Token Info */}
        <div className="max-w-[200px] min-w-0">
          <div className="flex items-center gap-2">
            <span className="block truncate font-medium text-white">
              {token.symbol} {token.name}
            </span>
            <button
              onClick={handleCopyAddress}
              className="flex-shrink-0 text-neutral-400 transition-colors hover:text-neutral-300"
              title="Copy address"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-medium text-teal-400">
              {type === "result" ? "Live" : "3mo"}
            </span>
            <CiUser className="size-4" />
            <CiGlobe className="size-4" />
            <FaTelegramPlane className="size-4" />
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="flex h-full items-center gap-6 text-xs whitespace-nowrap">
        <span className="text-neutral-400">
          MC <span className="text-lg font-medium text-white">${mc}</span>
        </span>
        <span className="text-neutral-400">
          V <span className="text-lg font-medium text-white">${vol}</span>
        </span>
        <span className="text-neutral-400">
          L <span className="text-lg font-medium text-white">${liq}</span>
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSelect}
        className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
        title="Select token"
      >
        <FaBolt className="h-4 w-4" />
      </button>
    </li>
  );
};

// Main Component
export default function SearchModal({
  open,
  onClose,
  onSubmit,
  onQueryChange,
}: SearchModalProps) {
  const [state, setState] = useState<SearchState>(INITIAL_STATE);
  const [rawResults, setRawResults] = useState<Token[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { searchTokens } = useTokenSearch();

  // Memoized sorted results
  const sortedResults = useMemo(() => {
    return sortTokens(rawResults, state.sortBy);
  }, [rawResults, state.sortBy]);

  // Update state helper
  const updateState = useCallback((updates: Partial<SearchState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Update filters helper
  const updateFilters = useCallback((filterUpdates: Partial<SearchFilters>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filterUpdates },
    }));
  }, []);

  // Handle query change with debounce
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      updateState({ query: newQuery });

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onQueryChange?.(newQuery);
      }, 300);
    },
    [updateState, onQueryChange],
  );

  // Debounced search effect
  useDebounce(
    () => {
      const trimmedQuery = state.query.trim();
      if (!open || trimmedQuery.length < 3) {
        setRawResults([]);
        updateState({ loading: false });
        return;
      }

      updateState({ loading: true });

      const searchParams: SearchParams = {
        query: trimmedQuery,
        sortBy: state.sortBy, // Not used by API, but kept for consistency
        filters: state.filters,
      };

      searchTokens(searchParams)
        .then((results) => {
          setRawResults(results);
          updateState({ loading: false });
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error("Search error:", error);
            setRawResults([]);
            updateState({ loading: false });
          }
        });
    },
    500,
    [state.query, state.filters, open],
  );

  // Handle submissions
  const handleSubmit = useCallback(
    (mint: string) => {
      const trimmed = mint.trim();
      if (!trimmed) return;
      onSubmit?.(trimmed);
      onClose();
    },
    [onSubmit, onClose],
  );

  const handleSelectToken = useCallback(
    (token: Token) => {
      const historyItem: SearchHistoryItem = {
        mint: token.mint,
        symbol: token.symbol,
        name: token.name,
        logo: token.logo,
        total_fully_diluted_valuation: token.total_fully_diluted_valuation,
        total_buy_volume_24h: token.total_buy_volume_24h,
        total_sell_volume_24h: token.total_sell_volume_24h,
        total_liquidity_usd: token.total_liquidity_usd,
      };

      addToHistory(historyItem);
      updateState({ history: getHistory() });
      handleSubmit(token.mint);
    },
    [updateState, handleSubmit],
  );

  const handleClearHistory = useCallback(() => {
    clearHistory();
    updateState({ history: [] });
  }, [updateState]);

  // Keyboard handlers
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit(state.query);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [handleSubmit, state.query, onClose],
  );

  // Initialize component on open
  useEffect(() => {
    if (open) {
      // Load history from localStorage immediately
      const historyFromStorage = getHistory();

      updateState({
        ...INITIAL_STATE,
        history: historyFromStorage,
      });
      setRawResults([]);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      updateState(INITIAL_STATE);
      setRawResults([]);
    }
  }, [open, updateState]);

  // Global escape key handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleGlobalKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [open, onClose]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!open) return null;

  const showResults = state.query.trim().length >= 3;
  const showHistory = state.query.trim().length === 0;

  return (
    <InterstatePopout
      open={open}
      onClose={onClose}
      align="center"
      overlayClassName="bg-[#090909]/80 backdrop-blur-[2px]"
      className="relative mx-4 flex h-[600px] w-full max-w-2xl -translate-y-8 flex-col rounded-md border border-neutral-700 bg-neutral-950 text-neutral-100 shadow-2xl"
    >
      {/* Filter and Sort Controls */}
      <div className="flex flex-shrink-0 items-center justify-between px-3 pt-3 text-xs font-medium">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {FILTER_OPTIONS.map((option) => (
            <FilterButton
              key={option.key}
              option={option}
              isActive={state.filters[option.key]}
              onClick={() =>
                updateFilters({ [option.key]: !state.filters[option.key] })
              }
            />
          ))}
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">Sort by</span>
          {SORT_BY_OPTIONS.map((option) => (
            <SortButton
              key={option.key}
              option={option}
              isActive={state.sortBy === option.key}
              onClick={() => updateState({ sortBy: option.key })}
            />
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative flex-shrink-0 border-b border-neutral-700 p-4">
        <input
          ref={inputRef}
          type="text"
          value={state.query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, ticker, or CA…"
          className="text-regular placeholder:text-textTertiary text-textPrimary flex h-full w-full flex-row items-center justify-center gap-[8px] bg-transparent text-[20px] outline-none placeholder:text-[20px]"
        />
        <span className="absolute top-1/2 right-4 -translate-y-1/2 rounded bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-300">
          Esc
        </span>
      </div>

      {/* Results Section */}
      {showResults && (
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="mb-2 flex flex-shrink-0 items-center justify-between">
            <span className="text-sm tracking-wider text-neutral-400">
              Results
            </span>
            {state.loading && (
              <span className="text-xs text-neutral-500">Loading…</span>
            )}
          </div>
          {sortedResults.length === 0 && !state.loading ? (
            <p className="text-sm text-neutral-500">No matches.</p>
          ) : (
            <ul className="flex-1 divide-y divide-neutral-800 overflow-y-auto pr-1 [scrollbar-color:rgb(82_82_82/0.5)_rgb(38_38_38/0.3)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-600/50 [&::-webkit-scrollbar-thumb]:hover:bg-neutral-500/70 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-neutral-800/30">
              {sortedResults.map((token) => (
                <TokenItem
                  key={token.mint}
                  token={token}
                  onSelect={handleSelectToken}
                  type="result"
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* History Section */}
      {showHistory && (
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="mb-2 flex flex-shrink-0 items-center justify-between">
            <span className="text-sm tracking-wider text-neutral-400">
              History
            </span>
            {state.history.length > 0 && (
              <button
                onClick={handleClearHistory}
                title="Clear history"
                className="text-neutral-500 transition-colors hover:text-red-400"
              >
                <FaTrash size={14} />
              </button>
            )}
          </div>
          {state.history.length === 0 ? (
            <p className="text-sm text-neutral-500">No recent searches.</p>
          ) : (
            <ul className="flex-1 divide-y divide-neutral-800 overflow-y-auto pr-1 [scrollbar-color:rgb(82_82_82/0.5)_rgb(38_38_38/0.3)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-600/50 [&::-webkit-scrollbar-thumb]:hover:bg-neutral-500/70 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-neutral-800/30">
              {state.history.map((token) => (
                <TokenItem
                  key={token.mint}
                  token={token}
                  onSelect={(t) => handleSubmit(t.mint)}
                  type="history"
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </InterstatePopout>
  );
}
