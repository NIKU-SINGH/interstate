import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaGlobe,
  FaUser,
  FaSearch,
  FaCheckCircle,
  FaQuestionCircle,
  FaPowerOff,
  FaTimes,
  FaCopy,
  FaCog,
  FaFilter,
} from "react-icons/fa";
import Image from "next/image";
import { useUser } from "../components/UserContext";
import Cookies from "js-cookie";
import QRCode from "qrcode";
import Header from "../components/Header";
import type { Token } from "~/utils/db";
import InterstateButton from "../components/InterstateButton";
import InterstateTable from "../components/InterstateTable";
import toast from "react-hot-toast";
import { formatSmartNumber } from "~/utils/db";
import { useQuickBuy } from "~/components/QuickBuyContext";
import QuickBuySettingsModal from '../components/QuickBuySettingsModal';
import { FilterProvider, useFilter } from '../components/FilterContext';
import InterstatePopout from '../components/InterstatePopout';
import FilterPopout from '../components/FilterPopout';
import throttle from 'lodash.throttle';
import usePaginatedTokensWebSocket from '../hooks/usePaginatedTokensWebSocket';
import { tradeBuy } from "../utils/api";
import { env } from "../env";

const navLinks = [
  { name: "Discover", href: "/" },
  { name: "Pulse", href: "/pulse" },
  { name: "Trackers", href: "#" },
  { name: "Perpetuals", href: "#" },
  { name: "Yield", href: "#" },
  { name: "Portfolio", href: "#" },
  { name: "Rewards", href: "#" },
];

function shuffleArray<T extends NonNullable<unknown>>(array: T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    //@ts-ignore
    arr[i] = arr[j];
    //@ts-ignore
    arr[j] = temp;
  }
  return arr;
}

