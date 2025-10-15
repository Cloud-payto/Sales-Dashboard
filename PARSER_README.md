# Sales Dashboard Parser

A comprehensive Python-based sales data parser that extracts actionable insights from YOY (Year-Over-Year) sales Excel reports for sales representatives.

## Features

The parser extracts and analyzes ALL data from your Excel sales report:

- **Complete Sales Metrics**: Total sales (current & previous year), direct/indirect sales, YOY changes
- **Account Performance**: Identifies growing, declining, new, and reactivated accounts
- **Frame Color Groups**: Tracks 12 major color categories (BLACK DIAMOND, YELLOW, RED, BLUE, GREEN, LIME, etc.) with YOY comparison
- **Individual Brands**: Analyzes 25+ individual brand/product lines with unit sales and account penetration
- **Detailed Account Data**: Full breakdown of what each account is buying by brand
- **Key Metrics**: Total sales, account averages, retention rates, and more
- **Actionable Insights**: Highlights urgent accounts and opportunities

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Required Packages
```bash
pip install pandas openpyxl numpy
```

## Usage

### Basic Usage

Run the parser on your Excel file:

```bash
python sales_parser.py
```

This will:
1. Parse the Excel file
2. Display a comprehensive summary report in the console
3. Generate multiple output files with detailed analysis

### Output Files

The parser generates the following files with comprehensive data:

1. **sales_dashboard_data.json** - Complete dashboard data (main file for frontend integration)
   - Summary metrics (all YOY data from top rows)
   - Top growing/declining accounts (with details)
   - New accounts list (16 accounts with $0 previous year sales)
   - Reactivated accounts list (15 accounts coming back to life)
   - Frame color group performance (12 categories with YOY comparison)
   - Brand performance (25+ brands with unit sales and account penetration)
   - Key insights and alerts

2. **declining_accounts.csv** - All declining accounts (72 accounts)
   - Account #, Name, City
   - Current year vs previous year sales
   - Dollar amount of decline

3. **increasing_accounts.csv** - All growing accounts (76 accounts)
   - Account #, Name, City
   - Current year vs previous year sales
   - Dollar amount of growth

4. **new_accounts.csv** - New accounts added this year (16 accounts)
   - Account #, Name, City
   - Current year sales
   - Project code

5. **reactivated_accounts.csv** - Reactivated accounts (15 accounts)
   - Account #, Name, City
   - Previous year (low) vs current year (growing)
   - Difference

6. **brand_performance.json** - Individual brand analysis (25 brands)
   - Total units sold per brand
   - Number of accounts buying each brand
   - Average units per account
   - Top 10 brands by volume

7. **declining_accounts_frame_details.json** - Frame purchase details for declining accounts
   - Shows which specific brands/frames each declining account is purchasing
   - Useful for understanding product mix changes and targeting recovery strategies

## Using the Parser Programmatically

You can also use the parser as a Python library in your own scripts:

```python
from sales_parser import SalesDashboardParser

# Initialize parser
parser = SalesDashboardParser('Payton YOY 8-18-24 to 8-19-25.xlsx')

# Load data
parser.load_data()

# Get declining accounts (decline > $1000)
declining = parser.get_declining_accounts(threshold=-1000)
print(declining)

# Get frame analysis
frame_analysis = parser.get_frame_analysis()
print("Top declining frames:", frame_analysis['top_decline'])

# Get complete dashboard summary
dashboard = parser.get_dashboard_summary()
print(dashboard['insights'])

# Export to custom location
parser.export_to_json('custom_output.json')
```

## Key Insights Provided

The parser automatically identifies and reports:

1. **Urgent Accounts** - Accounts with the largest declines
2. **Top Performers** - Accounts with the largest growth
3. **Frame Alerts** - Frame categories with significant declines
4. **Frame Opportunities** - Frame categories with strong growth
5. **Portfolio Health** - Percentage of accounts declining vs growing
6. **New Business** - Revenue from new and reactivated accounts

## Example Output

