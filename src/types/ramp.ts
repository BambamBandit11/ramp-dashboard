export interface RampTransaction {
  id: string;
  user_id?: string;
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
  receipts?: string[];
  memo?: string;
  department?: string;
  location?: string;
  spend_program_name?: string;
  spend_program_id?: string;
  budget_account?: string;      // NetSuite GL Account (e.g., "66010 - Token Usage - Opex")
  budget_department?: string;   // NetSuite Department (e.g., "IT") - where expense is charged
  policy_violations?: string[];
  is_compliant?: boolean;
  pending_approver?: string;
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
  employees?: string[]; // Multi-select employee names
  category?: string;
  categories?: string[];
  merchants?: string[];
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  statuses?: string[]; // Multi-select statuses
  minAmount?: number;
  maxAmount?: number;
  department?: string;
  departments?: string[];
  spendPrograms?: string[];
  policyCompliance?: 'compliant' | 'non-compliant' | '';
  policyCompliances?: string[]; // Multi-select policy compliance
  budgetAccounts?: string[];    // Multi-select Budget Account (GL Account)
  budgetDepartments?: string[]; // Multi-select Budget Department
}

export interface DashboardStats {
  totalTransactions: number;
  totalAmount: number;
  pendingTransactions: number;
  pendingAmount: number;
  approvedTransactions: number;
  approvedAmount: number;
  // New stats for improved tiles
  ytdSpend: number;
  thisMonthSpend: number;
  reimbursementsCount: number;
  reimbursementsAmount: number;
  receiptsCount: number;
  missingReceiptsCount: number;
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