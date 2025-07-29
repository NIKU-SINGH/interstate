import React, { useState } from "react";
import { formatSmartNumber, type Token } from "~/utils/db";
import { useQuickBuy } from "~/components/QuickBuyContext";
import { FaRunning, FaGasPump, FaCoins, FaBan } from "react-icons/fa";
import InterstateTooltip from "../InterstateTooltip";
import { QuickBuyPresetBar } from "./TradeHeader";
import QuickBuy from "../QuickBuy";
import CustomCheckbox from "../CustomCheckbox";
import { createLimitOrder, tradeBuy } from "~/utils/api";
import { useUser } from "~/components/UserContext";

interface TradeActionPanelProps {
  token: Token;
}

const presetLabels = ["PRESET 1", "PRESET 2", "PRESET 3"];
const mevModes = [
  { label: "Off", value: "off" },
  { label: "Reduced", value: "reduced" },
  { label: "Secure", value: "on" },
];

const TradeActionPanel: React.FC<TradeActionPanelProps> = ({ token }) => {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [tab, setTab] = useState<"market" | "limit" | "adv">("market");
  const [targetMC, setTargetMC] = useState("");
  const [direction, setDirection] = useState<"Above" | "Below">("Above");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { presets, activePreset } = useQuickBuy();
  const { user, solBalance } = useUser();
  const settings =
    mode === "buy"
      ? presets[activePreset].quickBuySettings
      : presets[activePreset].quickSellSettings;

  // Calculate stats from token fields
  const buyVol = token.total_buy_volume_5m || 0;
  const sellVol = token.total_sell_volume_5m || 0;
  const vol5m = buyVol + sellVol;
  const buysCount = token.total_buys_5m || 0;
  const buysValue = buyVol;
  const sellsCount = token.total_sells_5m || 0;
  const sellsValue = sellVol;
  const netVol = Number(buyVol) - Number(sellVol);
  const totalValue = Number(buyVol) + Number(sellVol);
  const buyPct = Number(totalValue)
    ? (Number(buyVol) / Number(totalValue)) * 100
    : 50;
  const sellPct = Number(totalValue)
    ? (Number(sellVol) / Number(totalValue)) * 100
    : 50;

  return (
    <div className="flex h-full flex-shrink-0 flex-col bg-neutral-950">
      {/* Stats Bar - Redesigned */}
      <div className="border-b border-emerald-950 p-4">
        <div className="flex items-end justify-between text-xs">
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-500">5m Vol</span>
            <span className="text-xs text-white">
              {formatSmartNumber(vol5m)}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-500">Buys</span>
            <span className="text-xs text-white">
              {buysCount} <span className="text-xs text-gray-500">/</span>{" "}
              <span className="text-xs text-white">
                {formatSmartNumber(buysValue)}
              </span>
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-500">Sells</span>
            <span className="text-xs text-white">
              {sellsCount} <span className="text-xs text-gray-500">/</span>{" "}
              <span className="text-xs text-white">
                {formatSmartNumber(sellsValue)}
              </span>
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-500">Net Vol.</span>
            <span className={`text-xs text-white`}>
              {netVol < 0 ? "-" : ""}$
              {Math.abs(netVol).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-2 flex h-[3px] gap-1 overflow-hidden rounded">
          <div
            className="bg-emerald-400"
            style={{ width: `${buyPct}%`, transition: "width 0.3s" }}
          />
          <div
            className="bg-red-500"
            style={{ width: `${sellPct}%`, transition: "width 0.3s" }}
          />
        </div>
      </div>
      {/* Trade Box */}
      <div className="flex w-full flex-col border-b border-emerald-950 pb-4">
        {/* Toggle */}
        <div className="flex w-full rounded-t-lg border-b border-emerald-950 p-2">
          <button
            className={`w-full px-6 py-2 text-sm font-bold transition-all ${mode === "buy" ? "bg-emerald-500 text-white" : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"}`}
            onClick={() => setMode("buy")}
            type="button"
          >
            Buy
          </button>
          <button
            className={`w-full px-6 py-2 text-sm font-bold transition-all ${mode === "sell" ? "bg-red-500 text-white" : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"}`}
            onClick={() => setMode("sell")}
            type="button"
          >
            Sell
          </button>
        </div>
        {/* Tabs: Market, Limit, Adv. */}
        <div className="flex items-center gap-4 border-b border-emerald-950 px-4 pt-2 text-sm font-semibold">
          <button
            className={
              tab === "market"
                ? "border-b-2 border-emerald-400 pb-1 text-emerald-400"
                : "pb-1 text-neutral-400"
            }
            onClick={() => setTab("market")}
          >
            Market
          </button>
          <button
            className={
              tab === "limit"
                ? "border-b-2 border-emerald-400 pb-1 text-emerald-400"
                : "pb-1 text-neutral-400"
            }
            onClick={() => setTab("limit")}
          >
            Limit
          </button>
          <button
            className={
              tab === "adv"
                ? "border-b-2 border-emerald-400 pb-1 text-emerald-400"
                : "pb-1 text-neutral-400"
            }
            onClick={() => setTab("adv")}
          >
            Adv.
          </button>
        </div>
        {/* Amount Row */}
        <div className="mx-4 my-3 mb-2 rounded-lg bg-neutral-800 p-2 px-0 pb-0">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-neutral-400">
              AMOUNT
            </span>
            <span className="text-xs font-bold text-white">
              {amount || "-"}
            </span>
          </div>
          <div className="mt-2 flex items-center">
            {[0.01, 0.1, 1, 10].map((opt) => (
              <button
                key={opt}
                className={`w-full cursor-pointer border border-neutral-800 bg-neutral-950 px-4 py-1 text-xs font-semibold text-white transition-all hover:bg-neutral-800 ${amount === String(opt) ? (mode === "buy" ? "bg-emerald-600" : "bg-red-500") : ""}`}
                onClick={() => setAmount(String(opt))}
                type="button"
              >
                {opt}
              </button>
            ))}
            <input
              type="number"
              min="0"
              step="any"
              className="w-32 border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="0.0"
              value={["0.01", "0.1", "1", "10"].includes(amount) ? "" : amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        {tab === "limit" && (
          <>
            <div className="mx-4 my-3 mb-2 rounded-lg bg-neutral-800 p-2 px-0 pb-0">
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="flex items-center gap-1 text-xs font-semibold text-neutral-400">
                  TARGET MARKET CAP
                </span>
                <span className="text-xs font-bold text-white">
                  {targetMC || "-"}
                </span>
              </div>
              <div className="mt-2 flex items-center">
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="w-full border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0.0"
                  value={targetMC}
                  onChange={(e) => setTargetMC(e.target.value)}
                />
              </div>
            </div>
            <div className="mx-4 my-3 mb-2 rounded-lg bg-neutral-800 p-2 px-0 pb-0">
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="flex items-center gap-1 text-xs font-semibold text-neutral-400">
                  DIRECTION
                </span>
                <span className="text-xs font-bold text-white">
                  {direction}
                </span>
              </div>
              <div className="mt-2 flex items-center">
                <button
                  className={`w-full cursor-pointer border border-neutral-800 bg-neutral-950 px-4 py-1 text-xs font-semibold text-white transition-all hover:bg-neutral-800 ${direction === "Above" ? (mode === "buy" ? "bg-emerald-600" : "bg-red-500") : ""}`}
                  onClick={() => setDirection("Above")}
                  type="button"
                >
                  Above
                </button>
                <button
                  className={`w-full cursor-pointer border border-neutral-800 bg-neutral-950 px-4 py-1 text-xs font-semibold text-white transition-all hover:bg-neutral-800 ${direction === "Below" ? (mode === "buy" ? "bg-emerald-600" : "bg-red-500") : ""}`}
                  onClick={() => setDirection("Below")}
                  type="button"
                >
                  Below
                </button>
              </div>
            </div>
          </>
        )}
        {/* QuickBuy Settings Summary */}
        <div className="mx-4 my-1 flex items-center gap-4 rounded-lg text-xs text-neutral-200">
          <InterstateTooltip label="Max Slippage">
            <span className="flex items-center gap-1">
              <FaRunning /> {settings.maxSlippage * 100}%
            </span>
          </InterstateTooltip>
          <InterstateTooltip
            label={`Priority Fee: ${settings.priority}. ${settings.priority < 0.01 ? "We recommend a priority fee of atleast 0.01" : ""}`}
          >
            <span className="flex items-center gap-1 text-yellow-400">
              <FaGasPump /> {settings.priority}{" "}
              {settings.priority < 0.01 ? (
                <span className="text-yellow-400">&#9888;</span>
              ) : (
                ""
              )}
            </span>
          </InterstateTooltip>
          <InterstateTooltip label="Bribe">
            <span className="flex items-center gap-1 text-yellow-400">
              <FaCoins /> {settings.bribe}{" "}
              <span className="text-yellow-400">&#9888;</span>
            </span>
          </InterstateTooltip>
          <InterstateTooltip label="MEV Protection">
            <span
              className={`flex items-center gap-1 ${settings.mevMode === "off" ? "text-neutral-400" : settings.mevMode === "reduced" ? "text-yellow-400" : "text-emerald-400"}`}
            >
              <FaBan />{" "}
              {settings.mevMode === "off"
                ? "Off"
                : settings.mevMode === "reduced"
                  ? "Reduced"
                  : "Secure"}
            </span>
          </InterstateTooltip>
        </div>
        {/* Advanced Trading Strategy DO THIS AGAIN ADVANCED  */}
        {/* <div className="mx-4 mt-1 flex items-center gap-2">
          <input
            type="checkbox"
            id="adv-strategy"
            className="accent-emerald-500"
          />
          <label htmlFor="adv-strategy" className="text-xs text-neutral-400">
            Advanced Trading Strategy
          </label>
        </div> */}
        {/* Action Button */}
        {message && (
          <div
            className={`mx-4 mt-2 rounded p-2 text-center text-xs font-bold ${message.type === "success" ? "bg-emerald-600" : "bg-red-500"} text-white`}
          >
            {message.text}
          </div>
        )}
        <button
          className={`mx-4 mt-2 py-3 text-xs font-bold transition disabled:opacity-50 ${mode === "buy" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-red-500 text-white hover:bg-pink-700"}`}
          disabled={!amount || isLoading || (tab === "limit" && !targetMC)}
          onClick={async () => {
            if (!user?.bearerToken) {
              setMessage({
                type: "error",
                text: "Authentication required to create limit orders.",
              });
              return;
            }

            setIsLoading(true);
            setMessage(null);

            if (tab === "limit") {
              if (!amount || !targetMC) {
                setMessage({
                  type: "error",
                  text: "Amount and Target Market Cap are required for limit orders.",
                });
                return;
              }
              try {
                await createLimitOrder(
                  {
                    tokenAddress: token.mint,
                    amount: Number(amount),
                    type: mode === "buy" ? "Buy" : "Sell",
                    direction: direction,
                    targetMC: Number(targetMC),
                  },
                  user.bearerToken,
                );
                setMessage({
                  type: "success",
                  text: `Limit order for ${token.symbol} created successfully!`,
                });
                setAmount("");
                setTargetMC("");
              } catch (error: any) {
                setMessage({
                  type: "error",
                  text: `Failed to create limit order: ${error.message}`,
                });
              } finally {
                setIsLoading(false);
              }
            } else if (tab === "market") {
              const tr = await tradeBuy(
                {
                  amount: Number(amount),
                  tokenAddress: token.mint,
                  mevProtection: settings.mevMode == "off" ? 0 : 1,
                },
                user.bearerToken,
              );

              console.log(tr);

              console.log(
                `Executing ${mode} market order for ${amount} of ${token.symbol}`,
              );
              setMessage({
                type: "success",
                text: `Market order for ${token.symbol} would be executed.`,
              });
            }
          }}
        >
          {isLoading
            ? "Processing..."
            : mode === "buy"
              ? `Buy ${token.symbol}`
              : `Sell ${token.symbol}`}
        </button>
      </div>
      <div className="flex flex-row border-b border-emerald-950">
        <div className="flex w-full flex-col items-center gap-2 border-r border-emerald-950 p-2 text-xs text-neutral-500">
          <span>Bought</span>
          <span className="text-sm text-emerald-300">$0</span>
        </div>
        <div className="flex w-full flex-col items-center gap-2 border-r border-emerald-950 p-2 text-xs text-neutral-500">
          <span>Sold</span>
          <span className="text-sm text-red-400">$0</span>
        </div>
        <div className="flex w-full flex-col items-center gap-2 border-r border-emerald-950 p-2 text-xs text-neutral-500">
          <span>Holding</span>
          <span className="text-sm text-neutral-50">$0</span>
        </div>
        <div className="flex w-full flex-col items-center gap-2 border-r border-emerald-950 p-2 text-xs text-neutral-500">
          <span>PnL</span>
          <span className="text-sm text-emerald-300">$0(+0%)</span>
        </div>
      </div>
      {/* QuickBuy Preset Bar  FIX THE WIDTH THING */}
      <div className="w-full border-b border-emerald-950">
        <QuickBuy
          hideActionButton
          className="rounded-none border-none bg-transparent"
        />
      </div>
      {/* Token Info Box */}
      <div className="border-b border-emerald-950 p-4">
        <div className="mb-2 text-xs text-neutral-400">Token Info</div>
        <div className="grid grid-cols-2 place-items-center gap-2 text-xs">
          <div className="flex h-20 w-20 flex-col items-center justify-center overflow-hidden rounded-full bg-neutral-800 p-1">
            <span className="font-bold text-emerald-400">
              {token.total_holders
                ? ((token.total_holders / token.total_supply) * 100).toFixed(2)
                : "0"}
              %
            </span>
            <span className="text-neutral-400">Top 10 H.</span>
          </div>
          <div className="flex h-20 w-20 flex-col items-center justify-center overflow-hidden rounded-full bg-neutral-800 p-1">
            <span className="font-bold text-neutral-400">
              {token.is_verified_contract ? "Yes" : "No"}
            </span>
            <span className="text-neutral-400">Dev H.</span>
          </div>
          <div className="flex h-20 w-20 flex-col items-center justify-center overflow-hidden rounded-full bg-neutral-800 p-1">
            <span className="font-bold text-red-400">
              {token.total_snipers
                ? ((token.total_snipers / token.total_supply) * 100).toFixed(2)
                : "0"}
              %
            </span>
            <span className="text-neutral-400">Snipers H.</span>
          </div>
          <div className="flex h-20 w-20 flex-col items-center justify-center overflow-hidden rounded-full bg-neutral-800 p-1">
            <span className="font-bold text-red-400">
              {token.possible_spam ? "Yes" : "No"}
            </span>
            <span className="text-neutral-400">Insiders</span>
          </div>
          <div className="flex h-20 w-20 flex-col items-center justify-center overflow-hidden rounded-full bg-neutral-800 p-1">
            <span className="font-bold text-red-400">
              {token.total_liquidity_usd
                ? formatSmartNumber(token.total_liquidity_usd)
                : "0"}
            </span>
            <span className="text-neutral-400">Liquidity</span>
          </div>
          <div className="flex h-20 w-20 flex-col items-center justify-center overflow-hidden rounded-full bg-neutral-800 p-1">
            <span className="font-bold text-red-400">
              {token.bonding_curve_progress
                ? `${Number(token.bonding_curve_progress).toFixed(2)}%`
                : "0%"}
            </span>
            <span className="text-neutral-400">Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeActionPanel;
