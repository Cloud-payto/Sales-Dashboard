# Excel Sales Report Data Structure

This document explains the structure and organization of the Year-over-Year (YOY) sales Excel report files used by this dashboard.

## File Overview

The Excel file contains comprehensive sales data comparing current year (CY) vs previous year (PY) performance across accounts, brands, and frame categories.

## File Structure

### Section 1: Summary Metrics (Rows 0-23)

The top portion of the Excel file contains high-level summary statistics:

#### Rows 0-7: Overall Sales Performance
- **Row 2**: Total Sales (CY, PY, Change, % Change)
- **Row 3**: Direct Sales (CY, PY)
- **Row 4**: Indirect Sales (CY, PY)
- **Row 5**: Total Accounts Count (CY, PY)
- **Row 6**: Account Average

#### Rows 8-22: Account Categories
- **Row 9**: New Accounts (Count, Sales)
- **Row 12**: Reactivated Accounts (Count, Sales)
- **Row 15**: Lost Accounts (Count, Sales)
- **Row 18**: Increasing Accounts (Count, Sales)
- **Row 21**: Declining Accounts (Count, Sales)

#### Rows 2-13 (Columns 10-13): Frame Color Group Performance
Sales performance by color-coded frame categories:
- **Row 2**: BLACK DIAMOND (CY Units, PY Units, Change, % Change)
- **Row 3**: YELLOW
- **Row 4**: RED
- **Row 5**: BLUE
- **Row 6**: GREEN
- **Row 7**: LIME
- **Row 8**: CLAMSHELL CASES
- **Row 9**: SLIP-IN CASES
- **Row 10**: NOSE PADS
- **Row 11**: PARTS
- **Row 12**: SUMMIT OPTICAL
- **Row 13**: TOOLS

### Section 2: Account Details (Row 24+)

Starting at row 24, the file contains detailed account-level data with the following columns:

#### Basic Account Information
- **Acct #**: Account number (unique identifier)
- **Rep**: Sales representative name
- **Name**: Account/business name
- **City**: Location
- **Project Code**: Account tier/classification (e.g., "TIER 1", "TIER 2")
- **MO Price Groups**: Price group classification

#### Sales Totals
- **CY Total**: Current year total sales ($)
- **PY Total**: Previous year total sales ($)
- **Difference**: Dollar change (CY - PY)

#### Individual Brand Columns (Units Sold)

Each account has unit quantities for individual brands. These brands are grouped into color categories:

##### BLACK DIAMOND (Black Color Group)
- MODERN ART
- G.V.X.
- MODZ TITANIUM
- MODZFLEX

##### YELLOW (Yellow Color Group)
- B.M.E.C.
- GB+ COLLECTION
- GENEVIEVE BOUTIQUE
- FASHIONTABULOUS
- UROCK

##### RED (Red Color Group)
- MODZ SUNZ
- GENEVIEVE PARIS DESIGN
- GIOVANI DI VENEZIA
- MODZ
- MODZ KIDS

##### BLUE (Blue Color Group)
- MODERN TIMES

##### GREEN (Green Color Group)
- MODERN METALS
- MODERN PLASTICS II (also called MODERN PLASTICS 2)

##### LIME (Lime Color Group)
- MODERN PLASTICS I (also called MODERN PLASTICS 1)

##### Other Product Categories
- CASES - CLAMSHELL
- CASES - SLIP IN
- BRANDED CASES
- CLEANING CLOTHS
- NOSE PADS
- PARTS
- SUMMIT OPTICAL
- TOOLS
- SMART SHOPPER (occasional)
- CLOSE OUT (occasional)
- PERSONAL PPE (occasional)
- MODERN SERVICES (occasional)

## Color Group to Brand Mapping

This is the official mapping used throughout the system:

```
BLACK DIAMOND → Modern Art, GVX, Modz titanium, Modzflex
YELLOW       → BMEC, GB+, Genevieve Boutique, Fashiontabulous, Urock
RED          → Modz Sunz, Genevieve Paris Design, Giovani Di venezia, Modz, Modz Kids
BLUE         → Modern Times
GREEN        → Modern metals and Modern Plastics 2
LIME         → Modern Plastics 1
```

## Data Parsing Logic

### Account Classification
Accounts are automatically classified based on their CY and PY totals:

- **New Accounts**: PY Total = 0 AND CY Total > 0
- **Lost Accounts**: PY Total > 0 AND CY Total = 0
- **Reactivated Accounts**: Small PY Total (< $1000) AND CY > PY * 2
- **Declining Accounts**: Difference < 0
- **Increasing Accounts**: Difference > 0

### Frame Color Groups
The frame color groups in rows 2-13 (columns 10-13) represent aggregate sales across multiple individual brands:

- **BLACK DIAMOND** = Sum of (MODERN ART + G.V.X. + MODZ TITANIUM + MODZFLEX)
- **YELLOW** = Sum of (B.M.E.C. + GB+ COLLECTION + GENEVIEVE BOUTIQUE + FASHIONTABULOUS + UROCK)
- **RED** = Sum of (MODZ SUNZ + GENEVIEVE PARIS DESIGN + GIOVANI DI VENEZIA + MODZ + MODZ KIDS)
- **BLUE** = MODERN TIMES only
- **GREEN** = Sum of (MODERN METALS + MODERN PLASTICS II)
- **LIME** = MODERN PLASTICS I only

### Brand-Level Analysis
Each account row contains unit quantities for individual brands. The parser:
1. Extracts unit counts for each brand per account
2. Calculates total units sold across all accounts per brand
3. Counts how many accounts purchase each brand
4. Computes average units per account for each brand

## Data Flow

1. **Excel Upload** → User uploads one or two .xlsx files
2. **Python Parser** → `sales_parser.py` or `sales_comparison_parser.py` processes the file(s)
3. **JSON Export** → Data is exported to `sales_dashboard_data.json`
4. **React Dashboard** → Frontend loads JSON and displays visualizations

## Important Notes

### Multi-File Comparison
When comparing two files (previous year vs current year), the system:
- Matches accounts by Account # across both files
- Compares brand-by-brand purchases for each account
- Identifies which specific brands are growing/declining per account
- Provides color group breakdowns showing mix changes

### Data Quality
- Empty cells in brand columns are treated as 0 units
- Account # must be numeric (non-numeric rows are filtered out)
- Column names are stripped of whitespace during parsing
- Special characters are handled for console output compatibility

### File Naming Convention
Files typically follow the pattern: `[Name] YOY [Start Date] to [End Date].xlsx`
Example: `Payton YOY 8-18-24 to 8-19-25.xlsx`

## Usage in Dashboard

The dashboard uses this data structure to provide:

1. **Summary Metrics**: Overall performance indicators from rows 0-23
2. **Account Tables**: Sortable lists of declining, growing, new, and reactivated accounts
3. **Frame Performance Charts**: Visualizations of color group trends
4. **Brand Analytics**: Individual brand performance with account penetration
5. **Account Modals**: Detailed drill-downs showing brand mix for individual accounts
6. **Color Group Breakdowns**: Showing which brands within each color contribute to account changes

## Future Enhancements

This data structure supports potential future features:
- **Accounts per Brand**: Count how many accounts buy 12+ units of each brand
- **Sales per Working Day**: Calculate daily average excluding bank holidays
- **Geographic Analysis**: Visualize performance by city/region
- **Rep Performance**: Compare performance across sales representatives
- **Price Group Analysis**: Analyze trends by MO Price Groups
