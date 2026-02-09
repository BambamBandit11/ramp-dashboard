import { RampTransaction, RampCard, RampUser, FilterOptions, ApiResponse } from '@/types/ramp';

class RampApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'RampApiError';
  }
}

class RampApiClient {
  private baseUrl = '/api/ramp';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        cache: 'no-store',
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new RampApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof RampApiError) {
        throw error;
      }
      throw new RampApiError('Network error occurred');
    }
  }

  async getTransactions(filters?: FilterOptions, page = 1, pageSize = 50): Promise<ApiResponse<RampTransaction>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    return this.request<ApiResponse<RampTransaction>>(`/transactions?${params}`);
  }

  async getTransaction(id: string): Promise<RampTransaction> {
    return this.request<RampTransaction>(`/transactions/${id}`);
  }

  async getCards(): Promise<ApiResponse<RampCard>> {
    return this.request<ApiResponse<RampCard>>('/cards');
  }

  async getUsers(): Promise<ApiResponse<RampUser>> {
    return this.request<ApiResponse<RampUser>>('/users');
  }

  async exportTransactions(filters?: FilterOptions, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams({ format });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/export?${params}`);
    
    if (!response.ok) {
      throw new RampApiError(`Export failed: ${response.statusText}`, response.status);
    }

    return response.blob();
  }
}

export const rampApi = new RampApiClient();
export { RampApiError };