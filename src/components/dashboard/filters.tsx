'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterOptions } from '@/types/ramp';
import { Filter, X, Download } from 'lucide-react';
import { rampApi } from '@/lib/ramp-api';

interface FiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onExport: (format: 'csv' | 'excel') => void;
  loading?: boolean;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'reimbursed', label: 'Reimbursed' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'meals', label: 'Meals & Entertainment' },
  { value: 'travel', label: 'Travel' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'software', label: 'Software & Subscriptions' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Other' },
];

export function Filters({ filters, onFiltersChange, onExport, loading }: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [employees, setEmployees] = useState<{ value: string; label: string }[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const response = await rampApi.getUsers();
        const employeeOptions = [
          { value: '', label: 'All Employees' },
          ...response.data.map(user => ({
            value: user.id,
            label: `${user.first_name} ${user.last_name}`,
          }))
        ];
        setEmployees(employeeOptions);
      } catch (error) {
        console.error('Failed to load employees:', error);
        setEmployees([{ value: '', label: 'All Employees' }]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('csv')}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('excel')}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Employee"
            options={employees}
            value={filters.employee || ''}
            onChange={(e) => handleFilterChange('employee', e.target.value)}
            disabled={loadingEmployees}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          />
          <Input
            label="From Date"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
          <Input
            label="To Date"
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>

        {/* Advanced Filters - Expandable */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <Select
              label="Category"
              options={categoryOptions}
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            />
            <Input
              label="Min Amount"
              type="number"
              placeholder="0.00"
              value={filters.minAmount || ''}
              onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
            <Input
              label="Max Amount"
              type="number"
              placeholder="1000.00"
              value={filters.maxAmount || ''}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
            <Input
              label="Department"
              placeholder="Engineering, Sales..."
              value={filters.department || ''}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            />
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}