import React, { useState, useEffect } from 'react';
import type { Token } from '~/utils/db';
import { formatSmartNumber } from '~/utils/db';
import { FaUser, FaGlobe, FaSearch, FaCrown, FaRegCopy, FaBolt } from 'react-icons/fa';
import InterstateTooltip from './InterstateTooltip';
import { useRouter } from 'next/router';
import { fetchTokenMetadata } from '~/utils/functions';

interface PulseTableProps {
  title: string;
  tokens: Token[];
  isFirstOrLast?: "first" | "last";
  loading?: boolean;
  skeletonRowCount?: number;
}

// Add a simple in-memory cache for token metadata
const tokenMetadataCache: Record<string, any> = {};

function useTokenMetadata(uri?: string) {
  const [meta, setMeta] = useState<any | null>(null);
  const [loading, setLoading] = useState(!!uri);
  const [showInitial, setShowInitial] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!uri) {
      setMeta(null);
      setLoading(false);
      return;
    }
    if (tokenMetadataCache[uri]) {
      setMeta(tokenMetadataCache[uri]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setShowInitial(false);
    const timer = setTimeout(() => setShowInitial(true), 500);
    fetchTokenMetadata(uri).then((data) => {
      if (!cancelled) {
        if (data) tokenMetadataCache[uri] = data;
        setMeta(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [uri]);
  return { meta, loading, showInitial };
}

function TokenImage({ token }: { token: Token }) {
  const { meta, loading, showInitial } = useTokenMetadata(token.uri);
  if (loading && !showInitial) {
    return <div className="w-8 h-8 border-2 border-t-2 border-b-2 border-yellow-400 rounded-full animate-spin" />;
  } else if (meta?.image) {
    return <img src={meta.image} alt={token.symbol} className="w-12 h-12 object-contain" />;
  } else if (token.logo) {
    return <img src={token.logo} alt={token.symbol} className="w-12 h-12 object-contain" />;
  } else {
    return <span className="text-2xl font-bold text-neutral-400">{token.symbol?.[0] || '?'}</span>;
  }
}

export default function PulseTable({ title, tokens, isFirstOrLast, loading = false, skeletonRowCount = 10 }: PulseTableProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const router = useRouter();
  return (
    <div className={`shadow-lg flex-1 min-w-[340px] w-full flex flex-col ${isFirstOrLast === "first" ? "border-l border-r" : "border-r"} border-emerald-950`}>
      <div className="text-lg font-bold mb-2 text-white flex items-center justify-between border-t border-b border-emerald-950 p-2">
        {title}
        {/* Optionally add filter/sort controls here */}
      </div>
      <div className="overflow-y-scroll max-h-[70vh] custom-scrollbar">
        {loading ? (
          Array.from({ length: skeletonRowCount }).map((_, idx) => (
            <div key={idx} className="flex flex-row py-3 border-b border-neutral-800 last:border-b-0 items-center animate-pulse">
              {/* Profile Picture & Address skeleton */}
              <div className="flex flex-col items-center w-16 mr-3">
                <div className="relative w-14 h-14 bg-neutral-800 rounded-full" />
                <div className="h-3 w-12 bg-neutral-800 rounded mt-1" />
              </div>
              {/* Main Info Section skeleton */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex flex-row justify-between gap-2">
                  <div className="flex flex-col min-w-0 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-4 w-20 bg-neutral-800 rounded" />
                      <div className="h-3 w-16 bg-neutral-800 rounded" />
                      <div className="h-3 w-6 bg-neutral-800 rounded" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-3 w-8 bg-neutral-800 rounded" />
                      <div className="h-3 w-6 bg-neutral-800 rounded" />
                      <div className="h-3 w-6 bg-neutral-800 rounded" />
                      <div className="h-3 w-6 bg-neutral-800 rounded" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 min-w-[120px]">
                    <div className="flex gap-3 text-xs">
                      <div className="h-3 w-12 bg-neutral-800 rounded" />
                      <div className="h-3 w-12 bg-neutral-800 rounded" />
                    </div>
                    <div className="flex gap-3 text-xs items-center">
                      <div className="h-3 w-8 bg-neutral-800 rounded" />
                      <div className="h-3 w-8 bg-neutral-800 rounded" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-2 mt-1">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-4 w-10 bg-neutral-800 rounded-full" />
                    ))}
                  </div>
                  <div className="h-7 w-20 bg-neutral-800 rounded-full" />
                </div>
              </div>
            </div>
          ))
        ) : tokens.length === 0 ? (
          <div className="text-neutral-500 text-center py-8">No tokens found.</div>
        ) : (
          tokens.map((token, idx) => (
            <div
              key={token.mint + idx}
              className="relative cursor-pointer flex flex-row py-3 transition group items-center border-b border-neutral-800 hover:bg-neutral-800/40 w-full"
              onClick={() => router.push(`/trade/${token.pair_address}`)}
            >
              {/* Bonding popout on hover */}
              {idx === 0 ? (
                <span
                  className="hidden group-hover:flex absolute left-1/2 top-full mt-2 -translate-x-1/2 px-3 py-1 bg-neutral-900 border border-emerald-700 shadow-xl text-emerald-400 text-sm z-20"
                  style={{ pointerEvents: 'none' }}
                >
                  Bonding: {typeof token.bonding_curve_progress === 'number' ? Math.round(token.bonding_curve_progress) : (parseFloat(token.bonding_curve_progress)).toFixed(0)}%
                </span>
              ) : (
                <span
                  className="hidden group-hover:flex absolute left-1/2 -top-7 -translate-x-1/2 px-3 py-1 bg-neutral-900 border border-emerald-700 shadow-xl text-emerald-400 text-sm z-20"
                  style={{ pointerEvents: 'none' }}
                >
                  Bonding: {typeof token.bonding_curve_progress === 'number' ? Math.round(token.bonding_curve_progress * 100) : (parseFloat(token.bonding_curve_progress) * 100).toFixed(0)}%
                </span>
              )}
              {/* Profile Picture & Address */}
              <div className="flex flex-col items-center w-16 mr-3">
                <div className="relative w-14 h-14 bg-neutral-800 rounded-full overflow-x-hidden flex items-center justify-center border border-neutral-700">
                  <TokenImage token={token} />
                  {/* Status indicator */}
                  <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full" />
                </div>
                <span className="text-xs text-neutral-500 mt-1 font-mono truncate max-w-[60px]">{token.mint.slice(0, 4)}...{token.mint.slice(-4)}</span>
              </div>
              {/* Main Info Section */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                {/* Top Row */}
                <div className="flex flex-row justify-between gap-2">
                  {/* Left: Token Info & Socials */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-white truncate max-w-[90px]">{token.symbol}</span>
                      <span className="text-neutral-400 text-xs truncate max-w-[90px]">{token.name}</span>
                      <button className="ml-1 text-neutral-400 hover:text-white" title="Copy contract">
                        <FaRegCopy size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-emerald-400">
                      <span>{(() => {
                        const created = new Date(token.created_at);
                        const now = new Date();
                        const diff = Math.floor((now.getTime() - created.getTime()) / 1000);
                        if (diff < 60) return `${diff}s`;
                        if (diff < 3600) return `${Math.floor(diff/60)}m`;
                        if (diff < 86400) return `${Math.floor(diff/3600)}h`;
                        return `${Math.floor(diff/86400)}d`;
                      })()}</span>
                      {/* Socials */}
                      <a href={token.links ? (token.links as Record<string, string>)["website"] || '#' : '#'} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300"><FaGlobe title="Website" /></a>
                      <a href={token.links ? (token.links as Record<string, string>)["pumpfun"] || '#' : '#'} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300"><FaBolt title="Pump.fun" /></a>
                      <a href={token.links ? (token.links as Record<string, string>)["twitter"] || '#' : '#'} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300"><FaUser title="X (Twitter)" /></a>
                    </div>
                  </div>
                  {/* Right: MC, V, F, TX */}
                  <div className="flex flex-col items-end gap-1 min-w-[120px]">
                    <div className="flex gap-3 text-xs">
                      <span className="text-neutral-400">MC <span className="text-blue-400 font-bold">${formatSmartNumber(token.fully_diluted_value)}</span></span>
                      <span className="text-neutral-400">V <span className="text-white font-bold">${formatSmartNumber(token[`total_buy_volume_24h`] + token[`total_sell_volume_24h`])}</span></span>
                    </div>
                    <div className="flex gap-3 text-xs items-center">
                      <span className="text-neutral-400 flex items-center gap-1">F <span className="inline-block align-middle"><svg width="12" height="12" viewBox="0 0 24 24"><defs><linearGradient id="solana-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00FFA3"/><stop offset="100%" stopColor="#DC1FFF"/></linearGradient></defs><rect width="24" height="24" fill="url(#solana-gradient)" rx="4"/></svg></span> <span className="text-emerald-400 font-bold">0</span></span>
                      <span className="text-neutral-400">TX <span className="text-white font-bold">{(token.total_buys_5m ?? 0) + (token.total_sells_5m ?? 0)}</span></span>
                    </div>
                  </div>
                </div>
                {/* Bottom Row: Badges & Buy Button */}
                <div className="flex flex-row items-center justify-between gap-2 mt-1">
                  <div className="flex gap-1">
                    {[{icon: <FaUser size={10}/>, label: 'Top 10', value: 0},
                      {icon: <FaCrown size={10}/>, label: 'Dev', value: 0},
                      {icon: <FaSearch size={10}/>, label: 'Snipers', value: 0},
                      {icon: <FaUser size={10}/>, label: 'Insiders', value: 0},
                      {icon: <FaUser size={10}/>, label: 'Bundle', value: 0}
                    ].map((b, i) => (
                      <span key={i} className="flex items-center gap-1 bg-neutral-800 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-neutral-700">
                        {b.icon} {b.value}%
                      </span>
                    ))}
                  </div>
                  <button className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-full px-4 py-1 transition shadow">
                    <FaBolt className="text-yellow-300" /> 0 SOL
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 