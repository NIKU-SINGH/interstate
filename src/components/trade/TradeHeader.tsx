import React from "react";
import type { Token } from "~/utils/db";
import {
  FaGlobe,
  FaUser,
  FaSearch,
  FaCrown,
  FaClock,
  FaFilter,
  FaShareAlt,
  FaEye,
  FaStar,
  FaRegSquare,
  FaRegStar,
  FaExpand,
  FaRunning,
  FaGasPump,
  FaCoins,
  FaBan,
} from "react-icons/fa";
import { FiCopy, FiShare } from "react-icons/fi";
import { IoShareSocialOutline } from "react-icons/io5";
import { formatSmartNumber } from '~/utils/db';
import { useQuickBuy } from '../QuickBuyContext';
import InterstateTooltip from '../InterstateTooltip';
import { useWatchlist } from '../WatchlistContext';
import { fetchTokenMetadata } from '~/utils/functions';

// Helper function to format age
function getTokenAge(createdAt: string) {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) {
    return `${diffDays}d`;
  } else if (diffHours > 0) {
    return `${diffHours}h`;
  } else {
    return `${diffMins}m`;
  }
}

interface TradeHeaderProps {
  token: Token;
}

const HeaderColumnSection = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-xs leading-none text-neutral-400">{label}</span>
      <span className="mt-0.5 text-sm leading-none text-white">{value}</span>
    </div>
  );
};

// Tooltip component
const Tooltip: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => {
  const [show, setShow] = React.useState(false);
  return (
    <span
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-lg bg-neutral-900 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg">
          {label}
        </span>
      )}
    </span>
  );
};