// Add this type extension after importing Token
type TokenWithDexPaid = Token & { dexPaid?: boolean };

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  // Populate search state if we arrived with ?search= in the URL
  useEffect(() => {
    if (router.query.search && typeof router.query.search === "string") {
      setSearch(router.query.search as string);
    }
  }, [router.query.search]);
  const tokenMapRef = useRef<Map<string, TokenWithDexPaid>>(new Map());
  const [filteredTokens, setFilteredTokens] = useState<TokenWithDexPaid[]>([]);
  const [displayed, setDisplayed] = useState<TokenWithDexPaid[]>([]);
  const isDiscover = router.pathname === "/";
  const timeframes = ["5m", "1h", "6h", "24h"] as const;
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<(typeof timeframes)[number]>("24h");
  const { user, loading: userLoading, refreshUser } = useUser();
  const [selectedTab, setSelectedTab] = useState<"dex" | "trending">("trending");
  const [sortKey, setSortKey] = useState<"market_cap_total" | "liquidity" | "volume" | "txns" | "name">("volume");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [quickBuyAmount, setQuickBuyAmount] = useState(0.05);
  const { quickBuySettings, presets, setPresets, activePreset, setActivePreset } = useQuickBuy();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFilterPopoutOpen, setIsFilterPopoutOpen] = useState(false);
  const { filter, setFilter, resetFilter } = useFilter();
  const [showSkeleton, setShowSkeleton] = useState(true);

  // WebSocket token service
  const { 
    data: allTokens, 
    isConnected, 
    error: tokenError, 
    isReconnecting
  } = usePaginatedTokensWebSocket({
    filter: selectedTab === 'dex' ? 'new' : 'trending'
  });

  // Efficiently update tokenMapRef and trigger re-renders only for changed tokens
  useEffect(() => {
    if (Array.isArray(allTokens)) {
      let changed = false;
      const map = tokenMapRef.current;
      for (const token of allTokens as TokenWithDexPaid[]) {
        const prev = map.get(token.mint);
        if (!prev || JSON.stringify(prev) !== JSON.stringify(token)) {
          map.set(token.mint, token);
          changed = true;
        }
      }
      // Optionally, remove tokens that are no longer present
      const allAddresses = new Set((allTokens as TokenWithDexPaid[]).map(t => t.mint));
      for (const addr of Array.from(map.keys())) {
        if (!allAddresses.has(addr)) {
          map.delete(addr);
          changed = true;
        }
      }
      if (changed) {
        // Create a stable array for downstream use
        const arr = Array.from(map.values());
        setFilteredTokens(arr);
      }
    }
  }, [allTokens]);

  // Helper for min/max input change
  const handleMinMaxChange = (key: keyof typeof filter, value: string | number) => {
    setFilter({ ...filter, [key]: value });
  };

  useEffect(() => {
    console.log(sortKey);
  }, [sortKey]);

  // Filter tokens when search changes
  // Fetch from backend /search endpoint when the search term changes
  useEffect(() => {
    const trimmed = search.trim();

    // 1. Empty term ⇒ show everything we already have in memory
    if (!trimmed) {
      const arr = Array.from(tokenMapRef.current.values());
      setFilteredTokens(arr);
      setDisplayed(arr.slice(0, 10));
      return;
    }

    // 2. Decide if we search by name/symbol (<10 chars) or by address
    const isAddress = trimmed.length >= 10;
    const param = isAddress ? "tokenaddress" : "name";

    // In local dev, use Next.js API proxy to avoid CORS; in prod, hit service directly
    const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
    const baseURL = isLocalhost
      ? "/api/token-search"
      : env.NEXT_PUBLIC_TOKEN_SERVICE_URL || env.NEXT_PUBLIC_API_URL || env.NEXT_PUBLIC_BACKEND_URL || "";

    if (!baseURL) {
      console.error("Token service URL missing – check env variables.");
      return;
    }

    const url = isLocalhost
      ? `${baseURL}?${param}=${encodeURIComponent(trimmed)}`
      : `${baseURL}/search?${param}=${encodeURIComponent(trimmed)}`;

    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list: TokenWithDexPaid[] = Array.isArray(data?.result)
          ? data.result
          : Array.isArray(data)
          ? data
          : [];
        setFilteredTokens(list);
        setDisplayed(list.slice(0, 10));
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      });

    return () => controller.abort();
  }, [search]);

  const handleTimeframeClick = (tf: string) => {
    setSelectedTimeframe(tf as (typeof timeframes)[number]);
    setSortKey("volume");
    setSortDirection("desc");
    // Sort by volume for the new timeframe
    const arr = Array.from(tokenMapRef.current.values());
    const sorted = [...arr].sort((a, b) => {
      const aVol = (a[`total_buy_volume_${tf}`] || 0) + (a[`total_sell_volume_${tf}`] || 0);
      const bVol = (b[`total_buy_volume_${tf}`] || 0) + (b[`total_sell_volume_${tf}`] || 0);
      return bVol - aVol;
    });
    setDisplayed(sorted);
  };

  // QUICK BUY handler
  async function handleQuickBuy(token: Token) {
    if (!user) {
      return;
    }
    try {
      const data = await tradeBuy({
        tokenAddress: token.mint,
        amount: quickBuyAmount,
        mevProtection: presets[activePreset].quickBuySettings.mevMode === "off" ? 0 : 1
      }, user.bearerToken);
      toast.success(
        `Quick Buy successful! Bought ${data.amount} ${token.symbol}`,
      );
    } catch (e: any) {
      toast.error(e.message || "Quick Buy failed");
    }
  }

  useEffect(() => {
    if (selectedTab === "trending") {
      setSortKey("volume");
      setSortDirection("desc");
    }
  }, [selectedTab]);

  useEffect(() => {
    if (selectedTab === "trending") {
      const arr = Array.from(tokenMapRef.current.values());
      const sortedTokens = [...arr];
      sortedTokens.sort((a, b) => {
        const aVal = Number(a[sortKey]) || 0;
        const bVal = Number(b[sortKey]) || 0;
        if (sortDirection === "asc") {
          return aVal - bVal;
        } else {
          return bVal - aVal;
        }
      });
      setDisplayed(sortedTokens);
    } else {
      setDisplayed(filteredTokens.slice(0, 10));
    }
  }, [selectedTab, filteredTokens, sortKey, sortDirection]);

  // Sorting handler for table headers
  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  // When activePreset changes, update quickBuySettings to match preset
  useEffect(() => {
    if (presets && presets[activePreset]) {
      // Optionally, update quickBuySettings globally if needed
      // setQuickBuySettings(presets[activePreset].quickBuySettings);
    }
  }, [activePreset, presets]);

  useEffect(() => {
    setShowSkeleton(true);
    const timer = setTimeout(() => setShowSkeleton(false), 1500);
    return () => clearTimeout(timer);
  }, [selectedTab]);

  return (
    <>
      <Head>
        <title>Interstate Memeboard | Discover</title>
        <meta name="description" content="Interstate dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        {/* Header */}
        <Header search={search} setSearch={setSearch} />
        {/* Tab Navigation */}
        <div className="mx-auto my-4 flex flex-row items-center justify-between gap-6 px-20">
          <div className="flex max-w-7xl items-center gap-6">
            <button
              className={`text-lg font-semibold transition-colors ${selectedTab === "dex" ? "text-white" : "text-neutral-400"} cursor-pointer`}
              onClick={() => setSelectedTab("dex")}
            >
              DEX Screener
            </button>
            <button
              className={`text-lg font-semibold transition-colors ${selectedTab === "trending" ? "text-white" : "text-neutral-400"} cursor-pointer`}
              onClick={() => setSelectedTab("trending")}
            >
              Trending
            </button>
          </div>
          {/* Quick Buy pill UI */}
          <div className="flex flex-row items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
              <span className="text-xs text-neutral-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {/* Timeframes Row (for both tabs) */}
            <div className="flex max-w-7xl items-center gap-4 text-sm font-medium">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  className={
                    (selectedTimeframe === tf
                      ? "text-emerald-400 "
                      : "text-neutral-400 ") +
                    "cursor-pointer transition-colors"
                  }
                  onClick={() => handleTimeframeClick(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
            {/* Settings*/}
            <button className="group cursor-pointer text-neutral-400 transition-colors hover:text-white" onClick={() => setSettingsOpen(true)}>
              <FaCog className="transition-transform duration-300 group-hover:rotate-90" />
            </button>
            <button
              className="relative flex flex-row items-center rounded-full bg-neutral-900 px-4 py-1.5 shadow-inner border border-neutral-800 group mr-2 cursor-pointer"
              onClick={() => setIsFilterPopoutOpen(true)}
            >
              <FaFilter className="text-lg mr-2 text-white" />
              <span className="font-semibold text-white text-base">Filters</span>
              <svg className="ml-2 w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              <span className="absolute left-3 top-1 w-2 h-2 bg-blue-400 rounded-full"></span>
            </button>
            <div className="flex items-center flex-row rounded-full border border-neutral-800 px-4 py-1.5 shadow-inner">
              <span className="mr-2 text-sm text-neutral-400">
                Quick Buy
              </span>
              <input value={quickBuyAmount} onChange={(e) => setQuickBuyAmount(e.target.value as unknown as number)} className="text-sm text-neutral-200 focus:outline-none outline-none w-12" />
              <img
                src="https://axiom.trade/images/sol-fill.svg"
                alt="Solana"
                className="mr-4 h-5 w-5"
              />
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className={`mr-2 cursor-pointer font-semibold ${activePreset === i ? "text-emerald-300" : "text-neutral-400"}`}
                  onClick={() => setActivePreset(i)}
                >
                  {`P${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Popout */}
        <FilterPopout
          open={isFilterPopoutOpen}
          onClose={() => setIsFilterPopoutOpen(false)}
        />

        {/* Main Content */}
        <main className="mx-auto px-20 pb-10">
          {showSkeleton ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-12 w-full bg-neutral-800 animate-pulse rounded" />
              ))}
            </div>
          ) : !allTokens ? (
            <InterstateTable
              rows={[]}
              onQuickBuy={handleQuickBuy}
              sortKey={sortKey}
              sortDirection={sortDirection}
              setSort={handleSort}
              selectedTimeframe={selectedTimeframe}
              quickBuyAmount={quickBuyAmount}
              skeletonRowCount={10}
            />
          ) : tokenError ? (
            <div className="py-10 text-center text-red-400">
              {tokenError}
            </div>
          ) : displayed.length === 0 ? (
            <div className="py-10 text-center text-neutral-400">
              No tokens found.
            </div>
          ) : (
            <InterstateTable
              rows={displayed.map((token, i) => ({ token, i }))}
              onQuickBuy={handleQuickBuy}
              sortKey={sortKey}
              sortDirection={sortDirection}
              setSort={handleSort}
              selectedTimeframe={selectedTimeframe}
              quickBuyAmount={quickBuyAmount}
            />
          )}
        </main>
        <QuickBuySettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </>
  );
}
