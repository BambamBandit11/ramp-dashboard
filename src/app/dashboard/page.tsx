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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ramp Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and analyze your company expenses</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <StatsCards stats={stats} loading={loading} />

          {/* Filters */}
          <Filters
            filters={filters}
            onFiltersChange={updateFilters}
            onExport={exportData}
            loading={loading}
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