// Sales Dashboard Types based on Parser Output

export interface SalesSummary {
  // Overall Performance
  total_sales_cy: number;
  total_sales_py: number;
  total_sales_change: number;
  total_sales_pct_change: number;

  // Sales Breakdown
  direct_sales_cy: number;
  direct_sales_py: number;
  indirect_sales_cy: number;
  indirect_sales_py: number;

  // Account Metrics
  total_accounts: number;
  total_accounts_py: number;
  account_average: number;
  retention_rate: number;

  // Account Changes
  new_accounts: number;
  new_accounts_sales: number;
  reactivated_accounts: number;
  reactivated_accounts_sales: number;
  lost_accounts: number;
  lost_accounts_sales: number;

  // Performance Breakdown
  increasing_accounts: number;
  increasing_accounts_sales: number;
  declining_accounts: number;
  declining_accounts_sales: number;

  // Calculated Metrics
  total_decline_amount: number;
  total_increase_amount: number;
  net_change: number;
}

export interface Account {
  'Acct #': number;
  Name: string;
  City: string;
  'CY Total': number;
  'PY Total': number;
  Difference: number;
  'Project Code'?: string;
}

export interface FrameCategory {
  name: string;
  current_year: number;
  previous_year: number;
  change: number;
  pct_change: number;
}

export interface FrameData {
  increasing: FrameCategory[];
  declining: FrameCategory[];
  top_growth: FrameCategory[];
  top_decline: FrameCategory[];
}

export interface Brand {
  brand: string;
  total_units: number;
  account_count: number;
  avg_units_per_account: number;
}

export interface BrandData {
  brands: Brand[];
  top_brands: Brand[];
  total_brands_sold: number;
}

export interface AccountsData {
  top_declining: Account[];
  top_increasing: Account[];
  new_accounts: Account[];
  reactivated_accounts: Account[];
}

export interface CustomerBrandChange {
  account_number: number;
  account_name: string;
  city: string;
  color_group: string;
  previous_year_units: number;
  current_year_units: number;
  change: number;
  brands: {
    brand: string;
    previous_year_units: number;
    current_year_units: number;
    change: number;
  }[];
}

export interface ColorGroupDrillDown {
  color_group: string;
  total_customers_with_activity: number;
  declining_customers: CustomerBrandChange[];
  declining_count: number;
  growing_customers: CustomerBrandChange[];
  growing_count: number;
  lost_customers: CustomerBrandChange[];
  lost_count: number;
  new_customers: CustomerBrandChange[];
  new_count: number;
  total_change_units: number;
}

export interface BrandComparison {
  all_customer_brand_changes: any[];
  color_group_drill_downs: {
    [colorGroup: string]: ColorGroupDrillDown;
  };
  comparison_metadata: {
    previous_year_file: string;
    current_year_file: string;
    total_brands_tracked: number;
    total_color_groups: number;
  };
}

export interface QualifyingAccount {
  account_number: number;
  account_name: string;
  units: number;
}

export interface BrandAccountMetric {
  brand: string;
  color_group: string;
  accounts_buying_12_plus: number;
  total_accounts_buying: number;
  total_units: number;
  qualifying_accounts: QualifyingAccount[];
}

export interface AccountsPerBrand {
  threshold: number;
  current_year: BrandAccountMetric[];
  previous_year: BrandAccountMetric[];
  summary: {
    cy_total_qualifying_accounts: number;
    py_total_qualifying_accounts: number;
    cy_avg_accounts_per_brand: number;
    py_avg_accounts_per_brand: number;
  };
}

export interface DateRange {
  start_date: string;
  end_date: string;
  total_days: number;
}

export interface SalesPerWorkingDay {
  date_range: DateRange;
  working_days: number;
  weekend_days: number;
  bank_holidays: number;
  sales_per_working_day_cy: number;
  sales_per_working_day_py: number;
  total_sales_cy: number;
  total_sales_py: number;
  change_per_day: number;
  pct_change_per_day: number;
  error?: string;
}

// City Insights Types
export interface CityColorGroup {
  color_group: string;
  units: number;
}

export interface CityAccountChange {
  account_number: number;
  account_name: string;
  previous_year_units: number;
  current_year_units: number;
  change: number;
}

export interface CityBrandMetric {
  brand: string;
  color_group: string;
  accounts_buying_12_plus: number;
  total_accounts_buying: number;
  total_units: number;
}

export interface CityData {
  city: string;
  total_accounts: number;
  total_units_cy: number;
  total_units_py: number;
  units_change: number;
  units_change_pct: number;
  accounts_by_brand_cy: CityBrandMetric[];
  accounts_by_brand_py: CityBrandMetric[];
  color_groups_cy: CityColorGroup[];
  color_groups_py: CityColorGroup[];
  growing_accounts: CityAccountChange[];
  declining_accounts: CityAccountChange[];
  lost_accounts: CityAccountChange[];
  new_accounts: CityAccountChange[];
  growing_count: number;
  declining_count: number;
  lost_count: number;
  new_count: number;
}

export interface CityInsightsSummary {
  total_units_cy: number;
  total_units_py: number;
  total_accounts: number;
  total_growing: number;
  total_declining: number;
  total_lost: number;
  total_new: number;
}

export interface CityInsights {
  cities: CityData[];
  total_cities: number;
  summary: CityInsightsSummary;
}

export interface DashboardData {
  summary: SalesSummary;
  accounts: AccountsData;
  frames: FrameData;
  brands: BrandData;
  insights: string[];
  brand_comparison?: BrandComparison;
  accounts_per_brand?: AccountsPerBrand;
  sales_per_working_day?: SalesPerWorkingDay;
  city_insights?: CityInsights;
}

// Route/Zone Management Types
export interface Route {
  id: string;
  name: string;
  description?: string;
  color: string;
  cities: string[];  // Array of city names
  createdAt: string;
  updatedAt: string;
}

export interface RouteAnalytics {
  routeId: string;
  routeName: string;
  totalAccounts: number;
  totalUnitsCY: number;
  totalUnitsPY: number;
  unitsChange: number;
  unitsChangePct: number;
  growingCount: number;
  decliningCount: number;
  lostCount: number;
  newCount: number;
  cities: CityData[];
  colorGroupBreakdown: CityColorGroup[];
}
