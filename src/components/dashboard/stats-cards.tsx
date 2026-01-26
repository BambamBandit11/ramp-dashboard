'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DashboardStats } from '@/types/ramp';

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      title: 'TOTAL YTD SPEND',
      value: formatCurrency(stats.ytdSpend || stats.totalAmount),
      isAmount: true,
    },
    {
      title: 'THIS MONTH',
      value: formatCurrency(stats.thisMonthSpend || 0),
      isAmount: true,
    },
    {
      title: 'TRANSACTION COUNT',
      value: stats.totalTransactions.toLocaleString(),
      isAmount: false,
    },
    {
      title: 'REIMBURSEMENTS',
      value: stats.reimbursementsCount?.toLocaleString() || '0',
      isAmount: false,
    },
    {
      title: 'RECEIPTS',
      value: stats.receiptsCount?.toLocaleString() || '0',
      isAmount: false,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6 text-center">
              <div className="h-3 bg-gray-200 rounded w-24 mx-auto mb-3"></div>
              <div className="h-10 bg-gray-200 rounded w-20 mx-auto"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="border-gray-200">
          <CardContent className="pt-6 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {card.title}
            </p>
            <p className={`text-3xl font-bold ${card.isAmount ? 'text-teal-500' : 'text-teal-500'}`}>
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}