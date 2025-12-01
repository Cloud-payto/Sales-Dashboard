# n8n Quick Reference - Sales Dashboard API

Quick copy-paste configurations for n8n HTTP Request nodes.

---

## 🎯 Main Endpoint: Parse Excel

### HTTP Request Node Configuration

**Method:** `POST`

**URL:** `http://localhost:3000/parse-excel`

**Authentication:** None

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "include_details": true
}
```

**Response Data Path:**
```
{{ $json.data }}
```

---

## 📊 Common Data Accessors

Use these in n8n expressions to access specific data:

### Summary Metrics
```javascript
{{ $json.data.summary.total_sales_cy }}            // Current year sales
{{ $json.data.summary.total_sales_py }}            // Previous year sales
{{ $json.data.summary.total_sales_pct_change }}    // Percentage change
{{ $json.data.summary.total_accounts }}            // Total accounts
{{ $json.data.summary.new_accounts }}              // New accounts count
{{ $json.data.summary.declining_accounts }}        // Declining accounts count
{{ $json.data.summary.retention_rate }}            // Retention rate %
```

### Top Declining Account
```javascript
{{ $json.data.accounts.top_declining[0].Name }}         // Account name
{{ $json.data.accounts.top_declining[0]["Acct #"] }}    // Account number
{{ $json.data.accounts.top_declining[0].Difference }}   // Decline amount
{{ $json.data.accounts.top_declining[0].City }}         // City
```

### Top Growing Account
```javascript
{{ $json.data.accounts.top_increasing[0].Name }}
{{ $json.data.accounts.top_increasing[0].Difference }}
```

### All Insights (for messages)
```javascript
{{ $json.data.insights.join('\n') }}                    // All insights, one per line
{{ $json.data.insights[0] }}                            // First insight
```

### Frame Performance
```javascript
{{ $json.data.frames.top_decline[0].name }}             // Top declining frame
{{ $json.data.frames.top_decline[0].change }}           // Unit change
{{ $json.data.frames.top_growth[0].name }}              // Top growing frame
```

### Brand Performance
```javascript
{{ $json.data.brands.top_brands[0].brand }}             // Top brand name
{{ $json.data.brands.top_brands[0].total_units }}       // Units sold
{{ $json.data.brands.total_brands_sold }}               // Total brands
```

---

## 🔔 Example Workflows

### 1. Daily Sales Alert Email

**Workflow:**
```
[Schedule Trigger: Daily 8am]
    ↓
[HTTP Request: Parse Excel]
    ↓
[Email: Send summary]
```

**Email Node Configuration:**

**To:** `sales@company.com`

**Subject:**
```
Daily Sales Update - {{ $now.format('MMMM DD, YYYY') }}
```

**Body:**
```
Sales Dashboard Update

OVERALL PERFORMANCE:
• Total Sales: ${{ $json.data.summary.total_sales_cy.toFixed(2) }}
• Change: {{ $json.data.summary.total_sales_pct_change }}% YOY
• Accounts: {{ $json.data.summary.total_accounts }}
• Retention: {{ $json.data.summary.retention_rate.toFixed(1) }}%

ACCOUNT STATUS:
• Growing: {{ $json.data.summary.increasing_accounts }}
• Declining: {{ $json.data.summary.declining_accounts }}
• New: {{ $json.data.summary.new_accounts }}

KEY INSIGHTS:
{{ $json.data.insights.join('\n• ') }}

TOP DECLINING ACCOUNT:
{{ $json.data.accounts.top_declining[0].Name }} - ${{ Math.abs($json.data.accounts.top_declining[0].Difference).toFixed(2) }} decline

TOP GROWING ACCOUNT:
{{ $json.data.accounts.top_increasing[0].Name }} - ${{ $json.data.accounts.top_increasing[0].Difference.toFixed(2) }} growth
```

---

### 2. Urgent Decline Alert (Slack)

**Workflow:**
```
[Schedule Trigger: Daily]
    ↓
[HTTP Request: Parse Excel]
    ↓
[Filter: Decline > $5000]
    ↓
[Slack: Alert channel]
```

**Filter Node:**
```javascript
{{ $json.data.accounts.top_declining[0].Difference < -5000 }}
```

**Slack Message:**
```
🚨 URGENT ACCOUNT ALERT

{{ $json.data.accounts.top_declining[0].Name }} has declined by ${{ Math.abs($json.data.accounts.top_declining[0].Difference).toFixed(2) }}!

Previous Year: ${{ $json.data.accounts.top_declining[0]["PY Total"].toFixed(2) }}
Current Year: ${{ $json.data.accounts.top_declining[0]["CY Total"].toFixed(2) }}
Location: {{ $json.data.accounts.top_declining[0].City }}

ACTION REQUIRED: Contact this account immediately.
```

---

### 3. Update Google Sheets

**Workflow:**
```
[Webhook Trigger]
    ↓
[HTTP Request: Parse Excel]
    ↓
