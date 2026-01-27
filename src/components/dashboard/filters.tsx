'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterOptions, RampTransaction } from '@/types/ramp';
import { Filter, X, Download, ChevronDown, Check } from 'lucide-react';
import { rampApi } from '@/lib/ramp-api';

interface FiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onExport: (format: 'csv' | 'excel') => void;
  loading?: boolean;
  transactions?: RampTransaction[];
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'reimbursed', label: 'Reimbursed' },
];

const policyOptions = [
  { value: '', label: 'All' },
  { value: 'compliant', label: 'In Policy' },
  { value: 'non-compliant', label: 'Out of Policy' },
];

// Multi-select dropdown component
interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

function MultiSelect({ label, options, selected, onChange, placeholder = 'Select...' }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const selectAll = () => onChange([...options]);
  const clearAll = () => onChange([]);

  const displayText = selected.length === 0 
    ? placeholder 
    : selected.length === options.length 
      ? 'All Selected' 
      : `${selected.length} selected`;

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-left bg-[#18171A] border border-[#2F2D33] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7511E2] focus:border-[#7511E2] text-sm"
      >
        <span className={selected.length === 0 ? 'text-gray-500' : 'text-white'}>
          {displayText}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[#18171A] border border-[#2F2D33] rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-[#2F2D33] border-b border-[#4A408F] px-3 py-2 flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-[#BC7CFF] hover:text-[#F08DFF]"
            >
              Select All
            </button>
            <span className="text-gray-500">|</span>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear All
            </button>
          </div>
          {options.map(option => (
            <label
              key={option}
              className="flex items-center px-3 py-2 hover:bg-[#2F2D33] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="h-4 w-4 text-[#7511E2] bg-[#18171A] border-[#2F2D33] rounded focus:ring-[#7511E2]"
              />
              <span className="ml-2 text-sm text-gray-300">{option || '(Empty)'}</span>
            </label>
          ))}
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">No options available</div>
          )}
        </div>
      )}
    </div>
  );
}

export function Filters({ filters, onFiltersChange, onExport, loading, transactions = [] }: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded
  const [employees, setEmployees] = useState<{ value: string; label: string }[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Extract unique values from transactions for multi-select filters
  const uniqueDepartments = [...new Set(transactions.map(t => t.department).filter(Boolean))] as string[];
  const uniqueCategories = [...new Set(transactions.map(t => t.category_name).filter(Boolean))] as string[];
  const uniqueMerchants = [...new Set(transactions.map(t => t.merchant_name).filter(Boolean))] as string[];
  const uniqueSpendPrograms = [...new Set(transactions.map(t => t.spend_program_name).filter(Boolean))] as string[];

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

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | string[] | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' || (Array.isArray(value) && value.length === 0) ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)
  );

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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#2F2D33]">
              <MultiSelect
                label="Department"
                options={uniqueDepartments}
                selected={filters.departments || []}
                onChange={(selected) => handleFilterChange('departments', selected)}
                placeholder="All Departments"
              />
              <MultiSelect
                label="Category"
                options={uniqueCategories}
                selected={filters.categories || []}
                onChange={(selected) => handleFilterChange('categories', selected)}
                placeholder="All Categories"
              />
              <MultiSelect
                label="Merchant"
                options={uniqueMerchants}
                selected={filters.merchants || []}
                onChange={(selected) => handleFilterChange('merchants', selected)}
                placeholder="All Merchants"
              />
              <MultiSelect
                label="Spend Program"
                options={uniqueSpendPrograms}
                selected={filters.spendPrograms || []}
                onChange={(selected) => handleFilterChange('spendPrograms', selected)}
                placeholder="All Programs"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <Select
                label="Policy Compliance"
                options={policyOptions}
                value={filters.policyCompliance || ''}
                onChange={(e) => handleFilterChange('policyCompliance', e.target.value)}
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
            </div>
          </>
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