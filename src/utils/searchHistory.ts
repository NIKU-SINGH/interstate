import type { Token } from "~/utils/db";

export const SEARCH_HISTORY_KEY = "searchHistory";

export type SearchHistoryItem = Pick<
  Token,
  | "mint"
  | "symbol"
  | "name"
  | "logo"
  | "uri"
  | "total_fully_diluted_valuation"
  | "total_buy_volume_24h"
  | "total_sell_volume_24h"
  | "total_liquidity_usd"
>;

export function getHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToHistory(item: SearchHistoryItem, maxEntries = 20) {
  if (typeof window === "undefined") return;
  const current = getHistory().filter((t) => t.mint !== item.mint);
  const updated = [item, ...current].slice(0, maxEntries);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}
