# Sales Dashboard Parser API Documentation

Complete REST API for parsing Excel sales data and retrieving insights. Designed for n8n workflow integration and frontend consumption.

## 🚀 Quick Start

### Start the API Server

```bash
python api_server.py
```

The server will start on **http://localhost:3000**

### Test the API

```bash
# Health check
curl http://localhost:3000/health

# Parse Excel and get all data
curl -X POST http://localhost:3000/parse-excel

# Get summary metrics
curl http://localhost:3000/data/summary
```

---

## 📍 API Endpoints

### Base URL
```
http://localhost:3000
```

---

## Core Endpoints

### 1. Home / API Info
**GET** `/`

Get API information and list of available endpoints.

**Response:**
```json
{
  "name": "Sales Dashboard Parser API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "POST /parse-excel": "Parse Excel file and return complete dashboard data",
    "GET /data": "Get the most recent parsed dashboard data",
    ...
  }
}
```

---

### 2. Health Check
**GET** `/health`

Check API health and Excel file status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-15T13:01:45.600653",
  "excel_file_exists": true,
  "excel_file_path": "Payton YOY 8-18-24 to 8-19-25.xlsx"
}
```

---

### 3. Parse Excel (Main Endpoint)
**POST** `/parse-excel`

Parse the Excel file and return complete dashboard data. This is the **main endpoint for n8n**.

**Optional Request Body (JSON):**
```json
{
  "excel_path": "custom/path/to/file.xlsx",  // Optional: custom Excel file path
  "include_details": true                     // Optional: include full account lists (default: true)
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-10-15T13:01:55.297556",
  "excel_file": "Payton YOY 8-18-24 to 8-19-25.xlsx",
  "data": {
    "summary": {
      "total_sales_cy": 430600.20,
      "total_sales_py": 406627.91,
      "total_sales_change": 23972.29,
      "total_sales_pct_change": 5.9,
      "direct_sales_cy": 394804.89,
      "direct_sales_py": 367400.92,
      "indirect_sales_cy": 35795.31,
      "indirect_sales_py": 39226.99,
      "total_accounts": 135,
      "total_accounts_py": 131,
      "account_average": 3189.63,
      "new_accounts": 9,
      "new_accounts_sales": 8294.55,
      "reactivated_accounts": 7,
      "reactivated_accounts_sales": 7054.33,
      "lost_accounts": 12,
      "lost_accounts_sales": 11326.46,
      "increasing_accounts": 44,
      "increasing_accounts_sales": 75771.55,
      "declining_accounts": 50,
      "declining_accounts_sales": -56043.33,
      "total_decline_amount": -68084.68,
      "total_increase_amount": 92056.97,
      "net_change": 23972.29,
      "retention_rate": 90.84
    },
    "accounts": {
      "declining_count": 72,
      "increasing_count": 76,
      "top_declining": [
        {
          "Acct #": 94824,
          "Name": "SUNDANCE OPTICAL",
          "City": "FLAGSTAFF",
          "CY Total": 18198.67,
          "PY Total": 24753.41,
          "Difference": -6554.74
        }
        // ... more accounts
      ],
      "top_increasing": [
        {
          "Acct #": 72443,
          "Name": "CORONA OPTIQUE",
          "City": "YUMA",
          "CY Total": 32353.79,
          "PY Total": 17442.30,
          "Difference": 14911.49
        }
        // ... more accounts
      ],
      "new_accounts": [
        {
          "Acct #": 95633,
          "Name": "MOHAVE EYE CENTER",
          "City": "BULLHEAD CITY",
          "CY Total": 4486.12,
          "Project Code": "TIER 1"
        }
        // ... more accounts
      ],
      "reactivated_accounts": [...]
    },
    "frames": {
      "increasing": [...],
      "declining": [...],
      "top_growth": [
        {
          "name": "LIME",
          "current_year": 11404,
          "previous_year": 9632,
          "change": 1772,
          "pct_change": 18.4
        }
        // ... more frames
      ],
      "top_decline": [...]
    },
    "brands": {
      "brands": [
        {
          "brand": "MODERN PLASTICS II",
          "total_units": 21175,
          "account_count": 108,
          "avg_units_per_account": 196.06
        }
        // ... all 25 brands
      ],
      "top_brands": [...],
      "total_brands_sold": 25
    },
    "insights": [
      "URGENT: SUNDANCE OPTICAL declined by $6,554.74",
      "TOP PERFORMER: CORONA OPTIQUE increased by $14,911.49",
      "Frame Alert: SLIP-IN CASES sales down 1960 units (-29.2% decline)",
      "Frame Opportunity: LIME sales up 1772 units (18.4% growth)",
      "72 of 135 accounts (53.3%) are declining",
      "9 new accounts added, generating $8,294.55"
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "traceback": "Full error traceback",
  "timestamp": "2025-10-15T13:01:55.297556"
}
```

---

## Data Retrieval Endpoints

### 4. Get All Data
**GET** `/data`

Retrieve the most recently parsed dashboard data (from last `/parse-excel` call).

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-10-15T13:02:00.123456",
  "data": {
    // Same structure as /parse-excel response
  }
}
```

---

### 5. Get Summary Metrics
**GET** `/data/summary`

Get only the summary metrics (faster response, less data).

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-10-15T13:02:00.123456",
  "summary": {
    "total_sales_cy": 430600.20,
    "total_sales_py": 406627.91,
    "total_sales_change": 23972.29,
    "total_sales_pct_change": 5.9,
    // ... all summary metrics
  }
}
```

---

### 6. Get Account Data
**GET** `/data/accounts`

Get account lists (declining, increasing, new, reactivated).

**Query Parameters:**
- `type` (optional): Filter by account type
  - `declining` - Only declining accounts
  - `increasing` - Only increasing accounts
  - `new` - Only new accounts
  - `reactivated` - Only reactivated accounts
- `limit` (optional): Limit number of accounts returned

**Examples:**
```bash
# Get all account data
curl http://localhost:3000/data/accounts

# Get only top 5 declining accounts
curl "http://localhost:3000/data/accounts?type=declining&limit=5"

# Get only new accounts
curl "http://localhost:3000/data/accounts?type=new"
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-10-15T13:02:00.123456",
  "accounts": {
    "top_declining": [...],
    "top_increasing": [...],
    "new_accounts": [...],
    "reactivated_accounts": [...]
  }
}
```

---

### 7. Get Frame Performance
**GET** `/data/frames`

Get frame color group performance data.

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-10-15T13:02:00.123456",
  "frames": {
    "increasing": [...],
    "declining": [...],
    "top_growth": [...],
    "top_decline": [...]
  }
}
```

