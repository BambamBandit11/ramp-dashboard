import { NextRequest, NextResponse } from 'next/server';
import { rampServerClient } from '@/lib/ramp-server';
import { FilterOptions } from '@/types/ramp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(100, Math.max(2, parseInt(searchParams.get('page_size') || '50')));
    
    const filters: FilterOptions = {
      employee: searchParams.get('employee') || undefined,
      category: searchParams.get('category') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      status: searchParams.get('status') || undefined,
      minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
      maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined,
      department: searchParams.get('department') || undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof FilterOptions] === undefined) {
        delete filters[key as keyof FilterOptions];
      }
    });

    const result = await rampServerClient.getTransactions(filters, page, pageSize);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}