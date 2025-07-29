import React, { useState, useEffect } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Positions from "../components/trade/Positions";
import TradeTable from "../components/trade/TradeTable";
import { useUser } from "../components/UserContext";
import InterstateTooltip from "~/components/InterstateTooltip";
import CustomCheckbox from "../components/CustomCheckbox";
import {
  getTradeHistoryByUser,
  getTradeActivityByUser,
} from "~/utils/functions";
import { formatSmartNumber } from "~/utils/db";
import type { PositionRow, TradeRow } from "~/utils/functions";

const spotTabs = ["Active Positions", "History", "Top 100"];
const activityTabs = ["Activity"];

export default function PortfolioPage() {
  const [activeSection, setActiveSection] = useState<"spot" | "wallet">("spot");
  const [activeSpotTab, setActiveSpotTab] = useState(0);
  const [activeActivityTab, setActiveActivityTab] = useState(0);
  const { user, loading: userLoading, solBalance } = useUser();
  const [walletChecked, setWalletChecked] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<TradeRow[]>([]);
  const [loadingTradeHistory, setLoadingTradeHistory] = useState(true);
  const [tradeActivity, setTradeActivity] = useState<TradeRow[]>([]);
  const [loadingTradeActivity, setLoadingTradeActivity] = useState(true);
  const [unrealizedPnl, setUnrealizedPnl] = useState(0);
  const [unrealizedPnlPercentage, setUnrealizedPnlPercentage] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [positions, setPositions] = useState<PositionRow[]>([]);

  useEffect(() => {
    const fetchTradeHistory = async () => {
      if (user?.id && activeSpotTab === 1) {
        setLoadingTradeHistory(true);
        try {
          const history = await getTradeHistoryByUser(user.id);
          setTradeHistory(history);
        } catch (error) {
          console.error("Failed to fetch trade history:", error);
          setTradeHistory([]);
        } finally {
          setLoadingTradeHistory(false);
        }
      }
    };

    const fetchTradeActivity = async () => {
      if (user?.id && activeActivityTab === 0) {
        setLoadingTradeActivity(true);
        try {
          const activity = await getTradeActivityByUser(user.id);
          setTradeActivity(activity);
        } catch (error) {
          console.error("Failed to fetch trade activity:", error);
          setTradeActivity([]);
        } finally {
          setLoadingTradeActivity(false);
        }
      }
    };

    fetchTradeHistory();
    fetchTradeActivity();
  }, [user?.id, activeSpotTab, activeActivityTab]);

  useEffect(() => {
    if (positions.length > 0) {
      const totalPnl = positions.reduce((acc, pos) => acc + pos.pnl, 0);
      const totalRemainingValue = positions.reduce(
        (acc, pos) => acc + pos.remainingUsdValue,
        0,
      );
      const totalBoughtValue = positions.reduce(
        (acc, pos) => acc + pos.boughtUsdValue,
        0,
      );
      setUnrealizedPnl(totalPnl);
      setUnrealizedPnlPercentage(
        totalBoughtValue ? (totalPnl / totalBoughtValue) * 100 : 0,
      );
      setTotalValue(solBalance + totalRemainingValue);
    }
  }, [positions, solBalance]);

  return (
    <>
      <Head>
        <title>Portfolio | Interstate Memeboard</title>
      </Head>
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <Header />
        <div className="px-8 pt-4">
          {/* Section Tabs */}
          <div className="mb-6 flex gap-8 text-2xl font-semibold">
            <button
              className={
                activeSection === "spot"
                  ? "text-white"
                  : "text-neutral-400 transition hover:text-white"
              }
              onClick={() => setActiveSection("spot")}
            >
              Spot
            </button>
            <button
              className={
                activeSection === "wallet"
                  ? "text-white"
                  : "text-neutral-400 transition hover:text-white"
              }
              onClick={() => setActiveSection("wallet")}
            >
              Wallets
            </button>
            <InterstateTooltip label="Coming soon">
              <button className="cursor-default text-neutral-600" disabled>
                Perpetuals
              </button>
            </InterstateTooltip>
          </div>

          {/* Spot Section */}
          {activeSection === "spot" && (
            <div className="border border-emerald-950">
              {/* Top Panels */}
              <div className="mb-0 flex w-full flex-row border-b border-emerald-950">
                {/* Balance */}
                <div className="flex flex-1 flex-col border-r border-emerald-950 p-4">
                  <div className="mb-2 text-base font-semibold">Balance</div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div>
                      <div className="text-xs text-neutral-400">
                        Total Value
                      </div>
                      <div className="text-xl font-bold">
                        ${totalValue.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400">
                        Unrealized PNL
                      </div>
                      <div
                        className={`text-lg font-bold ${unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {unrealizedPnl >= 0 ? "+" : ""}$
                        {unrealizedPnl.toFixed(2)}
                        <span className="ml-1 text-xs">
                          ({unrealizedPnlPercentage.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-neutral-400">
                      Available Balance
                    </div>
                    <div className="text-lg font-bold">
                      {formatSmartNumber(solBalance)} SOL
                    </div>
                  </div>
                </div>
                {/* Realized PNL */}
                <div className="flex min-h-[180px] flex-1 flex-col border-r border-emerald-950 p-4">
                  <div className="mb-2 text-base font-semibold">
                    Realized PNL
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    {/* Placeholder for chart */}
                    <span className="text-4xl text-neutral-600">─</span>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-xs text-neutral-600">
                      TradingView
                    </span>
                  </div>
                </div>
                {/* Performance */}
                <div className="flex min-h-[180px] flex-1 flex-col p-4">
                  <div className="mb-2 text-base font-semibold">
                    Performance
                  </div>
                  <div className="flex flex-1 flex-col gap-1 text-xs">
                    <div className="flex justify-between">
                      <span>Total PNL</span>
                      <span className="text-white">$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total TXNS</span>
                      <span className="text-green-400">0</span>
                      <span className="text-red-400">/ 0</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>{" "}
                        {">"}500% <span className="ml-auto">0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-400"></span>{" "}
                        200% ~ 500% <span className="ml-auto">0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-neutral-400"></span>{" "}
                        0% ~ 200% <span className="ml-auto">0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-pink-900"></span>{" "}
                        0% ~ -50% <span className="ml-auto">0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-pink-600"></span>{" "}
                        {"<"}-50% <span className="ml-auto">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tables Section */}
              <div className="mt-2 border-b border-emerald-950">
                <div className="mb-2 flex gap-8 border-b border-neutral-800">
                  {spotTabs.map((tab, i) => (
                    <button
                      key={tab}
                      className={`border-b-2 px-1 py-2 text-base font-semibold transition ${activeSpotTab === i ? "border-white text-white" : "border-transparent text-neutral-400 hover:text-white"}`}
                      onClick={() => setActiveSpotTab(i)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {/* Table Content */}
                <div className="overflow-x-auto">
                  {activeSpotTab === 0 &&
                    (userLoading ? (
                      <div className="py-8 text-center text-neutral-500">
                        Loading...
                      </div>
                    ) : !user?.id ? (
                      <div className="py-8 text-center text-neutral-500">
                        Please log in to view your positions.
                      </div>
                    ) : (
                      <Positions
                        bearerToken={user.bearerToken}
                        userId={user.id}
                        onPositionsChange={setPositions}
                      />
                    ))}
                  {activeSpotTab === 1 &&
                    (userLoading || loadingTradeHistory ? (
                      <div className="py-8 text-center text-neutral-500">
                        Loading...
                      </div>
                    ) : !user?.id ? (
                      <div className="py-8 text-center text-neutral-500">
                        Please log in to view your trade history.
                      </div>
                    ) : (
                      <TradeTable
                        trades={tradeHistory}
                        loading={loadingTradeHistory}
                      />
                    ))}
                  {activeSpotTab === 2 && (
                    <div className="py-8 text-center text-neutral-500">
                      No data.
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Section */}
              <div className="mt-4 border-b border-emerald-950">
                <div className="mb-2 flex gap-8 border-b border-neutral-800">
                  {activityTabs.map((tab, i) => (
                    <button
                      key={tab}
                      className={`border-b-2 px-1 py-2 text-base font-semibold transition ${activeActivityTab === i ? "border-white text-white" : "border-transparent text-neutral-400 hover:text-white"}`}
                      onClick={() => setActiveActivityTab(i)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="overflow-x-auto text-xs text-gray-400 p-4">
                  No activity log.
                </div>
                {/* <div className="overflow-x-auto">
                  {userLoading || loadingTradeActivity ? (
                    <div className="text-neutral-500 py-8 text-center">Loading...</div>
                  ) : !user?.id ? (
                    <div className="text-neutral-500 py-8 text-center">Please log in to view your trade activity.</div>
                  ) : (
                    <TradeTable trades={tradeActivity} loading={loadingTradeActivity} />
                  )}
                </div> */}
              </div>
            </div>
          )}

          {/* Wallet Section */}
          {activeSection === "wallet" && (
            <div className="w-full border border-emerald-950 p-4">
              {/* Top Bar */}
              <div className="mb-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by name or address"
                  className="w-80 rounded border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 focus:outline-none"
                  disabled
                />
                <span className="ml-2 flex items-center gap-2">
                  <button className="flex items-center gap-1 text-xs text-neutral-400">
                    <span className="opacity-60">
                      <svg width="16" height="16" fill="none">
                        <path
                          d="M2 8h12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    Show Archived
                  </button>
                  <button className="ml-2 rounded bg-neutral-800 px-4 py-1.5 text-sm font-semibold text-white">
                    Import
                  </button>
                  <button className="ml-2 rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
                    Create Wallet
                  </button>
                </span>
              </div>
              {/* Wallets Table */}
              <div className="flex w-full flex-row gap-4">
                {/* Wallets List */}
                <div className="min-h-[400px] flex-1 border-r border-emerald-950 p-2">
                  <div className="flex flex-col">
                    <div className="mb-2 flex items-center border-b border-neutral-800 pb-2">
                      <span className="w-1/3 text-sm text-neutral-400">
                        Wallet
                      </span>
                      <span className="w-1/4 text-sm text-neutral-400">
                        Balance
                      </span>
                      <span className="w-1/4 text-sm text-neutral-400">
                        Holdings
                      </span>
                      <span className="w-1/6 text-sm text-neutral-400">
                        Actions
                      </span>
                    </div>
                    {/* Only show if user is logged in */}
                    {user ? (
                      <div className="group flex items-center border-b border-neutral-800 py-2 transition hover:bg-neutral-800/60">
                        <CustomCheckbox
                          checked={walletChecked}
                          onChange={(e) => setWalletChecked(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="flex w-1/3 items-center gap-2 font-semibold text-amber-400">
                          Axiom Main
                          <span className="font-mono text-xs text-neutral-500">
                            {user.publicKey.slice(0, 4)}...
                            {user.publicKey.slice(-4)}
                          </span>
                          <button
                            className="ml-1 text-neutral-400 hover:text-white"
                            title="Copy address"
                          >
                            <svg width="14" height="14" fill="none">
                              <path
                                d="M3 3h8v8H3V3z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />
                              <path
                                d="M6 6h5v5H6V6z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />
                            </svg>
                          </button>
                        </span>
                        <span className="flex w-1/4 items-center gap-1">
                          <svg
                            width="18"
                            height="18"
                            className="mr-1"
                            viewBox="0 0 24 24"
                          >
                            <rect
                              width="24"
                              height="24"
                              rx="4"
                              fill="url(#solana-gradient)"
                            />
                            <defs>
                              <linearGradient
                                id="solana-gradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#00FFA3" />
                                <stop offset="100%" stopColor="#DC1FFF" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <span className="font-mono">0</span>
                        </span>
                        <span className="flex w-1/4 items-center">
                          <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">
                            0
                          </span>
                        </span>
                        <span className="flex w-1/6 items-center justify-center">
                          <button className="text-neutral-400 hover:text-white">
                            <svg width="16" height="16" fill="none">
                              <circle
                                cx="8"
                                cy="8"
                                r="7"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />
                            </svg>
                          </button>
                        </span>
                      </div>
                    ) : (
                      <div className="flex h-32 flex-col items-center justify-center text-neutral-500">
                        Please log in to view your wallets.
                      </div>
                    )}
                  </div>
                </div>
                {/* Source Wallets (right panel) */}
                <div className="flex min-h-[400px] flex-1 flex-col p-2">
                  <div className="mb-2 flex items-center border-b border-neutral-800 pb-2">
                    <span className="w-1/3 text-sm text-neutral-400">
                      Source wallets
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
                      <path
                        d="M20 10v20M10 20h20"
                        stroke="#444"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="mt-2 text-neutral-500">
                      Drag wallets to distribute SOL
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-neutral-700">
                    <span>Destination</span>
                    <button
                      className="ml-auto rounded bg-neutral-900 px-4 py-1.5 text-neutral-700"
                      disabled
                    >
                      Start Transfer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