---

### 8. Get Brand Performance
**GET** `/data/brands`

Get individual brand performance data.

**Query Parameters:**
- `limit` (optional): Limit number of brands returned

**Examples:**
```bash
# Get all brands
curl http://localhost:3000/data/brands

# Get top 10 brands only
curl "http://localhost:3000/data/brands?limit=10"
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-10-15T13:02:00.123456",
  "brands": {
    "brands": [...],
    "top_brands": [...],
    "total_brands_sold": 25
  }
}
```

---

### 9. Get Insights
**GET** `/data/insights`

Get actionable insights and alerts.

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-10-15T13:02:00.123456",
  "insights": [
    "URGENT: SUNDANCE OPTICAL declined by $6,554.74",
    "TOP PERFORMER: CORONA OPTIQUE increased by $14,911.49",
    "Frame Alert: SLIP-IN CASES sales down 1960 units (-29.2% decline)",
    "Frame Opportunity: LIME sales up 1772 units (18.4% growth)",
    "72 of 135 accounts (53.3%) are declining",
    "9 new accounts added, generating $8,294.55"
  ]
}
```

---

## File Download Endpoints

### 10. Download Declining Accounts CSV
**GET** `/files/declining-accounts`

Download CSV file of all declining accounts.

**Response:** CSV file download

---

### 11. Download Increasing Accounts CSV
**GET** `/files/increasing-accounts`

Download CSV file of all increasing accounts.

**Response:** CSV file download

---

### 12. Download New Accounts CSV
**GET** `/files/new-accounts`

Download CSV file of all new accounts.

**Response:** CSV file download

---

### 13. Download Brand Performance JSON
**GET** `/files/brand-performance`

Download JSON file with brand performance data.

**Response:** JSON file download

---

## 🔗 n8n Workflow Integration

### Basic n8n Workflow

1. **HTTP Request Node** (Trigger)
   - Method: `POST`
   - URL: `http://localhost:3000/parse-excel`
   - Headers: `Content-Type: application/json`
   - Body (optional):
     ```json
     {
       "include_details": false
     }
     ```

2. **Process Response**
   - Access data using: `{{ $json.data }}`
   - Summary metrics: `{{ $json.data.summary }}`
   - Top declining accounts: `{{ $json.data.accounts.top_declining }}`
   - Insights: `{{ $json.data.insights }}`

### Example n8n Workflow - Send Alert Email

```
[Cron Trigger: Daily 8am]
    ↓
[HTTP Request: POST /parse-excel]
    ↓
[Set Node: Extract top declining]
    {{ $json.data.accounts.top_declining[0] }}
    ↓
[Send Email: Alert if decline > $3000]
```

