"""
Sales Comparison Parser - Dual File YOY Analysis
Compares two YOY Excel files to extract brand-level customer insights
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import json
from datetime import datetime


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

        # Categorize customers
        declining = [c for c in customers if c['change'] < 0]
        growing = [c for c in customers if c['change'] > 0]
        lost = [c for c in customers if c['previous_year_units'] > 0 and c['current_year_units'] == 0]
        new = [c for c in customers if c['previous_year_units'] == 0 and c['current_year_units'] > 0]

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
