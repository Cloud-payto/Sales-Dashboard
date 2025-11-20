# Sales Dashboard

A comprehensive Year-over-Year (YOY) sales analytics dashboard for sales representatives, built with React, TypeScript, and Tailwind CSS. This dashboard provides actionable insights into sales performance, account health, frame category trends, and brand analytics.

## Features

### Key Insights & Alerts
- **Urgent Notifications**: Immediate visibility into critical account declines
- **Performance Highlights**: Top performers and growth opportunities
- **Actionable Insights**: Smart alerts for declining frame categories and growth trends

### Comprehensive Metrics
- **Overall Performance**: Total sales, account counts, averages, and retention rates
- **Account Performance**: Growing, declining, new, and reactivated accounts
- **YOY Comparison**: Side-by-side current year vs previous year analysis
- **Trend Indicators**: Visual indicators for positive/negative changes

### Data Visualization
- **Frame Category Performance**: Horizontal bar chart showing top 5 growing and declining frame categories
- **Brand Performance**: Top 10 brands by units sold with account penetration metrics
- **Interactive Charts**: Hover tooltips with detailed breakdowns

### Account Management
- **Top Declining Accounts**: Sortable table of accounts needing attention
- **Top Growing Accounts**: High performers driving revenue growth
- **New Accounts**: First-time buyers with project codes
- **Reactivated Accounts**: Previously inactive accounts coming back

### NEW: Advanced Analytics
- **Accounts per Brand (12+ Units)**: Identify brand penetration by showing which accounts purchase 12 or more units from each brand, with CY/PY comparison and qualifying account lists
- **Sales per Working Day**: Calculate average daily sales excluding weekends and major US bank holidays for accurate performance normalization

### Features
- **Sortable Tables**: Click column headers to sort by any field
- **Color-Coded Indicators**: Red for declines, green for growth, blue for new
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **TypeScript**: Fully typed for maintainability and developer experience

## Tech Stack

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization library
- **Lucide React** - Beautiful icon library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── MetricCard.tsx           # Metric display cards with trend indicators
│   ├── TrafficChart.tsx         # Frame category performance chart
│   ├── AccountsTable.tsx        # Sortable accounts table
│   ├── BrandPerformance.tsx     # Brand analytics component
│   └── InsightsPanel.tsx        # Key insights and alerts
├── data/
│   └── mockData.ts              # Sample data for development
├── types/
│   └── index.ts                 # TypeScript type definitions
├── App.tsx                      # Main application component
├── main.tsx                     # Application entry point
└── index.css                    # Global styles and Tailwind imports
```

## Data Integration

### Using Real Data

The dashboard is designed to work with data from the Python sales parser. To use real data:

1. Run the Python parser on your Excel sales report:
   ```bash
   python sales_parser.py
   ```

2. This generates `sales_dashboard_data.json`

3. Replace the mock data import in [src/App.tsx](src/App.tsx):
   ```typescript
   // Replace this:
   import { mockDashboardData } from './data/mockData';

   // With this:
   import dashboardData from './sales_dashboard_data.json';
   ```

### Data Structure

The dashboard expects data in the following format (see [PARSER_README.md](PARSER_README.md) for details):

```typescript
{
  summary: {
    total_sales_cy: number,
    total_sales_py: number,
    total_sales_pct_change: number,
    // ... more metrics
  },
  accounts: {
    top_declining: Account[],
    top_increasing: Account[],
    new_accounts: Account[],
    reactivated_accounts: Account[]
  },
  frames: {
    top_growth: FrameCategory[],
    top_decline: FrameCategory[]
  },
  brands: {
    brands: Brand[],
    top_brands: Brand[]
  },
  insights: string[]
}
```

## Customization

### Adjusting Displayed Data

Edit [src/App.tsx](src/App.tsx) to customize:
- Number of accounts shown in tables
- Number of brands displayed
- Chart configurations
- Metric card layouts

### Styling

Tailwind CSS classes can be modified in any component file. The theme uses:
- Gray tones for neutral elements
- Red for declining metrics
- Green for growing metrics
- Blue for new/informational items

### Adding New Components

1. Create new component in `src/components/`
2. Import and use in [src/App.tsx](src/App.tsx)
3. Add TypeScript types to [src/types/index.ts](src/types/index.ts)

## Key Components

### MetricCard
Displays key performance indicators with trend arrows and percentage changes.

**Props:**
- `label`: Metric title
- `value`: Main value to display
- `subtitle`: Additional context
- `change`: Percentage change
- `icon`: Icon type (sales, accounts, average, new, growing, declining)
- `trend`: Trend direction (up, down, neutral)

### AccountsTable
Sortable table for account data with color-coded changes.

**Props:**
- `accounts`: Array of account objects
- `title`: Table heading
- `type`: Table type (declining, growing, new, reactivated)

### FramePerformanceChart
Horizontal bar chart showing frame category performance.

**Props:**
- `topGrowth`: Top growing frame categories
- `topDecline`: Top declining frame categories

### BrandPerformance
List view of top brands with progress bars and metrics.

**Props:**
- `brands`: Array of brand objects
- `showTop`: Number of brands to display (default: 10)

### InsightsPanel
Alert panel with color-coded insights.

**Props:**
- `insights`: Array of insight strings

## Use Cases

1. **Daily Account Reviews**: Quickly identify accounts needing attention
2. **Territory Planning**: Understand product trends and opportunities
3. **Client Meetings**: Present data-driven account performance
4. **Sales Forecasting**: Analyze YOY trends for predictions
5. **Product Strategy**: Identify which frame lines to promote

## Related Files

- [PARSER_README.md](PARSER_README.md) - Python parser documentation
- [sales_parser.py](sales_parser.py) - Data extraction script (if included)

## License

MIT