```
================================================================================
                            SALES DASHBOARD SUMMARY
================================================================================

[OVERALL PERFORMANCE]
   Total Sales:        $  430,600.20 (CY) vs $406,627.91 (PY)
   Change:             $   23,972.29 (  5.90%)
   Account Average:    $    3,189.63
   Total Accounts:              135 (vs 131 PY)

[ACCOUNT CHANGES]
   New Accounts:                  9 ($8,294.55)
   Reactivated:                   7 ($7,054.33)
   Lost Accounts:                12 ($11,326.46)
   Increasing:                   44 (+$75,771.55)
   Declining:                    50 ($-56,043.33)

[TOP DECLINING ACCOUNTS]
   1. SUNDANCE OPTICAL                         $ -6,554.74
   2. NEVADA EYE PHYSICIANS                    $ -4,994.98
   3. LAVEEN TOTAL EYECARE, LLC                $ -4,337.59

[FRAME PERFORMANCE - TOP DECLINE]
   1. SLIP-IN CASES                   -1960 units ( -29.2%)
   2. NOSE PADS                       -1842 units ( -29.1%)
   3. YELLOW                           -142 units (  -4.4%)
```

## Advanced Usage

### Filter by Decline Amount

```python
# Get only accounts declining by more than $3,000
major_declines = parser.get_declining_accounts(threshold=-3000)
```

### Get Frame Details for Specific Account

```python
# Get frame purchase breakdown for account 94824
account_frames = parser.get_account_frame_details(account_number=94824)
```

### Analyze Frame Trends for Declining Accounts

```python
# Get detailed frame purchasing patterns for all declining accounts
frame_trends = parser.get_frame_trends_by_account()

# This shows what each declining account is currently buying
# Useful for understanding if they're shifting to different products
```

## Data Structure

The parser expects an Excel file with the following structure:

- **Summary Section** (rows 0-23): Overall sales metrics and frame totals
- **Account Details** (row 24+): Individual account data with columns:
  - Acct #
  - Rep
  - Name
  - City
  - Project Code
  - MO Price Groups
  - CY Total (Current Year)
  - PY Total (Previous Year)
  - Difference
  - Individual frame category quantities

## Customization

You can modify the parser to:

1. **Add new metrics**: Edit `_generate_insights()` method
2. **Change output format**: Modify `print_summary_report()` method
3. **Add filters**: Create new methods using pandas filtering
4. **Customize exports**: Modify `export_to_json()` or add new export methods

## Troubleshooting

### Unicode Errors on Windows
If you see encoding errors, the parser automatically handles this by removing special characters for console output.

### Missing Data
The parser gracefully handles missing data by:
- Using 0 as default for numeric fields
- Skipping empty rows
- Providing warnings for parsing errors

### Excel File Format
Ensure your Excel file follows the expected format with:
- Summary data in the first 24 rows
- Account headers starting at row 24
- Consistent column structure

## Use Cases for Sales Reps

1. **Weekly Account Reviews**: Quickly identify which accounts need attention
2. **Territory Planning**: Understand which products are gaining/losing traction
3. **Customer Meetings**: Bring data on account trends and product opportunities
4. **Sales Forecasting**: Analyze trends to predict future performance
5. **Product Focus**: Identify which frame lines to promote or phase out

## Complete Data Available for Frontend Display

The `sales_dashboard_data.json` file contains ALL data extracted from your Excel file, structured for easy frontend integration. Here's everything available:

