import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Token } from "~/utils/db";
import Head from "next/head";
import Link from "next/link";
import {
  FaGlobe,
  FaUser,
  FaSearch,
  FaCheckCircle,
  FaQuestionCircle,
  FaPowerOff,
  FaTimes,
} from "react-icons/fa";
import dynamic from "next/dynamic";
import { useWallet } from "../../components/useWallet";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../../components/UserContext";
import PriceChartWidget from "../../components/PriceChartWidget";
import Header from "../../components/Header";
import TradeHeader from "../../components/trade/TradeHeader";
import TradeActionPanel from "../../components/trade/TradeActionPanel";
import TradeTabs from "../../components/trade/TradeTabs";
import { formatSmartNumber } from "~/utils/db";
import { tradeBuy, tradeSellPercentage, tradeSellExactAmount } from "../../utils/api";
import Trades from "../../components/trade/Trades";
import Positions from "~/components/trade/Positions";
import useSingleTokenWebSocket from "../../hooks/useSingleTokenWebSocket";

export default function TradePage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [chartHeight, setChartHeight] = useState(600);
  const { address, isConnected } = useWallet();
  const [sellPercentage, setSellPercentage] = useState("");
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [usdcAmount, setUsdcAmount] = useState("");
  const [memeAmount, setMemeAmount] = useState("");
  const [memePrice, setMemePrice] = useState<number | null>(null); // price in USDC per memecoin
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [tradeAmount, setTradeAmount] = useState<string>("");
  const amountOptions = ["0.1", "1", "10"];
  
  const { user, loading: userLoading } = useUser();
  const [selectedTab, setSelectedTab] = useState("Trades");
  const [search, setSearch] = useState("");

  // WebSocket per-token service
  const { token, trades, isConnected: wsConnected, error: wsError } = useSingleTokenWebSocket(
    typeof id === "string" ? id : undefined
  );

  useEffect(() => {
    // Show skeleton for at least 1.5s
    setShowSkeleton(true);
    const timer = setTimeout(() => setShowSkeleton(false), 1500);
    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    if (token || wsError) setLoading(false);
  }, [token, wsError]);

  useEffect(() => {
    if (token) {
      console.log('WebSocket token data:', token);
    }
  }, [token]);

  useEffect(() => {
    function handleResize() {
      setChartHeight(window.innerHeight - 220);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (showSkeleton) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-neutral-950 text-neutral-100">
        <Header search={search} setSearch={setSearch} />
        <div className="flex flex-1 flex-row w-full">
          <div className="flex-1 min-w-0 flex flex-col pb-4 border-r border-emerald-950">
            <div className="h-16 w-1/2 bg-neutral-800 animate-pulse rounded mb-4" />
            <div className="min-h-[500px] w-full bg-neutral-800 animate-pulse rounded mb-4" />
            <hr className="border-emerald-950" />
            <div className="h-12 w-1/3 bg-neutral-800 animate-pulse rounded mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-8 w-full bg-neutral-800 animate-pulse rounded" />
              ))}
            </div>
          </div>
          <div className="w-full max-w-md flex-shrink-0">
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-8 w-full bg-neutral-800 animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-20 text-center text-2xl text-neutral-400">
        Loading...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="mt-20 text-center text-2xl text-red-400">
        Token not found
        {wsError && (
          <div className="mt-4 text-sm text-neutral-400">
            WebSocket Error: {wsError}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{token?.name} | Trade</title>
      </Head>
      <Toaster position="top-right" />
      <div className="min-h-screen w-full flex flex-col bg-neutral-950 text-neutral-100">
        {/* Header always at the top, full width */}
        <Header search={search} setSearch={setSearch} />
        {/* Main content: flex row, fills the rest of the page */}
        <div className="flex flex-1 flex-row w-full">
          {/* Left: Chart and Info */}
          <div className="flex-1 min-w-0 flex flex-col pb-4 border-r border-emerald-950">
            <TradeHeader token={token} />
            <div className="min-h-[500px] flex-1">
              <PriceChartWidget token={token} />
            </div>
            <hr className="border-emerald-950" />
            <TradeTabs
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
            {selectedTab === "Trades" && <Trades token={token} trades={trades} />}
            {selectedTab === "Positions" && <Positions userId={user?.id} bearerToken={user.bearerToken} onPositionsChange={() => {}} />}
          </div>
          {/* Right: Buy/Sell and Token Info */}
          <div className="w-full max-w-md flex-shrink-0">
            <TradeActionPanel token={token} />
          </div>
        </div>
      </div>
    </>
  );
}