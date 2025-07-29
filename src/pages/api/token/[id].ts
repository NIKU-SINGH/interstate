import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { env } from '../../../env';
import type { Token } from '~/utils/db';

const pool = new Pool({
  connectionString: env.NEON_DB_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid token address' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT * FROM bonding_tokens WHERE mint = $1 LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ result: null });
    }
    const row = rows[0];
    const result: Token = {
      id: row.id,
      mint: row.mint,
      standard: row.standard,
      name: row.name,
      symbol: row.symbol,
      logo: row.logo,
      decimals: row.decimals,
      metaplex: row.metaplex || null,
      fully_diluted_value: row.fully_diluted_value,
      total_supply: row.total_supply,
      total_supply_formatted: row.total_supply_formatted,
      links: row.links || null,
      description: row.description,
      is_verified_contract: row.is_verified_contract,
      possible_spam: row.possible_spam,
      total_buy_volume_5m: row.total_buy_volume_5m,
      total_buy_volume_1h: row.total_buy_volume_1h,
      total_buy_volume_6h: row.total_buy_volume_6h,
      total_buy_volume_24h: row.total_buy_volume_24h,
      total_sell_volume_5m: row.total_sell_volume_5m,
      total_sell_volume_1h: row.total_sell_volume_1h,
      total_sell_volume_6h: row.total_sell_volume_6h,
      total_sell_volume_24h: row.total_sell_volume_24h,
      total_buyers_5m: row.total_buyers_5m,
      total_buyers_1h: row.total_buyers_1h,
      total_buyers_6h: row.total_buyers_6h,
      total_buyers_24h: row.total_buyers_24h,
      total_sellers_5m: row.total_sellers_5m,
      total_sellers_1h: row.total_sellers_1h,
      total_sellers_6h: row.total_sellers_6h,
      total_sellers_24h: row.total_sellers_24h,
      total_buys_5m: row.total_buys_5m,
      total_buys_1h: row.total_buys_1h,
      total_buys_6h: row.total_buys_6h,
      total_buys_24h: row.total_buys_24h,
      total_sells_5m: row.total_sells_5m,
      total_sells_1h: row.total_sells_1h,
      total_sells_6h: row.total_sells_6h,
      total_sells_24h: row.total_sells_24h,
      unique_wallets_5m: row.unique_wallets_5m,
      unique_wallets_1h: row.unique_wallets_1h,
      unique_wallets_6h: row.unique_wallets_6h,
      unique_wallets_24h: row.unique_wallets_24h,
      price_percent_change_5m: row.price_percent_change_5m,
      price_percent_change_1h: row.price_percent_change_1h,
      price_percent_change_6h: row.price_percent_change_6h,
      price_percent_change_24h: row.price_percent_change_24h,
      usd_price: row.usd_price,
      sol_price: row.sol_price,
      total_liquidity_usd: row.total_liquidity_usd,
      total_fully_diluted_valuation: row.total_fully_diluted_valuation,
      total_snipers: row.total_snipers,
      pair_address: row.pair_address,
      total_holders: row.total_holders,
      created_at: row.created_at,
      updated_at: row.updated_at,
      bonding_curve_progress: row.bonding_curve_progress,
      global_fees_paid: row.global_fees_paid,
    };
    res.status(200).json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch token' });
  }
} 