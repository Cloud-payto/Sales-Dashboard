# Quick Start: New Features

## 🚀 Getting Started in 3 Steps

### Step 1: Ensure Your Excel Filename is Correct
Your Excel file **must** include dates in this format:
```
[Name] YOY MM-DD-YY to MM-DD-YY.xlsx
```

**Examples:**
- ✅ `Payton YOY 8-18-24 to 8-19-25.xlsx`
- ✅ `Sales YOY 1-1-24 to 12-31-24.xlsx`
- ❌ `Sales Report 2024.xlsx` (missing date pattern)

### Step 2: Upload Your Files
1. Open the dashboard
2. Click "Upload New Data"
3. Upload **TWO** Excel files:
   - Previous Year file
   - Current Year file
4. Wait for processing

### Step 3: View Your New Analytics
Scroll down on the dashboard to see:
1. **Sales per Working Day** (near the top)
2. **Accounts per Brand** (middle of page)

---

## 📊 Feature 1: Accounts per Brand

### What You'll See
A list of all brands showing:
- How many accounts buy 12+ units
- Total accounts buying the brand
- Year-over-year comparison
- Which specific accounts are buying

### How to Use It
1. **Toggle Years**: Click "Current Year" or "Previous Year" buttons
2. **Expand Brands**: Click any brand row to see qualifying accounts
3. **View Trends**: Green ↑ = more accounts, Red ↓ = fewer accounts
4. **Identify Opportunities**: Look for brands with low penetration

### Quick Tips
- Brands are sorted by number of qualifying accounts (highest first)
- Color badges show brand category (Green, Blue, Red, etc.)
- Click a brand multiple times to expand/collapse

---

## 📅 Feature 2: Sales per Working Day

### What You'll See
A card showing:
- Total working days (excluding weekends & holidays)
- Average sales per working day (CY vs PY)
- Dollar and percentage change
- Calendar breakdown

### How to Read It
- **Green** = Daily average increased
- **Red** = Daily average decreased
- **Working Days** = Weekdays minus bank holidays
- **Insight Box** = Plain-language summary

### Quick Tips
- Use this metric to compare territories fairly
- Set daily sales goals based on working day averages
- More accurate than total sales for different time periods

---

## 🔍 What If...

### Sales per Working Day shows "Error"?
**Fix**: Rename your Excel file to include dates in format: `MM-DD-YY to MM-DD-YY`

Example:
```
Before: Sales Report.xlsx
After: Sales Report 8-18-24 to 8-19-25.xlsx
```

### Accounts per Brand shows no data?
**Check**:
1. Did you upload both previous AND current year files?
2. Do your Excel files have brand columns (MODERN ART, GVX, etc.)?
3. Are there any accounts with 12+ units purchased?

### Components don't appear at all?
**Try**:
1. Refresh the page
2. Check browser console for errors (F12)
3. Re-upload your files
4. Verify files are in correct Excel format

---

## 🎯 Use Cases

### Brand Penetration Analysis
**Scenario**: You want to know which brands are most popular
**Action**:
1. View "Accounts per Brand"
2. Sort by qualifying accounts (automatic)
3. Focus on top 5-10 brands
4. Expand to see which accounts are loyal customers

### Setting Daily Goals
**Scenario**: You need to set realistic daily sales targets
**Action**:
1. View "Sales per Working Day"
2. Note the CY average per day
3. Set goals based on working day average
4. Track progress against this normalized metric

### Finding Growth Opportunities
**Scenario**: Identify brands to promote
**Action**:
1. Toggle to "Previous Year" in Accounts per Brand
2. Look for brands with low penetration
3. Toggle back to "Current Year"
4. Expand brands that are growing
5. Contact those accounts to understand why

### Territory Comparison
**Scenario**: Compare your performance to another rep
**Action**:
1. Compare "Sales per Working Day" (not total sales)
2. This accounts for different time periods
3. This excludes holidays that may differ by region
4. More accurate comparison

---

## 📱 Mobile Usage

Both features are mobile-responsive:
- **Accounts per Brand**: Scrollable list with tap-to-expand
- **Sales per Working Day**: Cards stack vertically on small screens

---

## 💾 Data Location

The new data is stored in your uploaded JSON:
```json
{
  "accounts_per_brand": { ... },
  "sales_per_working_day": { ... }
}
```

You can download the JSON file to:
- Import into other tools
- Archive for records
- Share with team

---

## 🆘 Need Help?

### Documentation
- **Full Details**: See `NEW_FEATURES.md`
- **Data Structure**: See `XLSX_DATA_STRUCTURE.md`
- **Implementation**: See `IMPLEMENTATION_SUMMARY.md`

### Common Questions

**Q: Can I change the 12-unit threshold?**
A: Currently fixed at 12, but this can be customized in code

**Q: Which holidays are excluded?**
A: All major US federal bank holidays (9 total)

**Q: Does this work with single file upload?**
A: No, you need two files (previous and current year) for comparison

**Q: Can I export the qualifying accounts list?**
A: Not yet, but you can expand brands and copy manually

---

## ✅ Success Checklist

Before reaching out for support, verify:
- [ ] Excel filename includes date range
- [ ] Uploaded TWO files (not one)
- [ ] Files have brand columns
- [ ] Browser is up-to-date
- [ ] Page fully loaded before checking
- [ ] Checked browser console (F12) for errors

---

## 🎉 You're Ready!

Start exploring your brand penetration and working day metrics now!

**Pro Tip**: Bookmark this page for quick reference when analyzing your sales data.
