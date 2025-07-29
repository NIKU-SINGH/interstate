import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { env } from '../../env';
import type { Token } from '~/utils/db';

const pool = new Pool({
  connectionString: env.NEON_DB_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all tokens
    const { rows } = await pool.query(`
      SELECT 
        mint, name, symbol, logo, decimals, price_native, price_usd, liquidity, fully_diluted_valuation, bonding_curve_progress
      FROM tokens
      ORDER BY liquidity DESC NULLS LAST
      LIMIT 100
    `);

    const result: Token[] = rows.map((row: any) => ({
      tokenAddress: row.mint,
      name: row.name,
      symbol: row.symbol,
      logo: row.logo,
      decimals: String(row.decimals),
      priceNative: String(row.price_native),
      priceUsd: String(row.price_usd),
      liquidity: String(row.liquidity),
      fullyDilutedValuation: String(row.fully_diluted_valuation),
      bondingCurveProgress: Number(row.bonding_curve_progress),
    }));

    res.status(200).json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
} 