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

export interface DashboardData {
  summary: SalesSummary;
  accounts: AccountsData;
  frames: FrameData;
  brands: BrandData;
  insights: string[];
}