### Example n8n Workflow - Update Database

```
[Webhook Trigger]
    ↓
[HTTP Request: POST /parse-excel]
    ↓
[Split In Batches: Process accounts]
    ↓
[PostgreSQL: Update account records]
```

### Example n8n Workflow - Slack Notification

```
[Cron Trigger: Daily]
    ↓
[HTTP Request: GET /data/insights]
    ↓
[Slack: Post insights to channel]
    Message: {{ $json.insights.join('\n') }}
```

---

## 🔧 Configuration

### Change Excel File Path

Edit `api_server.py`:

```python
EXCEL_FILE_PATH = 'path/to/your/file.xlsx'
```

Or pass in request body:

```bash
curl -X POST http://localhost:3000/parse-excel \
  -H "Content-Type: application/json" \
  -d '{"excel_path": "custom/path/file.xlsx"}'
```

### Change Port

Edit `api_server.py`:

```python
app.run(host='0.0.0.0', port=5000, debug=True)  # Change 3000 to 5000
```

Or set environment variable:

```bash
export FLASK_RUN_PORT=5000
python api_server.py
```

---

## 🔒 Production Deployment

For production use, replace the development server with a production WSGI server:

### Using Gunicorn (recommended)

1. Install Gunicorn:
   ```bash
   pip install gunicorn
   ```

2. Run with Gunicorn:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:3000 api_server:app
   ```

### Using Waitress (Windows-friendly)

1. Install Waitress:
   ```bash
   pip install waitress
   ```

2. Run with Waitress:
   ```bash
   waitress-serve --port=3000 api_server:app
   ```

---

## 📊 Usage Examples

### Python

```python
import requests

# Parse Excel
response = requests.post('http://localhost:3000/parse-excel')
data = response.json()

print(f"Total Sales: ${data['data']['summary']['total_sales_cy']:,.2f}")
print(f"Declining Accounts: {data['data']['accounts']['declining_count']}")

# Get specific data
summary = requests.get('http://localhost:3000/data/summary').json()
print(summary['summary']['retention_rate'])
```

### JavaScript / Node.js

```javascript
// Parse Excel
const response = await fetch('http://localhost:3000/parse-excel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

const result = await response.json();
console.log('Total Sales:', result.data.summary.total_sales_cy);

// Get insights
const insightsResponse = await fetch('http://localhost:3000/data/insights');
const insights = await insightsResponse.json();
console.log(insights.insights);
```

### cURL

```bash
# Parse and save to file
curl -X POST http://localhost:3000/parse-excel -o dashboard.json

# Get summary metrics
curl http://localhost:3000/data/summary | jq '.summary'

# Get top 3 declining accounts
curl "http://localhost:3000/data/accounts?type=declining&limit=3" | jq '.accounts'

# Download CSV
curl http://localhost:3000/files/declining-accounts -o declining.csv
```

---

## 🐛 Troubleshooting

### Error: "Excel file not found"
- Ensure the Excel file exists in the correct path
- Check `EXCEL_FILE_PATH` in `api_server.py`
- Use absolute paths if relative paths aren't working

### Error: "No data available"
- Run `POST /parse-excel` first before calling `/data` endpoints
- Check server logs for parsing errors

### Server won't start
- Ensure port 3000 is not already in use
- Check that Flask and dependencies are installed: `pip install flask flask-cors`
- Look for Python errors in the console

### Slow response times
- First parse takes 3-5 seconds (reading Excel)
- Subsequent `/data` calls are fast (cached)
- Use `include_details: false` for faster responses
- Consider caching strategy for high-traffic scenarios

---

## 📝 API Response Codes

- **200 OK** - Successful request
- **404 Not Found** - Resource not found (file or endpoint)
- **500 Internal Server Error** - Server error (check logs)

---

## 🔄 Data Refresh Strategy

1. **Manual Refresh**: Call `POST /parse-excel` when Excel file is updated
2. **Scheduled Refresh**: Use cron job or n8n scheduler to parse periodically
3. **Webhook Trigger**: Call API when Excel file is uploaded/modified
4. **On-Demand**: Frontend calls `/parse-excel` on page load

---

## 📚 Related Documentation

- [PARSER_README.md](PARSER_README.md) - Detailed data structure documentation
- [DATA_EXTRACTION_SUMMARY.md](DATA_EXTRACTION_SUMMARY.md) - Overview of extracted data
- [sales_parser.py](sales_parser.py) - Core parser implementation

---

## 🎉 You're Ready!

The API is now running and ready for your n8n workflows. Start with:

```bash
curl -X POST http://localhost:3000/parse-excel
```

Then integrate into n8n using HTTP Request nodes pointing to the endpoints you need!