[Google Sheets: Update range]
```

**Google Sheets Node:**

**Range:** `Dashboard!A2:E2`

**Values:**
```javascript
[
  [
    $json.data.summary.total_sales_cy,
    $json.data.summary.total_sales_py,
    $json.data.summary.total_sales_pct_change,
    $json.data.summary.total_accounts,
    $json.data.summary.declining_accounts
  ]
]
```

---

### 4. Log to Database

**Workflow:**
```
[Schedule Trigger: Daily]
    ↓
[HTTP Request: Parse Excel]
    ↓
[PostgreSQL: Insert record]
```

**PostgreSQL Node:**

**Query:**
```sql
INSERT INTO sales_daily_metrics (
  date, total_sales, total_accounts, new_accounts,
  declining_accounts, retention_rate
) VALUES (
  CURRENT_DATE,
  {{ $json.data.summary.total_sales_cy }},
  {{ $json.data.summary.total_accounts }},
  {{ $json.data.summary.new_accounts }},
  {{ $json.data.summary.declining_accounts }},
  {{ $json.data.summary.retention_rate }}
)
```

---

### 5. Conditional Workflow - New Accounts

**Workflow:**
```
[Schedule Trigger: Daily]
    ↓
[HTTP Request: Parse Excel]
    ↓
[IF Node: New accounts > 0]
    ↓ (true)
[Split In Batches: Loop through new accounts]
    ↓
[Send welcome email to each]
```

**IF Node Condition:**
```javascript
{{ $json.data.summary.new_accounts > 0 }}
```

**Split In Batches:**
```javascript
{{ $json.data.accounts.new_accounts }}
```

**Email Node (in loop):**

**To:** Use account data to lookup email
**Subject:** `Welcome to Our Sales Program`
**Body:**
```
Welcome {{ $json.Name }}!

We're excited to have you as a new customer. Your account #{{ $json["Acct #"] }} has been set up.

Current Orders: ${{ $json["CY Total"].toFixed(2) }}

Your sales representative will contact you soon.
```

---

### 6. Weekly Summary Report

**Workflow:**
```
[Schedule Trigger: Monday 9am]
    ↓
[HTTP Request: Parse Excel]
    ↓
[Download CSV: Declining accounts]
    ↓
[Email: Attach CSV]
```

**HTTP Request #1:** Parse Excel (as above)

**HTTP Request #2 (Download CSV):**
- **Method:** `GET`
- **URL:** `http://localhost:3000/files/declining-accounts`
- **Download Response:** `Yes`

**Email Node:**
- **Attachments:** `{{ $binary }}`

---

## 🔍 Filtering & Conditions

### Filter by decline amount
```javascript
{{ $json.data.accounts.top_declining[0].Difference < -3000 }}
```

### Filter if retention drops
```javascript
{{ $json.data.summary.retention_rate < 85 }}
```

### Filter if sales growth positive
```javascript
{{ $json.data.summary.total_sales_pct_change > 0 }}
```

### Filter if many declining accounts
```javascript
{{ $json.data.summary.declining_accounts > 50 }}
```

---

## 🎨 Formatting Tips

### Format currency
```javascript
${{ $json.data.summary.total_sales_cy.toLocaleString('en-US', {minimumFractionDigits: 2}) }}
```

### Format percentage
```javascript
{{ $json.data.summary.total_sales_pct_change.toFixed(2) }}%
```

### Format date
```javascript
{{ $now.format('MMMM DD, YYYY') }}
```

### Conditional emoji
```javascript
{{ $json.data.summary.total_sales_pct_change > 0 ? '📈 Up' : '📉 Down' }}
```

---

## 🔗 Additional Endpoints

### Get Only Summary
**URL:** `http://localhost:3000/data/summary`
**When to use:** Faster response, only need high-level metrics

### Get Only Declining Accounts
**URL:** `http://localhost:3000/data/accounts?type=declining&limit=5`
**When to use:** Only care about declining accounts

### Get Insights
**URL:** `http://localhost:3000/data/insights`
**When to use:** Just need the insights array for notifications

---

## ⚡ Performance Tips

1. **Use cached data:** After parsing once, use `GET /data/*` endpoints for faster responses
2. **Limit results:** Add `?limit=5` to account endpoints
3. **Reduce details:** Set `include_details: false` in parse request
4. **Schedule wisely:** Parse once in morning, use cached data throughout day

---

## 🐛 Common Issues

### "No data available"
**Solution:** Run `POST /parse-excel` first

### Empty response
**Solution:** Check server is running on localhost:3000

### Timeout
**Solution:** Increase n8n HTTP Request timeout to 30 seconds

---

## 📝 Testing in n8n

1. Create new workflow
2. Add "HTTP Request" node
3. Configure as shown above
4. Click "Test Step"
5. Inspect response in "Output" tab
6. Use "Expression" editor to test data accessors

---

## 🎉 Ready to Automate!

Copy these configurations into your n8n workflows and start automating your sales insights!

For more details, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
