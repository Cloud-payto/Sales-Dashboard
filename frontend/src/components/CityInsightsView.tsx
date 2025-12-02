import React, { useState, useMemo } from 'react';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Building2,
  Package,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  UserMinus,
  Search,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { CityInsights, CityData } from '../types';

interface CityInsightsViewProps {
  data: CityInsights;
}

const COLOR_GROUP_COLORS: { [key: string]: string } = {
  'BLACK DIAMOND': 'bg-gray-800 text-white',
  'YELLOW': 'bg-yellow-500 text-gray-900',
  'RED': 'bg-red-600 text-white',
  'BLUE': 'bg-blue-600 text-white',
  'GREEN': 'bg-green-600 text-white',
  'LIME': 'bg-lime-500 text-gray-900',
  'OTHER': 'bg-gray-400 text-gray-900',
};

type SortField = 'city' | 'units_cy' | 'units_change' | 'accounts' | 'growing' | 'declining';
type SortDirection = 'asc' | 'desc';

export default function CityInsightsView({ data }: CityInsightsViewProps) {
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('units_cy');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  if (!data || !data.cities) return null;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedCities = useMemo(() => {
    let filtered = data.cities;

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((city) =>
        city.city.toLowerCase().includes(query)
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'city':
          aVal = a.city.toLowerCase();
          bVal = b.city.toLowerCase();
          break;
        case 'units_cy':
          aVal = a.total_units_cy;
          bVal = b.total_units_cy;
          break;
        case 'units_change':
          aVal = a.units_change;
          bVal = b.units_change;
          break;
        case 'accounts':
          aVal = a.total_accounts;
          bVal = b.total_accounts;
          break;
        case 'growing':
          aVal = a.growing_count;
          bVal = b.growing_count;
          break;
        case 'declining':
          aVal = a.declining_count;
          bVal = b.declining_count;
          break;
        default:
          aVal = a.total_units_cy;
          bVal = b.total_units_cy;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [data.cities, searchQuery, sortField, sortDirection]);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
        sortField === field
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
      {sortField === field &&
        (sortDirection === 'asc' ? (
          <SortAsc className="w-3 h-3" />
        ) : (
          <SortDesc className="w-3 h-3" />
        ))}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="w-7 h-7 text-blue-600" />
              City Insights
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Performance breakdown by city location
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{data.total_cities}</p>
            <p className="text-sm text-gray-600">Cities</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-blue-700 font-medium">Total Units CY</p>
            <p className="text-xl font-bold text-blue-900 mt-1">
              {formatNumber(data.summary.total_units_cy)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-700 font-medium">Total Units PY</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {formatNumber(data.summary.total_units_py)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <p className="text-xs text-purple-700 font-medium">Total Accounts</p>
            <p className="text-xl font-bold text-purple-900 mt-1">
              {formatNumber(data.summary.total_accounts)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <p className="text-xs text-green-700 font-medium">Growing</p>
            <p className="text-xl font-bold text-green-900 mt-1">
              {formatNumber(data.summary.total_growing)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <p className="text-xs text-red-700 font-medium">Declining</p>
            <p className="text-xl font-bold text-red-900 mt-1">
              {formatNumber(data.summary.total_declining)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
            <p className="text-xs text-amber-700 font-medium">Lost</p>
            <p className="text-xl font-bold text-amber-900 mt-1">
              {formatNumber(data.summary.total_lost)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
            <p className="text-xs text-emerald-700 font-medium">New</p>
            <p className="text-xl font-bold text-emerald-900 mt-1">
              {formatNumber(data.summary.total_new)}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <SortButton field="city" label="City" />
            <SortButton field="units_cy" label="Units" />
            <SortButton field="units_change" label="Change" />
            <SortButton field="accounts" label="Accounts" />
            <SortButton field="growing" label="Growing" />
            <SortButton field="declining" label="Declining" />
          </div>
        </div>
      </div>

      {/* City List */}
      <div className="space-y-4">
        {filteredAndSortedCities.map((city, index) => (
          <CityCard
            key={city.city}
            city={city}
            rank={index + 1}
            isExpanded={expandedCity === city.city}
            expandedSection={expandedCity === city.city ? expandedSection : null}
            onToggle={() =>
              setExpandedCity(expandedCity === city.city ? null : city.city)
            }
            onSectionToggle={(section) =>
              setExpandedSection(expandedSection === section ? null : section)
            }
          />
        ))}
      </div>

      {filteredAndSortedCities.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No cities found matching your search</p>
        </div>
      )}
    </div>
  );
}

interface CityCardProps {
  city: CityData;
  rank: number;
  isExpanded: boolean;
  expandedSection: string | null;
  onToggle: () => void;
  onSectionToggle: (section: string) => void;
}

function CityCard({
  city,
  rank,
  isExpanded,
  expandedSection,
  onToggle,
  onSectionToggle,
}: CityCardProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* City Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-500 font-medium text-sm w-8">#{rank}</span>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-bold text-gray-800">{city.city}</span>
            </div>
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {city.total_accounts} accounts
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Units */}
            <div className="text-right">
              <p className="text-xl font-bold text-gray-800">
                {formatNumber(city.total_units_cy)}
              </p>
              <p className="text-xs text-gray-600">units CY</p>
            </div>

            {/* Change */}
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                city.units_change > 0
                  ? 'bg-green-100 text-green-700'
                  : city.units_change < 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {city.units_change > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : city.units_change < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              <span className="text-sm font-semibold">
                {city.units_change > 0 ? '+' : ''}
                {formatNumber(city.units_change)} ({city.units_change_pct}%)
              </span>
            </div>

            {/* Expand icon */}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="mt-3 flex gap-4 text-sm">
          <span className="flex items-center gap-1 text-green-600">
            <ArrowUpRight className="w-4 h-4" />
            {city.growing_count} growing
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <ArrowDownRight className="w-4 h-4" />
            {city.declining_count} declining
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <UserMinus className="w-4 h-4" />
            {city.lost_count} lost
          </span>
          <span className="flex items-center gap-1 text-emerald-600">
            <UserPlus className="w-4 h-4" />
            {city.new_count} new
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Color Groups */}
          <div className="p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Color Group Breakdown
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {city.color_groups_cy.map((cg) => (
                <div
                  key={cg.color_group}
                  className="bg-white rounded border border-gray-200 p-2 text-center"
                >
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      COLOR_GROUP_COLORS[cg.color_group] || COLOR_GROUP_COLORS.OTHER
                    }`}
                  >
                    {cg.color_group}
                  </span>
                  <p className="text-lg font-bold text-gray-800 mt-1">
                    {formatNumber(cg.units)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Accounts per Brand */}
          <ExpandableSection
            title="Accounts per Brand (12+ Units)"
            icon={<Building2 className="w-4 h-4" />}
            isExpanded={expandedSection === 'brands'}
            onToggle={() => onSectionToggle('brands')}
            count={city.accounts_by_brand_cy.length}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {city.accounts_by_brand_cy.slice(0, 12).map((brand) => (
                <div
                  key={brand.brand}
                  className="bg-white rounded border border-gray-200 p-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          COLOR_GROUP_COLORS[brand.color_group] ||
                          COLOR_GROUP_COLORS.OTHER
                        }`}
                      >
                        {brand.color_group}
                      </span>
                      <p className="text-sm font-medium text-gray-800 mt-1">
                        {brand.brand}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {brand.accounts_buying_12_plus}
                      </p>
                      <p className="text-xs text-gray-500">
                        of {brand.total_accounts_buying}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ExpandableSection>

          {/* Growing Accounts */}
          <ExpandableSection
            title="Growing Accounts"
            icon={<TrendingUp className="w-4 h-4 text-green-600" />}
            isExpanded={expandedSection === 'growing'}
            onToggle={() => onSectionToggle('growing')}
            count={city.growing_count}
            color="green"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {city.growing_accounts.slice(0, 15).map((account) => (
                <div
                  key={account.account_number}
                  className="bg-white rounded border border-green-200 p-2"
                >
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {account.account_name}
                  </p>
                  <p className="text-xs text-gray-600">
                    Acct #{account.account_number}
                  </p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    +{formatNumber(account.change)} units
                  </p>
                </div>
              ))}
            </div>
          </ExpandableSection>

          {/* Declining Accounts */}
          <ExpandableSection
            title="Declining Accounts"
            icon={<TrendingDown className="w-4 h-4 text-red-600" />}
            isExpanded={expandedSection === 'declining'}
            onToggle={() => onSectionToggle('declining')}
            count={city.declining_count}
            color="red"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {city.declining_accounts.slice(0, 15).map((account) => (
                <div
                  key={account.account_number}
                  className="bg-white rounded border border-red-200 p-2"
                >
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {account.account_name}
                  </p>
                  <p className="text-xs text-gray-600">
                    Acct #{account.account_number}
                  </p>
                  <p className="text-sm font-semibold text-red-600 mt-1">
                    {formatNumber(account.change)} units
                  </p>
                </div>
              ))}
            </div>
          </ExpandableSection>

          {/* Lost Accounts */}
          <ExpandableSection
            title="Lost Accounts"
            icon={<UserMinus className="w-4 h-4 text-amber-600" />}
            isExpanded={expandedSection === 'lost'}
            onToggle={() => onSectionToggle('lost')}
            count={city.lost_count}
            color="amber"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {city.lost_accounts.slice(0, 15).map((account) => (
                <div
                  key={account.account_number}
                  className="bg-white rounded border border-amber-200 p-2"
                >
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {account.account_name}
                  </p>
                  <p className="text-xs text-gray-600">
                    Acct #{account.account_number}
                  </p>
                  <p className="text-sm font-semibold text-amber-600 mt-1">
                    {formatNumber(account.previous_year_units)} units (PY)
                  </p>
                </div>
              ))}
            </div>
          </ExpandableSection>

          {/* New Accounts */}
          <ExpandableSection
            title="New Accounts"
            icon={<UserPlus className="w-4 h-4 text-emerald-600" />}
            isExpanded={expandedSection === 'new'}
            onToggle={() => onSectionToggle('new')}
            count={city.new_count}
            color="emerald"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {city.new_accounts.slice(0, 15).map((account) => (
                <div
                  key={account.account_number}
                  className="bg-white rounded border border-emerald-200 p-2"
                >
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {account.account_name}
                  </p>
                  <p className="text-xs text-gray-600">
                    Acct #{account.account_number}
                  </p>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">
                    {formatNumber(account.current_year_units)} units
                  </p>
                </div>
              ))}
            </div>
          </ExpandableSection>
        </div>
      )}
    </div>
  );
}

interface ExpandableSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  count: number;
  color?: string;
  children: React.ReactNode;
}

function ExpandableSection({
  title,
  icon,
  isExpanded,
  onToggle,
  count,
  color = 'gray',
  children,
}: ExpandableSectionProps) {
  if (count === 0) return null;

  const bgColors: { [key: string]: string } = {
    green: 'bg-green-50 hover:bg-green-100',
    red: 'bg-red-50 hover:bg-red-100',
    amber: 'bg-amber-50 hover:bg-amber-100',
    emerald: 'bg-emerald-50 hover:bg-emerald-100',
    gray: 'bg-gray-50 hover:bg-gray-100',
  };

  return (
    <div className="border-t border-gray-200">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`w-full p-3 flex items-center justify-between ${bgColors[color]} transition-colors`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-700">{title}</span>
          <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded">
            {count}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isExpanded && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}
