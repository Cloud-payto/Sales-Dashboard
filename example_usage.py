"""
Example usage scripts for the Sales Dashboard Parser

This file demonstrates various ways to use the parser for specific analysis tasks
"""

from sales_parser import SalesDashboardParser


def example_1_quick_summary():
    """Quick summary report - most common use case"""
    print("\n=== EXAMPLE 1: Quick Summary Report ===\n")

    parser = SalesDashboardParser('Payton YOY 8-18-24 to 8-19-25.xlsx')
    parser.load_data()
    parser.print_summary_report()


def example_2_top_declining_accounts():
    """Focus on top declining accounts that need attention"""
    print("\n=== EXAMPLE 2: Top 10 Declining Accounts ===\n")

    parser = SalesDashboardParser('Payton YOY 8-18-24 to 8-19-25.xlsx')
    parser.load_data()

    # Get top 10 declining accounts
    declining = parser.get_declining_accounts().head(10)

    print("URGENT: Top 10 Accounts Needing Attention\n")
    for idx, account in declining.iterrows():
        print(f"{account['Name']:<40} (#{account['Acct #']})")
        print(f"   Location: {account['City']}")
        print(f"   Decline:  ${abs(account['Difference']):,.2f}")
        print(f"   Previous: ${account['PY Total']:,.2f}  Current: ${account['CY Total']:,.2f}")
        print()


def example_3_major_declines():
    """Find accounts with significant declines (> $2000)"""
    print("\n=== EXAMPLE 3: Major Declines (>$2000) ===\n")

    parser = SalesDashboardParser('Payton YOY 8-18-24 to 8-19-25.xlsx')
    parser.load_data()

    # Get accounts declining by more than $2000
    major_declines = parser.get_declining_accounts(threshold=-2000)

    print(f"Found {len(major_declines)} accounts declining by more than $2,000\n")
    print(f"Total revenue at risk: ${abs(major_declines['Difference'].sum()):,.2f}\n")

    for idx, account in major_declines.iterrows():
        pct_decline = (account['Difference'] / account['PY Total'] * 100) if account['PY Total'] != 0 else 0
        print(f"- {account['Name']}: ${abs(account['Difference']):,.2f} ({pct_decline:.1f}% decline)")


def example_4_growth_opportunities():
    """Identify top growing accounts to understand what's working"""
    print("\n=== EXAMPLE 4: Growth Success Stories ===\n")

    parser = SalesDashboardParser('Payton YOY 8-18-24 to 8-19-25.xlsx')
    parser.load_data()

    # Get top 5 growing accounts
    growing = parser.get_increasing_accounts().head(5)

    print("Learn from these successful accounts:\n")
    for idx, account in growing.iterrows():
        pct_growth = (account['Difference'] / account['PY Total'] * 100) if account['PY Total'] != 0 else 0
        print(f"{account['Name']}")
        print(f"   Growth:   +${account['Difference']:,.2f} ({pct_growth:.1f}% increase)")
        print(f"   Previous: ${account['PY Total']:,.2f}")
        print(f"   Current:  ${account['CY Total']:,.2f}")
        print()


def example_5_frame_analysis():
    """Analyze which frames are performing well or poorly"""
    print("\n=== EXAMPLE 5: Frame Category Performance ===\n")

    parser = SalesDashboardParser('Payton YOY 8-18-24 to 8-19-25.xlsx')
    parser.load_data()

    frame_analysis = parser.get_frame_analysis()

    print("DECLINING FRAME CATEGORIES (Focus for improvement):\n")
    for frame in frame_analysis['declining']:
        print(f"  {frame['name']:<30} {frame['change']:>6} units ({frame['pct_change']:>6.1f}%)")
        print(f"     {frame['previous_year']} → {frame['current_year']} units")

    print("\n\nGROWING FRAME CATEGORIES (Success stories):\n")
    for frame in frame_analysis['increasing']:
        print(f"  {frame['name']:<30} +{frame['change']:>6} units (+{frame['pct_change']:>6.1f}%)")
        print(f"     {frame['previous_year']} → {frame['current_year']} units")


def example_6_account_frame_details():
    """Get detailed frame purchases for specific accounts"""
    print("\n=== EXAMPLE 6: Frame Details for Specific Accounts ===\n")

    parser = SalesDashboardParser('Payton YOY 8-18-24 to 8-19-25.xlsx')
    parser.load_data()

    # Get top declining account
    declining = parser.get_declining_accounts()
    if not declining.empty:
        top_declining_acct = declining.iloc[0]['Acct #']

        print(f"Analyzing account #{top_declining_acct}: {declining.iloc[0]['Name']}\n")

        # Get frame details
        frame_details = parser.get_account_frame_details(account_number=top_declining_acct)

        if not frame_details.empty:
            print(f"Current Year Total: ${frame_details.iloc[0]['CY Total']:,.2f}")
            print(f"Previous Year Total: ${frame_details.iloc[0]['PY Total']:,.2f}")
            print(f"Change: ${frame_details.iloc[0]['Difference']:,.2f}\n")

            # Show frame purchases
            print("Frame purchases this year:")
            frame_cols = frame_details.columns[6:]  # Frame columns start after basic info
            for col in frame_cols:
                val = frame_details.iloc[0][col]
                if val and val != 0:
                    print(f"  - {col}: {val}")


