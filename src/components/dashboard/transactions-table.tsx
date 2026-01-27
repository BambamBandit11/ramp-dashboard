'use client';

import { useMemo, useCallback, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// Register AG Grid modules (must be done before grid renders)
ModuleRegistry.registerModules([AllCommunityModule]);
import { RampTransaction } from '@/types/ramp';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, FileText, ExternalLink } from 'lucide-react';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface TransactionsTableProps {
  transactions: RampTransaction[];
  loading?: boolean;
  onRefresh?: () => void;
}

// Format date nicely
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Status cell renderer
const StatusCellRenderer = ({ value }: { value: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'reimbursed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
      {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
    </span>
  );
};

// Currency cell renderer
const CurrencyCellRenderer = ({ value, data }: { value: number; data: RampTransaction }) => {
  return (
    <span className="font-medium text-teal-600">
      {formatCurrency(value, data.currency)}
    </span>
  );
};

// Date cell renderer
const DateCellRenderer = ({ value }: { value: string }) => {
  return (
    <span className="text-gray-700">
      {formatDate(value)}
    </span>
  );
};

// Policy compliance cell renderer with tooltip for violations
const PolicyCellRenderer = ({ data }: { data: RampTransaction }) => {
  const isCompliant = data.is_compliant !== false && (!data.policy_violations || data.policy_violations.length === 0);
  const violationText = data.policy_violations?.join(', ') || 'Policy violation';
  
  return (
    <div className="flex items-center justify-center" title={isCompliant ? 'In Policy' : violationText}>
      {isCompliant ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 cursor-help" />
      )}
    </div>
  );
};

// Receipt cell renderer - shows indicator only (Ramp receipt URLs require authentication)
const ReceiptCellRenderer = ({ data }: { data: RampTransaction }) => {
  const hasReceipt = data.receipt_url || (data.receipts && data.receipts.length > 0);
  const receiptCount = data.receipts?.length || (data.receipt_url ? 1 : 0);
  
  return (
    <div className="flex items-center justify-center" title={hasReceipt ? `${receiptCount} receipt(s) attached` : 'No receipt'}>
      {hasReceipt ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )}
    </div>
  );
};

export function TransactionsTable({ transactions, loading, onRefresh }: TransactionsTableProps) {
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Date',
      field: 'date',
      minWidth: 120,
      width: 120,
      cellRenderer: DateCellRenderer,
      sort: 'desc',
    },
    {
      headerName: 'Employee',
      field: 'employee_name',
      minWidth: 140,
      width: 140,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Department',
      field: 'department',
      minWidth: 160,
      width: 160,
      filter: 'agSetColumnFilter',
    },
    {
      headerName: 'Merchant',
      field: 'merchant_name',
      minWidth: 150,
      width: 150,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Category',
      field: 'category_name',
      minWidth: 180,
      width: 180,
      filter: 'agSetColumnFilter',
    },
    {
      headerName: 'Amount',
      field: 'amount',
      minWidth: 100,
      width: 100,
      cellRenderer: CurrencyCellRenderer,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
    },
    {
      headerName: 'Location',
      field: 'location',
      minWidth: 140,
      width: 140,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Memo',
      field: 'memo',
      minWidth: 200,
      flex: 1,
      filter: 'agTextColumnFilter',
      tooltipField: 'memo',
    },
    {
      headerName: 'Receipt',
      field: 'receipt_url',
      minWidth: 80,
      width: 80,
      cellRenderer: ReceiptCellRenderer,
      filter: false,
      sortable: false,
    },
    {
      headerName: 'Policy',
      field: 'is_compliant',
      minWidth: 80,
      width: 80,
      cellRenderer: PolicyCellRenderer,
      filter: false,
      sortable: false,
    },
    {
      headerName: 'Status',
      field: 'status',
      minWidth: 100,
      width: 100,
      cellRenderer: StatusCellRenderer,
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: false,  // Disable floating filters - use filter pane instead
    floatingFilter: false,  // Remove the filter row below headers
    wrapText: true,  // Enable text wrapping
    autoHeight: true,  // Auto-adjust row height for wrapped text
  }), []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Auto-size columns to fit content
    params.api.sizeColumnsToFit();
  }, []);

  const getRowStyle = useCallback((params: { node: { rowIndex?: number } }) => {
    // Alternate row colors
    if (params.node.rowIndex && params.node.rowIndex % 2 === 0) {
      return { backgroundColor: '#fafafa' };
    }
    return null;
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transactions ({transactions.length})</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
          <AgGridReact
            rowData={transactions}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            getRowStyle={getRowStyle}
            pagination={true}
            paginationPageSize={50}
            suppressRowClickSelection={true}
            enableCellTextSelection={true}
            animateRows={true}
            loading={loading}
            loadingOverlayComponent={() => (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span>Loading transactions...</span>
                </div>
              </div>
            )}
            noRowsOverlayComponent={() => (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">No transactions found</p>
                  <p className="text-sm text-gray-400">Try adjusting your filters</p>
                </div>
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}