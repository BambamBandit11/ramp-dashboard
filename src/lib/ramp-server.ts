import { RampTransaction, RampCard, RampUser, FilterOptions, ApiResponse } from '@/types/ramp';
import { mockTransactions, mockCards, mockUsers, createMockApiResponse, filterMockTransactions } from './mock-data';

const RAMP_PRODUCTION_BASE = 'https://api.ramp.com';
const RAMP_SANDBOX_BASE = 'https://demo-api.ramp.com';

interface RampTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

class RampServerClient {
  private clientId: string;
  private clientSecret: string;
  private environment: 'production' | 'sandbox';
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private useMockData: boolean;

  constructor() {
    this.clientId = process.env.RAMP_CLIENT_ID || '';
    this.clientSecret = process.env.RAMP_CLIENT_SECRET || '';
    this.environment = (process.env.RAMP_ENVIRONMENT as 'production' | 'sandbox') || 'production';
    this.baseUrl = this.environment === 'production' ? RAMP_PRODUCTION_BASE : RAMP_SANDBOX_BASE;
    
    // Use mock data if:
    // - No credentials provided
    // - Credentials contain "demo" or "test"
    // - Credentials are placeholder values
    this.useMockData = !this.clientId || 
                       !this.clientSecret ||
                       this.clientId.toLowerCase().includes('demo') ||
                       this.clientId.toLowerCase().includes('test') ||
                       this.clientId === 'your_client_id_here' ||
                       this.clientSecret === 'your_client_secret_here' ||
                       this.clientId.length < 10;
    
    console.log('Ramp API Client initialized:', {
      hasClientId: !!this.clientId,
      hasClientSecret: !!this.clientSecret,
      environment: this.environment,
      baseUrl: this.baseUrl,
      useMockData: this.useMockData,
      clientIdPreview: this.clientId ? this.clientId.substring(0, 15) + '...' : 'none'
    });
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 5 minute buffer)
    if (this.accessToken && Date.now() < (this.tokenExpiry - 300000)) {
      return this.accessToken;
    }

