import { env } from '../env';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export interface PositionRow {
  tokenAddress: string;
  bought: number;
  boughtUsdValue: number;
  sold: number;
  soldUsdValue: number;
  remaining: number;
  remainingUsdValue: number;
  pnl: number;
  pnlPercentage: number;
  actions: string;
}

export interface TradeRow {
  id: number;
  tokenAddress: string;
  tradeTime: string;
  type: 'Buy' | 'Sell';
  marketCap: string | number;
  solAmount: string | number;
  tokenAmount: string | number;
  usdValue: string | number;
  transactionHash: string;
  createdAt: string;
}

// New: Wallet Interface
export interface Wallet {
  address: string;
  name: string;
  createdAt: number; // Timestamp for creation date
  emoji?: string;
}

// New: Helper to get stored wallets from localStorage
export function getStoredWallets(): Wallet[] {
  if (typeof window === 'undefined') return []; // Ensure runs only on client-side
  const walletsJson = localStorage.getItem('wallets');
  return walletsJson ? JSON.parse(walletsJson) : [];
}

// New: Helper to store wallets to localStorage
export function storeWallets(wallets: Wallet[]) {
  if (typeof window === 'undefined') return; // Ensure runs only on client-side
  localStorage.setItem('wallets', JSON.stringify(wallets));
}

export async function getPrice(tokenAddress: string): Promise<{ price: number }> {
  if (!tokenAddress) throw new Error('tokenAddress is required');
  const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/trade/get_price?tokenAddress=${tokenAddress}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch price: ${res.statusText}`);
  }
  return res.json();
}

export async function getPumpSwapPool(tokenAddress: string): Promise<any> {
  if (!tokenAddress) throw new Error('tokenAddress is required');
  const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/trade/get_pump_swap_pool?tokenAddress=${tokenAddress}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch pump swap pool: ${res.statusText}`);
  }
  return res.json();
}

export async function getActivePositionsByUser(userId: string): Promise<PositionRow[]> {
  if (!userId) return [];
  if (!env.NEXT_PUBLIC_BACKEND_URL) {
    console.error('NEXT_PUBLIC_BACKEND_URL is not set');
    return [];
  }
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/trade/get_active_positions_by_user?userId=${userId}`);
    if (!res.ok) {
      console.error('Failed to fetch active positions:', res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching active positions:', err);
    return [];
  }
}

export async function getTradeHistoryByTokenAddress(tokenAddress: string): Promise<TradeRow[]> {
  if (!tokenAddress) return [];
  console.log(env.NEXT_PUBLIC_BACKEND_URL)
  const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/trade/get_trade_history_by_tokenaddress?tokenAddress=${tokenAddress}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getTradeHistoryByUser(userId: string): Promise<any[]> {
  if (!userId) throw new Error('userId is required');
  const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/trade/get_trade_history_by_user?userId=${userId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch trade history by user: ${res.statusText}`);
  }
  return res.json();
}

export async function getTradeActivityByUser(userId: string): Promise<any[]> {
  if (!userId) throw new Error('userId is required');
  const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/trade/get_trade_activity_by_user?userId=${userId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch trade activity by user: ${res.statusText}`);
  }
  return res.json();
}

export function formatSmartNumber(num: number): string {
  if (Math.abs(num) < 1000) {
    return parseFloat(num.toFixed(2)).toLocaleString();
  } else if (Math.abs(num) < 1000000) {
    return (parseFloat((num / 1000).toFixed(2))).toLocaleString() + 'K';
  } else if (Math.abs(num) < 1000000000) {
    return (parseFloat((num / 1000000).toFixed(2))).toLocaleString() + 'M';
  } else {
    return (parseFloat((num / 1000000000).toFixed(2))).toLocaleString() + 'B';
  }
}

// Fetch and parse token metadata from a URI (IPFS or HTTP)
export async function fetchTokenMetadata(uri: string | undefined): Promise<any | null> {
  console.log(uri)
  if (!uri) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(uri, { signal: controller.signal });
    clearTimeout(timeout);
    let data = await resp.text();
    try {
      data = JSON.parse(data);
    } catch (e) {
      // Not valid JSON
      return null;
    }
    return data;
  } catch (err) {
    // Handle fetch error
    return null;
  }
} 


export async function getSolBalance(address: string) {
  try {
    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    const publicKey = new PublicKey(address);
    const lamports = await connection.getBalance(publicKey);
    const sol = lamports / 1e9;
    return sol;
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return null;
  }
}


