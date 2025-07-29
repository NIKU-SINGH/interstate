interface TokenInfo {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: string;
  tokenDecimals: string; // could be converted to number if consistent
  pairTokenType: "token0" | "token1";
  liquidityUsd: number;
}

export interface DexPair {
  exchangeAddress: string;
  exchangeName: string;
  exchangeLogo: string;
  pairAddress: string;
  pairLabel: string;
  usdPrice: number;
  usdPrice24hrPercentChange: number;
  usdPrice24hrUsdChange: number;
  volume24hrNative: number;
  volume24hrUsd: number;
  liquidityUsd: number;
  baseToken: string;
  quoteToken: string;
  inactivePair: boolean;
  pair: TokenInfo[];
}

export interface DexPairsResponse {
  pairs: DexPair[];
}

export type Token = {
  id: number;
  mint: string;
  standard: string;
  name: string;
  symbol: string;
  logo: string;
  decimals: number;
  metaplex: object | null; // The original value is [object Object], so it's likely a JSON object
  fully_diluted_value: number;
  total_supply: number;
  total_supply_formatted: number;
  links: object | null; // Similarly [object Object]
  description: string;
  is_verified_contract: boolean;
  possible_spam: boolean;
  total_buy_volume_5m: number;
  total_buy_volume_1h: number;
  total_buy_volume_6h: number;
  total_buy_volume_24h: number;
  total_sell_volume_5m: number;
  total_sell_volume_1h: number;
  total_sell_volume_6h: number;
  total_sell_volume_24h: number;
  total_buyers_5m: number;
  total_buyers_1h: number;
  total_buyers_6h: number;
  total_buyers_24h: number;
  total_sellers_5m: number;
  total_sellers_1h: number;
  total_sellers_6h: number;
  total_sellers_24h: number;
  total_buys_5m: number;
  total_buys_1h: number;
  total_buys_6h: number;
  total_buys_24h: number;
  total_sells_5m: number;
  total_sells_1h: number;
  total_sells_6h: number;
  total_sells_24h: number;
  unique_wallets_5m: number;
  unique_wallets_1h: number;
  unique_wallets_6h: number;
  unique_wallets_24h: number;
  price_percent_change_5m: number;
  price_percent_change_1h: number;
  price_percent_change_6h: number;
  price_percent_change_24h: number;
  sol_price: number;
  usd_price: number;
  total_liquidity_usd: number;
  total_fully_diluted_valuation: number;
  total_snipers: number;
  pair_address: string;
  total_holders: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  bonding_curve_progress: number | string;
  global_fees_paid: number;
  uri?: string; // IPFS metadata URI
};

/**
 * Formats a number into a human-readable abbreviated form.
 * Examples:
 *   1234567    => "1.23M"
 *   1000       => "1K"
 *   0.0054321  => "0.0054"
 *   0.00000012 => "0.00000012"
 *   "abc"      => "-"
 */
export function formatSmartNumber(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "-";

  const num = typeof val === "string" ? parseFloat(val) : val;

  if (isNaN(num) || !isFinite(num)) return "-";

  const abs = Math.abs(num);

  const abbreviations = [
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" },
  ];

  for (const { value, suffix } of abbreviations) {
    if (abs >= value) {
      const formatted = (num / value).toFixed(2);
      return formatted.endsWith(".00")
        ? `${parseInt(formatted)}${suffix}`
        : `${formatted}${suffix}`;
    }
  }

  // Show full precision for very small values < 0.01
  if (abs > 0 && abs < 0.01) {
    return num.toPrecision(2);
  }

  // Normal decimal formatting for values >= 0.01
  return num.toFixed(2);
}


