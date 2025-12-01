import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Home,
  Upload,
  Info,
  ChevronDown,
  Filter,
  LayoutDashboard,
  Building2,
  Map as MapIcon,
} from 'lucide-react';
import { useFilters } from '../contexts/FilterContext';
import { DATA_VIEW_OPTIONS } from '../constants/filterOptions';

const Header: React.FC = () => {
  const location = useLocation();
  const { filters, updateFilter, activeFilterCount, toggleFilterPanel } = useFilters();
  const [isDataViewOpen, setIsDataViewOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDataViewOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDataViewIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard className="w-4 h-4" />;
      case 'BarChart3':
        return <BarChart3 className="w-4 h-4" />;
      case 'Building2':
        return <Building2 className="w-4 h-4" />;
      case 'MapIcon':
        return <MapIcon className="w-4 h-4" />;
      default:
        return <LayoutDashboard className="w-4 h-4" />;
    }
  };

  const handleDataViewChange = (view: string) => {
    updateFilter('dataView', view as any);
    setIsDataViewOpen(false);
  };

  const currentDataView = DATA_VIEW_OPTIONS.find((opt) => opt.value === filters.dataView);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sales Dashboard</h1>
              <p className="text-xs text-gray-500">YOY Analytics Platform</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>

            {/* Data View Dropdown */}
            {isActive('/dashboard') && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDataViewOpen(!isDataViewOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  {currentDataView && getDataViewIcon(currentDataView.icon)}
                  <span className="text-sm">{currentDataView?.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isDataViewOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDataViewOpen && (
                  <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {DATA_VIEW_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleDataViewChange(option.value)}
                        className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                          filters.dataView === option.value ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg ${
                            filters.dataView === option.value
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {getDataViewIcon(option.icon)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${
                                filters.dataView === option.value
                                  ? 'text-blue-700'
                                  : 'text-gray-900'
                              }`}
                            >
                              {option.label}
                            </span>
                            {option.badge && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                                {option.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {option.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Filter Button (only on dashboard) */}
            {isActive('/dashboard') && (
              <button
                onClick={toggleFilterPanel}
                className="relative flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            <Link
              to="/territory-map"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/territory-map')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Territory Map
            </Link>

            <Link
              to="/upload"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/upload')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload Data
            </Link>

            <Link
              to="/about"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/about')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Info className="w-4 h-4" />
              About
            </Link>
          </nav>

          {/* User section */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-sm font-semibold text-white">SR</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