### Summary Metrics (`dashboard.summary`)
```javascript
{
  // Overall Performance
  total_sales_cy: 430600.20,                    // Current year total sales
  total_sales_py: 406627.91,                    // Previous year total sales
  total_sales_change: 23972.29,                 // Dollar change
  total_sales_pct_change: 5.9,                  // Percentage change

  // Sales Breakdown
  direct_sales_cy: 394804.89,                   // Direct sales current year
  direct_sales_py: 367400.92,                   // Direct sales previous year
  indirect_sales_cy: 35795.31,                  // Indirect sales current year
  indirect_sales_py: 39226.99,                  // Indirect sales previous year

  // Account Metrics
  total_accounts: 135,                          // Current total accounts
  total_accounts_py: 131,                       // Previous year accounts
  account_average: 3189.63,                     // Average sales per account
  retention_rate: 90.84,                        // Account retention percentage

  // Account Changes
  new_accounts: 9,                              // Count of new accounts
  new_accounts_sales: 8294.55,                  // Revenue from new accounts
  reactivated_accounts: 7,                      // Count of reactivated
  reactivated_accounts_sales: 7054.33,          // Revenue from reactivated
  lost_accounts: 12,                            // Count of lost accounts
  lost_accounts_sales: 11326.46,                // Revenue lost

  // Performance Breakdown
  increasing_accounts: 44,                      // Growing accounts count
  increasing_accounts_sales: 75771.55,          // Total growth amount
  declining_accounts: 50,                       // Declining accounts count
  declining_accounts_sales: -56043.33,          // Total decline amount

  // Calculated Metrics
  total_decline_amount: -68084.68,              // Sum of all declines
  total_increase_amount: 92056.97,              // Sum of all increases
  net_change: 23972.29                          // Net overall change
}
```

### Account Lists (`dashboard.accounts`)

**Top Declining Accounts** (10 accounts with largest declines)
```javascript
top_declining: [
  {
    "Acct #": 94824,
    "Name": "SUNDANCE OPTICAL",
    "City": "FLAGSTAFF",
    "CY Total": 18198.67,
    "PY Total": 24753.41,
    "Difference": -6554.74
  },
  // ... 9 more accounts
]
```

**Top Growing Accounts** (10 accounts with largest growth)
```javascript
top_increasing: [
  {
    "Acct #": 72443,
    "Name": "CORONA OPTIQUE",
    "City": "YUMA",
    "CY Total": 32353.79,
    "PY Total": 17442.30,
    "Difference": 14911.49
  },
  // ... 9 more accounts
]
```

**New Accounts** (16 accounts - first time buyers)
```javascript
new_accounts: [
  {
    "Acct #": 95633,
    "Name": "MOHAVE EYE CENTER",
    "City": "BULLHEAD CITY",
    "CY Total": 4486.12,
    "Project Code": "TIER 1"
  },
  // ... 15 more accounts
]
```

**Reactivated Accounts** (15 accounts coming back)
```javascript
reactivated_accounts: [
  {
    "Acct #": 87727,
    "Name": "HORIZON OPTICAL",
    "City": "PHOENIX",
    "CY Total": 1332.33,
    "PY Total": 54.95,
    "Difference": 1277.38
  },
  // ... 14 more accounts
]
```

### Frame Color Groups (`dashboard.frames`)

**YOY Performance by Color Category** (12 major frame categories)
```javascript
{
  increasing: [
    {
      name: "LIME",
      current_year: 11404,        // Units sold this year
      previous_year: 9632,        // Units sold last year
      change: 1772,               // Unit change
      pct_change: 18.4            // Percentage change
    },
    // ... more growing categories
  ],

  declining: [
    {
      name: "SLIP-IN CASES",
      current_year: 4740,
      previous_year: 6700,
      change: -1960,
      pct_change: -29.2
    },
    // ... more declining categories
  ],

  top_growth: [/* Top 5 growing frame categories */],
  top_decline: [/* Top 5 declining frame categories */]
}
```

**All Frame Categories Tracked:**
- BLACK DIAMOND
- YELLOW
- RED
- BLUE
- GREEN
- LIME
- CLAMSHELL CASES
- SLIP-IN CASES
- NOSE PADS
- PARTS
- SUMMIT OPTICAL
- TOOLS

### Individual Brand Performance (`dashboard.brands`)

