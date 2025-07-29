import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  FaUser,
  FaGlobe,
  FaSearch,
  FaCopy,
  FaQuestionCircle,
} from "react-icons/fa";
import InterstateButton from "./InterstateButton";
import InterstateTooltip from './InterstateTooltip';
import CustomCheckbox from './CustomCheckbox';
import { useRouter } from "next/router";
import type { Token as BaseToken } from "~/utils/db";
import { formatSmartNumber } from '~/utils/db';
import SkeletonRow from './InterstateTable/SkeletonRow';
import { fetchTokenMetadata } from '~/utils/functions';
import { useFilter } from "./FilterContext";
import { getAmm } from "~/utils/amms";

// Types
type Token = BaseToken & { dexPaid?: boolean; amm?: string };

export interface InterstateTableRow {
  token: Token;
  i: number;
}

interface InterstateTableProps {
  rows: InterstateTableRow[];
  onQuickBuy?: (token: Token) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  setSort?: (key: string) => void;
  selectedTimeframe: '5m' | '1h' | '6h' | '24h';
  quickBuyAmount?: number | string;
  skeletonRowCount?: number;
}

interface HeaderConfig {
  key: string | null;
  label: string;
  align: 'left' | 'right' | 'center';
  width: string;
}

// Constants
const TABLE_HEADERS: HeaderConfig[] = [
  { key: 'name', label: 'Pair Info', align: 'left', width: 'w-80' },
  { key: 'fully_diluted_value', label: 'Market Cap', align: 'right', width: 'w-32' },
  { key: 'total_liquidity_usd', label: 'Liquidity', align: 'right', width: 'w-28' },
  { key: 'volume', label: 'Volume', align: 'right', width: 'w-28' },
  { key: 'txns', label: 'TXNS', align: 'right', width: 'w-24' },
  { key: null, label: 'Audit Log', align: 'center', width: 'w-24' },
  { key: null, label: 'Action', align: 'center', width: 'w-32' },
];

const TIME_LABELS = ['2h', '1d', '3d', '1h', '6h'];

// Utility Functions
const getTokenStat = (token: Token, stat: string, timeframe: string): number => {
  const key = `${stat}_${timeframe}`;
  const val = (token as any)[key];
  return typeof val === 'number' ? val : parseFloat(val) || 0;
};

const formatPercentChange = (val: number): string => {
  if (val === 0) return '0.00';
  return (val > 0 ? '+' : '') + formatSmartNumber(val);
};

const getSortableValue = (token: Token, key: string): number => {
  let val = (token as any)[key];
  if (typeof val === 'string') {
    val = val.replace(/[$,\s]/g, '');
  }
  const num = parseFloat(val);
  return isNaN(num) ? -Infinity : num;
};

// Token Metadata Hook
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

// Table Header Component
const TableHeader: React.FC<{
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}> = ({ sortKey, sortDirection, onSort }) => (
  <thead>
    <tr className="bg-neutral-800/80">
      {TABLE_HEADERS.map((header, idx) => (
        <th
          key={idx}
          className={`${header.width} px-4 py-4 text-${header.align} text-xs font-bold tracking-wide text-neutral-200 uppercase ${
            header.key ? 'cursor-pointer hover:text-white transition-colors' : ''
          }`}
          onClick={header.key && onSort ? () => onSort(header.key!) : undefined}
        >
          {header.label}
          {header.key && sortKey === header.key && (
            <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
          )}
        </th>
      ))}
    </tr>
  </thead>
);

// Token Avatar Component
const TokenAvatar: React.FC<{
  token: Token;
  meta: any;
  loading: boolean;
  showInitial: boolean;
}> = ({ token, meta, loading, showInitial }) => {
  const initial = token.name?.charAt(0)?.toUpperCase() || '?';
  const amm = token.amm ? getAmm(token.amm) : undefined;
  const borderColorClass = amm ? `bg-gradient-to-br ${amm.borderColor}` : 'border-2 border-yellow-400';

  return (
    <div className={`h-12 w-12 rounded-lg p-0.5 ${borderColorClass} flex-shrink-0`}>
      <div className="w-full h-full rounded-lg bg-neutral-800 flex items-center justify-center overflow-hidden">
        {loading && !showInitial ? (
          <div className="w-6 h-6 border-2 border-t-2 border-b-2 border-yellow-400 rounded-full animate-spin"></div>
        ) : meta?.image ? (
          <img
            src={meta.image}
            alt={token.name}
            width={48}
            height={48}
            className="h-12 w-12 object-cover rounded-lg"
          />
        ) : (
          <span className="text-lg font-bold text-white">{initial}</span>
        )}
      </div>
    </div>
  );
};

