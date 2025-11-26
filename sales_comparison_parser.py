"""
Sales Comparison Parser - Dual File YOY Analysis
Compares two YOY Excel files to extract brand-level customer insights
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import json
from datetime import datetime, timedelta
import re
import os


class SalesComparisonParser:
    """Parse and compare two YOY Excel files for detailed brand-level analysis"""

    # Brand to Color Group Mapping
    BRAND_COLOR_MAP = {
        # Black Diamond
        'MODERN ART': 'BLACK DIAMOND',
        'G.V.X.': 'BLACK DIAMOND',
        'MODZ TITANIUM': 'BLACK DIAMOND',
        'MODZFLEX': 'BLACK DIAMOND',

        # Yellow
        'B.M.E.C.': 'YELLOW',
        'GB+ COLLECTION': 'YELLOW',
        'GENEVIEVE BOUTIQUE': 'YELLOW',
        'FASHIONTABULOUS': 'YELLOW',
        'UROCK': 'YELLOW',

        # Red
        'MODZ SUNZ': 'RED',
        'GENEVIEVE PARIS DESIGN': 'RED',
        'GIOVANI DI VENEZIA': 'RED',
        'MODZ': 'RED',
        'MODZ KIDS': 'RED',

        # Blue
        'MODERN TIMES': 'BLUE',

        # Green
        'MODERN PLASTICS II': 'GREEN',
        'MODERN METALS': 'GREEN',

        # Lime
        'MODERN PLASTICS I': 'LIME',
    }

    # US Federal Bank Holidays (fixed dates and rules)
    BANK_HOLIDAYS = [
        # Format: (month, day) for fixed holidays
        (1, 1),    # New Year's Day
        (7, 4),    # Independence Day
        (11, 11),  # Veterans Day
        (12, 25),  # Christmas Day
    ]

    def __init__(self, previous_year_path: str, current_year_path: str):
        """
        Initialize with paths to both YOY Excel files

        Args:
            previous_year_path: Path to previous year YOY Excel (e.g., 2024)
            current_year_path: Path to current year YOY Excel (e.g., 2025)
        """
        self.previous_year_path = previous_year_path
        self.current_year_path = current_year_path
        self.previous_year_data = None
        self.current_year_data = None
        self.brand_columns = None

    def load_data(self):
        """Load both Excel files and extract account-level brand data"""
        print(f"[INFO] Loading previous year file: {self.previous_year_path}")
        self.previous_year_data = self._load_excel_file(self.previous_year_path)

        print(f"[INFO] Loading current year file: {self.current_year_path}")
        self.current_year_data = self._load_excel_file(self.current_year_path)

        # Get brand columns (same in both files)
        self.brand_columns = [col for col in self.previous_year_data.columns
                             if col in self.BRAND_COLOR_MAP]

        print(f"[OK] Loaded {len(self.previous_year_data)} accounts from previous year")
        print(f"[OK] Loaded {len(self.current_year_data)} accounts from current year")
        print(f"[OK] Found {len(self.brand_columns)} brand columns for comparison")

    def _load_excel_file(self, file_path: str) -> pd.DataFrame:
        """Load Excel file starting at row 24 (account data section)"""
        df = pd.read_excel(file_path, sheet_name=0, skiprows=24)
        df.columns = df.columns.str.strip()
        df = df.dropna(how='all')

        # Remove rows where Acct # is not numeric (footer rows)
        if 'Acct #' in df.columns:
            df = df[pd.to_numeric(df['Acct #'], errors='coerce').notna()]

        # Fill NaN values in brand columns with 0
        for col in df.columns:
            if col in self.BRAND_COLOR_MAP:
                df[col] = df[col].fillna(0)

        return df

    def get_customer_brand_changes(self) -> List[Dict]:
        """
        Compare brand purchases between years for each customer

        Returns:
            List of customer brand changes with details
        """
        changes = []

        # Merge datasets on Account #
        merged = pd.merge(
            self.previous_year_data[['Acct #', 'Name', 'City'] + self.brand_columns],
            self.current_year_data[['Acct #', 'Name', 'City'] + self.brand_columns],
            on='Acct #',
            how='outer',
            suffixes=('_py', '_cy')
        )

        # Iterate through each account
        for _, row in merged.iterrows():
            acct_num = row['Acct #']
            # Use current year name/city if available, otherwise previous year
            name = row.get('Name_cy', row.get('Name_py', 'Unknown'))
            city = row.get('City_cy', row.get('City_py', 'Unknown'))

            # Compare each brand
            for brand in self.brand_columns:
                py_col = f'{brand}_py'
                cy_col = f'{brand}_cy'

                py_units = row.get(py_col, 0) if pd.notna(row.get(py_col)) else 0
                cy_units = row.get(cy_col, 0) if pd.notna(row.get(cy_col)) else 0

                # Convert to int
                py_units = int(py_units) if isinstance(py_units, (int, float)) else 0
                cy_units = int(cy_units) if isinstance(cy_units, (int, float)) else 0

                # Calculate change
                change = cy_units - py_units

                # Only include if there's a change or current/previous activity
                if change != 0 or py_units > 0 or cy_units > 0:
                    changes.append({
                        'account_number': int(acct_num) if pd.notna(acct_num) else 0,
                        'account_name': str(name),
                        'city': str(city),
                        'brand': brand,
                        'color_group': self.BRAND_COLOR_MAP.get(brand, 'OTHER'),
                        'previous_year_units': py_units,
                        'current_year_units': cy_units,
                        'change': change,
                        'pct_change': ((change / py_units) * 100) if py_units > 0 else 0
                    })

        return changes

    def get_account_color_breakdown(self, account_number: int) -> Dict:
        """
        Get color group breakdown for a specific account

        Args:
            account_number: Account number to analyze

        Returns:
            Dictionary with color group breakdown for this account
        """
        all_changes = self.get_customer_brand_changes()

        # Filter to this account
        account_changes = [c for c in all_changes if c['account_number'] == account_number]

        if not account_changes:
            return {
                'account_number': account_number,
                'color_groups_cy': [],
                'color_groups_py': []
            }

        # Aggregate by color group for Current Year
        color_totals_cy = {}
        color_totals_py = {}

        for change in account_changes:
            color = change['color_group']

            if color not in color_totals_cy:
                color_totals_cy[color] = 0
                color_totals_py[color] = 0

            color_totals_cy[color] += change['current_year_units']
            color_totals_py[color] += change['previous_year_units']

        # Convert to list format with percentages
        total_cy = sum(color_totals_cy.values())
        total_py = sum(color_totals_py.values())

        color_groups_cy = []
        color_groups_py = []

        for color in color_totals_cy.keys():
            if color_totals_cy[color] > 0:
                color_groups_cy.append({
                    'color_group': color,
                    'units': color_totals_cy[color],
                    'percentage': (color_totals_cy[color] / total_cy * 100) if total_cy > 0 else 0
                })

            if color_totals_py[color] > 0:
                color_groups_py.append({
                    'color_group': color,
                    'units': color_totals_py[color],
                    'percentage': (color_totals_py[color] / total_py * 100) if total_py > 0 else 0
                })

        # Sort by units descending
        color_groups_cy.sort(key=lambda x: x['units'], reverse=True)
        color_groups_py.sort(key=lambda x: x['units'], reverse=True)

        return {
            'account_number': account_number,
            'color_groups_cy': color_groups_cy,
            'color_groups_py': color_groups_py,
            'total_units_cy': total_cy,
            'total_units_py': total_py
        }

    def get_color_group_drill_down(self, color_group: str) -> Dict:
        """
        Get detailed drill-down for a specific color group
        Shows which customers stopped/reduced buying

        Args:
            color_group: Color group name (e.g., 'BLUE', 'BLACK DIAMOND')

        Returns:
            Dictionary with declining, growing, lost, and new customers for that color
        """
        all_changes = self.get_customer_brand_changes()

        # Filter to this color group
        color_changes = [c for c in all_changes if c['color_group'] == color_group]

        # Aggregate by customer (sum all brands in this color group)
        customer_totals = {}
        for change in color_changes:
            acct = change['account_number']
            if acct not in customer_totals:
                customer_totals[acct] = {
                    'account_number': acct,
                    'account_name': change['account_name'],
                    'city': change['city'],
                    'color_group': color_group,
                    'previous_year_units': 0,
                    'current_year_units': 0,
                    'change': 0,
                    'brands': []
                }

            customer_totals[acct]['previous_year_units'] += change['previous_year_units']
            customer_totals[acct]['current_year_units'] += change['current_year_units']
            customer_totals[acct]['change'] += change['change']
            customer_totals[acct]['brands'].append({
                'brand': change['brand'],
                'previous_year_units': change['previous_year_units'],
                'current_year_units': change['current_year_units'],
                'change': change['change']
            })

        customers = list(customer_totals.values())

        # Categorize customers (mutually exclusive categories)
        lost = [c for c in customers if c['previous_year_units'] > 0 and c['current_year_units'] == 0]
        new = [c for c in customers if c['previous_year_units'] == 0 and c['current_year_units'] > 0]
        declining = [c for c in customers if c['change'] < 0 and c['current_year_units'] > 0]  # Exclude lost (CY must be > 0)
        growing = [c for c in customers if c['change'] > 0 and c['previous_year_units'] > 0]  # Exclude new (PY must be > 0)

        # Sort by impact (largest declines first)
        declining.sort(key=lambda x: x['change'])
        growing.sort(key=lambda x: x['change'], reverse=True)
        lost.sort(key=lambda x: x['previous_year_units'], reverse=True)
        new.sort(key=lambda x: x['current_year_units'], reverse=True)

        return {
            'color_group': color_group,
            'total_customers_with_activity': len(customers),
            'declining_customers': declining,
            'declining_count': len(declining),
            'growing_customers': growing,
            'growing_count': len(growing),
            'lost_customers': lost,
            'lost_count': len(lost),
            'new_customers': new,
            'new_count': len(new),
            'total_change_units': sum(c['change'] for c in customers)
        }

    def get_accounts_per_brand(self, threshold: int = 12) -> Dict:
        """
        Calculate how many accounts buy threshold+ units from each brand

        Args:
            threshold: Minimum units to qualify (default: 12)

        Returns:
            Dictionary with accounts per brand metrics for CY and PY
        """
        brand_metrics_cy = {}
        brand_metrics_py = {}

        # Initialize metrics for all tracked brands
        for brand in self.brand_columns:
            brand_metrics_cy[brand] = {
                'brand': brand,
                'color_group': self.BRAND_COLOR_MAP.get(brand, 'OTHER'),
                'accounts_buying_12_plus': 0,
                'total_accounts_buying': 0,
                'total_units': 0,
                'qualifying_accounts': []
            }
            brand_metrics_py[brand] = {
                'brand': brand,
                'color_group': self.BRAND_COLOR_MAP.get(brand, 'OTHER'),
                'accounts_buying_12_plus': 0,
                'total_accounts_buying': 0,
                'total_units': 0,
                'qualifying_accounts': []
            }

        # Analyze current year data
        for _, row in self.current_year_data.iterrows():
            acct_num = row.get('Acct #', 0)
            acct_name = row.get('Name', 'Unknown')

            for brand in self.brand_columns:
                if brand in row and pd.notna(row[brand]):
                    units = int(row[brand]) if isinstance(row[brand], (int, float)) else 0

                    if units > 0:
                        brand_metrics_cy[brand]['total_accounts_buying'] += 1
                        brand_metrics_cy[brand]['total_units'] += units

                        if units >= threshold:
                            brand_metrics_cy[brand]['accounts_buying_12_plus'] += 1
                            brand_metrics_cy[brand]['qualifying_accounts'].append({
                                'account_number': int(acct_num) if pd.notna(acct_num) else 0,
                                'account_name': str(acct_name),
                                'units': units
                            })

        # Analyze previous year data
        for _, row in self.previous_year_data.iterrows():
            acct_num = row.get('Acct #', 0)
            acct_name = row.get('Name', 'Unknown')

            for brand in self.brand_columns:
                if brand in row and pd.notna(row[brand]):
                    units = int(row[brand]) if isinstance(row[brand], (int, float)) else 0

                    if units > 0:
                        brand_metrics_py[brand]['total_accounts_buying'] += 1
                        brand_metrics_py[brand]['total_units'] += units

                        if units >= threshold:
                            brand_metrics_py[brand]['accounts_buying_12_plus'] += 1
                            brand_metrics_py[brand]['qualifying_accounts'].append({
                                'account_number': int(acct_num) if pd.notna(acct_num) else 0,
                                'account_name': str(acct_name),
                                'units': units
                            })

        # Sort qualifying accounts by units for each brand
        for brand in self.brand_columns:
            brand_metrics_cy[brand]['qualifying_accounts'].sort(
                key=lambda x: x['units'], reverse=True
            )
            brand_metrics_py[brand]['qualifying_accounts'].sort(
                key=lambda x: x['units'], reverse=True
            )

        # Convert to lists and sort by accounts_buying_12_plus
        brands_cy = list(brand_metrics_cy.values())
        brands_py = list(brand_metrics_py.values())

        brands_cy.sort(key=lambda x: x['accounts_buying_12_plus'], reverse=True)
        brands_py.sort(key=lambda x: x['accounts_buying_12_plus'], reverse=True)

        return {
            'threshold': threshold,
            'current_year': brands_cy,
            'previous_year': brands_py,
            'summary': {
                'cy_total_qualifying_accounts': sum(b['accounts_buying_12_plus'] for b in brands_cy),
                'py_total_qualifying_accounts': sum(b['accounts_buying_12_plus'] for b in brands_py),
                'cy_avg_accounts_per_brand': sum(b['accounts_buying_12_plus'] for b in brands_cy) / len(brands_cy) if brands_cy else 0,
                'py_avg_accounts_per_brand': sum(b['accounts_buying_12_plus'] for b in brands_py) / len(brands_py) if brands_py else 0
            }
        }

    def _extract_dates_from_filename(self, file_path: str) -> Optional[Tuple[datetime, datetime]]:
        """
        Extract start and end dates from filename pattern like 'Payton YOY 8-18-24 to 8-19-25.xlsx'
        or from Excel cell C1 if filename doesn't contain dates

        Args:
            file_path: Path to the Excel file

        Returns:
            Tuple of (start_date, end_date) or None if not found
        """
        filename = os.path.basename(file_path)

        # Pattern: Month-Day-Year to Month-Day-Year
        pattern = r'(\d{1,2})-(\d{1,2})-(\d{2,4})\s+to\s+(\d{1,2})-(\d{1,2})-(\d{2,4})'
        match = re.search(pattern, filename)

        if match:
            start_month, start_day, start_year, end_month, end_day, end_year = match.groups()

            # Convert 2-digit years to 4-digit
            start_year = int(start_year)
            if start_year < 100:
                start_year += 2000

            end_year = int(end_year)
            if end_year < 100:
                end_year += 2000

            try:
                start_date = datetime(start_year, int(start_month), int(start_day))
                end_date = datetime(end_year, int(end_month), int(end_day))
                return (start_date, end_date)
            except ValueError:
                return None

        # If not found in filename, try reading from Excel cell C1
        try:
            import openpyxl
            wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
            sheet = wb.active

            # Try cell C1 (row 1, column 3)
            cell_value = sheet['C1'].value
            wb.close()

            if cell_value and isinstance(cell_value, str):
                # Try to find date pattern in cell value
                match = re.search(pattern, cell_value)
                if match:
                    start_month, start_day, start_year, end_month, end_day, end_year = match.groups()

                    # Convert 2-digit years to 4-digit
                    start_year = int(start_year)
                    if start_year < 100:
                        start_year += 2000

                    end_year = int(end_year)
                    if end_year < 100:
                        end_year += 2000

                    try:
                        start_date = datetime(start_year, int(start_month), int(start_day))
                        end_date = datetime(end_year, int(end_month), int(end_day))
                        return (start_date, end_date)
                    except ValueError:
                        pass
        except Exception as e:
            print(f"[WARNING] Could not read date from Excel cell C1: {e}")

        return None

    def _get_bank_holidays(self, year: int) -> List[datetime]:
        """
        Get list of bank holidays for a given year

        Args:
            year: Year to calculate holidays for

        Returns:
            List of datetime objects for bank holidays
        """
        holidays = []

        # Fixed date holidays
        for month, day in self.BANK_HOLIDAYS:
            holidays.append(datetime(year, month, day))

        # Martin Luther King Jr. Day - 3rd Monday in January
        jan_1 = datetime(year, 1, 1)
        first_monday = jan_1 + timedelta(days=(7 - jan_1.weekday()) % 7)
        mlk_day = first_monday + timedelta(weeks=2)
        holidays.append(mlk_day)

        # Presidents Day - 3rd Monday in February
        feb_1 = datetime(year, 2, 1)
        first_monday = feb_1 + timedelta(days=(7 - feb_1.weekday()) % 7)
        presidents_day = first_monday + timedelta(weeks=2)
        holidays.append(presidents_day)

        # Memorial Day - Last Monday in May
        may_31 = datetime(year, 5, 31)
        memorial_day = may_31 - timedelta(days=(may_31.weekday() - 0) % 7)
        holidays.append(memorial_day)

        # Labor Day - 1st Monday in September
        sep_1 = datetime(year, 9, 1)
        labor_day = sep_1 + timedelta(days=(7 - sep_1.weekday()) % 7)
        holidays.append(labor_day)

        # Thanksgiving - 4th Thursday in November
        nov_1 = datetime(year, 11, 1)
        first_thursday = nov_1 + timedelta(days=(3 - nov_1.weekday()) % 7)
        thanksgiving = first_thursday + timedelta(weeks=3)
        holidays.append(thanksgiving)

        return holidays

    def _count_working_days(self, start_date: datetime, end_date: datetime) -> int:
        """
        Count working days between two dates, excluding weekends and bank holidays

        Args:
            start_date: Start date (inclusive)
            end_date: End date (inclusive)

        Returns:
            Number of working days
        """
        working_days = 0
        current_date = start_date

        # Get bank holidays for all years in range
        years = range(start_date.year, end_date.year + 1)
        all_holidays = []
        for year in years:
            all_holidays.extend(self._get_bank_holidays(year))

        # Convert to date objects for comparison
        holiday_dates = set(h.date() for h in all_holidays)

        while current_date <= end_date:
            # Check if it's a weekday (Monday=0, Sunday=6)
            if current_date.weekday() < 5:  # Monday through Friday
                # Check if it's not a bank holiday
                if current_date.date() not in holiday_dates:
                    working_days += 1

            current_date += timedelta(days=1)

        return working_days

    def get_sales_per_working_day(self) -> Dict:
        """
        Calculate sales per working day excluding bank holidays

        Returns:
            Dictionary with working day metrics
        """
        # Try to extract dates from filename
        dates = self._extract_dates_from_filename(self.current_year_path)

        if not dates:
            return {
                'error': 'Could not extract date range from filename',
                'working_days': None,
                'sales_per_working_day_cy': None,
                'sales_per_working_day_py': None
            }

        start_date, end_date = dates
        working_days = self._count_working_days(start_date, end_date)

        # Import parser to get sales totals
        from sales_parser import SalesDashboardParser

        current_parser = SalesDashboardParser(self.current_year_path)
        current_parser.load_data()
        summary = current_parser.summary_data

        total_sales_cy = summary.get('total_sales_cy', 0)
        total_sales_py = summary.get('total_sales_py', 0)

        return {
            'date_range': {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'total_days': (end_date - start_date).days + 1
            },
            'working_days': working_days,
            'weekend_days': sum(1 for d in range((end_date - start_date).days + 1)
                              if (start_date + timedelta(days=d)).weekday() >= 5),
            'bank_holidays': (end_date - start_date).days + 1 - working_days -
                           sum(1 for d in range((end_date - start_date).days + 1)
                               if (start_date + timedelta(days=d)).weekday() >= 5),
            'sales_per_working_day_cy': round(total_sales_cy / working_days, 2) if working_days > 0 else 0,
            'sales_per_working_day_py': round(total_sales_py / working_days, 2) if working_days > 0 else 0,
            'total_sales_cy': total_sales_cy,
            'total_sales_py': total_sales_py,
            'change_per_day': round((total_sales_cy - total_sales_py) / working_days, 2) if working_days > 0 else 0,
            'pct_change_per_day': round(((total_sales_cy / working_days) / (total_sales_py / working_days) - 1) * 100, 2) if working_days > 0 and total_sales_py > 0 else 0
        }

    def get_complete_comparison_summary(self) -> Dict:
        """
        Generate complete dashboard data including brand-level comparisons

        Returns:
            Complete dashboard data structure
        """
        # Import the original parser for aggregate metrics
        from sales_parser import SalesDashboardParser

        # Parse current year file for aggregate metrics (maintains compatibility)
        current_parser = SalesDashboardParser(self.current_year_path)
        current_parser.load_data()
        base_summary = current_parser.get_dashboard_summary()

        # Add brand-level comparison data
        all_brand_changes = self.get_customer_brand_changes()

        # Generate drill-downs for each color group
        color_drill_downs = {}
        for color in set(self.BRAND_COLOR_MAP.values()):
            color_drill_downs[color] = self.get_color_group_drill_down(color)

        # NEW: Add accounts per brand analysis
        accounts_per_brand = self.get_accounts_per_brand(threshold=12)

        # NEW: Add sales per working day metrics
        sales_per_working_day = self.get_sales_per_working_day()

        # Enhance base summary with comparison data
        base_summary['brand_comparison'] = {
            'all_customer_brand_changes': all_brand_changes,
            'color_group_drill_downs': color_drill_downs,
            'comparison_metadata': {
                'previous_year_file': self.previous_year_path,
                'current_year_file': self.current_year_path,
                'total_brands_tracked': len(self.brand_columns),
                'total_color_groups': len(set(self.BRAND_COLOR_MAP.values()))
            }
        }

        # Add new features to base summary
        base_summary['accounts_per_brand'] = accounts_per_brand
        base_summary['sales_per_working_day'] = sales_per_working_day

        return base_summary

    def export_to_json(self, output_path: str = 'sales_comparison_data.json'):
        """Export complete comparison data to JSON"""
        comparison_data = self.get_complete_comparison_summary()

        def json_serializer(obj):
            """Handle NaN and special types"""
            if pd.isna(obj):
                return None
            if isinstance(obj, (pd.Timestamp, datetime)):
                return obj.isoformat()
            if isinstance(obj, np.integer):
                return int(obj)
            if isinstance(obj, np.floating):
                if np.isnan(obj):
                    return None
                return float(obj)
            return str(obj)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(comparison_data, f, indent=2, default=json_serializer, ensure_ascii=False)

        print(f"[OK] Comparison data exported to {output_path}")
        return output_path


# Example usage
if __name__ == "__main__":
    # Test with your files
    parser = SalesComparisonParser(
        previous_year_path='Payton YOY 8-18-24 to 8-19-25.xlsx',  # Replace with actual 2024 file
        current_year_path='Payton YOY 8-18-24 to 8-19-25.xlsx'     # Replace with actual 2025 file
    )

    parser.load_data()

    # Get Blue frame drill-down
    blue_drill_down = parser.get_color_group_drill_down('BLUE')

    print("\n" + "="*60)
    print(f"BLUE FRAME CATEGORY DRILL-DOWN")
    print("="*60)
    print(f"Total customers with Blue activity: {blue_drill_down['total_customers_with_activity']}")
    print(f"Declining: {blue_drill_down['declining_count']}")
    print(f"Growing: {blue_drill_down['growing_count']}")
    print(f"Lost (bought last year, not this year): {blue_drill_down['lost_count']}")
    print(f"New (didn't buy last year, buying now): {blue_drill_down['new_count']}")
    print(f"Total change: {blue_drill_down['total_change_units']} units")

    if blue_drill_down['declining_customers']:
        print("\nTop 5 Declining Blue Customers:")
        for customer in blue_drill_down['declining_customers'][:5]:
            print(f"  - {customer['account_name']} ({customer['city']})")
            print(f"    {customer['previous_year_units']} → {customer['current_year_units']} units ({customer['change']:+d})")
            print(f"    Brands: {', '.join([b['brand'] for b in customer['brands']])}")

    # Export full data
    parser.export_to_json()
