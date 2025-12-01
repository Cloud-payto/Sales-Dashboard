# Codebase Organization Guide

This document explains how the Sales Dashboard codebase is organized and where to find different components.

## Directory Structure

```
sales_dashboard/
├── frontend/                    # React/TypeScript application
├── backend/                     # Python Flask API & parsers
├── google/                      # Google API integrations
├── documents/                   # All documentation
├── data/                        # Data files (input & output)
├── .claude/                     # Claude Code settings
├── .git/                        # Git repository
├── .gitignore                   # Git ignore rules
└── README.md                    # Project overview
```

---

## Frontend (`/frontend`)

The React/TypeScript web application built with Vite and Tailwind CSS.

### Structure

```
frontend/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── map/                 # Map-specific components
│   │   │   ├── TerritoryMap.tsx
│   │   │   ├── MapControls.tsx
│   │   │   ├── RoutePanel.tsx
│   │   │   └── AccountMarkerInfo.tsx
│   │   ├── AccountDetailModal.tsx
│   │   ├── AccountsPerBrand.tsx
│   │   ├── AccountsTable.tsx
│   │   ├── AllAccountsView.tsx
│   │   ├── BrandPerformance.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── FrameDetailModal.tsx
│   │   ├── Header.tsx
│   │   ├── InsightsPanel.tsx
│   │   ├── MetricCard.tsx
│   │   ├── SalesPerWorkingDay.tsx
│   │   └── TrafficChart.tsx
│   │
│   ├── pages/                   # Page-level components
│   │   ├── AboutPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── TerritoryMapPage.tsx
│   │   └── UploadPage.tsx
│   │
│   ├── contexts/                # React Context providers
│   │   ├── DashboardContext.tsx
│   │   ├── FilterContext.tsx
│   │   └── TerritoryContext.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useGoogleMaps.ts
│   │
│   ├── constants/               # Configuration constants
│   │   ├── filterOptions.ts
│   │   ├── mapStyles.ts
│   │   └── territories.ts
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── filters.ts
│   │   ├── map.ts
│   │   ├── territory.ts
│   │   └── google-maps.d.ts
│   │
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles & Tailwind imports
│
├── node_modules/                # npm dependencies
├── package.json                 # npm configuration
├── package-lock.json            # Dependency lock file
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json           # Node TypeScript config
├── vite.config.ts               # Vite build configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── vercel.json                  # Vercel deployment config
└── index.html                   # HTML entry point
```

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app component, routing, layout |
| `src/main.tsx` | React entry point, context providers |
| `src/contexts/DashboardContext.tsx` | Dashboard state management |
| `package.json` | Dependencies and npm scripts |

### Running the Frontend

