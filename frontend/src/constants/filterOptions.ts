// Filter Options Constants
import { FilterOption } from '../types/filters';

// Data View Option type
interface DataViewOption {
  value: string;
  label: string;
  icon: string;
  description: string;
  badge?: string;
}

// Data View Options
export const DATA_VIEW_OPTIONS: DataViewOption[] = [
  {
    value: 'full',
    label: 'Full Dataset',
    icon: 'LayoutDashboard',
    description: 'Complete overview of all data',
  },
  {
    value: 'territory_overview',
    label: 'Territory Overview',
    icon: 'BarChart3',
    description: 'Summary metrics by territory',
  },
  {
    value: 'all_accounts',
    label: 'All Accounts',
    icon: 'Building2',
    description: 'Detailed account listings',
  },
  {
    value: 'territory_map',
    label: 'Territory Map',
    icon: 'MapIcon',
    description: 'Geographic visualization',
    badge: 'New',
  },
];

// Account Sort Options
export const ACCOUNT_SORT_OPTIONS: FilterOption[] = [
  {
    value: 'sales_high',
    label: 'Sales: High to Low',
    description: 'Sort by total sales descending',
  },
  {
    value: 'sales_low',
    label: 'Sales: Low to High',
    description: 'Sort by total sales ascending',
  },
  {
    value: 'change_gain',
    label: 'Change: Biggest Gain',
    description: 'Sort by sales increase',
  },
  {
    value: 'change_loss',
    label: 'Change: Biggest Loss',
    description: 'Sort by sales decrease',
  },
  {
    value: 'city_asc',
    label: 'City: A to Z',
    description: 'Sort alphabetically by city',
  },
  {
    value: 'city_desc',
    label: 'City: Z to A',
    description: 'Sort reverse alphabetically',
  },
];

// Account Status Options
export const ACCOUNT_STATUS_OPTIONS: FilterOption[] = [
  {
    value: 'all',
    label: 'All Accounts',
    description: 'Show all account types',
  },
  {
    value: 'active',
    label: 'Active Accounts',
    description: 'Currently purchasing accounts',
  },
  {
    value: 'new',
    label: 'New Accounts',
    description: 'First-time buyers this year',
  },
  {
    value: 'reactivated',
    label: 'Reactivated Accounts',
    description: 'Returned after absence',
  },
  {
    value: 'lost',
    label: 'Lost Accounts',
    description: 'No longer purchasing',
  },
];

// Brand Sort Options
export const BRAND_SORT_OPTIONS: FilterOption[] = [
  {
    value: 'units_high',
    label: 'Units: High to Low',
    description: 'Sort by total units sold',
  },
  {
    value: 'units_low',
    label: 'Units: Low to High',
    description: 'Sort by fewest units',
  },
  {
    value: 'accounts_high',
    label: 'Accounts: Most First',
    description: 'Sort by account count',
  },
  {
    value: 'accounts_low',
    label: 'Accounts: Fewest First',
    description: 'Sort by lowest account count',
  },
];

// Time Period Options
export const TIME_PERIOD_OPTIONS: FilterOption[] = [
  {
    value: 'current',
    label: 'Current Year',
    description: 'Show current year data only',
  },
  {
    value: 'previous',
    label: 'Previous Year',
    description: 'Show previous year data only',
  },
  {
    value: 'comparison',
    label: 'Year Comparison',
    description: 'Show both years side by side',
  },
];

// Phoenix Metro Territory Zones
export const TERRITORY_ZONES: FilterOption[] = [
  {
    value: 'all',
    label: 'All Territories',
    description: 'Show all zones',
  },
  {
    value: 'north_phoenix',
    label: 'North Phoenix',
    description: 'North of Loop 101',
  },
  {
    value: 'scottsdale',
    label: 'Scottsdale',
    description: 'Scottsdale area',
  },
  {
    value: 'tempe',
    label: 'Tempe',
    description: 'Tempe and ASU area',
  },
  {
    value: 'mesa',
    label: 'Mesa',
    description: 'Mesa and east valley',
  },
  {
    value: 'chandler',
    label: 'Chandler',
    description: 'Chandler area',
  },
  {
    value: 'gilbert',
    label: 'Gilbert',
    description: 'Gilbert area',
  },
  {
    value: 'glendale',
    label: 'Glendale',
    description: 'Glendale and west valley',
  },
  {
    value: 'peoria',
    label: 'Peoria',
    description: 'Peoria area',
  },
];

// Default Filter State
export const DEFAULT_FILTERS = {
  dataView: 'full' as const,
  accountSort: 'sales_high' as const,
  accountStatus: ['all' as const],
  selectedCities: [],
  brandSort: 'units_high' as const,
  selectedColorGroups: [],
  timePeriod: 'comparison' as const,
  selectedZones: ['all'],
};
