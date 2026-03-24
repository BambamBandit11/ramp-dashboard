'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterOptions, RampTransaction, RampUser } from '@/types/ramp';
import { Filter, X, Download, ChevronDown, Check, Search } from 'lucide-react';
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

// Employee multi-select with search and Apply button
interface EmployeeMultiSelectProps {
  employees: RampUser[];
  selected: string[];
  onApply: (selected: string[]) => void;
  loading?: boolean;
}

function EmployeeMultiSelect({ employees, selected, onApply, loading }: EmployeeMultiSelectProps) {
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
        // Reset pending to actual on close without apply
        setPendingSelected(selected);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selected]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter(emp => 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  const toggleEmployee = (id: string) => {
    if (pendingSelected.includes(id)) {
      setPendingSelected(pendingSelected.filter(s => s !== id));
    } else {
      setPendingSelected([...pendingSelected, id]);
    }
  };

  const selectAllVisible = () => {
    const visibleIds = filteredEmployees.map(e => e.id);
    const newSelected = [...new Set([...pendingSelected, ...visibleIds])];
    setPendingSelected(newSelected);
  };

  const clearAll = () => setPendingSelected([]);

  const handleApply = () => {
    onApply(pendingSelected);
    setIsOpen(false);
  };

  const handleClear = () => {
    setPendingSelected([]);
    onApply([]);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selected.length === 0) return 'All Employees';
    if (selected.length === 1) {
      const emp = employees.find(e => e.id === selected[0]);
      return emp ? `${emp.first_name} ${emp.last_name}` : '1 selected';
    }
    return `${selected.length} selected`;
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-300 mb-1">Employee</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full flex items-center justify-between px-3 py-2 text-left bg-[#18171A] border border-[#2F2D33] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7511E2] focus:border-[#7511E2] text-sm disabled:opacity-50"
      >
        <span className={selected.length === 0 ? 'text-gray-500' : 'text-white'}>
          {loading ? 'Loading...' : getDisplayText()}
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
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#2F2D33] border border-[#4A408F] rounded focus:outline-none focus:ring-1 focus:ring-[#7511E2] text-white placeholder-gray-500"
                autoFocus
              />
            </div>
          </div>
          
          {/* Select All / Clear All */}
          <div className="sticky top-0 bg-[#2F2D33] border-b border-[#4A408F] px-3 py-2 flex gap-2">
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
            {filteredEmployees.map(emp => (
              <label
                key={emp.id}
                className="flex items-center px-3 py-2 hover:bg-[#2F2D33] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={pendingSelected.includes(emp.id)}
                  onChange={() => toggleEmployee(emp.id)}
                  className="h-4 w-4 text-[#7511E2] bg-[#18171A] border-[#2F2D33] rounded focus:ring-[#7511E2]"
                />
                <span className="ml-2 text-sm text-gray-300">
                  {emp.first_name} {emp.last_name}
                </span>
              </label>
            ))}
            {filteredEmployees.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchQuery ? 'No matches found' : 'No employees available'}
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
  const [employeeList, setEmployeeList] = useState<RampUser[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Extract unique values from transactions for multi-select filters
  const uniqueDepartments = [...new Set(transactions.map(t => t.department).filter(Boolean))] as string[];
  const uniqueCategories = [...new Set(transactions.map(t => t.category_name).filter(Boolean))] as string[];
  const uniqueMerchants = [...new Set(transactions.map(t => t.merchant_name).filter(Boolean))] as string[];
  // Filter out placeholder IDs (e.g., "Program 16aceb7") - only show actual names
  const uniqueSpendPrograms = [...new Set(transactions.map(t => t.spend_program_name).filter(name => name && !name.startsWith('Program ')))] as string[];

  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const response = await rampApi.getUsers();
        setEmployeeList(response.data);
      } catch (error) {
        console.error('Failed to load employees:', error);
        setEmployeeList([]);
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
          <EmployeeMultiSelect
            employees={employeeList}
            selected={filters.employees || []}
            onApply={(selected) => handleFilterChange('employees', selected)}
            loading={loadingEmployees}
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