def example_7_export_for_dashboard():
    """Export data for use in web dashboard or other tools"""
    print("\n=== EXAMPLE 7: Export Data for Integration ===\n")

    parser = SalesDashboardParser('Payton YOY 8-18-24 to 8-19-25.xlsx')
    parser.load_data()

    # Export to JSON for web dashboard
    parser.export_to_json('sales_dashboard_data.json')

    # Export CSVs for Excel/reporting
    declining = parser.get_declining_accounts()
    declining.to_csv('declining_accounts.csv', index=False)

    increasing = parser.get_increasing_accounts()
    increasing.to_csv('increasing_accounts.csv', index=False)

    print("[OK] Exported data files:")
    print("  - sales_dashboard_data.json (for web dashboard)")
    print("  - declining_accounts.csv")
    print("  - increasing_accounts.csv")


def example_8_custom_analysis():
    """Custom analysis: Accounts in specific city"""
    print("\n=== EXAMPLE 8: Custom Analysis - Accounts by City ===\n")

    parser = SalesDashboardParser('Payton YOY 8-18-24 to 8-19-25.xlsx')
    parser.load_data()

    # Example: Find all Las Vegas accounts
    city = "LAS VEGAS"
    vegas_accounts = parser.account_data[
        parser.account_data['City'].str.contains(city, case=False, na=False)
    ][['Acct #', 'Name', 'City', 'CY Total', 'PY Total', 'Difference']]

    print(f"Accounts in {city}:\n")
    print(f"Total accounts: {len(vegas_accounts)}")
    print(f"Total sales: ${vegas_accounts['CY Total'].sum():,.2f}")
    print(f"YOY Change: ${vegas_accounts['Difference'].sum():,.2f}\n")

    declining_count = len(vegas_accounts[vegas_accounts['Difference'] < 0])
    print(f"Declining: {declining_count}")
    print(f"Growing: {len(vegas_accounts[vegas_accounts['Difference'] > 0])}")


def example_9_weekly_action_items():
    """Generate a weekly action item list for sales rep"""
    print("\n=== EXAMPLE 9: Weekly Action Items ===\n")

    parser = SalesDashboardParser('Payton YOY 8-18-24 to 8-19-25.xlsx')
    parser.load_data()

    print("SALES REP ACTION ITEMS - This Week\n")
    print("="*60)

    # Priority 1: Major declines
    major_declines = parser.get_declining_accounts(threshold=-3000)
    if not major_declines.empty:
        print("\n[PRIORITY 1] URGENT - Major Declines (>$3000):")
        for idx, account in major_declines.head(3).iterrows():
            print(f"  [ ] Call {account['Name']} (#{account['Acct #']})")
            print(f"      - Declined ${abs(account['Difference']):,.2f}")
            print(f"      - Understand reason and develop recovery plan")

    # Priority 2: Any declines
    declining = parser.get_declining_accounts()
    moderate_declines = declining[
        (declining['Difference'] >= -3000) & (declining['Difference'] < 0)
    ]
    if not moderate_declines.empty:
        print(f"\n[PRIORITY 2] Monitor - Moderate Declines:")
        print(f"  [ ] Review {len(moderate_declines.head(5))} accounts with declining sales")
        for idx, account in moderate_declines.head(5).iterrows():
            print(f"      - {account['Name']}: ${abs(account['Difference']):,.2f}")

    # Priority 3: Top performers
    growing = parser.get_increasing_accounts().head(3)
    if not growing.empty:
        print("\n[PRIORITY 3] Success Stories - Learn & Replicate:")
        for idx, account in growing.iterrows():
            print(f"  [ ] Document success with {account['Name']}")
            print(f"      - Grew by +${account['Difference']:,.2f}")
            print(f"      - What strategies worked?")

    # Priority 4: Frame focus
    frame_analysis = parser.get_frame_analysis()
    if frame_analysis.get('top_decline'):
        print("\n[PRIORITY 4] Product Focus:")
        top_declining_frame = frame_analysis['top_decline'][0]
        print(f"  [ ] Address {top_declining_frame['name']} decline")
        print(f"      - Down {abs(top_declining_frame['change'])} units ({top_declining_frame['pct_change']:.1f}%)")
        print(f"      - Identify why accounts are buying less")

    print("\n" + "="*60)


# Main menu
def main():
    """Run example demonstrations"""
    print("\n" + "="*70)
    print("SALES DASHBOARD PARSER - EXAMPLE USAGE".center(70))
    print("="*70)

    examples = {
        '1': ('Quick Summary Report', example_1_quick_summary),
        '2': ('Top 10 Declining Accounts', example_2_top_declining_accounts),
        '3': ('Major Declines (>$2000)', example_3_major_declines),
        '4': ('Growth Success Stories', example_4_growth_opportunities),
        '5': ('Frame Category Performance', example_5_frame_analysis),
        '6': ('Frame Details for Specific Account', example_6_account_frame_details),
        '7': ('Export Data for Integration', example_7_export_for_dashboard),
        '8': ('Custom Analysis by City', example_8_custom_analysis),
        '9': ('Weekly Action Items', example_9_weekly_action_items),
        'a': ('Run ALL Examples', None),
    }

    print("\nAvailable Examples:")
    for key, (description, _) in examples.items():
        print(f"  {key}. {description}")

    choice = input("\nSelect example to run (1-9, a for all, q to quit): ").lower()

    if choice == 'q':
        return
    elif choice == 'a':
        for key in ['1', '2', '3', '4', '5', '6', '7', '8', '9']:
            examples[key][1]()
            input("\nPress Enter to continue to next example...")
    elif choice in examples and examples[choice][1]:
        examples[choice][1]()
    else:
        print("Invalid choice")


if __name__ == "__main__":
    main()
