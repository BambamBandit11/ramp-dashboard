import { RampTransaction, RampCard, RampUser, FilterOptions, ApiResponse } from '@/types/ramp';
import { mockTransactions, mockCards, mockUsers, createMockApiResponse, filterMockTransactions } from './mock-data';

const RAMP_API_BASE = 'https://api.ramp.com/v1';

class RampServerClient {
  private apiKey: string;
  private useMockData: boolean;

  constructor() {
    this.apiKey = process.env.RAMP_API_KEY || '';
    this.useMockData = !this.apiKey || this.apiKey === 'demo_key_replace_with_real_key';
    
    if (!this.useMockData && !this.apiKey) {
      throw new Error('RAMP_API_KEY environment variable is required');
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${RAMP_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Ramp API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async getTransactions(filters?: FilterOptions, page = 1, pageSize = 50): Promise<ApiResponse<RampTransaction>> {
    if (this.useMockData) {
      // Use mock data for development
      const filteredTransactions = filters ? filterMockTransactions(mockTransactions, filters) : mockTransactions;
      return createMockApiResponse(filteredTransactions, page, pageSize);
    }

    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    // Map our filter options to Ramp API parameters
    if (filters) {
      if (filters.employee) params.append('user_id', filters.employee);
      if (filters.category) params.append('category_id', filters.category);
      if (filters.dateFrom) params.append('from_date', filters.dateFrom);
      if (filters.dateTo) params.append('to_date', filters.dateTo);
      if (filters.status) params.append('state', filters.status);
      if (filters.minAmount) params.append('min_amount', (filters.minAmount * 100).toString()); // Convert to cents
      if (filters.maxAmount) params.append('max_amount', (filters.maxAmount * 100).toString());
      if (filters.department) params.append('department_id', filters.department);
    }

    const response = await this.request<any>(`/transactions?${params}`);
    
    // Transform Ramp API response to our format
    return {
      data: response.data.map(this.transformTransaction),
      page: response.page || page,
      page_size: response.page_size || pageSize,
      total_count: response.total_count || response.data.length,
      has_more: response.has_more || false,
    };
  }

  async getCards(): Promise<ApiResponse<RampCard>> {
    if (this.useMockData) {
      return createMockApiResponse(mockCards);
    }

    const response = await this.request<any>('/cards');
    
    return {
      data: response.data.map(this.transformCard),
      page: 1,
      page_size: response.data.length,
      total_count: response.data.length,
      has_more: false,
    };
  }

  async getUsers(): Promise<ApiResponse<RampUser>> {
    if (this.useMockData) {
      return createMockApiResponse(mockUsers);
    }

    const response = await this.request<any>('/users');
    
    return {
      data: response.data.map(this.transformUser),
      page: 1,
      page_size: response.data.length,
      total_count: response.data.length,
      has_more: false,
    };
  }

  private transformTransaction(rampTx: any): RampTransaction {
    return {
      id: rampTx.id,
      amount: rampTx.amount / 100, // Convert from cents
      currency: rampTx.currency || 'USD',
      description: rampTx.merchant_name || rampTx.description || '',
      merchant_name: rampTx.merchant_name || '',
      category_name: rampTx.category?.name || 'Uncategorized',
      employee_name: `${rampTx.user?.first_name || ''} ${rampTx.user?.last_name || ''}`.trim(),
      employee_email: rampTx.user?.email || '',
      card_holder_name: rampTx.card_holder?.first_name + ' ' + rampTx.card_holder?.last_name || '',
      date: rampTx.user_transaction_time || rampTx.created_at,
      status: this.mapStatus(rampTx.state),
      receipt_url: rampTx.receipts?.[0]?.url,
      memo: rampTx.memo,
      department: rampTx.user?.department?.name,
      location: rampTx.merchant?.descriptor,
      created_at: rampTx.created_at,
      updated_at: rampTx.updated_at,
    };
  }

  private transformCard(rampCard: any): RampCard {
    return {
      id: rampCard.id,
      display_name: rampCard.display_name,
      last_four: rampCard.last_four,
      cardholder_name: `${rampCard.cardholder?.first_name || ''} ${rampCard.cardholder?.last_name || ''}`.trim(),
      status: rampCard.is_active ? 'active' : 'inactive',
      spending_limit: rampCard.spending_restrictions?.amount / 100 || 0,
      available_limit: rampCard.remaining_limit / 100 || 0,
      created_at: rampCard.created_at,
    };
  }

  private transformUser(rampUser: any): RampUser {
    return {
      id: rampUser.id,
      first_name: rampUser.first_name,
      last_name: rampUser.last_name,
      email: rampUser.email,
      department: rampUser.department?.name,
      role: rampUser.role || 'user',
      status: rampUser.is_active ? 'active' : 'inactive',
    };
  }

  private mapStatus(rampStatus: string): 'pending' | 'approved' | 'declined' | 'reimbursed' {
    switch (rampStatus?.toLowerCase()) {
      case 'pending':
      case 'submitted':
        return 'pending';
      case 'approved':
      case 'cleared':
        return 'approved';
      case 'declined':
      case 'rejected':
        return 'declined';
      case 'reimbursed':
        return 'reimbursed';
      default:
        return 'pending';
    }
  }
}

export const rampServerClient = new RampServerClient();