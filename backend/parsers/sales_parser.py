"""
Sales Dashboard Parser
Extracts insights from YOY sales data for sales representatives
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import json
from datetime import datetime


class SalesDashboardParser:
    """Parse Excel sales data and extract actionable insights"""

    def __init__(self, excel_path: str):
        """
        Initialize the parser with an Excel file path

        Args:
            excel_path: Path to the Excel file containing sales data
        """
        self.excel_path = excel_path
        self.df = None
        self.summary_data = {}
        self.account_data = None
        self.frame_data = None

    def load_data(self):
        """Load and parse the Excel file"""
        # Read the raw data
        raw_df = pd.read_excel(self.excel_path, sheet_name=0, header=None)

        # Extract summary data from the top section
        self._extract_summary_data(raw_df)

        # Find the account details section (starts at row 24)
        account_start_row = 24

        # Read account data with proper headers
        self.account_data = pd.read_excel(
            self.excel_path,
            sheet_name=0,
            skiprows=account_start_row
        )

        # Clean column names
        self.account_data.columns = self.account_data.columns.str.strip()

        # Remove any empty rows
        self.account_data = self.account_data.dropna(how='all')

        print(f"[OK] Loaded {len(self.account_data)} accounts")

    def _extract_summary_data(self, raw_df):
        """Extract summary metrics from the top of the spreadsheet"""
        try:
            # Extract key metrics
            self.summary_data = {
                'total_sales_cy': self._parse_currency(raw_df.iloc[2, 3]),
                'total_sales_py': self._parse_currency(raw_df.iloc[2, 4]),
                'total_sales_change': self._parse_currency(raw_df.iloc[2, 5]),
                'total_sales_pct_change': self._parse_percentage(raw_df.iloc[2, 6]),
                'direct_sales_cy': self._parse_currency(raw_df.iloc[3, 3]),
                'direct_sales_py': self._parse_currency(raw_df.iloc[3, 4]),
                'indirect_sales_cy': self._parse_currency(raw_df.iloc[4, 3]),
                'indirect_sales_py': self._parse_currency(raw_df.iloc[4, 4]),
                'total_accounts': int(raw_df.iloc[5, 3]) if pd.notna(raw_df.iloc[5, 3]) else 0,
                'total_accounts_py': int(raw_df.iloc[5, 4]) if pd.notna(raw_df.iloc[5, 4]) else 0,
                'account_average': self._parse_currency(raw_df.iloc[6, 3]),
                'new_accounts': int(raw_df.iloc[9, 3]) if pd.notna(raw_df.iloc[9, 3]) else 0,
                'new_accounts_sales': self._parse_currency(raw_df.iloc[9, 4]),
                'reactivated_accounts': int(raw_df.iloc[12, 3]) if pd.notna(raw_df.iloc[12, 3]) else 0,
                'reactivated_accounts_sales': self._parse_currency(raw_df.iloc[12, 4]),
                'lost_accounts': int(raw_df.iloc[15, 3]) if pd.notna(raw_df.iloc[15, 3]) else 0,
                'lost_accounts_sales': self._parse_currency(raw_df.iloc[15, 4]),
                'increasing_accounts': int(raw_df.iloc[18, 3]) if pd.notna(raw_df.iloc[18, 3]) else 0,
                'increasing_accounts_sales': self._parse_currency(raw_df.iloc[18, 4]),
                'declining_accounts': int(raw_df.iloc[21, 3]) if pd.notna(raw_df.iloc[21, 3]) else 0,
                'declining_accounts_sales': self._parse_currency(raw_df.iloc[21, 4]),
            }

            # Extract frame data
            self.frame_data = {}
            frame_rows = {
                'BLACK DIAMOND': 2,
                'YELLOW': 3,
                'RED': 4,
                'BLUE': 5,
                'GREEN': 6,
                'LIME': 7,
                'CLAMSHELL CASES': 8,
                'SLIP-IN CASES': 9,
                'NOSE PADS': 10,
                'PARTS': 11,
                'SUMMIT OPTICAL': 12,
                'TOOLS': 13,
            }

            for frame_name, row_idx in frame_rows.items():
                cy_val = raw_df.iloc[row_idx, 10]
                py_val = raw_df.iloc[row_idx, 11]
                change_val = raw_df.iloc[row_idx, 12]
                pct_change_val = raw_df.iloc[row_idx, 13]

                if pd.notna(cy_val) and pd.notna(py_val):
                    self.frame_data[frame_name] = {
                        'current_year': int(cy_val) if isinstance(cy_val, (int, float)) else 0,
                        'previous_year': int(py_val) if isinstance(py_val, (int, float)) else 0,
                        'change': int(change_val) if pd.notna(change_val) and isinstance(change_val, (int, float)) else 0,
                        'pct_change': self._parse_percentage(pct_change_val) if pd.notna(pct_change_val) else 0.0
                    }

        except Exception as e:
            print(f"Warning: Error extracting summary data: {e}")

    def _parse_currency(self, value):
        """Parse currency string to float"""
        if pd.isna(value):
            return 0.0
        if isinstance(value, (int, float)):
            return float(value)
        # Remove currency symbols and commas
        cleaned = str(value).replace('$', '').replace(',', '').replace('-', '-')
        try:
            return float(cleaned)
        except:
            return 0.0

    def _parse_percentage(self, value):
        """Parse percentage string to float"""
        if pd.isna(value):
            return 0.0
        if isinstance(value, (int, float)):
            return float(value) * 100 if abs(value) < 1 else float(value)
        # Remove percentage symbol
        cleaned = str(value).replace('%', '').replace(',', '')
        try:
            return float(cleaned)
        except:
            return 0.0

    def get_declining_accounts(self, threshold: float = 0) -> pd.DataFrame:
        """
        Get accounts with declining sales

        Args:
            threshold: Minimum decline amount (negative number) to filter by

        Returns:
            DataFrame of declining accounts sorted by decline amount
        """
        declining = self.account_data[
            (pd.notna(self.account_data['Difference'])) &
            (self.account_data['Difference'] < threshold)
        ].copy()

        declining = declining.sort_values('Difference', ascending=True)

        return declining[['Acct #', 'Name', 'City', 'CY Total', 'PY Total', 'Difference']]

    def get_increasing_accounts(self, threshold: float = 0) -> pd.DataFrame:
        """
        Get accounts with increasing sales

        Args:
            threshold: Minimum increase amount to filter by

        Returns:
            DataFrame of increasing accounts sorted by increase amount
        """
        increasing = self.account_data[
            (pd.notna(self.account_data['Difference'])) &
            (self.account_data['Difference'] > threshold)
        ].copy()

        increasing = increasing.sort_values('Difference', ascending=False)

        return increasing[['Acct #', 'Name', 'City', 'CY Total', 'PY Total', 'Difference']]

    def get_frame_analysis(self) -> Dict:
        """
        Analyze frame buying patterns YOY

        Returns:
            Dictionary with frame categories: increasing, declining, and top movers
        """
        if not self.frame_data:
            return {}

        increasing_frames = []
        declining_frames = []

        for frame_name, data in self.frame_data.items():
            if data['change'] > 0:
                increasing_frames.append({
                    'name': frame_name,
                    'current_year': data['current_year'],
                    'previous_year': data['previous_year'],
                    'change': data['change'],
                    'pct_change': data['pct_change']
                })
            elif data['change'] < 0:
                declining_frames.append({
                    'name': frame_name,
                    'current_year': data['current_year'],
                    'previous_year': data['previous_year'],
                    'change': data['change'],
                    'pct_change': data['pct_change']
                })

        # Sort by absolute change
        increasing_frames.sort(key=lambda x: x['change'], reverse=True)
        declining_frames.sort(key=lambda x: x['change'])

        return {
            'increasing': increasing_frames,
            'declining': declining_frames,
            'top_growth': increasing_frames[:5] if increasing_frames else [],
            'top_decline': declining_frames[:5] if declining_frames else []
        }

    def get_account_frame_details(self, account_number: int = None) -> pd.DataFrame:
        """
        Get detailed frame purchases for specific account(s)

        Args:
            account_number: Optional account number to filter by

        Returns:
            DataFrame with account and their frame purchases
        """
        # Get frame columns (columns after 'Total B Units')
        frame_columns = [
            'MODERN ART', 'G.V.X.', 'MODZ TITANIUM', 'MODZFLEX', 'B.M.E.C.',
            'GB+ COLLECTION', 'GENEVIEVE BOUTIQUE', 'FASHIONTABULOUS', 'UROCK',
            'MODZ SUNZ', 'GENEVIEVE PARIS DESIGN', 'GIOVANI DI VENEZIA', 'MODZ',
            'MODZ KIDS', 'MODERN TIMES', 'MODERN METALS', 'MODERN PLASTICS II',
            'MODERN PLASTICS I', 'CASES - CLAMSHELL', 'CASES - SLIP IN',
            'BRANDED CASES', 'CLEANING CLOTHS', 'NOSE PADS', 'PARTS',
            'SUMMIT OPTICAL', 'TOOLS'
        ]

        # Filter columns that exist in the dataframe
        available_frame_cols = [col for col in frame_columns if col in self.account_data.columns]

        base_cols = ['Acct #', 'Name', 'City', 'CY Total', 'PY Total', 'Difference']
        select_cols = base_cols + available_frame_cols

        if account_number:
            result = self.account_data[self.account_data['Acct #'] == account_number][select_cols]
        else:
            result = self.account_data[select_cols]

        return result

    def get_frame_trends_by_account(self) -> List[Dict]:
        """
        Analyze which frames each declining account is buying less of

        Returns:
            List of dictionaries with account info and their declining frame categories
        """
        # This would require historical frame data per account
        # For now, we'll return accounts with their current frame mix
        declining_accounts = self.get_declining_accounts()

        results = []
        for _, account in declining_accounts.iterrows():
            acct_num = account['Acct #']
            acct_details = self.get_account_frame_details(acct_num)

            if not acct_details.empty:
                # Get non-zero frame purchases
                frame_cols = acct_details.columns[6:]  # Columns after basic info
                frame_purchases = {}

                for col in frame_cols:
                    val = acct_details.iloc[0][col]
                    if pd.notna(val) and val != 0:
                        frame_purchases[col] = val

                results.append({
                    'account_number': acct_num,
                    'account_name': account['Name'],
                    'city': account['City'],
                    'total_decline': account['Difference'],
                    'current_year_total': account['CY Total'],
                    'previous_year_total': account['PY Total'],
                    'frame_purchases': frame_purchases
                })

        return results

    def get_new_accounts(self) -> pd.DataFrame:
        """
        Get list of new accounts (PY Total = 0 and CY Total > 0)

        Returns:
            DataFrame of new accounts
        """
        new_accounts = self.account_data[
            (self.account_data['PY Total'] == 0) &
            (self.account_data['CY Total'] > 0)
        ].copy()

        new_accounts = new_accounts.sort_values('CY Total', ascending=False)

        return new_accounts[['Acct #', 'Name', 'City', 'CY Total', 'Project Code']]

    def get_reactivated_accounts(self) -> pd.DataFrame:
        """
        Get list of reactivated accounts (had sales before, gap, then sales again)
        These are accounts with previous sales but this would need historical data.
        For now, we identify them as accounts with positive difference and relatively small PY values.

        Returns:
            DataFrame of potentially reactivated accounts
        """
        # This is an approximation - true reactivated accounts need multi-year history
        # We'll identify accounts with small PY total but significant CY growth
        reactivated = self.account_data[
            (self.account_data['PY Total'] > 0) &
            (self.account_data['PY Total'] < 1000) &  # Small previous year
            (self.account_data['CY Total'] > self.account_data['PY Total'] * 2)  # Doubled
        ].copy()

        reactivated = reactivated.sort_values('CY Total', ascending=False)

        return reactivated[['Acct #', 'Name', 'City', 'CY Total', 'PY Total', 'Difference']]

    def get_brand_performance(self) -> Dict:
        """
        Analyze sales performance by individual brand/product line

        Returns:
            Dictionary with brand sales totals and rankings
        """
        brand_columns = [
            'MODERN ART', 'G.V.X.', 'MODZ TITANIUM', 'MODZFLEX', 'B.M.E.C.',
            'GB+ COLLECTION', 'GENEVIEVE BOUTIQUE', 'FASHIONTABULOUS', 'UROCK',
            'MODZ SUNZ', 'GENEVIEVE PARIS DESIGN', 'GIOVANI DI VENEZIA', 'MODZ',
            'MODZ KIDS', 'MODERN TIMES', 'MODERN METALS', 'MODERN PLASTICS II',
            'MODERN PLASTICS I', 'CASES - CLAMSHELL', 'CASES - SLIP IN',
            'BRANDED CASES', 'CLEANING CLOTHS', 'NOSE PADS', 'PARTS',
            'SUMMIT OPTICAL', 'TOOLS', 'SMART SHOPPER', 'CLOSE OUT',
            'PERSONAL PPE', 'MODERN SERVICES'
        ]

        brand_totals = []
        for brand in brand_columns:
            if brand in self.account_data.columns:
                total_units = self.account_data[brand].sum(skipna=True)
                if total_units > 0:
                    # Count how many accounts bought this brand
                    account_count = (self.account_data[brand] > 0).sum()

                    brand_totals.append({
                        'brand': brand,
                        'total_units': int(total_units) if pd.notna(total_units) else 0,
                        'account_count': int(account_count),
                        'avg_units_per_account': round(total_units / account_count, 2) if account_count > 0 else 0
                    })

        # Sort by total units
        brand_totals.sort(key=lambda x: x['total_units'], reverse=True)

        return {
            'brands': brand_totals,
            'top_brands': brand_totals[:10],
            'total_brands_sold': len(brand_totals)
        }

    def get_dashboard_summary(self) -> Dict:
        """
        Generate comprehensive dashboard summary with key insights

        Returns:
            Dictionary containing all key metrics and insights
        """
        declining_accounts = self.get_declining_accounts()
        increasing_accounts = self.get_increasing_accounts()
        frame_analysis = self.get_frame_analysis()
        new_accounts = self.get_new_accounts()
        reactivated_accounts = self.get_reactivated_accounts()
        brand_performance = self.get_brand_performance()

        # Calculate additional metrics
        total_decline_amount = declining_accounts['Difference'].sum() if not declining_accounts.empty else 0
        total_increase_amount = increasing_accounts['Difference'].sum() if not increasing_accounts.empty else 0

        # All declining and increasing accounts (not limited to 10)
        top_declining = declining_accounts.to_dict('records') if not declining_accounts.empty else []
        top_increasing = increasing_accounts.to_dict('records') if not increasing_accounts.empty else []

        # New and reactivated account details
        new_accounts_list = new_accounts.to_dict('records') if not new_accounts.empty else []
        reactivated_accounts_list = reactivated_accounts.to_dict('records') if not reactivated_accounts.empty else []

        # Account retention metrics
        retention_rate = ((self.summary_data.get('total_accounts', 0) -
                          self.summary_data.get('new_accounts', 0) -
                          self.summary_data.get('reactivated_accounts', 0)) /
                         self.summary_data.get('total_accounts_py', 1)) * 100 if self.summary_data.get('total_accounts_py', 0) > 0 else 0

        return {
            'summary': {
                **self.summary_data,
                'total_decline_amount': total_decline_amount,
                'total_increase_amount': total_increase_amount,
                'net_change': total_increase_amount + total_decline_amount,
                'retention_rate': retention_rate
            },
            'accounts': {
                'declining_count': len(declining_accounts),
                'increasing_count': len(increasing_accounts),
                'top_declining': top_declining,
                'top_increasing': top_increasing,
                'new_accounts': new_accounts_list,
                'reactivated_accounts': reactivated_accounts_list
            },
            'frames': frame_analysis,
            'brands': brand_performance,
            'insights': self._generate_insights(
                declining_accounts,
                increasing_accounts,
                frame_analysis
            )
        }

    def _generate_insights(self, declining_accounts, increasing_accounts, frame_analysis) -> List[str]:
        """Generate actionable insights for the sales rep"""
        insights = []

        # Account insights
        if not declining_accounts.empty:
            worst_decline = declining_accounts.iloc[0]
            insights.append(
                f"🔴 URGENT: {worst_decline['Name']} declined by ${abs(worst_decline['Difference']):,.2f} "
                f"({worst_decline['PY Total']:,.2f} → ${worst_decline['CY Total']:,.2f})"
            )

        if not increasing_accounts.empty:
            best_growth = increasing_accounts.iloc[0]
            insights.append(
                f"🟢 TOP PERFORMER: {best_growth['Name']} increased by ${best_growth['Difference']:,.2f} "
                f"(${best_growth['PY Total']:,.2f} → ${best_growth['CY Total']:,.2f})"
            )

        # Frame insights
        if frame_analysis.get('top_decline'):
            top_declining_frame = frame_analysis['top_decline'][0]
            insights.append(
                f"📉 Frame Alert: {top_declining_frame['name']} sales down {abs(top_declining_frame['change'])} units "
                f"({top_declining_frame['pct_change']:.1f}% decline)"
            )

        if frame_analysis.get('top_growth'):
            top_growing_frame = frame_analysis['top_growth'][0]
            insights.append(
                f"📈 Frame Opportunity: {top_growing_frame['name']} sales up {top_growing_frame['change']} units "
                f"({top_growing_frame['pct_change']:.1f}% growth)"
            )

        # Summary insights
        total_accounts = self.summary_data.get('total_accounts', 0)
        declining_count = len(declining_accounts)
        declining_pct = (declining_count / total_accounts * 100) if total_accounts > 0 else 0

        insights.append(
            f"⚠️  {declining_count} of {total_accounts} accounts ({declining_pct:.1f}%) are declining"
        )

        new_accounts = self.summary_data.get('new_accounts', 0)
        if new_accounts > 0:
            insights.append(
                f"✨ {new_accounts} new accounts added, generating ${self.summary_data.get('new_accounts_sales', 0):,.2f}"
            )

        return insights

    def export_to_json(self, output_path: str = None):
        """Export dashboard data to JSON file"""
        dashboard_data = self.get_dashboard_summary()

        if output_path is None:
            output_path = 'sales_dashboard_data.json'

        # Custom JSON encoder to handle NaN and special types
        def json_serializer(obj):
            if pd.isna(obj):
                return None
            if isinstance(obj, (pd.Timestamp, datetime)):
                return obj.isoformat()
            return str(obj)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(dashboard_data, f, indent=2, default=json_serializer, ensure_ascii=False)

        print(f"[OK] Dashboard data exported to {output_path}")
        return output_path

    def print_summary_report(self):
        """Print a formatted summary report to console"""
        dashboard = self.get_dashboard_summary()

        print("\n" + "="*80)
        print("SALES DASHBOARD SUMMARY".center(80))
        print("="*80)

        summary = dashboard['summary']
        print(f"\n[OVERALL PERFORMANCE]")
        print(f"   Total Sales:        ${summary['total_sales_cy']:>12,.2f} (CY) vs ${summary['total_sales_py']:,.2f} (PY)")
        print(f"   Change:             ${summary['total_sales_change']:>12,.2f} ({summary['total_sales_pct_change']:>6.2f}%)")
        print(f"   Account Average:    ${summary['account_average']:>12,.2f}")
        print(f"   Total Accounts:     {summary['total_accounts']:>12} (vs {summary['total_accounts_py']} PY)")

        print(f"\n[ACCOUNT CHANGES]")
        print(f"   New Accounts:       {summary['new_accounts']:>12} (${summary['new_accounts_sales']:,.2f})")
        print(f"   Reactivated:        {summary['reactivated_accounts']:>12} (${summary['reactivated_accounts_sales']:,.2f})")
        print(f"   Lost Accounts:      {summary['lost_accounts']:>12} (${summary['lost_accounts_sales']:,.2f})")
        print(f"   Increasing:         {summary['increasing_accounts']:>12} (+${summary['increasing_accounts_sales']:,.2f})")
        print(f"   Declining:          {summary['declining_accounts']:>12} (${summary['declining_accounts_sales']:,.2f})")

        print(f"\n[TOP GROWING ACCOUNTS]")
        for i, acct in enumerate(dashboard['accounts']['top_increasing'][:5], 1):
            print(f"   {i}. {acct['Name']:<40} +${acct['Difference']:>10,.2f}")

        print(f"\n[TOP DECLINING ACCOUNTS]")
        for i, acct in enumerate(dashboard['accounts']['top_declining'][:5], 1):
            print(f"   {i}. {acct['Name']:<40} ${acct['Difference']:>10,.2f}")

        print(f"\n[FRAME PERFORMANCE - TOP GROWTH]")
        for i, frame in enumerate(dashboard['frames']['top_growth'][:5], 1):
            print(f"   {i}. {frame['name']:<30} +{frame['change']:>6} units ({frame['pct_change']:>6.1f}%)")

        print(f"\n[FRAME PERFORMANCE - TOP DECLINE]")
        for i, frame in enumerate(dashboard['frames']['top_decline'][:5], 1):
            print(f"   {i}. {frame['name']:<30} {frame['change']:>6} units ({frame['pct_change']:>6.1f}%)")

        print(f"\n[KEY INSIGHTS]")
        for insight in dashboard['insights']:
            # Remove emojis from insights for Windows console
            clean_insight = insight.encode('ascii', 'ignore').decode('ascii').strip()
            print(f"   - {clean_insight}")

        print("\n" + "="*80 + "\n")


def main():
    """Main function to demonstrate parser usage"""
    # Initialize parser
    parser = SalesDashboardParser('Payton YOY 8-18-24 to 8-19-25.xlsx')

    # Load data
    print("Loading sales data...")
    parser.load_data()

    # Print comprehensive report
    parser.print_summary_report()

    # Export to JSON
    parser.export_to_json('sales_dashboard_data.json')

    # Additional detailed exports
    print("Exporting detailed reports...")

    # Export declining accounts
    declining = parser.get_declining_accounts()
    declining.to_csv('declining_accounts.csv', index=False)
    print(f"[OK] Exported {len(declining)} declining accounts to declining_accounts.csv")

    # Export increasing accounts
    increasing = parser.get_increasing_accounts()
    increasing.to_csv('increasing_accounts.csv', index=False)
    print(f"[OK] Exported {len(increasing)} increasing accounts to increasing_accounts.csv")

    # Export frame trends by declining accounts
    frame_trends = parser.get_frame_trends_by_account()
    with open('declining_accounts_frame_details.json', 'w') as f:
        json.dump(frame_trends, f, indent=2, default=str)
    print(f"[OK] Exported frame purchase details for declining accounts")

    # Export new accounts
    new_accounts = parser.get_new_accounts()
    new_accounts.to_csv('new_accounts.csv', index=False)
    print(f"[OK] Exported {len(new_accounts)} new accounts to new_accounts.csv")

    # Export reactivated accounts
    reactivated = parser.get_reactivated_accounts()
    reactivated.to_csv('reactivated_accounts.csv', index=False)
    print(f"[OK] Exported {len(reactivated)} reactivated accounts to reactivated_accounts.csv")

    # Export brand performance
    brand_perf = parser.get_brand_performance()
    with open('brand_performance.json', 'w') as f:
        json.dump(brand_perf, f, indent=2, default=str)
    print(f"[OK] Exported brand performance data to brand_performance.json")

    print("\n[SUCCESS] All reports generated successfully!")


if __name__ == "__main__":
    main()
