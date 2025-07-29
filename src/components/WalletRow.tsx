import React, { useState, useEffect } from 'react';
import type { Wallet } from '~/utils/functions';
import { FaBell, FaChartBar, FaTrash } from 'react-icons/fa';

interface WalletRowProps {
  wallet: Wallet;
  onRemove: (address: string) => void;
  onClick?: (wallet: Wallet) => void;
}

function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative flex flex-col items-center">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        tabIndex={0}
        className="focus:outline-none"
      >
        {children}
      </span>
      <span
        className={`absolute -top-7 left-1/2 -translate-x-1/2 z-50 px-2 py-1 rounded-md bg-neutral-900 text-white text-sm font-normal shadow border border-neutral-700 whitespace-nowrap transition-all duration-200 ${show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'}`}
      >
        {label}
      </span>
    </span>
  );
}

export default function WalletRow({ wallet, onRemove, onClick }: WalletRowProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate fetching real-time data
    setLoading(true);
    const fetchBalance = setTimeout(() => {
      // In a real application, you would fetch actual wallet balance here
      setBalance(parseFloat((Math.random() * 10000).toFixed(2))); // Dummy balance
      setLoading(false);
    }, 1500); // Simulate network delay

    return () => clearTimeout(fetchBalance);
  }, [wallet.address]); // Re-fetch when wallet address changes

  // Helper to format date or relative time
  const formatCreated = (timestamp: number) => {
    const today = new Date().toLocaleDateString();
    if (!timestamp || isNaN(timestamp)) return today;
    const now = Date.now();
    const diff = now - timestamp;
    const min = 60 * 1000;
    const hour = 60 * min;
    const day = 24 * hour;
    if (diff < day) {
      if (diff < hour) {
        const mins = Math.max(1, Math.floor(diff / min));
        return `${mins} min`;
      } else {
        const hours = Math.floor(diff / hour);
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      }
    } else {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? today : date.toLocaleDateString();
    }
  };

  return (
    <tr
      key={wallet.address}
      className="border-b border-neutral-800/50 hover:bg-neutral-800/40 transition-all duration-200 cursor-pointer"
      onClick={() => onClick && onClick(wallet)}
    >
      <td className="w-24 px-1 py-1 text-neutral-400 text-[11px]">{formatCreated(wallet.createdAt)}</td>
      <td className="flex-1 px-1 py-1 font-mono text-neutral-200 text-[12px] flex items-center gap-1">
        <span className="text-base mr-1">{wallet.emoji || ''}</span>
        <span className="truncate max-w-[90px]">{wallet.name || 'N/A'}</span>
        <span className="text-neutral-500">|</span>
        <span className="truncate max-w-[90px] text-neutral-500">{wallet.address}</span>
        <button 
          className="text-neutral-500 hover:text-white transition-colors duration-200 flex-shrink-0 p-0.5" 
          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(wallet.address); }}
          title="Copy address"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v2.25A2.25 2.25 0 0113.5 22h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25m11.25-9V7.5a2.25 2.25 0 00-2.25-2.25H9.75A2.25 2.25 0 007.5 7.5v2.25m9.75 9.75H13.5m-3.75 0H7.5M9 6.75V4.5A2.25 2.25 0 0111.25 2h1.5a2.25 2.25 0 012.25 2.25v2.25M10.5 10.5H13.5" /></svg>
        </button>
      </td>
      <td className="px-1 py-1 text-right flex items-center gap-2 justify-end">
        {/* Action Icons Row */}
        <div className="flex flex-row gap-2 items-center">
          <button className="p-1 rounded-md hover:bg-neutral-800 transition-colors" title="Alert" onClick={e => e.stopPropagation()}>
            <FaBell className="text-base text-emerald-300" />
          </button>
          <Tooltip label="Scan Address">
            <button className="p-1 rounded-md hover:bg-neutral-800 transition-colors" title="Scan" onClick={e => e.stopPropagation()}>
              <FaChartBar className="text-base text-blue-300" />
            </button>
          </Tooltip>
          <button className="p-1 rounded-md hover:bg-neutral-800 transition-colors" title="Delete" onClick={e => { e.stopPropagation(); onRemove(wallet.address); }}>
            <FaTrash className="text-base text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
} 