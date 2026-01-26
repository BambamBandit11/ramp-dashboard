'use client';

import { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// Register AG Grid modules (must be done before grid renders)
ModuleRegistry.registerModules([AllCommunityModule]);
import { RampTransaction } from '@/types/ramp';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface TransactionsTableProps {
  transactions: RampTransaction[];
  loading?: boolean;
  onRefresh?: () => void;
}

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
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
};

// Currency cell renderer
const CurrencyCellRenderer = ({ value, data }: { value: number; data: RampTransaction }) => {
  return (
    <span className="font-medium">
      {formatCurrency(value, data.currency)}
    </span>
  );
};

// Date cell renderer
const DateCellRenderer = ({ value }: { value: string }) => {
  return (
    <span className="text-gray-600">
      {formatDateTime(value)}
    </span>
  );
};

export function TransactionsTable({ transactions, loading, onRefresh }: TransactionsTableProps) {
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Date',
      field: 'date',
      width: 150,
      cellRenderer: DateCellRenderer,
      sort: 'desc',
    },
    {
      headerName: 'Employee',
      field: 'employee_name',
      width: 150,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Merchant',
      field: 'merchant_name',
      width: 200,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Description',
      field: 'description',
      width: 250,
      filter: 'agTextColumnFilter',
      tooltipField: 'description',
    },
    {
      headerName: 'Category',
      field: 'category_name',
      width: 150,
      filter: 'agSetColumnFilter',
    },
    {
      headerName: 'Amount',
      field: 'amount',
      width: 120,
      cellRenderer: CurrencyCellRenderer,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 120,
      cellRenderer: StatusCellRenderer,
      filter: 'agSetColumnFilter',
    },
    {
      headerName: 'Department',
      field: 'department',
      width: 130,
      filter: 'agSetColumnFilter',
    },
    {
      headerName: 'Card Holder',
      field: 'card_holder_name',
      width: 150,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Memo',
      field: 'memo',
      width: 200,
      filter: 'agTextColumnFilter',
      tooltipField: 'memo',
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: true,
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