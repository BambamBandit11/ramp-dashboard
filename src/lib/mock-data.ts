import { RampTransaction, RampCard, RampUser, ApiResponse } from '@/types/ramp';

// Mock users/employees
export const mockUsers: RampUser[] = [
  {
    id: 'user-1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    role: 'Software Engineer',
    status: 'active',
  },
  {
    id: 'user-2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@company.com',
    department: 'Marketing',
    role: 'Marketing Manager',
    status: 'active',
  },
  {
    id: 'user-3',
    first_name: 'Mike',
    last_name: 'Johnson',
    email: 'mike.johnson@company.com',
    department: 'Sales',
    role: 'Sales Representative',
    status: 'active',
  },
  {
    id: 'user-4',
    first_name: 'Sarah',
    last_name: 'Wilson',
    email: 'sarah.wilson@company.com',
    department: 'Operations',
    role: 'Operations Manager',
    status: 'active',
  },
];

// Mock cards
export const mockCards: RampCard[] = [
  {
    id: 'card-1',
    display_name: 'John Doe - Engineering',
    last_four: '1234',
    cardholder_name: 'John Doe',
    status: 'active',
    spending_limit: 5000,
    available_limit: 3200,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'card-2',
    display_name: 'Jane Smith - Marketing',
    last_four: '5678',
    cardholder_name: 'Jane Smith',
    status: 'active',
    spending_limit: 3000,
    available_limit: 1500,
    created_at: '2024-01-20T10:00:00Z',
  },
];

// Mock transactions
export const mockTransactions: RampTransaction[] = [
  {
    id: 'tx-1',
    amount: 45.67,
    currency: 'USD',
    description: 'Team lunch at Chipotle',
    merchant_name: 'Chipotle Mexican Grill',
    category_name: 'Meals & Entertainment',
    employee_name: 'John Doe',
    employee_email: 'john.doe@company.com',
    card_holder_name: 'John Doe',
    date: '2024-01-15T12:30:00Z',
    status: 'approved',
    department: 'Engineering',
    memo: 'Team building lunch',
    created_at: '2024-01-15T12:30:00Z',
    updated_at: '2024-01-15T14:00:00Z',
  },
  {
    id: 'tx-2',
    amount: 299.99,
    currency: 'USD',
    description: 'Adobe Creative Suite subscription',
    merchant_name: 'Adobe Systems',
    category_name: 'Software & Subscriptions',
    employee_name: 'Jane Smith',
    employee_email: 'jane.smith@company.com',
    card_holder_name: 'Jane Smith',
    date: '2024-01-14T09:15:00Z',
    status: 'approved',
    department: 'Marketing',
    memo: 'Monthly design software subscription',
    created_at: '2024-01-14T09:15:00Z',
    updated_at: '2024-01-14T10:30:00Z',
  },
  {
    id: 'tx-3',
    amount: 1250.00,
    currency: 'USD',
    description: 'Flight to San Francisco',
    merchant_name: 'United Airlines',
    category_name: 'Travel',
    employee_name: 'Mike Johnson',
    employee_email: 'mike.johnson@company.com',
    card_holder_name: 'Mike Johnson',
    date: '2024-01-13T06:45:00Z',
    status: 'pending',
    department: 'Sales',
    memo: 'Client meeting in SF',
    created_at: '2024-01-13T06:45:00Z',
    updated_at: '2024-01-13T06:45:00Z',
  },
  {
    id: 'tx-4',
    amount: 89.50,
    currency: 'USD',
    description: 'Office supplies',
    merchant_name: 'Staples',
    category_name: 'Office Supplies',
    employee_name: 'Sarah Wilson',
    employee_email: 'sarah.wilson@company.com',
    card_holder_name: 'Sarah Wilson',
    date: '2024-01-12T14:20:00Z',
    status: 'approved',
    department: 'Operations',
    memo: 'Printer paper and pens',
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-01-12T15:00:00Z',
  },
  {
    id: 'tx-5',
    amount: 15.99,
    currency: 'USD',
    description: 'Uber ride to airport',
    merchant_name: 'Uber',
    category_name: 'Travel',
    employee_name: 'Mike Johnson',
    employee_email: 'mike.johnson@company.com',
    card_holder_name: 'Mike Johnson',
    date: '2024-01-13T05:30:00Z',
    status: 'approved',
    department: 'Sales',
    memo: 'Transportation to airport',
    created_at: '2024-01-13T05:30:00Z',
    updated_at: '2024-01-13T06:00:00Z',
  },
  {
    id: 'tx-6',
    amount: 125.00,
    currency: 'USD',
    description: 'Hotel night in SF',
    merchant_name: 'Marriott Hotels',
    category_name: 'Travel',
    employee_name: 'Mike Johnson',
    employee_email: 'mike.johnson@company.com',
    card_holder_name: 'Mike Johnson',
    date: '2024-01-13T22:00:00Z',
    status: 'pending',
    department: 'Sales',
    memo: 'Overnight stay for client meeting',
    created_at: '2024-01-13T22:00:00Z',
    updated_at: '2024-01-13T22:00:00Z',
  },
  {
    id: 'tx-7',
    amount: 67.89,
    currency: 'USD',
    description: 'Client dinner',
    merchant_name: 'The Cheesecake Factory',
    category_name: 'Meals & Entertainment',
    employee_name: 'Jane Smith',
    employee_email: 'jane.smith@company.com',
    card_holder_name: 'Jane Smith',
    date: '2024-01-11T19:30:00Z',
    status: 'approved',
    department: 'Marketing',
    memo: 'Dinner with potential client',
    created_at: '2024-01-11T19:30:00Z',
    updated_at: '2024-01-12T09:00:00Z',
  },
  {
    id: 'tx-8',
    amount: 199.99,
    currency: 'USD',
    description: 'Zoom Pro subscription',
    merchant_name: 'Zoom Video Communications',
    category_name: 'Software & Subscriptions',
    employee_name: 'Sarah Wilson',
    employee_email: 'sarah.wilson@company.com',
    card_holder_name: 'Sarah Wilson',
    date: '2024-01-10T10:00:00Z',
    status: 'approved',
    department: 'Operations',
    memo: 'Annual video conferencing subscription',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T11:00:00Z',
  },
];

// Helper function to create API response format
export function createMockApiResponse<T>(data: T[], page = 1, pageSize = 50): ApiResponse<T> {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    page,
    page_size: pageSize,
    total_count: data.length,
    has_more: endIndex < data.length,
  };
}

// Helper function to filter transactions based on FilterOptions
export function filterMockTransactions(transactions: RampTransaction[], filters: any): RampTransaction[] {
  return transactions.filter(transaction => {
    if (filters.employee && transaction.employee_name.toLowerCase().indexOf(filters.employee.toLowerCase()) === -1) {
      return false;
    }
    if (filters.category && transaction.category_name !== filters.category) {
      return false;
    }
    if (filters.status && transaction.status !== filters.status) {
      return false;
    }
    if (filters.dateFrom && new Date(transaction.date) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && new Date(transaction.date) > new Date(filters.dateTo)) {
      return false;
    }
    if (filters.minAmount && transaction.amount < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount && transaction.amount > filters.maxAmount) {
      return false;
    }
    if (filters.department && transaction.department !== filters.department) {
      return false;
    }
    return true;
  });
}