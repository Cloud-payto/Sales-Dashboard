import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import FramePerformanceChart from './components/TrafficChart';
import AccountsTable from './components/AccountsTable';
import BrandPerformance from './components/BrandPerformance';
import InsightsPanel from './components/InsightsPanel';
import { mockDashboardData } from './data/mockData';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('reporting-overview');

  // Use mock data - replace with actual data from sales_dashboard_data.json
  const { summary, accounts, frames, brands, insights } = mockDashboardData;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Year-over-year performance overview
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-green-700">Live Data</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8 space-y-8">
          {/* Key Insights Panel */}
          <InsightsPanel insights={insights} />

          {/* Primary Metrics Grid */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                label="Total Sales"
                value={formatCurrency(summary.total_sales_cy)}
                subtitle={`vs ${formatCurrency(summary.total_sales_py)} PY`}
                change={summary.total_sales_pct_change}
                icon="sales"
                trend={summary.total_sales_pct_change > 0 ? 'up' : 'down'}
              />
              <MetricCard
                label="Total Accounts"
                value={formatNumber(summary.total_accounts)}
                subtitle={`${summary.total_accounts - summary.total_accounts_py} more than PY`}
                icon="accounts"
                trend="up"
              />
              <MetricCard
                label="Account Average"
                value={formatCurrency(summary.account_average)}
                subtitle="Per account sales"
                icon="average"
                trend="neutral"
              />
              <MetricCard
                label="Retention Rate"
                value={`${summary.retention_rate.toFixed(1)}%`}
                subtitle={`${summary.lost_accounts} accounts lost`}
                icon="accounts"
                trend="up"
              />
            </div>
          </div>

          {/* Account Performance Metrics */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                label="Growing Accounts"
                value={formatNumber(summary.increasing_accounts)}
                changeLabel={formatCurrency(summary.increasing_accounts_sales)}
                icon="growing"
                trend="up"
              />
              <MetricCard
                label="Declining Accounts"
                value={formatNumber(summary.declining_accounts)}
                changeLabel={formatCurrency(summary.declining_accounts_sales)}
                icon="declining"
                trend="down"
              />
              <MetricCard
                label="New Accounts"
                value={formatNumber(summary.new_accounts)}
                changeLabel={formatCurrency(summary.new_accounts_sales)}
                icon="new"
                trend="up"
              />
              <MetricCard
                label="Reactivated"
                value={formatNumber(summary.reactivated_accounts)}
                changeLabel={formatCurrency(summary.reactivated_accounts_sales)}
                icon="new"
                trend="up"
              />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FramePerformanceChart
              topGrowth={frames.top_growth}
              topDecline={frames.top_decline}
            />
            <BrandPerformance brands={brands.brands} showTop={10} />
          </div>

          {/* Accounts Tables */}
          <div className="space-y-6">
            <AccountsTable
              accounts={accounts.top_declining}
              title="Top Declining Accounts"
              type="declining"
            />

            <AccountsTable
              accounts={accounts.top_increasing}
              title="Top Growing Accounts"
              type="growing"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AccountsTable
                accounts={accounts.new_accounts}
                title="New Accounts"
                type="new"
              />

              <AccountsTable
                accounts={accounts.reactivated_accounts}
                title="Reactivated Accounts"
                type="reactivated"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
