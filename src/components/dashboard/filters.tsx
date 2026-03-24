'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterOptions, RampTransaction } from '@/types/ramp';
import { Filter, X, Download, ChevronDown, Search } from 'lucide-react';

interface FiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onExport: (format: 'csv' | 'excel') => void;
  loading?: boolean;
  transactions?: RampTransaction[];
}

const STATUS_OPTIONS = ['Pending', 'Approved', 'Declined', 'Reimbursed'];
const POLICY_OPTIONS = ['In Policy', 'Out of Policy'];

// Unified searchable multi-select with Apply button
interface SearchableMultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onApply: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

function SearchableMultiSelect({ 
  label, 
  options, 
  selected, 
  onApply, 
  placeholder = 'All',
  searchPlaceholder = 'Search...'
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingSelected, setPendingSelected] = useState<string[]>(selected);
  const ref = useRef<HTMLDivElement>(null);

  // Sync pending selections when prop changes (e.g., clear filters)
  useEffect(() => {
    setPendingSelected(selected);
  }, [selected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        // Reset pending to actual on close without apply
        setPendingSelected(selected);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selected]);

  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => a.localeCompare(b));
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return sortedOptions;
    const query = searchQuery.toLowerCase();
    return sortedOptions.filter(opt => opt.toLowerCase().includes(query));
  }, [sortedOptions, searchQuery]);

  const toggleOption = (option: string) => {
    if (pendingSelected.includes(option)) {
      setPendingSelected(pendingSelected.filter(s => s !== option));
    } else {
      setPendingSelected([...pendingSelected, option]);
    }
  };

  const selectAllVisible = () => {
    const newSelected = [...new Set([...pendingSelected, ...filteredOptions])];
    setPendingSelected(newSelected);
  };

  const clearAll = () => setPendingSelected([]);

  const handleApply = () => {
    onApply(pendingSelected);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setPendingSelected([]);
    onApply([]);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) return selected[0];
    return `${selected.length} selected`;
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-left bg-[#18171A] border border-[#2F2D33] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7511E2] focus:border-[#7511E2] text-sm"
      >
        <span className={selected.length === 0 ? 'text-gray-500' : 'text-white'}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[#18171A] border border-[#2F2D33] rounded-md shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-[#2F2D33]">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#2F2D33] border border-[#4A408F] rounded focus:outline-none focus:ring-1 focus:ring-[#7511E2] text-white placeholder-gray-500"
                autoFocus
              />
            </div>
          </div>
          
          {/* Select All / Clear All */}
          <div className="bg-[#2F2D33] border-b border-[#4A408F] px-3 py-2 flex gap-2">
            <button
              type="button"
              onClick={selectAllVisible}
              className="text-xs text-[#BC7CFF] hover:text-[#F08DFF]"
            >
              Select All{searchQuery ? ' Visible' : ''}
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
          
          {/* Options list */}
          <div className="max-h-48 overflow-auto">
            {filteredOptions.map(option => (
              <label
                key={option}
                className="flex items-center px-3 py-2 hover:bg-[#2F2D33] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={pendingSelected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="h-4 w-4 text-[#7511E2] bg-[#18171A] border-[#2F2D33] rounded focus:ring-[#7511E2]"
                />
                <span className="ml-2 text-sm text-gray-300">{option}</span>
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchQuery ? 'No matches found' : 'No options available'}
              </div>
            )}
          </div>
          
          {/* Apply / Clear buttons */}
          <div className="border-t border-[#2F2D33] p-2 flex gap-2">
            <Button
              size="sm"
              onClick={handleApply}
              className="flex-1 bg-[#7511E2] hover:bg-[#5E0DB5] text-white"
            >
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Filters({ filters, onFiltersChange, onExport, loading, transactions = [] }: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded

  // Extract unique values from transactions for multi-select filters
  const uniqueEmployees = useMemo(() => {
    return [...new Set(transactions.map(t => t.employee_name).filter(Boolean))] as string[];
  }, [transactions]);
  const uniqueDepartments = useMemo(() => {
    return [...new Set(transactions.map(t => t.department).filter(Boolean))] as string[];
  }, [transactions]);
  const uniqueCategories = useMemo(() => {
    return [...new Set(transactions.map(t => t.category_name).filter(Boolean))] as string[];
  }, [transactions]);
  const uniqueMerchants = useMemo(() => {
    return [...new Set(transactions.map(t => t.merchant_name).filter(Boolean))] as string[];
  }, [transactions]);
  const uniqueSpendPrograms = useMemo(() => {
    return [...new Set(transactions.map(t => t.spend_program_name).filter(Boolean))] as string[];
  }, [transactions]);

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | string[] | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' || (Array.isArray(value) && value.length === 0) ? undefined : value,
    });
  };

  // Convert status display names to API values
  const statusDisplayToValue: Record<string, string> = {
    'Pending': 'pending',
    'Approved': 'approved', 
    'Declined': 'declined',
    'Reimbursed': 'reimbursed',
  };
  const statusValueToDisplay: Record<string, string> = {
    'pending': 'Pending',
    'approved': 'Approved',
    'declined': 'Declined', 
    'reimbursed': 'Reimbursed',
  };

  // Convert policy display names to API values
  const policyDisplayToValue: Record<string, string> = {
    'In Policy': 'compliant',
    'Out of Policy': 'non-compliant',
  };
  const policyValueToDisplay: Record<string, string> = {
    'compliant': 'In Policy',
    'non-compliant': 'Out of Policy',
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
          <SearchableMultiSelect
            label="Employee"
            options={uniqueEmployees}
            selected={filters.employees || []}
            onApply={(selected) => handleFilterChange('employees', selected)}
            placeholder="All Employees"
            searchPlaceholder="Search employees..."
          />
          <SearchableMultiSelect
            label="Status"
            options={STATUS_OPTIONS}
            selected={(filters.statuses || []).map(s => statusValueToDisplay[s] || s)}
            onApply={(selected) => handleFilterChange('statuses', selected.map(s => statusDisplayToValue[s] || s))}
            placeholder="All Statuses"
            searchPlaceholder="Search statuses..."
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
              <SearchableMultiSelect
                label="Department"
                options={uniqueDepartments}
                selected={filters.departments || []}
                onApply={(selected) => handleFilterChange('departments', selected)}
                placeholder="All Departments"
                searchPlaceholder="Search departments..."
              />
              <SearchableMultiSelect
                label="Category"
                options={uniqueCategories}
                selected={filters.categories || []}
                onApply={(selected) => handleFilterChange('categories', selected)}
                placeholder="All Categories"
                searchPlaceholder="Search categories..."
              />
              <SearchableMultiSelect
                label="Merchant"
                options={uniqueMerchants}
                selected={filters.merchants || []}
                onApply={(selected) => handleFilterChange('merchants', selected)}
                placeholder="All Merchants"
                searchPlaceholder="Search merchants..."
              />
              <SearchableMultiSelect
                label="Spend Program"
                options={uniqueSpendPrograms}
                selected={filters.spendPrograms || []}
                onApply={(selected) => handleFilterChange('spendPrograms', selected)}
                placeholder="All Programs"
                searchPlaceholder="Search programs..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <SearchableMultiSelect
                label="Policy Compliance"
                options={POLICY_OPTIONS}
                selected={(filters.policyCompliances || []).map(p => policyValueToDisplay[p] || p)}
                onApply={(selected) => handleFilterChange('policyCompliances', selected.map(p => policyDisplayToValue[p] || p))}
                placeholder="All"
                searchPlaceholder="Search..."
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