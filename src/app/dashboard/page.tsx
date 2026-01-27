'use client';

import { StatsCards } from '@/components/dashboard/stats-cards';
import { Filters } from '@/components/dashboard/filters';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const {
    transactions,
    allTransactions,
    stats,
    filters,
    loading,
    error,
    refreshData,
    updateFilters,
    exportData,
  } = useDashboardData();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during SSR/hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#090B0B] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7511E2] mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#090B0B] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-[#7511E2] text-white px-4 py-2 rounded-md hover:bg-[#9900B1] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090B0B]">
      {/* Header */}
      <div className="bg-[#18171A] shadow-sm border-b border-[#2F2D33]">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <img src="/coder-logo.svg" alt="Coder" className="h-8 invert" />
              <div className="border-l border-[#2F2D33] pl-4">
                <h1 className="text-xl font-semibold text-white">Expense Dashboard</h1>
                <p className="text-gray-400 text-sm">Powered by Ramp</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full width */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          <StatsCards stats={stats} loading={loading} />

          {/* Filters */}
          <Filters
            filters={filters}
            onFiltersChange={updateFilters}
            onExport={exportData}
            loading={loading}
            transactions={allTransactions}
          />

          {/* Transactions Table */}
          <TransactionsTable
            transactions={transactions}
            loading={loading}
            onRefresh={refreshData}
          />
        </div>
      </div>
    </div>
  );
}