// Filter System Types for Sales Dashboard

export type DataView = 'full' | 'territory_overview' | 'all_accounts' | 'territory_map';

export type AccountSortOption =
  | 'sales_high'
  | 'sales_low'
  | 'change_gain'
  | 'change_loss'
  | 'city_asc'
  | 'city_desc';

export type AccountStatusFilter = 'new' | 'reactivated' | 'lost' | 'active' | 'all';

export type BrandSortOption =
  | 'units_high'
  | 'units_low'
  | 'accounts_high'
  | 'accounts_low';

export type TimePeriod = 'current' | 'previous' | 'comparison';

export interface FilterState {
  // Data View
  dataView: DataView;

  // Account Filters
  accountSort: AccountSortOption;
  accountStatus: AccountStatusFilter[];
  selectedCities: string[];

  // Brand Filters
  brandSort: BrandSortOption;
  selectedColorGroups: string[];

  // Time Period
  timePeriod: TimePeriod;

  // Territory
  selectedZones: string[];
}

export interface FilterContextType {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  isFilterPanelOpen: boolean;
  toggleFilterPanel: () => void;
}

export interface FilterOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'checkbox' | 'radio';
  options: FilterOption[];
}
