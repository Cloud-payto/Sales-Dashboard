import React from 'react';
import { BarChart3, Zap, Shield, TrendingUp } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Sales Dashboard</h1>
          <p className="text-xl text-gray-600">
            A powerful analytics platform designed for sales representatives
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Sales Dashboard was built to solve a common problem: sales representatives spend too much time
            manually analyzing Excel spreadsheets instead of focusing on what they do best—selling.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We created an intuitive platform that transforms raw sales data into actionable insights in seconds,
            helping sales teams identify opportunities, track performance, and make data-driven decisions.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
            <p className="text-gray-600">
              Advanced Python parser extracts all metrics, accounts, and insights from your Excel files in seconds.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Actionable Insights</h3>
            <p className="text-gray-600">
              Smart alerts highlight urgent account declines, growth opportunities, and product trends automatically.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Beautiful Visualizations</h3>
            <p className="text-gray-600">
              Interactive charts and color-coded tables make complex sales data easy to understand at a glance.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
            <p className="text-gray-600">
              Your sales data is processed securely and never shared. All data stays within your control.
            </p>
          </div>
        </div>

        {/* Technology */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">Built With Modern Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="font-semibold">React</p>
              <p className="text-sm text-blue-100">Frontend Framework</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="font-semibold">TypeScript</p>
              <p className="text-sm text-blue-100">Type Safety</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="font-semibold">Python</p>
              <p className="text-sm text-blue-100">Data Parser</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="font-semibold">Tailwind CSS</p>
              <p className="text-sm text-blue-100">Styling</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="font-semibold">Recharts</p>
              <p className="text-sm text-blue-100">Visualizations</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="font-semibold">Vercel</p>
              <p className="text-sm text-blue-100">Hosting</p>
            </div>
          </div>
        </div>

        {/* What We Track */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Track</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Sales Metrics</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Total Sales (Current vs Previous Year)</li>
                <li>• Direct & Indirect Sales Breakdown</li>
                <li>• Account Averages</li>
                <li>• Retention Rates</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Account Health</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Growing Accounts</li>
                <li>• Declining Accounts</li>
                <li>• New Customers</li>
                <li>• Reactivated Accounts</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Product Performance</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 12 Frame Color Categories</li>
                <li>• 25+ Individual Brands</li>
                <li>• Unit Sales by Category</li>
                <li>• Account Penetration Metrics</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Insights & Alerts</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Urgent Account Declines</li>
                <li>• Top Performers</li>
                <li>• Product Trend Alerts</li>
                <li>• Growth Opportunities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