const QuickBuyPresetBar: React.FC = () => {
  const { presets, activePreset, setActivePreset } = useQuickBuy();
  const settings = presets[activePreset]?.quickBuySettings;
  return (
    <div className="mb-2 flex flex-col gap-2 rounded-xl bg-neutral-900/80 px-3 py-2">
      <div className="flex gap-2 mb-1">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${activePreset === i ? 'bg-blue-700 text-white' : 'bg-neutral-800 text-blue-300 hover:bg-neutral-700'}`}
            onClick={() => setActivePreset(i)}
          >
            {`PRESET ${i + 1}`}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 text-neutral-200 text-xs">
        <InterstateTooltip label="Max Slippage">
          <span className="flex items-center gap-1"><FaRunning /> {settings.maxSlippage * 100}%</span>
        </InterstateTooltip>
        <InterstateTooltip label={`Priority Fee: ${settings.priority}. ${settings.priority < 0.01 ? 'We recommend a priority fee of atleast 0.01' : ''}`}>
          <span className="flex items-center gap-1 text-yellow-400"><FaGasPump /> {settings.priority} {settings.priority < 0.01 ? <span className="text-yellow-400">&#9888;</span> : ''}</span>
        </InterstateTooltip>
        <InterstateTooltip label="Bribe">
          <span className="flex items-center gap-1 text-yellow-400"><FaCoins /> {settings.bribe} <span className="text-yellow-400">&#9888;</span></span>
        </InterstateTooltip>
        <InterstateTooltip label="MEV Protection">
          <span className={`flex items-center gap-1 ${settings.mevMode === 'off' ? 'text-neutral-400' : settings.mevMode === 'reduced' ? 'text-yellow-400' : 'text-emerald-400'}`}><FaBan /> {settings.mevMode === 'off' ? 'Off' : settings.mevMode === 'reduced' ? 'Reduced' : 'Secure'}</span>
        </InterstateTooltip>
      </div>
    </div>
  );
};

const tokenMetadataCache: Record<string, any> = {};
function useTokenMetadata(uri?: string) {
  const [meta, setMeta] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(!!uri);
  const [showInitial, setShowInitial] = React.useState(false);
  React.useEffect(() => {
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

const TradeHeader: React.FC<TradeHeaderProps> = ({ token }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const isWatched = isInWatchlist(token.mint);

  const handleWatchlistClick = () => {
    if (isWatched) {
      removeFromWatchlist(token.mint);
    } else {
      addToWatchlist(token);
    }
  };

  const { meta, loading, showInitial } = useTokenMetadata(token.uri);

  return (
    <>
      <div className="mb-2 flex w-full items-center gap-6 rounded-lg px-3 py-1.5">
        {/* Left: Logo, Symbol, Name, Clipboard, Age */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Logo */}
          {loading && !showInitial && (
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-4 border-b-4 border-blue-500"></div>
          )}
          {loading && showInitial && (
            <div className="h-10 w-10 rounded-full border border-neutral-800 flex items-center justify-center">
              {token.name.charAt(0)}
            </div>
          )}
          {meta?.image && (
            <img
              src={meta.image}
              alt={token.name}
              width={36}
              height={36}
              className="min-h-[36px] min-w-[36px] rounded-full border border-neutral-800"
            />
          )}
          {/* Symbol, Name, Clipboard, Age */}
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-base leading-none font-bold text-white">
                {token.symbol}
              </span>
              <span className="truncate text-sm leading-none text-neutral-400">
                {token.name}
              </span>
              <FiCopy className="ml-1 cursor-pointer text-xs text-neutral-400" />
            </div>
            <div className="mt-1 flex items-center gap-2">
              {/* Age with gold circle and clock */}
              <span className="flex items-center text-xs font-semibold">
                <span className="text-green-300">
                  {getTokenAge(token.created_at)}
                </span>
              </span>
              {/* Website, Holders, Search icons */}
              <FaGlobe className="cursor-pointer text-[15px] text-blue-300 hover:text-blue-400" />
              <FaUser className="cursor-pointer text-[15px] text-blue-300 hover:text-blue-400" />
              <FaSearch className="cursor-pointer text-[15px] text-blue-300 hover:text-blue-400" />
            </div>
          </div>
        </div>
        {/* Center: Price, Liquidity, Supply, Global Fees Paid */}
        <div className="flex items-center justify-center gap-4">
          <div className="text-base leading-tight font-medium text-white">
            ${formatSmartNumber(token.fully_diluted_value).toLocaleString()}
          </div>
          {/* Price */}
          <HeaderColumnSection
            label={"Price"}
            value={`$${formatSmartNumber(token.usd_price)}`}
          />
          <HeaderColumnSection
            label={"Liquidity"}
            value={`$${formatSmartNumber(token.total_liquidity_usd)}`}
          />
          <HeaderColumnSection
            label={"Supply"}
            value={formatSmartNumber(token.total_supply)}
          />
          <HeaderColumnSection
            label={"Global Fees Paid"}
            value={
              <span className="flex items-center gap-2 text-blue-300">
                <span className="font-bold">Ξ {formatSmartNumber(token.global_fees_paid)}</span>
              </span>
            }
          />
        </div>
        {/* Right: Action Icons */}
        <div className="mr-0 ml-auto flex items-center gap-4 pr-1 text-lg text-neutral-300">
          <Tooltip label="Share token pair">
            <IoShareSocialOutline className="cursor-pointer text-[17px] duration-50 ease-in hover:text-emerald-400" />
          </Tooltip>
          <Tooltip label={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}>
            <button
              onClick={handleWatchlistClick}
              className="cursor-pointer text-[17px] duration-50 ease-in hover:text-emerald-400"
            >
              {isWatched ? <FaStar className="text-yellow-400" /> : <FaRegStar />}
            </button>
          </Tooltip>
          <Tooltip label="Expand Chart">
            <FaExpand className="cursor-pointer text-[17px] duration-50 ease-in hover:text-emerald-400" />
          </Tooltip>
        </div>
      </div>
    </>
  );
};

export default TradeHeader;
export { QuickBuyPresetBar };