```bash
cd frontend
npm install
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

---

## Backend (`/backend`)

Python Flask API server and Excel parsing logic.

### Structure

```
backend/
├── parsers/                     # Excel parsing modules
│   ├── __init__.py
│   ├── sales_parser.py          # Core parser for single Excel files
│   └── sales_comparison_parser.py # YOY comparison parser
│
├── api/                         # API endpoint handlers
│   ├── get-account-breakdown.py
│   └── parse-sales-data.py
│
├── output/                      # API-generated outputs
│   └── latest_dashboard_data.json
│
├── api_server.py                # Flask REST API server
├── example_usage.py             # Parser usage examples
└── requirements.txt             # Python dependencies
```

### Key Files

| File | Purpose |
|------|---------|
| `api_server.py` | Flask server with REST endpoints |
| `parsers/sales_parser.py` | Core Excel data extraction |
| `parsers/sales_comparison_parser.py` | Year-over-year comparison |
| `requirements.txt` | Python package dependencies |

### Running the Backend

```bash
cd backend
pip install -r requirements.txt
python api_server.py             # Start Flask server on port 3000
```

### API Endpoints

- `GET /` - API info and available endpoints
- `POST /parse-excel` - Parse Excel and return dashboard data
- `GET /data` - Get latest parsed data
- `GET /data/summary` - Summary metrics only
- `GET /data/accounts` - Account data
- `GET /data/frames` - Frame performance
- `GET /data/brands` - Brand performance
- `GET /health` - Health check

---

## Google API Integration (`/google`)

Integration with Google Maps/Places APIs for territory mapping.

### Structure

```
google/
├── extract_place_details.py     # Extract coordinates from saved places
└── api-key.txt                  # Google API key (not in git)
```

### Usage

```bash
cd google
python extract_place_details.py
```

**Note:** The API key file is gitignored. Create `api-key.txt` with your Google API key.

---

## Documents (`/documents`)

All project documentation.

### Contents

| File | Description |
|------|-------------|
| `ORGANIZATION.md` | This file - codebase structure guide |
| `PARSER_README.md` | Python parser documentation |
| `API_DOCUMENTATION.md` | API endpoint documentation |
| `API_SETUP_COMPLETE.md` | API setup instructions |
| `DESIGN_DOCUMENT.md` | UI/UX design specifications |
| `DESIGN_SUMMARY.md` | Design overview |
| `COMPONENT_EXAMPLES.md` | React component examples |
| `IMPLEMENTATION_QUICK_START.md` | Quick start guide |
| `IMPLEMENTATION_SUMMARY.md` | Implementation overview |
| `NEW_FEATURES.md` | New feature documentation |
| `QUICK_START_NEW_FEATURES.md` | New features quick start |
| `N8N_QUICK_REFERENCE.md` | n8n workflow reference |
| `TERRITORY_MAP_README.md` | Territory map feature docs |
| `VISUAL_WIREFRAMES.md` | UI wireframes |
| `XLSX_DATA_STRUCTURE.md` | Excel file structure |
| `DATA_EXTRACTION_SUMMARY.md` | Data extraction overview |
| `README_DESIGN.md` | Design README |

---

## Data (`/data`)

All data files organized by purpose.

### Structure

```
data/
├── input/                       # Source files (Excel)
│   ├── PAM 11-20-23 to 11-19-24.xlsx
│   ├── PAM 11-20-24 to 11-19-25.xlsx
│   └── Payton YOY 8-18-24 to 8-19-25.xlsx
│
└── output/                      # Generated files
    ├── sales_dashboard_data.json
    ├── sales_comparison_data.json
    ├── brand_performance.json
    ├── declining_accounts.csv
    ├── increasing_accounts.csv
    ├── new_accounts.csv
    ├── reactivated_accounts.csv
    ├── declining_accounts_frame_details.json
    ├── modern_optical_territory.csv
    ├── places_with_coordinates.csv
    └── addresses.csv
```

### Data Flow

1. **Input**: Excel files placed in `data/input/`
2. **Processing**: Backend parsers process Excel files
3. **Output**: Generated JSON/CSV saved to `data/output/`
4. **Consumption**: Frontend reads from `data/output/` or API

---

## Configuration Files

### Root Level

| File | Purpose |
|------|---------|
| `.gitignore` | Files to exclude from git |
| `README.md` | Project overview and getting started |

### Frontend

| File | Purpose |
|------|---------|
| `package.json` | npm configuration, scripts, dependencies |
| `tsconfig.json` | TypeScript compiler options |
| `vite.config.ts` | Vite bundler configuration |
| `tailwind.config.js` | Tailwind CSS customization |
| `postcss.config.js` | PostCSS plugins |

### Backend

| File | Purpose |
|------|---------|
| `requirements.txt` | Python package dependencies |

---

## Development Workflow

### Adding a New Feature

1. **Frontend Component**: Create in `frontend/src/components/`
2. **Types**: Add TypeScript types in `frontend/src/types/`
3. **Backend Logic**: Add parser/API in `backend/`
4. **Documentation**: Update relevant docs in `documents/`

### Working with Data

1. Place Excel files in `data/input/`
2. Run parser from `backend/`
3. Output appears in `data/output/`
4. Frontend consumes via API or direct import

### Adding External Services

For new integrations (like Supabase, Firebase, etc.):
1. Create a new top-level folder (e.g., `/supabase`)
2. Add configuration and utility files there
3. Document in this file and `README.md`

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Python, Flask, Flask-CORS |
| Data Processing | Pandas, OpenPyXL, NumPy |
| Maps | Google Maps API |
| Deployment | Vercel (frontend) |

---

*Last updated: December 2024*
