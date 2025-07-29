import React, { useEffect, useState } from 'react';
import type { Wallet } from '~/utils/functions';
import InterstatePopout from './InterstatePopout';
import { FaRegCopy, FaCheck, FaStar, FaSearch, FaRegChartBar, FaBell, FaExternalLinkAlt, FaArrowUp, FaArrowDown, FaRegCalendar } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import PriceChartWidget from './PriceChartWidget';
import type { Token } from '~/utils/db';
import { AiOutlineCalendar } from 'react-icons/ai';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface WalletScanPanelProps {
  wallet: Wallet;
  onClose: () => void;
}

const TABS = ["Active Positions", "History", "Top 100", "Activity"];

const WalletScanPanel: React.FC<WalletScanPanelProps> = ({ wallet, onClose }) => {
  // Live data state
  const [balance, setBalance] = useState<number | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("Activity");
  const [token, setToken] = useState<Token | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [tokenBalanceLoading, setTokenBalanceLoading] = useState(true);
  const [tokenBalanceError, setTokenBalanceError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notify, setNotify] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Max');
  const timeRanges = ['1d', '7d', '30d', 'Max'];
  const [toast, setToast] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'SOL'>('USD');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!wallet?.address) return;
    setLoading(true);
    setError(null);
    fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [wallet.address]
      })
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch balance');
        const text = await res.text();
        if (!text) throw new Error('Empty response for balance');
        return JSON.parse(text);
      })
      .then(data => setBalance(data?.result?.value ? data.result.value / 1e9 : 0))
      .catch(() => setBalance(null));
    fetch(`https://public-api.solscan.io/account/transactions?address=${wallet.address}&limit=10`)
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch activity');
        const text = await res.text();
        if (!text) throw new Error('Empty response for activity');
        return JSON.parse(text);
      })
      .then(data => Array.isArray(data) ? setActivity(data) : setActivity([]))
      .catch(() => setActivity([]))
      .finally(() => setLoading(false));
  }, [wallet.address]);

  useEffect(() => {
    if (!wallet.address) return;
    setTokenLoading(true);
    setTokenError(null);
    fetch(`/api/token/${wallet.address}`)
      .then(res => res.json())
      .then((data) => {
        if (data?.result) setToken(data.result);
        else setTokenError('Token not found');
      })
      .catch(() => setTokenError('Failed to fetch token info'))
      .finally(() => setTokenLoading(false));
  }, [wallet.address]);

  // Fetch SPL token balance
  useEffect(() => {
    if (!wallet.address || !token || !token.mint) return;
    setTokenBalanceLoading(true);
    setTokenBalanceError(null);
    // 1. Get token accounts by owner
    fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          wallet.address,
          { mint: token.mint },
          { encoding: 'jsonParsed' }
        ]
      })
    })
      .then(res => res.json())
      .then(data => {
        const accounts = data?.result?.value;
        if (!accounts || accounts.length === 0) {
          setTokenBalance(0);
          return;
        }
        // Use the first account (most users have one)
        const amount = accounts[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
        setTokenBalance(typeof amount === 'number' ? amount : 0);
      })
      .catch(() => setTokenBalanceError('Failed to fetch token balance'))
      .finally(() => setTokenBalanceLoading(false));
  }, [wallet.address, token && token.mint]);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(wallet.address).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      });
    }
  };

  // Toast display logic
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <InterstatePopout open={true} onClose={onClose} align="center" className="w-[calc(100vw-600px)] h-[calc(100vh-120px)] p-0 bg-transparent shadow-none" overlayClassName="z-50">
      <div className="relative w-[calc(100vw-600px)] h-[calc(100vh-120px)] bg-neutral-900 border border-neutral-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-3 border-b border-neutral-800 relative">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-pink-400">{wallet.name || 'Null'}</span>
            <span className="text-neutral-400 font-mono text-sm flex items-center gap-1">
              {typeof wallet.address === 'string' && wallet.address.length >= 10
                ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                : wallet.address || '—'}
              <button
                className="ml-1 p-1 rounded hover:bg-neutral-800 transition-colors text-neutral-400 text-xs"
                onClick={handleCopy}
                title="Copy address"
                type="button"
              >
                {copied ? <FaCheck className="text-emerald-400 text-base" /> : <FaRegCopy className="text-base" />}
              </button>
              {copied && <span className="ml-1 text-emerald-400 text-xs">Copied!</span>}
              <span className="mx-2 text-neutral-500">|</span>
              {tokenBalanceLoading || tokenLoading ? (
                <span className="animate-pulse text-neutral-500">—</span>
              ) : tokenBalanceError ? (
                <span className="text-red-400">Error</span>
              ) : tokenBalance !== null && token ? (
                <span className="text-neutral-300">{tokenBalance} {token.symbol}</span>
              ) : (
                <span className="text-red-400">No balance</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-4 absolute right-16 top-1/2 -translate-y-1/2">
            <FaStar
              className={`text-base cursor-pointer transition-colors ${isFavorite ? 'text-yellow-400' : 'text-neutral-500 hover:text-yellow-400'}`}
              title="Track Wallet"
              onClick={() => { setIsFavorite(fav => !fav); setToast('Wallet updated successfully'); }}
            />
            <FaBell
              className={`text-base cursor-pointer transition-colors ${notify ? 'text-blue-400' : 'text-neutral-500 hover:text-blue-400'}`}
              title="Notify"
              onClick={() => { setNotify(n => !n); setToast('Wallet updated successfully'); }}
            />
            <FaExternalLinkAlt
              className="text-base text-neutral-500 hover:text-blue-400 cursor-pointer"
              title="Open in Solscan"
              onClick={() => { window.open(`https://solscan.io/account/${wallet.address}`, '_blank'); setToast('Wallet updated successfully'); }}
            />
            <FaSearch
              className="text-base text-neutral-500 hover:text-blue-400 cursor-pointer"
              title="Search on Solscan"
              onClick={() => { window.open(`https://solscan.io/account/${wallet.address}`, '_blank'); setToast('Wallet updated successfully'); }}
            />
            <span className="mx-2 text-neutral-700">|</span>
            {timeRanges.map((label) => (
              <button
                key={label}
                className={`px-2 py-1 rounded text-xs font-semibold ${selectedRange === label ? 'text-blue-400' : 'text-neutral-400 hover:text-blue-400'} hover:bg-neutral-800 transition-colors`}
                onClick={() => setSelectedRange(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-2xl font-bold px-2 py-1 rounded transition-colors">×</button>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top: Balance, PNL, Performance */}
          <div className="flex flex-row gap-8 px-8 pt-6 pb-2">
            {/* Balance */}
            <div className="flex-1 min-w-[180px]">
              <div className="text-xs text-neutral-400 mb-1">Balance</div>
              <div className="text-3xl font-bold text-white">
                {tokenLoading ? (
                  <span className="animate-pulse text-neutral-500">—</span>
                ) : !token || typeof token.usd_price !== 'number' ? (
                  <span className="text-red-400">No price data</span>
                ) : (
                  `$${token.usd_price.toLocaleString(undefined, { maximumFractionDigits: 6 })}`
                )}
              </div>
              <div className="text-xs text-neutral-500 mt-2">Unrealized PNL</div>
              <div className="text-lg text-white font-semibold">$0</div>
              <div className="text-xs text-neutral-500 mt-2">Available Balance</div>
              <div className="text-lg text-white font-semibold">
                {tokenBalanceLoading || tokenLoading ? (
                  <span className="animate-pulse text-neutral-500">—</span>
                ) : tokenBalanceError ? (
                  <span className="text-red-400">Error</span>
                ) : tokenBalance !== null && token ? (
                  `${tokenBalance} ${token.symbol}`
                ) : (
                  <span className="text-red-400">No balance</span>
                )}
              </div>
            </div>
            {/* PNL with TradingView Chart */}
            <div className="flex-1 min-w-[180px] flex flex-col justify-between">
              <div className="flex flex-row justify-between items-start w-full">
                <div className="w-full text-xs text-neutral-400 mb-1 mt-1 text-left pl-2">PNL</div>
                <div className="relative mt-1 mr-2">
                  <button
                    className="text-neutral-400 hover:text-blue-400 p-1 rounded transition-colors"
                    title={selectedDate ? `Selected: ${selectedDate.toLocaleDateString()}` : 'Select date'}
                    onClick={() => setShowDatePicker((v) => !v)}
                  >
                    <AiOutlineCalendar className="text-lg" />
                  </button>
                  {showDatePicker && (
                    <div className="absolute right-0 top-8 z-50">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => { setSelectedDate(date); setShowDatePicker(false); }}
                        inline
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        calendarClassName="bg-neutral-900 text-white border border-neutral-700 rounded shadow-lg dark-datepicker"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-4xl font-mono text-neutral-300 mb-2">$0</div>
                <div className="w-2/3 h-1 bg-neutral-700 rounded-full" />
              </div>
            </div>
            {/* Performance */}
            <div className="flex-1 min-w-[180px]">
              <div className="text-xs text-neutral-400 mb-1 flex items-center gap-2">
                Performance
                <span className="text-[10px] text-neutral-500" title="Performance ranges show the number of positions with PNL in each range. Example: >500% means positions with more than 500% profit.">(?)</span>
              </div>
              <div className="flex flex-row items-center justify-between mb-2">
                <span className="text-xs text-neutral-400">
                  {selectedRange === 'Max' ? 'Total PNL' : `${selectedRange} PNL`}
                </span>
                <span className="text-xs text-neutral-400">
                  {selectedRange === 'Max' ? 'Total TXNS' : `${selectedRange} TXNS`}
                </span>
              </div>
              <div className="flex flex-row items-center justify-between mb-2">
                <span className="text-white font-semibold">$0.00</span>
                <span className="text-white font-semibold">0 / 0</span>
              </div>
              <div className="mt-2">
                <div className="flex flex-col gap-1 mt-2 mb-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="w-3 h-3 rounded-full bg-green-900 inline-block" />
                    <span>&gt;500%</span>
                    <span className="ml-auto">0</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="w-3 h-3 rounded-full bg-green-700 inline-block" />
                    <span>200% ~ 500%</span>
                    <span className="ml-auto">0</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                    <span>0% ~ 200%</span>
                    <span className="ml-auto">0</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="w-3 h-3 rounded-full bg-rose-900 inline-block" />
                    <span>0% ~ -50%</span>
                    <span className="ml-auto">0</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="w-3 h-3 rounded-full bg-rose-700 inline-block" />
                    <span>&lt;-50%</span>
                    <span className="ml-auto">0</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-neutral-800 rounded-full mt-1">
                  <div className="h-2 rounded-full bg-pink-500" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="px-8 border-b border-neutral-800 mt-2 flex items-center justify-between">
            <div className="flex flex-row gap-10 text-sm mt-2">
              {TABS.map((t) => (
                <button
                  key={t}
                  className={`py-2 border-b-2 transition-colors duration-200 ${tab === t ? 'border-blue-400 text-blue-400 font-semibold' : 'border-transparent text-neutral-400 hover:text-white'}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {tab !== 'Activity' && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="px-2 py-1 rounded-full bg-neutral-800 text-xs text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ minWidth: 120 }}
                />
                <button
                  className={`px-3 py-1 text-xs font-semibold border border-neutral-700 ${currency === 'USD' ? 'bg-blue-500 text-white' : 'bg-neutral-800 text-neutral-300'} rounded-full transition-colors`}
                  onClick={() => setCurrency(currency === 'USD' ? 'SOL' : 'USD')}
                  style={{ minWidth: 56 }}
                >
                  {currency === 'USD' ? 'USD' : 'SOL'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed left-1/2 top-12 z-50 -translate-x-1/2 px-4 py-2 rounded-md shadow-md text-sm font-semibold bg-neutral-800 text-white animate-fade-in">
          {toast}
        </div>
      )}
      <style jsx global>{`
        .dark-datepicker,
        .dark-datepicker .react-datepicker__header,
        .dark-datepicker .react-datepicker__month,
        .dark-datepicker .react-datepicker__day,
        .dark-datepicker .react-datepicker__day-name,
        .dark-datepicker .react-datepicker__current-month,
        .dark-datepicker .react-datepicker__year-dropdown,
        .dark-datepicker .react-datepicker__month-dropdown {
          background: #18181b !important;
          color: #fff !important;
          border-color: #27272a !important;
        }
        .dark-datepicker .react-datepicker__day--selected,
        .dark-datepicker .react-datepicker__day--keyboard-selected {
          background: #2563eb !important;
          color: #fff !important;
        }
        .dark-datepicker .react-datepicker__day:hover {
          background: #334155 !important;
          color: #fff !important;
        }
        .dark-datepicker .react-datepicker__month-dropdown,
        .dark-datepicker .react-datepicker__year-dropdown {
          background: #18181b !important;
          color: #fff !important;
        }
        .dark-datepicker .react-datepicker__navigation-icon::before {
          border-color: #fff !important;
        }
      `}</style>
    </InterstatePopout>
  );
};

export default WalletScanPanel;