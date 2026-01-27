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
    
    // Build base params for filtering
    const buildParams = (startingAfter?: string) => {
      const params = new URLSearchParams({
        page_size: '100', // Always fetch max per page for efficiency
        expand: 'user,merchant,card_holder,receipts',
      });

      // Use cursor-based pagination if we have a cursor
      if (startingAfter) {
        params.append('start', startingAfter);
      }

      // Map our filter options to Ramp API parameters
      if (filters) {
        if (filters.employee) params.append('user_id', filters.employee);
        if (filters.category) params.append('category_id', filters.category);
        // Ramp API requires ISO 8601 datetime format (YYYY-MM-DDTHH:MM:SSZ)
        if (filters.dateFrom) params.append('from_date', `${filters.dateFrom}T00:00:00Z`);
        if (filters.dateTo) params.append('to_date', `${filters.dateTo}T23:59:59Z`);
        if (filters.status) {
          const statusMap: Record<string, string> = {
            'pending': 'PENDING',
            'approved': 'CLEARED',
            'declined': 'DECLINED',
            'reimbursed': 'REIMBURSED'
          };
          params.append('state', statusMap[filters.status] || filters.status.toUpperCase());
        }
        if (filters.minAmount) params.append('min_amount', (filters.minAmount * 100).toString());
        if (filters.maxAmount) params.append('max_amount', (filters.maxAmount * 100).toString());
        if (filters.department) params.append('department_id', filters.department);
      }
      
      return params;
    };

    // Fetch ALL pages if pageSize > 100 (indicates "fetch all")
    const fetchAll = pageSize > 100;
    const allTransactions: RampTransaction[] = [];
    let cursor: string | undefined = undefined;
    let hasMore = true;
    let pageCount = 0;
    const maxPages = 50; // Safety limit: 50 pages * 100 = 5000 transactions max

    while (hasMore && pageCount < maxPages) {
      const params = buildParams(cursor);
      const response = await this.request<any>(`/developer/v1/transactions?${params}`);
      
      const transformed = response.data?.map((tx: any) => this.transformTransaction(tx)) || [];
      allTransactions.push(...transformed);
      
      pageCount++;
      console.log(`Fetched page ${pageCount}: ${transformed.length} transactions (total: ${allTransactions.length})`);
      
      // Check if there are more pages
      hasMore = fetchAll && response.page?.next !== undefined && response.page?.next !== null;
      cursor = response.page?.next;
      
      // If not fetching all, just return first page
      if (!fetchAll) break;
    }

    console.log(`Total transactions fetched: ${allTransactions.length} across ${pageCount} pages`);
    
    return {
      data: allTransactions,
      page: 1,
      page_size: allTransactions.length,
      total_count: allTransactions.length,
      has_more: false,
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
    // Receipts are UUIDs - construct Ramp receipt URLs
    const receiptIds = rampTx.receipts || [];
    const receipts = receiptIds.map((id: string) => 
      `https://app.ramp.com/receipts/${id}`
    );
    
    // Get card holder info - Ramp returns nested object with first_name, last_name, department_name, location_name
    const cardHolder = rampTx.card_holder || {};
    const cardHolderName = `${cardHolder.first_name || ''} ${cardHolder.last_name || ''}`.trim();
    
    // Get user/employee name - fall back to card holder if not available
    const user = rampTx.user || {};
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const employeeName = userName || cardHolderName;
    
    // Get department from card_holder or accounting_categories
    let department = cardHolder.department_name;
    if (!department && rampTx.accounting_categories) {
      const deptCategory = rampTx.accounting_categories.find(
        (c: any) => c.tracking_category_remote_type === 'OTHER' && c.tracking_category_remote_name === 'Department'
      );
      department = deptCategory?.category_name;
    }
    
    // Get location from card_holder or merchant_location
    let location = cardHolder.location_name;
    if (!location && rampTx.merchant_location) {
      const ml = rampTx.merchant_location;
      location = [ml.city, ml.state, ml.country].filter(Boolean).join(', ');
    }
    
    // Get category from sk_category_name or accounting_categories
    let categoryName = rampTx.sk_category_name || 'Uncategorized';
    if (rampTx.accounting_categories) {
      const glCategory = rampTx.accounting_categories.find(
        (c: any) => c.tracking_category_remote_type === 'GL_ACCOUNT'
      );
      if (glCategory?.category_name) {
        categoryName = glCategory.category_name;
      }
    }
    
    // Amount is already in dollars (not cents) based on the sample
    const amount = typeof rampTx.amount === 'number' 
      ? rampTx.amount 
      : (rampTx.original_transaction_amount?.amount || 0) / 100;
    
    return {
      id: rampTx.id || rampTx.transaction_id,
      amount: amount,
      currency: rampTx.currency_code || rampTx.currency || 'USD',
      description: rampTx.merchant_descriptor || rampTx.merchant_name || rampTx.memo || '',
      merchant_name: rampTx.merchant_name || '',
      category_name: categoryName,
      employee_name: employeeName,
      employee_email: user.email || '',
      card_holder_name: cardHolderName,
      date: rampTx.user_transaction_time || rampTx.accounting_date || rampTx.created_at,
      status: this.mapStatus(rampTx.state || rampTx.status),
      receipt_url: receipts[0],
      receipts: receipts,
      memo: rampTx.memo || '',
      department: department,
      location: location,
      spend_program_name: rampTx.limit_id ? `Program ${rampTx.limit_id.substring(0, 8)}` : undefined,
      spend_program_id: rampTx.limit_id,
      policy_violations: rampTx.policy_violations || [],
      is_compliant: !rampTx.policy_violations || rampTx.policy_violations.length === 0,
      pending_approver: undefined, // Will need separate API call to get approvers
      created_at: rampTx.created_at || rampTx.user_transaction_time,
      updated_at: rampTx.synced_at || rampTx.user_transaction_time,
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