    console.log('Requesting new access token from Ramp...');
    
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await fetch(`${this.baseUrl}/developer/v1/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'scope': 'transactions:read users:read cards:read business:read'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token request failed:', response.status, errorText);
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }

    const tokenData: RampTokenResponse = await response.json();
    
    this.accessToken = tokenData.access_token;
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
    
    console.log('Access token obtained successfully, expires in:', tokenData.expires_in, 'seconds');
    
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('Making Ramp API request to:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Ramp API request failed:', response.status, errorData);
      throw new Error(
        `Ramp API error: ${response.status} ${response.statusText} - ${errorData}`
      );
    }

    const data = await response.json();
    console.log('Ramp API response received, data length:', Array.isArray(data?.data) ? data.data.length : 'N/A');
    
    return data;
  }

  async getTransactions(filters?: FilterOptions, page = 1, pageSize = 50): Promise<ApiResponse<RampTransaction>> {
    if (this.useMockData) {
      console.log('Using mock data for transactions (no valid credentials)');
      const filteredTransactions = filters ? filterMockTransactions(mockTransactions, filters) : mockTransactions;
      return createMockApiResponse(filteredTransactions, page, pageSize);
    }

    console.log('Fetching real transactions from Ramp API...');
    
    const params = new URLSearchParams({
      page_size: pageSize.toString(),
      expand: 'user,merchant,card_holder,receipts',
    });

    // Add pagination if not first page
    if (page > 1) {
      params.append('page', page.toString());
    }

    // Map our filter options to Ramp API parameters
    if (filters) {
      if (filters.employee) params.append('user_id', filters.employee);
      if (filters.category) params.append('category_id', filters.category);
      if (filters.dateFrom) params.append('from_date', filters.dateFrom);
      if (filters.dateTo) params.append('to_date', filters.dateTo);
      if (filters.status) {
        // Map our status values to Ramp's status values
        const statusMap: Record<string, string> = {
          'pending': 'PENDING',
          'approved': 'CLEARED',
          'declined': 'DECLINED',
          'reimbursed': 'REIMBURSED'
        };
        params.append('state', statusMap[filters.status] || filters.status.toUpperCase());
      }
      if (filters.minAmount) params.append('min_amount', (filters.minAmount * 100).toString()); // Convert to cents
      if (filters.maxAmount) params.append('max_amount', (filters.maxAmount * 100).toString());
      if (filters.department) params.append('department_id', filters.department);
    }

    const response = await this.request<any>(`/developer/v1/transactions?${params}`);
    
    // Log first transaction to debug structure
    if (response.data?.[0]) {
      console.log('Sample Ramp transaction structure:', JSON.stringify(response.data[0], null, 2));
    }
    
    // Transform Ramp API response to our format
    return {
      data: response.data?.map((tx: any) => this.transformTransaction(tx)) || [],
      page: response.page || page,
      page_size: response.page_size || pageSize,
      total_count: response.total_count || response.data?.length || 0,
      has_more: response.has_more || false,
    };
  }

  async getCards(): Promise<ApiResponse<RampCard>> {
    if (this.useMockData) {
      console.log('Using mock data for cards (no valid credentials)');
      return createMockApiResponse(mockCards);
    }

    console.log('Fetching real cards from Ramp API...');
    const response = await this.request<any>('/developer/v1/cards');
    
    return {
      data: response.data?.map((card: any) => this.transformCard(card)) || [],
      page: 1,
      page_size: response.data?.length || 0,
      total_count: response.data?.length || 0,
      has_more: false,
    };
  }

  async getUsers(): Promise<ApiResponse<RampUser>> {
    if (this.useMockData) {
      console.log('Using mock data for users (no valid credentials)');
      return createMockApiResponse(mockUsers);
    }

    console.log('Fetching real users from Ramp API...');
    const response = await this.request<any>('/developer/v1/users');
    
    return {
      data: response.data?.map((user: any) => this.transformUser(user)) || [],
      page: 1,
      page_size: response.data?.length || 0,
      total_count: response.data?.length || 0,
      has_more: false,
    };
  }

  private transformTransaction(rampTx: any): RampTransaction {
    // Handle Ramp's actual transaction structure
    const receipts = rampTx.receipts?.map((r: any) => r.url || r).filter(Boolean) || [];
    
    return {
      id: rampTx.id || rampTx.transaction_id,
      amount: (rampTx.amount || rampTx.amount_cents || 0) / 100, // Convert from cents
      currency: rampTx.currency_code || rampTx.currency || 'USD',
      description: rampTx.merchant_name || rampTx.description || rampTx.memo || '',
      merchant_name: rampTx.merchant?.name || rampTx.merchant_name || '',
      category_name: rampTx.category?.name || rampTx.category_name || 'Uncategorized',
      employee_name: rampTx.user ? `${rampTx.user.first_name || ''} ${rampTx.user.last_name || ''}`.trim() : '',
      employee_email: rampTx.user?.email || '',
      card_holder_name: rampTx.card_holder ? `${rampTx.card_holder.first_name || ''} ${rampTx.card_holder.last_name || ''}`.trim() : '',
      date: rampTx.user_transaction_time || rampTx.transaction_date || rampTx.created_at,
      status: this.mapStatus(rampTx.state || rampTx.status),
      receipt_url: receipts[0] || rampTx.receipt_url,
      receipts: receipts,
      memo: rampTx.memo || rampTx.note || '',
      department: rampTx.user?.department?.name || rampTx.department?.name,
      location: rampTx.merchant?.city ? `${rampTx.merchant.city}, ${rampTx.merchant.state || rampTx.merchant.country || ''}`.trim() : rampTx.location,
      spend_program_name: rampTx.spending_limit?.display_name || rampTx.spend_program?.name,
      spend_program_id: rampTx.spending_limit?.id || rampTx.spend_program?.id,
      policy_violations: rampTx.policy_violations || [],
      is_compliant: !rampTx.policy_violations || rampTx.policy_violations.length === 0,
      pending_approver: rampTx.pending_reviewer ? `${rampTx.pending_reviewer.first_name || ''} ${rampTx.pending_reviewer.last_name || ''}`.trim() : undefined,
      created_at: rampTx.created_at,
      updated_at: rampTx.updated_at,
    };
  }

  private transformCard(rampCard: any): RampCard {
    return {
      id: rampCard.id,
      display_name: rampCard.display_name || rampCard.name,
      last_four: rampCard.last_four || rampCard.last_4,
      cardholder_name: rampCard.cardholder ? `${rampCard.cardholder.first_name || ''} ${rampCard.cardholder.last_name || ''}`.trim() : '',
      status: rampCard.is_active ? 'active' : 'inactive',
      spending_limit: (rampCard.spending_restrictions?.amount || rampCard.spending_limit || 0) / 100,
      available_limit: (rampCard.remaining_limit || rampCard.available_limit || 0) / 100,
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
      status: rampUser.is_active !== false ? 'active' : 'inactive',
    };
  }

  private mapStatus(rampStatus: string): 'pending' | 'approved' | 'declined' | 'reimbursed' {
    if (!rampStatus) return 'pending';
    
    switch (rampStatus.toUpperCase()) {
      case 'PENDING':
      case 'SUBMITTED':
      case 'PROCESSING':
        return 'pending';
      case 'APPROVED':
      case 'CLEARED':
      case 'SETTLED':
        return 'approved';
      case 'DECLINED':
      case 'REJECTED':
      case 'CANCELLED':
        return 'declined';
      case 'REIMBURSED':
      case 'REFUNDED':
        return 'reimbursed';
      default:
        return 'pending';
    }
  }
}

export const rampServerClient = new RampServerClient();