// Token Info Component
const TokenInfo: React.FC<{ 
  token: Token; 
  i: number; 
  sortedRows: InterstateTableRow[] 
}> = ({ token, i, sortedRows }) => {
  const { meta, loading, showInitial } = useTokenMetadata(token.uri);
  const timeLabel = TIME_LABELS[i % TIME_LABELS.length];

  const similarTokens = useMemo(() => 
    sortedRows
      .filter(row => row.token.mint !== token.mint)
      .sort((a, b) => {
        const diffA = Math.abs(a.token.fully_diluted_value - token.fully_diluted_value);
        const diffB = Math.abs(b.token.fully_diluted_value - token.fully_diluted_value);
        return diffA - diffB;
      })
      .slice(0, 2), 
    [token, sortedRows]
  );

  const tooltipContent = (
    <div className="p-3 min-w-[280px]">
      <div className="mb-3 flex justify-center">
        <TokenAvatar token={token} meta={meta} loading={loading} showInitial={showInitial} />
      </div>
      <div className="mb-3 text-center">
        <div className="text-lg font-bold text-white mb-1">{token.name}</div>
        <div className="text-sm font-medium text-neutral-400 mb-2">({token.symbol})</div>
        <p className="text-base font-semibold text-white">
          ${formatSmartNumber(token.usd_price)}{' '}
          <span className={`text-sm ${token.price_percent_change_1h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPercentChange(token.price_percent_change_1h)}%
          </span>
        </p>
      </div>
      {similarTokens.length > 0 && (
        <div className="border-t border-neutral-700 pt-2">
          <p className="mb-2 text-xs font-semibold text-neutral-300">Similar Tokens:</p>
          <div className="space-y-1">
            {similarTokens.map((similarTokenRow, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded bg-neutral-700 flex-shrink-0"></div>
                <span className="text-neutral-300 truncate flex-1">
                  {similarTokenRow.token.name}
                </span>
                <span className="text-neutral-500 text-[10px]">
                  {similarTokenRow.token.created_at 
                    ? `${Math.floor((Date.now() - new Date(similarTokenRow.token.created_at).getTime()) / (1000 * 60 * 60 * 24))}d` 
                    : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      <InterstateTooltip
        width={300}
        height={undefined}
        xOffset="ml-0"
        label={tooltipContent}
      >
        <TokenAvatar token={token} meta={meta} loading={loading} showInitial={showInitial} />
      </InterstateTooltip>
      
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="truncate text-sm font-bold text-white">
            {token.name}
          </span>
          <span className="truncate text-xs font-medium text-neutral-400">
            {token.symbol}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-1.5 py-0.5 rounded">
            {timeLabel}
          </span>
          <div className="flex items-center gap-1 text-sky-400">
            <FaUser className="text-xs" />
            <FaGlobe className="text-xs" />
            <FaSearch className="text-xs" />
            <FaCopy className="text-xs cursor-pointer hover:text-sky-300 transition-colors" />
          </div>
          {i === 1 && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-red-600">
              <path d="M23.498 6.186c-.197-.74-.777-1.32-1.517-1.517C20.34 4.333 12 4.333 12 4.333s-8.34 0-9.981.336c-.74.197-1.32.777-1.517 1.517C.166 7.827.166 12 .166 12s0 4.173.336 5.814c.197.74.777 1.32 1.517 1.517C3.66 19.667 12 19.667 12 19.667s8.34 0 9.981-.336c.74-.197 1.32-.777 1.517-1.517.336-1.641.336-5.814.336-5.814s0-4.173-.336-5.814zM9.797 15.568V8.432l6.568 3.568-6.568 3.568z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

// Market Cap Cell Component
const MarketCapCell: React.FC<{
  token: Token;
  selectedTimeframe: string;
  animationState: Record<string, 'up' | 'down' | null>;
}> = ({ token, selectedTimeframe, animationState }) => {
  const percentChange = getTokenStat(token, 'price_percent_change', selectedTimeframe);
  const percentFieldKey = `${token.mint}-price_percent_change_${selectedTimeframe}`;
  const isPositive = percentChange >= 0;

  return (
    <div className="text-right">
      <div className="text-sm font-semibold text-white mb-1">
        ${formatSmartNumber(token.usd_price)}
      </div>
      <div
        className={`text-xs font-semibold ${
          isPositive ? "text-emerald-400" : "text-red-400"
        } ${
          animationState[percentFieldKey] === 'up' ? 'price-animate-up' : 
          animationState[percentFieldKey] === 'down' ? 'price-animate-down' : ''
        }`}
      >
        {formatPercentChange(percentChange)}%
      </div>
    </div>
  );
};

// TXNS Cell Component
const TxnsCell: React.FC<{
  token: Token;
  selectedTimeframe: string;
}> = ({ token, selectedTimeframe }) => {
  const totalTxns = getTokenStat(token, 'total_buys', selectedTimeframe) + 
                   getTokenStat(token, 'total_sells', selectedTimeframe);
  const buys = getTokenStat(token, 'total_buys', selectedTimeframe);
  const sells = getTokenStat(token, 'total_sells', selectedTimeframe);

  return (
    <div className="text-right">
      <div className="text-sm text-neutral-100 font-medium mb-1">
        {formatSmartNumber(totalTxns)}
      </div>
      <div className="text-xs font-medium">
        <span className="text-emerald-400">{formatSmartNumber(buys)}</span>
        <span className="text-neutral-500 mx-1">/</span>
        <span className="text-red-400">{formatSmartNumber(sells)}</span>
      </div>
    </div>
  );
};

// Audit Log Cell Component
const AuditLogCell: React.FC<{
  token: Token;
  selectedTimeframe: string;
}> = ({ token, selectedTimeframe }) => {
  const percentChange = getTokenStat(token, 'price_percent_change', selectedTimeframe);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1">
        <span className={`w-2 h-2 rounded-full ${percentChange >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
        <span className="text-xs font-medium text-neutral-300">
          {Math.abs(percentChange).toFixed(2)}%
        </span>
      </div>
      {typeof token.dexPaid !== 'undefined' && (
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${token.dexPaid ? 'bg-emerald-400' : 'bg-neutral-600'}`}></span>
          <span className="text-xs text-neutral-400">Paid</span>
        </div>
      )}
    </div>
  );
};

// Table Row Component
const TableRow: React.FC<{
  token: Token;
  i: number;
  selectedTimeframe: string;
  onQuickBuy?: (token: Token) => void;
  quickBuyAmount: number | string;
  animationState: Record<string, 'up' | 'down' | null>;
  sortedRows: InterstateTableRow[];
  onClick: () => void;
}> = React.memo(({ 
  token, 
  i, 
  selectedTimeframe, 
  onQuickBuy, 
  quickBuyAmount, 
  animationState, 
  sortedRows, 
  onClick 
}) => {
  const handleQuickBuy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickBuy) {
      onQuickBuy(token);
    } else {
      onClick();
    }
  }, [onQuickBuy, token, onClick]);

  const volume = getTokenStat(token, 'total_buy_volume', selectedTimeframe) +
                getTokenStat(token, 'total_sell_volume', selectedTimeframe);

  return (
    <tr 
      className="cursor-pointer transition-colors hover:bg-neutral-800/60 border-b border-neutral-800/50" 
      onClick={onClick}
    >
      <td className="w-80 px-4 py-4 align-middle">
        <TokenInfo token={token} i={i} sortedRows={sortedRows} />
      </td>
      
      <td className="w-32 px-4 py-4 align-middle">
        <MarketCapCell 
          token={token} 
          selectedTimeframe={selectedTimeframe} 
          animationState={animationState} 
        />
      </td>
      
      <td className="w-28 px-4 py-4 align-middle text-right">
        <div className="text-sm text-neutral-100 font-medium">
          ${formatSmartNumber(token.total_liquidity_usd)}
        </div>
      </td>
      
      <td className="w-28 px-4 py-4 align-middle text-right">
        <div className="text-sm text-neutral-100 font-medium">
          ${formatSmartNumber(volume)}
        </div>
      </td>
      
      <td className="w-24 px-4 py-4 align-middle">
        <TxnsCell token={token} selectedTimeframe={selectedTimeframe} />
      </td>
      
      <td className="w-24 px-4 py-4 align-middle">
        <AuditLogCell token={token} selectedTimeframe={selectedTimeframe} />
      </td>
      
      <td className="w-32 px-4 py-4 align-middle text-center">
        <InterstateButton
          variant="primary"
          size="sm"
          className="!px-3 !py-2 text-xs font-medium w-full"
          onClick={handleQuickBuy}
        >
          Buy {quickBuyAmount} SOL
        </InterstateButton>
      </td>
    </tr>
  );
});

TableRow.displayName = 'TableRow';

// Main Table Component
export default function InterstateTable({ 
  rows, 
  onQuickBuy, 
  sortKey, 
  sortDirection, 
  setSort, 
  selectedTimeframe, 
  quickBuyAmount = 0.44, 
  skeletonRowCount = 6 
}: InterstateTableProps) {
  const router = useRouter();
  const { filter } = useFilter();
  const [animationState, setAnimationState] = useState<Record<string, 'up' | 'down' | null>>({});
  const prevValuesRef = useRef<Record<string, number>>({});

  // Memoized filtered and sorted rows
  const sortedRows = useMemo(() => {
    const filteredRows = rows.filter(({ token }) => 
      token.amm && filter.amms.includes(token.amm)
    );

    if (!sortKey) return filteredRows;
    
    return [...filteredRows].sort((a, b) => {
      const aVal = getSortableValue(a.token, sortKey);
      const bVal = getSortableValue(b.token, sortKey);
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [rows, sortKey, sortDirection, filter.amms]);

  // Price animation effect
  useEffect(() => {
    const newAnimationState: Record<string, 'up' | 'down' | null> = {};
    const newPrevValues = { ...prevValuesRef.current };
    
    rows.forEach(({ token }) => {
      const priceKey = `${token.mint}-usd_price`;
      const price = token.usd_price;
      
      if (priceKey in prevValuesRef.current) {
        if (price > prevValuesRef.current[priceKey]) {
          newAnimationState[priceKey] = 'up';
        } else if (price < prevValuesRef.current[priceKey]) {
          newAnimationState[priceKey] = 'down';
        }
      }
      newPrevValues[priceKey] = price;

      const percentFieldKey = `${token.mint}-price_percent_change_${selectedTimeframe}`;
      const percentValue = (token as any)[`price_percent_change_${selectedTimeframe}`] ?? 0;
      
      if (percentFieldKey in prevValuesRef.current) {
        if (percentValue > prevValuesRef.current[percentFieldKey]) {
          newAnimationState[percentFieldKey] = 'up';
        } else if (percentValue < prevValuesRef.current[percentFieldKey]) {
          newAnimationState[percentFieldKey] = 'down';
        }
      }
      newPrevValues[percentFieldKey] = percentValue;
    });

    setAnimationState(newAnimationState);
    prevValuesRef.current = newPrevValues;

    if (Object.keys(newAnimationState).length > 0) {
      const timeout = setTimeout(() => setAnimationState({}), 300);
      return () => clearTimeout(timeout);
    }
  }, [rows, selectedTimeframe]);

  return (
    <div className="overflow-x-auto border border-neutral-800 bg-neutral-900/95 shadow-lg rounded-lg">
      <style jsx>{`
        .price-animate-up {
          background: rgba(52, 211, 153, 0.2);
          animation: pulse-green 0.6s ease-out;
        }
        .price-animate-down {
          background: rgba(248, 113, 113, 0.2);
          animation: pulse-red 0.6s ease-out;
        }
        @keyframes pulse-green {
          0% { background: rgba(52, 211, 153, 0.4); }
          100% { background: transparent; }
        }
        @keyframes pulse-red {
          0% { background: rgba(248, 113, 113, 0.4); }
          100% { background: transparent; }
        }
        table {
          table-layout: fixed;
        }
      `}</style>
      
      <table className="min-w-full divide-y divide-neutral-800">
        <TableHeader 
          sortKey={sortKey} 
          sortDirection={sortDirection} 
          onSort={setSort} 
        />
        
        <tbody className="divide-y divide-neutral-800/50">
          {sortedRows.length === 0 ? (
            Array.from({ length: skeletonRowCount }).map((_, idx) => (
              <SkeletonRow key={idx} />
            ))
          ) : (
            sortedRows.map(({ token, i }) => (
              <TableRow
                key={token.mint}
                token={token}
                i={i}
                selectedTimeframe={selectedTimeframe}
                onQuickBuy={onQuickBuy}
                quickBuyAmount={quickBuyAmount}
                animationState={animationState}
                sortedRows={sortedRows}
                onClick={() => router.push(`/trade/${token.mint}`)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}