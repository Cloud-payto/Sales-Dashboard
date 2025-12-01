import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Package,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Upload,
  Zap
} from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-700">Year-Over-Year Analytics Platform</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Sales Data Into
            <span className="text-blue-600"> Actionable Insights</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Upload your Excel sales reports and instantly visualize YOY performance,
            identify growth opportunities, and track account health—all in one beautiful dashboard.
          </p>

          <div className="flex items-center gap-4 justify-center">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
              <Upload className="w-5 h-5" />
              Upload Your Data
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <BarChart3 className="w-5 h-5" />
              View Demo Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Track Sales Performance</h2>
          <p className="text-lg text-gray-600">Powerful analytics designed specifically for sales representatives</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">YOY Performance Tracking</h3>
            <p className="text-gray-600 leading-relaxed">
              Compare current year vs previous year sales with automatic percentage calculations and trend indicators.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Health Monitoring</h3>
            <p className="text-gray-600 leading-relaxed">
              Identify growing, declining, new, and reactivated accounts at a glance with sortable tables.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Product Category Analysis</h3>
            <p className="text-gray-600 leading-relaxed">
              Track performance across 12 frame categories and 25+ brands to understand what's selling.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Alerts & Insights</h3>
            <p className="text-gray-600 leading-relaxed">
              Get instant notifications about urgent account declines and growth opportunities.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Simple Excel Upload</h3>
            <p className="text-gray-600 leading-relaxed">
              Drag and drop your Excel reports—no complex setup or manual data entry required.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Processing</h3>
            <p className="text-gray-600 leading-relaxed">
              Advanced Python parser extracts all metrics in seconds and updates your dashboard live.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">See Your Sales Data Come to Life</h2>
            <p className="text-blue-100 text-lg">
              Interactive charts, sortable tables, and color-coded insights make it easy to understand your performance at a glance.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-2xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">$430.6K</p>
                <p className="text-sm text-green-600 font-medium">+5.9% YOY</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Accounts</p>
                <p className="text-2xl font-bold text-gray-900">135</p>
                <p className="text-sm text-green-600 font-medium">+4 from PY</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Growing</p>
                <p className="text-2xl font-bold text-green-600">44</p>
                <p className="text-sm text-gray-600">+$75.8K</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Declining</p>
                <p className="text-2xl font-bold text-red-600">50</p>
                <p className="text-sm text-gray-600">-$56.0K</p>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Full Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600">Get insights in three simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Your Excel</h3>
            <p className="text-gray-600">
              Drag and drop your YOY sales report in Excel format
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Auto Processing</h3>
            <p className="text-gray-600">
              Our parser extracts all metrics, accounts, and insights automatically
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">View Dashboard</h3>
            <p className="text-gray-600">
              Instantly see interactive charts, tables, and actionable alerts
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 mb-16">
        <div className="bg-gray-900 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Sales Analytics?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Stop manually analyzing spreadsheets. Let our dashboard do the heavy lifting so you can focus on what matters—closing deals.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
