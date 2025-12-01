# New Features Implementation Guide

This document describes the two new features added to the Sales Dashboard and how to use them.

## Feature 1: Accounts per Brand (12+ Units)

### Overview
This feature identifies and displays accounts that purchase 12 or more units from each brand, helping you understand brand penetration and customer loyalty.

### What It Shows
- **Brand Rankings**: Brands sorted by number of qualifying accounts
- **Current vs Previous Year**: Compare how brand penetration has changed
- **Qualifying Account Lists**: See which specific accounts buy 12+ units from each brand
- **Color Group Classification**: Brands organized by color groups (Black Diamond, Yellow, Red, Blue, Green, Lime)
- **Unit Statistics**: Total units sold and average units per account

### How to Use
1. Upload your YOY comparison files (2 Excel files)
2. Navigate to the Dashboard page
3. Scroll down to the "Accounts per Brand (12+ Units)" section
4. Toggle between "Current Year" and "Previous Year" views
5. Click on any brand row to expand and see the full list of qualifying accounts
6. View trends with green (increasing) or red (decreasing) indicators

### Data Structure
```json
{
  "accounts_per_brand": {
    "threshold": 12,
    "current_year": [
      {
        "brand": "MODERN PLASTICS II",
        "color_group": "GREEN",
        "accounts_buying_12_plus": 85,
        "total_accounts_buying": 108,
        "total_units": 21175,
        "qualifying_accounts": [
          {
            "account_number": 12345,
            "account_name": "ABC Optical",
            "units": 250
          }
        ]
      }
    ],
    "previous_year": [...],
    "summary": {
      "cy_total_qualifying_accounts": 450,
      "py_total_qualifying_accounts": 420,
      "cy_avg_accounts_per_brand": 25.0,
      "py_avg_accounts_per_brand": 23.3
    }
  }
}
```

### Business Use Cases
- **Territory Planning**: Identify which brands have strong penetration in your territory
- **Account Development**: Find accounts that are close to the 12-unit threshold and can be grown
- **Brand Focus**: Determine which brands to promote based on account adoption
- **Loyalty Analysis**: Track which accounts are loyal to specific brands year over year
- **Gap Analysis**: Identify brands with low penetration that need attention

---

## Feature 2: Sales per Working Day

### Overview
This feature calculates average daily sales excluding weekends and major US bank holidays, providing a more accurate view of daily performance.

### What It Shows
- **Date Range**: Automatically extracted from filename (e.g., "8-18-24 to 8-19-25")
- **Working Days Calculation**: Total working days excluding weekends and holidays
- **Sales per Working Day**: Average daily sales for CY and PY
- **Day-over-Day Comparison**: Dollar and percentage change in daily average
- **Calendar Breakdown**: Total days, working days, weekend days, and bank holidays

### Bank Holidays Excluded
- New Year's Day (January 1)
- Martin Luther King Jr. Day (3rd Monday in January)
- Presidents Day (3rd Monday in February)
- Memorial Day (Last Monday in May)
- Independence Day (July 4)
- Labor Day (1st Monday in September)
- Veterans Day (November 11)
- Thanksgiving (4th Thursday in November)
- Christmas Day (December 25)

### How to Use
1. Ensure your Excel filename includes dates in format: "Name YOY MM-DD-YY to MM-DD-YY.xlsx"
2. Upload your YOY comparison files
3. Navigate to the Dashboard page
4. View the "Sales per Working Day" card near the top
5. Compare current year vs previous year daily averages
6. Review the change analysis with trend indicators

### Data Structure
```json
{
  "sales_per_working_day": {
    "date_range": {
      "start_date": "2024-08-18",
      "end_date": "2025-08-19",
      "total_days": 367
    },
    "working_days": 261,
    "weekend_days": 104,
    "bank_holidays": 2,
    "sales_per_working_day_cy": 1650.19,
    "sales_per_working_day_py": 1558.35,
    "total_sales_cy": 430600.20,
    "total_sales_py": 406627.91,
    "change_per_day": 91.84,
    "pct_change_per_day": 5.89
  }
}
```

### Business Use Cases
- **Performance Normalization**: Compare sales across different time periods fairly
- **Goal Setting**: Set realistic daily sales targets based on working days
- **Territory Comparison**: Compare territories with different holiday schedules
- **Trend Analysis**: Identify true daily performance trends without weekend noise
- **Forecasting**: Project future sales based on working day averages

---

## Technical Implementation

### Backend (Python)

#### Files Modified
1. **sales_comparison_parser.py**: Added two new methods:
   - `get_accounts_per_brand(threshold=12)`: Calculates brand penetration metrics
   - `get_sales_per_working_day()`: Calculates working day averages
   - Helper methods for date extraction and holiday calculation

#### Key Functions
```python
# Extract dates from filename
def _extract_dates_from_filename(self, file_path: str) -> Optional[Tuple[datetime, datetime]]

# Calculate bank holidays for a year
def _get_bank_holidays(self, year: int) -> List[datetime]

# Count working days between dates
def _count_working_days(self, start_date: datetime, end_date: datetime) -> int

# Get accounts per brand analysis
def get_accounts_per_brand(self, threshold: int = 12) -> Dict

# Get sales per working day metrics
def get_sales_per_working_day(self) -> Dict
```

