export interface Trade {
  id: string;
  invoiceNo: string;
  buyerName: string;
  amountINR: number;
  orderId: string;
  usdtRate: number;
  date: string; // YYYY-MM-DD
}

export interface DateDocuments {
  date: string; // YYYY-MM-DD
  kyc: StoredFile[];
  chargeSlips: StoredFile[];
}

export interface StoredFile {
  id: string;
  name: string;
  type: string;
  dataUrl: string; // base64 data URL
  uploadedAt: string;
}
