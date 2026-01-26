'use client';

import { useState, useEffect, useCallback } from 'react';
import { rampApi } from '@/lib/ramp-api';
import { RampTransaction, FilterOptions, DashboardStats } from '@/types/ramp';
import { downloadFile } from '@/lib/utils';

export function useDashboardData() {
  const [allTransactions, setAllTransactions] = useState<RampTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<RampTransaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    totalAmount: 0,
    pendingTransactions: 0,
    pendingAmount: 0,
    approvedTransactions: 0,
    approvedAmount: 0,
    ytdSpend: 0,
    thisMonthSpend: 0,
    reimbursementsCount: 0,
    reimbursementsAmount: 0,
    receiptsCount: 0,
    missingReceiptsCount: 0,
  });
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateStats = useCallback((transactions: RampTransaction[]): DashboardStats => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = transactions.reduce(
      (acc, transaction) => {
        const txDate = new Date(transaction.date);
        
        acc.totalTransactions += 1;
        acc.totalAmount += transaction.amount;

        // YTD spend
        if (txDate >= startOfYear) {
          acc.ytdSpend += transaction.amount;
        }

        // This month spend
        if (txDate >= startOfMonth) {
          acc.thisMonthSpend += transaction.amount;
        }

        // Status-based counts
        switch (transaction.status) {
          case 'pending':
            acc.pendingTransactions += 1;
            acc.pendingAmount += transaction.amount;
            break;
          case 'approved':
            acc.approvedTransactions += 1;
            acc.approvedAmount += transaction.amount;
            break;
          case 'reimbursed':
            acc.reimbursementsCount += 1;
            acc.reimbursementsAmount += transaction.amount;
            break;
        }

        // Receipt tracking
        if (transaction.receipt_url || (transaction.receipts && transaction.receipts.length > 0)) {
          acc.receiptsCount += 1;
        } else {
          acc.missingReceiptsCount += 1;
        }

        return acc;
      },
      {
        totalTransactions: 0,
        totalAmount: 0,
        pendingTransactions: 0,
        pendingAmount: 0,
        approvedTransactions: 0,
        approvedAmount: 0,
        ytdSpend: 0,
        thisMonthSpend: 0,
        reimbursementsCount: 0,
        reimbursementsAmount: 0,
        receiptsCount: 0,
        missingReceiptsCount: 0,
      }
    );

    return stats;
  }, []);

  // Apply client-side filters for multi-select options
  const applyClientFilters = useCallback((transactions: RampTransaction[], currentFilters: FilterOptions): RampTransaction[] => {
    return transactions.filter(tx => {
      // Multi-select department filter
      if (currentFilters.departments && currentFilters.departments.length > 0) {
        if (!tx.department || !currentFilters.departments.includes(tx.department)) {
          return false;
        }
      }
      
      // Multi-select category filter
      if (currentFilters.categories && currentFilters.categories.length > 0) {
        if (!tx.category_name || !currentFilters.categories.includes(tx.category_name)) {
          return false;
        }
      }
      
      // Multi-select merchant filter
      if (currentFilters.merchants && currentFilters.merchants.length > 0) {
        if (!tx.merchant_name || !currentFilters.merchants.includes(tx.merchant_name)) {
          return false;
        }
      }
      
      // Multi-select spend program filter
      if (currentFilters.spendPrograms && currentFilters.spendPrograms.length > 0) {
        if (!tx.spend_program_name || !currentFilters.spendPrograms.includes(tx.spend_program_name)) {
          return false;
        }
      }
      
      // Policy compliance filter
      if (currentFilters.policyCompliance) {
        const isCompliant = tx.is_compliant !== false && (!tx.policy_violations || tx.policy_violations.length === 0);
        if (currentFilters.policyCompliance === 'compliant' && !isCompliant) return false;
        if (currentFilters.policyCompliance === 'non-compliant' && isCompliant) return false;
      }
      
      return true;
    });
  }, []);

  const fetchTransactions = useCallback(async (currentFilters: FilterOptions = {}) => {
    if (!mounted) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch with server-side filters (employee, status, date, amount)
      const serverFilters: FilterOptions = {
        employee: currentFilters.employee,
        status: currentFilters.status,
        dateFrom: currentFilters.dateFrom,
        dateTo: currentFilters.dateTo,
        minAmount: currentFilters.minAmount,
        maxAmount: currentFilters.maxAmount,
      };
      
      const response = await rampApi.getTransactions(serverFilters, 1, 1000);
      setAllTransactions(response.data);
      
      // Apply client-side multi-select filters
      const filtered = applyClientFilters(response.data, currentFilters);
      setFilteredTransactions(filtered);
      setStats(calculateStats(filtered));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateStats, applyClientFilters, mounted]);

  const refreshData = useCallback(() => {
    if (mounted) {
      fetchTransactions(filters);
    }
  }, [fetchTransactions, filters, mounted]);

  const updateFilters = useCallback((newFilters: FilterOptions) => {
    if (mounted) {
      setFilters(newFilters);
      
      // For multi-select filters, apply client-side filtering immediately
      const hasOnlyClientFilters = !newFilters.employee && !newFilters.status && 
        !newFilters.dateFrom && !newFilters.dateTo && 
        !newFilters.minAmount && !newFilters.maxAmount;
      
      if (hasOnlyClientFilters && allTransactions.length > 0) {
        const filtered = applyClientFilters(allTransactions, newFilters);
        setFilteredTransactions(filtered);
        setStats(calculateStats(filtered));
      } else {
        fetchTransactions(newFilters);
      }
    }
  }, [fetchTransactions, applyClientFilters, calculateStats, allTransactions, mounted]);

  const exportData = useCallback(async (format: 'csv' | 'excel') => {
    if (!mounted) return;
    
    try {
      setLoading(true);
      const blob = await rampApi.exportTransactions(filters, format);
      const filename = `ramp-transactions-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      downloadFile(blob, filename);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      console.error('Error exporting data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, mounted]);

  // Initial data fetch - only after component is mounted
  useEffect(() => {
    if (mounted) {
      fetchTransactions();
    }
  }, [mounted, fetchTransactions]);

  return {
    transactions: filteredTransactions,
    allTransactions,
    stats,
    filters,
    loading,
    error,
    refreshData,
    updateFilters,
    exportData,
  };
}