### Frontend (React/TypeScript)

#### New Components
1. **AccountsPerBrand.tsx**: Displays brand penetration analysis
   - Year toggle (CY/PY)
   - Expandable brand rows
   - Qualifying accounts lists
   - Color group badges
   - Trend indicators

2. **SalesPerWorkingDay.tsx**: Displays working day metrics
   - Date range summary
   - Calendar breakdown
   - CY vs PY comparison
   - Change analysis with trends
   - Insight box

#### Type Definitions Added
```typescript
// src/types/index.ts
export interface AccountsPerBrand { ... }
export interface SalesPerWorkingDay { ... }
export interface QualifyingAccount { ... }
export interface BrandAccountMetric { ... }
export interface DateRange { ... }
```

---

## Testing the Features

### Backend Testing

1. **Test with Sample File**:
```bash
python sales_comparison_parser.py
```

2. **Test Accounts per Brand**:
```python
from sales_comparison_parser import SalesComparisonParser

parser = SalesComparisonParser('previous.xlsx', 'current.xlsx')
parser.load_data()

# Get accounts per brand analysis
accounts_per_brand = parser.get_accounts_per_brand(threshold=12)
print(f"Brands tracked: {len(accounts_per_brand['current_year'])}")
print(f"CY Qualifying accounts: {accounts_per_brand['summary']['cy_total_qualifying_accounts']}")
```

3. **Test Sales per Working Day**:
```python
# Get working day metrics
sales_per_day = parser.get_sales_per_working_day()
print(f"Working days: {sales_per_day['working_days']}")
print(f"CY Daily avg: ${sales_per_day['sales_per_working_day_cy']:.2f}")
```

### Frontend Testing

1. **Build the Frontend**:
```bash
npm run build
```

2. **Run Development Server**:
```bash
npm run dev
```

3. **Test Upload Flow**:
   - Navigate to /upload
   - Upload two Excel files
   - Verify data parses correctly
   - Check for new sections on dashboard

4. **Test Components**:
   - Verify "Accounts per Brand" section appears
   - Test year toggle functionality
   - Expand/collapse brand rows
   - Verify "Sales per Working Day" card displays
   - Check trend indicators and colors

---

## API Integration

The new features are automatically included when using the comparison parser endpoint:

### API Endpoint
```
POST /api/parse-sales-data
```

### Request
```javascript
const formData = new FormData();
formData.append('previousYearFile', previousYearFile);
formData.append('currentYearFile', currentYearFile);

const response = await fetch('/api/parse-sales-data', {
  method: 'POST',
  body: formData
});
```

### Response
The response now includes:
```json
{
  "success": true,
  "data": {
    "summary": { ... },
    "accounts": { ... },
    "frames": { ... },
    "brands": { ... },
    "brand_comparison": { ... },
    "accounts_per_brand": { ... },    // NEW
    "sales_per_working_day": { ... }  // NEW
  }
}
```

---

## Troubleshooting

### Accounts per Brand Not Showing
- Ensure both previous and current year files are uploaded
- Verify brand columns exist in Excel files
- Check that accounts have purchase data

### Sales per Working Day Shows Error
- Verify filename contains date range in format: "MM-DD-YY to MM-DD-YY"
- Check that dates are valid
- Ensure sales totals are available in data

### Components Not Rendering
- Check browser console for errors
- Verify data types match TypeScript interfaces
- Ensure components are imported in DashboardPage.tsx

---

## Future Enhancements

### Potential Improvements
1. **Accounts per Brand**:
   - Adjustable threshold (currently fixed at 12)
   - Export qualifying accounts list to CSV
   - Filter by color group
   - Compare multiple years side-by-side

2. **Sales per Working Day**:
   - Custom holiday configuration
   - Weekly/monthly breakdowns
   - Day-of-week analysis
   - Working day forecast

3. **Both Features**:
   - Email alerts for significant changes
   - Historical trend charts
   - Export to PDF reports
   - Mobile app optimization

---

## Documentation Updates

### Files Updated
- `XLSX_DATA_STRUCTURE.md`: Added brand mapping and data structure details
- `src/types/index.ts`: Added new TypeScript interfaces
- `sales_comparison_parser.py`: Added comprehensive docstrings

### Additional Documentation
- API integration examples
- Component usage examples
- Testing procedures
- Troubleshooting guide

---

## Summary

Both features are now fully integrated into the sales dashboard:

✅ **Backend**: Python parser calculates both metrics automatically
✅ **Frontend**: React components display data beautifully
✅ **Types**: TypeScript interfaces ensure type safety
✅ **Integration**: Seamlessly integrated into existing dashboard flow
✅ **Documentation**: Comprehensive guides for usage and development

The features provide actionable insights for sales representatives to:
- Identify brand adoption trends
- Normalize performance across time periods
- Make data-driven territory decisions
- Set realistic goals based on working days
