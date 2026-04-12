import { Trade, DateDocuments, StoredFile } from "@/types/trade";

const STORAGE_KEY = "shiloh_trades";
const DOCS_KEY = "shiloh_documents";

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

function generateInvoiceNo(): string {
  const trades = getTrades();
  const num = trades.length + 1;
  return `SHL-${String(num).padStart(5, "0")}`;
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
    invoiceNo: generateInvoiceNo(),
    buyerName,
    amountINR,
    orderId,
    usdtRate,
    date,
  };
}

// Document storage
export function getDocuments(): DateDocuments[] {
  const data = localStorage.getItem(DOCS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveDocuments(docs: DateDocuments[]): void {
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
}

export function getDocumentsByDate(date: string): DateDocuments {
  const docs = getDocuments();
  return docs.find((d) => d.date === date) || { date, kyc: [], chargeSlips: [] };
}

export function addDocument(date: string, type: "kyc" | "chargeSlips", file: StoredFile): void {
  const docs = getDocuments();
  const existing = docs.find((d) => d.date === date);
  if (existing) {
    existing[type].push(file);
  } else {
    const newDoc: DateDocuments = { date, kyc: [], chargeSlips: [] };
    newDoc[type].push(file);
    docs.push(newDoc);
  }
  saveDocuments(docs);
}

export function removeDocument(date: string, type: "kyc" | "chargeSlips", fileId: string): void {
  const docs = getDocuments();
  const existing = docs.find((d) => d.date === date);
  if (existing) {
    existing[type] = existing[type].filter((f) => f.id !== fileId);
    saveDocuments(docs);
  }
}
