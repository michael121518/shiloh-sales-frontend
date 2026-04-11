import { Trade } from "@/types/trade";

const STORAGE_KEY = "shiloh_trades";

export function getTrades(): Trade[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTrades(trades: Trade[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
}

export function addTrades(newTrades: Trade[]): void {
  const existing = getTrades();
  saveTrades([...existing, ...newTrades]);
}

export function deleteTrade(id: string): void {
  const trades = getTrades().filter((t) => t.id !== id);
  saveTrades(trades);
}

export function parseCSVLine(line: string, date: string): Trade | null {
  const parts = line.split(",").map((s) => s.trim());
  if (parts.length < 4) return null;
  const [buyerName, amountStr, orderId, rateStr] = parts;
  const amountINR = parseFloat(amountStr);
  const usdtRate = parseFloat(rateStr);
  if (!buyerName || isNaN(amountINR) || !orderId || isNaN(usdtRate)) return null;
  return {
    id: crypto.randomUUID(),
    buyerName,
    amountINR,
    orderId,
    usdtRate,
    date,
  };
}
