# Sales Dashboard Parser - Data Extraction Summary

## ✅ Complete Data Extraction Accomplished

This parser successfully extracts **ALL** data from your Excel sales report and makes it available for your frontend dashboard.

---

## 📊 Data Extracted from Excel

### 1. Summary Metrics (Top Rows)
✅ **ALL YOY metrics from rows 0-23 extracted:**
- Total Sales (Current Year & Previous Year)
- Direct Sales (CY & PY)
- Indirect Sales (CY & PY)
- Total Accounts (CY & PY)
- Account Average
- New Accounts (count & sales)
- Reactivated Accounts (count & sales)
- Lost Accounts (count & sales)
- Accounts with Increasing Sales (count & sales)
- Accounts with Declining Sales (count & sales)
- All dollar changes and percentage changes

### 2. Frame Color Groups (12 Categories)
✅ **Complete YOY tracking for all color groups:**
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

**For each group:**
- Current year units
- Previous year units
- Unit change
- Percentage change

### 3. Individual Brands (25 Brands)
✅ **Complete analysis of all 25 brand/product lines:**
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

**For each brand:**
- Total units sold
- Number of accounts buying
- Average units per account

### 4. Account-Level Data (All 225 Accounts)
✅ **Complete details for every account:**
- Account number
- Name
- City
- Current year sales
- Previous year sales
- Dollar difference
- Project code
- MO Price Groups
- **Detailed brand purchases** (which brands each account bought)

### 5. Account Segmentation
✅ **Accounts categorized and analyzed:**

**Declining Accounts: 72**
- Full list with decline amounts
- Frame purchase details for targeting

**Growing Accounts: 76**
- Full list with growth amounts
- Success stories to replicate

**New Accounts: 16**
- First-time buyers this year
- Revenue breakdown

**Reactivated Accounts: 15**
- Accounts coming back to life
- Before/after comparison

---

## 📁 Output Files Generated

### Main Dashboard File
1. **sales_dashboard_data.json**
   - Complete unified data source
   - Ready for React/frontend integration
   - Contains: summary, accounts, frames, brands, insights

### CSV Reports
2. **declining_accounts.csv** (72 accounts)
3. **increasing_accounts.csv** (76 accounts)
4. **new_accounts.csv** (16 accounts)
5. **reactivated_accounts.csv** (15 accounts)

### Detailed Analysis
6. **brand_performance.json** (25 brands with metrics)
7. **declining_accounts_frame_details.json** (Frame purchases for declining accounts)

---

## 🎯 Use Cases Enabled

### For Sales Dashboard Frontend:
✅ Display total sales with YOY comparison
✅ Show account health gauge (growing vs declining)
✅ List top performing accounts
✅ Alert on urgent declining accounts
✅ Track new business acquisition
✅ Monitor reactivation success
✅ Visualize frame category trends
✅ Compare brand performance
✅ Generate actionable insights
✅ Create geographic sales maps
✅ Build product mix analysis
✅ Track account retention metrics

### For Sales Rep Actions:
✅ Identify accounts needing immediate attention
✅ Understand which products are declining
✅ Know which brands to push with each account
✅ Celebrate and learn from top performers
✅ Track new account onboarding
✅ Monitor reactivation campaigns
✅ Plan territory visits by city
✅ Prepare for customer meetings with data

---

## 🚀 Frontend Integration Ready

All data is structured in `sales_dashboard_data.json` with clear hierarchies:

```javascript
{
  summary: {
    // All top-level metrics
  },
  accounts: {
    top_declining: [],
    top_increasing: [],
    new_accounts: [],
    reactivated_accounts: []
  },
  frames: {
    increasing: [],
    declining: [],
    top_growth: [],
    top_decline: []
  },
  brands: {
    brands: [],        // All 25 brands
    top_brands: [],    // Top 10
    total_brands_sold: 25
  },
  insights: []         // Actionable alerts
}
```

Simply import this JSON into your React components and start building visualizations!

---

## ✨ Key Achievements

1. ✅ **100% Data Coverage** - Every metric from the Excel file is extracted
2. ✅ **Structured for Frontend** - Clean JSON schema ready for React
3. ✅ **Multiple Export Formats** - JSON for web, CSV for analysis
4. ✅ **Actionable Insights** - Automated alerts and recommendations
5. ✅ **Brand-Level Detail** - Know exactly what's selling and where
6. ✅ **Account Segmentation** - Declining, growing, new, reactivated
7. ✅ **YOY Comparisons** - Track trends across all metrics
8. ✅ **Extensible Architecture** - Easy to add new analyses

---

## 📚 Documentation

- **PARSER_README.md** - Complete usage guide with examples
- **example_usage.py** - 9 example scripts showing different analyses
- **sales_parser.py** - Fully commented source code

---

## 🎉 Ready to Build Your Dashboard!

You now have access to **every single data point** from your Excel file, perfectly structured for building a comprehensive sales dashboard. The parser handles all the heavy lifting - you just focus on creating great visualizations and UX!