**Detailed Brand Analysis** (25+ individual brands/SKUs)
```javascript
{
  brands: [
    {
      brand: "MODERN PLASTICS II",
      total_units: 21175,              // Total units sold across all accounts
      account_count: 108,              // Number of accounts buying this brand
      avg_units_per_account: 196.06   // Average units per account
    },
    // ... all 25 brands
  ],

  top_brands: [/* Top 10 brands by volume */],
  total_brands_sold: 25
}
```

**All Brands Tracked:**
- MODERN PLASTICS II (21,175 units)
- MODERN PLASTICS I (11,404 units)
- CASES - CLAMSHELL (10,434 units)
- MODERN METALS (8,201 units)
- CLEANING CLOTHS (5,600 units)
- CASES - SLIP IN (4,740 units)
- NOSE PADS (4,483 units)
- MODERN TIMES (3,479 units)
- BRANDED CASES (2,401 units)
- B.M.E.C. (1,405 units)
- GB+ COLLECTION (1,087 units)
- MODZ SUNZ (1,029 units)
- MODZ KIDS (666 units)
- GENEVIEVE PARIS DESIGN (506 units)
- GENEVIEVE BOUTIQUE (459 units)
- MODZ (326 units)
- PARTS (300 units)
- GIOVANI DI VENEZIA (293 units)
- MODERN ART (125 units)
- UROCK (99 units)
- MODZ TITANIUM (86 units)
- G.V.X. (64 units)
- MODZFLEX (36 units)
- FASHIONTABULOUS (36 units)
- TOOLS (2 units)

### Key Insights (`dashboard.insights`)

Array of actionable insight strings:
```javascript
[
  "URGENT: SUNDANCE OPTICAL declined by $6,554.74",
  "TOP PERFORMER: CORONA OPTIQUE increased by $14,911.49",
  "Frame Alert: SLIP-IN CASES sales down 1960 units (-29.2% decline)",
  "Frame Opportunity: LIME sales up 1772 units (18.4% growth)",
  "72 of 135 accounts (53.3%) are declining",
  "9 new accounts added, generating $8,294.55"
]
```

## Frontend Display Suggestions

### Dashboard Overview Widgets
- **Total Sales Card**: Show CY, PY, change $, change %
- **Account Health**: Growing vs declining accounts (visual gauge)
- **New Business**: New + reactivated accounts with revenue
- **Average Deal Size**: Account average metric

### Charts & Visualizations
1. **Sales Trend Chart**: CY vs PY comparison
2. **Account Performance Pie**: Growing/Declining/New/Lost breakdown
3. **Frame Category Bar Chart**: Top 5 growing vs top 5 declining
4. **Brand Performance Chart**: Top 10 brands by units
5. **Geographic Map**: Sales by city (using account city data)

### Data Tables
1. **Accounts Needing Attention**: Declining accounts table (sortable)
2. **Growth Leaders**: Top performing accounts
3. **New Opportunities**: New and reactivated accounts
4. **Product Performance**: Brand analysis table

### Alert/Notification System
- Use `insights` array to display alerts
- Color-code by severity (red for urgent declines, green for opportunities)
- Make accounts clickable to view detailed frame purchases

## Integration with React Dashboard

The JSON output (`sales_dashboard_data.json`) is designed to be consumed by the React-based sales dashboard in this project. Simply:

1. Run the parser to generate the JSON file
2. Import it into your React components
3. Display the metrics, charts, and insights in your UI

Example React usage:
```javascript
import dashboardData from './sales_dashboard_data.json';

function Dashboard() {
  const { summary, accounts, frames, brands, insights } = dashboardData;

  return (
    <div>
      <MetricCard
        title="Total Sales"
        current={summary.total_sales_cy}
        previous={summary.total_sales_py}
        change={summary.total_sales_pct_change}
      />

      <AccountsList accounts={accounts.top_declining} type="declining" />

      <FrameChart data={frames.top_growth} />

      <BrandTable brands={brands.top_brands} />

      <InsightsFeed insights={insights} />
    </div>
  );
}
```

## License

This tool is provided as-is for internal sales analysis use.

## Support

For issues or questions, contact your development team.
