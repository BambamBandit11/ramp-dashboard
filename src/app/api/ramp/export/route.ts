import { NextRequest, NextResponse } from 'next/server';
import { rampServerClient } from '@/lib/ramp-server';
import { FilterOptions } from '@/types/ramp';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    
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

    // Get all transactions (we'll handle pagination on the server side for export)
    const result = await rampServerClient.getTransactions(filters, 1, 1000);
    
    // Transform data for export
    const exportData = result.data.map(transaction => ({
      'Transaction ID': transaction.id,
      'Date': transaction.date,
      'Employee': transaction.employee_name,
      'Email': transaction.employee_email,
      'Merchant': transaction.merchant_name,
      'Description': transaction.description,
      'Category': transaction.category_name,
      'Amount': transaction.amount,
      'Currency': transaction.currency,
      'Status': transaction.status,
      'Department': transaction.department || '',
      'Card Holder': transaction.card_holder_name,
      'Memo': transaction.memo || '',
      'Created At': transaction.created_at,
    }));

    if (format === 'excel') {
      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      
      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="ramp-transactions-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    } else {
      // Create CSV file
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ramp-transactions-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}