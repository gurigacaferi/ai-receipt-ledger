export interface Invoice {
  id: string;
  user_id: string;
  file_url: string;
  vendor?: string;
  invoice_no?: string;
  invoice_date?: string;
  currency?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  raw_json?: any;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  invoice_id?: string;
  date: string;
  category: string;
  description?: string;
  amount: number;
  currency: string;
  vendor?: string;
}

export interface ParsedReceipt {
  vendor: string;
  invoice_no?: string;
  invoice_date: string;
  currency: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  guessed_categories: boolean;
}

export interface ReceiptItem {
  description: string;
  qty: number;
  unit_price: number;
  line_total: number;
  category: string;
}

export interface MonthlyReport {
  month: string;
  categories: Record<string, number>;
  total: number;
}

export type ExpenseCategory = 
  | "Ushqim" 
  | "Transport" 
  | "Teknologji" 
  | "Argëtim" 
  | "Tjetër";

export interface ParseStatus {
  status: "idle" | "uploading" | "parsing" | "done" | "error";
  message?: string;
}