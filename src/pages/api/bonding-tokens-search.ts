import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.NEON_DB_API_KEY,
  ssl: {
    rejectUnauthorized: false,
  },
});

export interface BondingToken {
  id: number;
  name: string;
  symbol: string;
  mint: string;
  logo?: string;
  total_fully_diluted_valuation?: number;
  total_buy_volume_24h?: number;
  total_sell_volume_24h?: number;
  total_liquidity_usd?: number;
  created_at?: string;
  updated_at?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, limit = "10" } = req.query;
  
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Name parameter is required" });
  }

  const searchLimit = Math.min(parseInt(limit as string) || 10, 50); // Cap at 50 results

  try {
    // Search for tokens where name contains the search term (case insensitive)
    const query = `
      SELECT 
        id,
        name,
        symbol,
        mint,
        logo,
        total_fully_diluted_valuation,
        total_buy_volume_24h,
        total_sell_volume_24h,
        total_liquidity_usd,
        created_at,
        updated_at
      FROM bonding_tokens 
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY 
        CASE 
          WHEN LOWER(name) = LOWER($1) THEN 1
          WHEN LOWER(name) LIKE LOWER($1 || '%') THEN 2
          ELSE 3
        END,
        total_fully_diluted_valuation DESC NULLS LAST
      LIMIT $2
    `;

    const searchPattern = `%${name}%`;
    const result = await pool.query(query, [searchPattern, searchLimit]);

    const tokens: BondingToken[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      symbol: row.symbol,
      mint: row.mint,
      logo: row.logo,
      total_fully_diluted_valuation: row.total_fully_diluted_valuation,
      total_buy_volume_24h: row.total_buy_volume_24h,
      total_sell_volume_24h: row.total_sell_volume_24h,
      total_liquidity_usd: row.total_liquidity_usd,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    res.status(200).json({
      success: true,
      result: tokens,
      count: tokens.length,
    });

  } catch (error) {
    console.error("Database search error:", error);
    res.status(500).json({ 
      error: "Database search failed", 
      detail: error instanceof Error ? error.message : "Unknown error" 
    });
  }
} 