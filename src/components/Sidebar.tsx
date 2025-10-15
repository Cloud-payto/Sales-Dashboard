import React, { useState } from 'react';
import {
  Home,
  BarChart3,
  Package,
  CheckSquare,
  FileText,
  Bell,
  Users,
  ChevronDown,
  Search
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['reporting']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Company Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SB</span>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">Sales Dashboard</h2>
            <p className="text-sm text-gray-500">analytics@company.com</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        {/* Overview */}
        <button
          onClick={() => setActiveSection('overview')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 ${
            activeSection === 'overview'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Overview</span>
        </button>

        {/* Analytics */}
        <button
          onClick={() => toggleSection('analytics')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-gray-600 hover:bg-gray-50"
        >
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium flex-1 text-left">Analytics</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${
            expandedSections.includes('analytics') ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Products */}
        <button
          onClick={() => toggleSection('products')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-gray-600 hover:bg-gray-50"
        >
          <Package className="w-5 h-5" />
          <span className="font-medium flex-1 text-left">Products</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${
            expandedSections.includes('products') ? 'rotate-180' : ''
          }`} />
        </button>

        {/* My tasks */}
        <button
          onClick={() => toggleSection('tasks')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-gray-600 hover:bg-gray-50"
        >
          <CheckSquare className="w-5 h-5" />
          <span className="font-medium flex-1 text-left">My tasks</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${
            expandedSections.includes('tasks') ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Reporting (expanded by default) */}
        <button
          onClick={() => toggleSection('reporting')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-gray-600 hover:bg-gray-50"
        >
          <FileText className="w-5 h-5" />
          <span className="font-medium flex-1 text-left">Reporting</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${
            expandedSections.includes('reporting') ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Reporting submenu */}
        {expandedSections.includes('reporting') && (
          <div className="ml-8 mb-1">
            <button
              onClick={() => setActiveSection('reporting-overview')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                activeSection === 'reporting-overview'
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              • Overview
            </button>
            <button
              onClick={() => setActiveSection('notifications')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                activeSection === 'notifications'
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveSection('analytics-sub')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                activeSection === 'analytics-sub'
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveSection('reports')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                activeSection === 'reports'
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Reports
            </button>
          </div>
        )}

        {/* Shared with */}
        <button
          onClick={() => toggleSection('shared')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-gray-600 hover:bg-gray-50"
        >
          <Users className="w-5 h-5" />
          <span className="font-medium flex-1 text-left">Shared with</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${
            expandedSections.includes('shared') ? 'rotate-180' : ''
          }`} />
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
