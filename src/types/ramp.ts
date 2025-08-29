export interface RampTransaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  merchant_name: string;
  category_name: string;
  employee_name: string;
  employee_email: string;
  card_holder_name: string;
  date: string;
  status: 'pending' | 'approved' | 'declined' | 'reimbursed';
  receipt_url?: string;
  memo?: string;
  department?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface RampCard {
  id: string;
  display_name: string;
  last_four: string;
  cardholder_name: string;
  status: 'active' | 'inactive' | 'suspended';
  spending_limit: number;
  available_limit: number;
  created_at: string;
}

export interface RampUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  role: string;
  status: 'active' | 'inactive';
}

export interface FilterOptions {
  employee?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  department?: string;
}

export interface DashboardStats {
  totalTransactions: number;
  totalAmount: number;
  pendingTransactions: number;
  pendingAmount: number;
  approvedTransactions: number;
  approvedAmount: number;
}

export interface ApiResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total_count: number;
  has_more: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  filename?: string;
  includeHeaders?: boolean;
}