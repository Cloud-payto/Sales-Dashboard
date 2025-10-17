import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, BarChart3 } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import MetricCard from '../components/MetricCard';
import FramePerformanceChart from '../components/TrafficChart';
import AccountsTable from '../components/AccountsTable';
import BrandPerformance from '../components/BrandPerformance';
import InsightsPanel from '../components/InsightsPanel';

const DashboardPage: React.FC = () => {
  const { dashboardData, isLoading } = useDashboard();

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Empty state - no data uploaded yet
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No Data Available
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload your Year-Over-Year sales analysis to view comprehensive analytics,
              insights, and performance metrics.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
              <Upload className="w-5 h-5" />
              Upload YOY Analysis
            </Link>

            <div className="mt-12 pt-12 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll See:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📊 Sales Metrics</h4>
                  <p className="text-sm text-gray-600">Total sales, account averages, retention rates, and YOY comparisons</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">👥 Customer Health</h4>
                  <p className="text-sm text-gray-600">Growing, declining, new, and reactivated customers with detailed breakdowns</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📦 Product Performance</h4>
                  <p className="text-sm text-gray-600">Frame categories and brand analytics with unit sales and trends</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard with data
  const { summary, accounts, frames, brands, insights } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Year-over-year performance overview and insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                Upload New Data
              </Link>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-green-700">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
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
              label="Total Customers"
              value={formatNumber(summary.total_accounts)}
              subtitle={`${summary.total_accounts - summary.total_accounts_py} more than PY`}
              icon="accounts"
              trend="up"
            />
            <MetricCard
              label="Customer Average"
              value={formatCurrency(summary.account_average)}
              subtitle="Per customer sales"
              icon="average"
              trend="neutral"
            />
            <MetricCard
              label="Retention Rate"
              value={`${summary.retention_rate.toFixed(1)}%`}
              subtitle={`${summary.lost_accounts} customers lost`}
              icon="accounts"
              trend="up"
            />
          </div>
        </div>

        {/* Customer Performance Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              label="Growing Customers"
              value={formatNumber(summary.increasing_accounts)}
              changeLabel={formatCurrency(summary.increasing_accounts_sales)}
              icon="growing"
              trend="up"
            />
            <MetricCard
              label="Declining Customers"
              value={formatNumber(summary.declining_accounts)}
              changeLabel={formatCurrency(summary.declining_accounts_sales)}
              icon="declining"
              trend="down"
            />
            <MetricCard
              label="New Customers"
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
            topGrowth={frames.increasing}
            topDecline={frames.declining}
          />
          <BrandPerformance brands={brands.brands} showTop={10} />
        </div>

        {/* Customer Tables */}
        <div className="space-y-6">
          <AccountsTable
            accounts={accounts.top_declining}
            title="Bottom Performing Customers"
            type="declining"
          />

          <AccountsTable
            accounts={accounts.top_increasing}
            title="Top Performing Customers"
            type="growing"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AccountsTable
              accounts={accounts.new_accounts}
              title="New Customers"
              type="new"
            />

            <AccountsTable
              accounts={accounts.reactivated_accounts}
              title="Reactivated Customers"
              type="reactivated"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
