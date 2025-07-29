import React from 'react';
import InterstatePopout from './InterstatePopout';
import { FaUser, FaGlobe, FaSearch, FaCopy } from 'react-icons/fa';
import { formatSmartNumber } from '~/utils/db';
import type { Token } from '~/utils/db';
import { fetchTokenMetadata } from '~/utils/functions';

interface TokenInfoModalProps {
  open: boolean;
  onClose: () => void;
  token: Token | null;
  similarTokens: Token[];
}

function formatPercentChange(val: number): string {
  if (val === 0) return '0.00';
  const sign = val > 0 ? '+' : '';
  return sign + formatSmartNumber(val);
}

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

const TokenInfoModal: React.FC<TokenInfoModalProps> = ({ open, onClose, token, similarTokens }) => {
  if (!token) return null;
  const { meta, loading, showInitial } = useTokenMetadata(token.uri);
  return (
    <InterstatePopout open={open} onClose={onClose} align="center" className="bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative text-neutral-100">
      <button className="absolute top-3 right-3 text-neutral-400 hover:text-white text-xl" onClick={onClose} type="button">×</button>
      <div className="flex flex-col items-center">
        {/* Enlarged Picture */}
        {loading && !showInitial ? (
          <div className="w-20 h-20 border border-neutral-700 rounded-full animate-spin"></div>
        ) : (
          <img src={meta?.image || token.logo} alt={token.name} width={120} height={120} className="border border-neutral-700 mb-4" />
        )}
        {/* Token Details */}
        <div className="text-center mb-4">
          <div className="text-xl font-bold text-white">{token.name}</div>
          <div className="text-base font-medium text-neutral-400 mb-2">({token.symbol})</div>
          <p className="text-lg font-semibold text-white">
            ${formatSmartNumber(token.usd_price)}{' '}
            <span className={`text-base ${token.price_percent_change_1h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatPercentChange(token.price_percent_change_1h)}%</span>
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-sm font-semibold text-emerald-400">1h</span>
            <FaUser className="text-sm text-sky-400" />
            <FaGlobe className="text-sm text-sky-400" />
            <FaSearch className="text-sm text-sky-400" />
            <FaCopy className="ml-1 cursor-pointer text-sm text-neutral-500" />
          </div>
        </div>
        {/* Similar Tokens */}
        <div className="border-t border-neutral-700 pt-2 mt-2 w-full">
          <p className="mb-1 text-xs font-semibold text-neutral-300">Similar Tokens:</p>
          <ul className="text-xs text-neutral-500 space-y-1">
            {similarTokens.map((similarToken, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <img src={similarToken.logo} alt={similarToken.name} width={32} height={32} className="border border-neutral-700" />
                <span className="text-neutral-300 truncate max-w-[80px]">{similarToken.name}</span>
                <span className="text-[10px] text-neutral-500">{similarToken.created_at ? `${Math.floor((new Date().getTime() - new Date(similarToken.created_at).getTime()) / (1000 * 60 * 60 * 24))}d` : '-'}</span>
                <span className="text-[10px] text-neutral-500">TX: {formatSmartNumber((similarToken.total_buy_volume_1h || 0) + (similarToken.total_sell_volume_1h || 0))}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </InterstatePopout>
  );
};

export default TokenInfoModal; 