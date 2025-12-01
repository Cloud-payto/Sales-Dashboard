# Sales Dashboard UI Architecture Design Document

**Project**: Sales Dashboard Enhanced Features
**Date**: December 1, 2025
**Version**: 1.0
**Designer**: UI Architecture Team

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Feature 1: Enhanced Navbar with Dropdowns](#feature-1-enhanced-navbar-with-dropdowns)
3. [Feature 2: Territory Map Feature](#feature-2-territory-map-feature)
4. [Component Hierarchy](#component-hierarchy)
5. [TypeScript Interfaces](#typescript-interfaces)
6. [File Structure](#file-structure)
7. [Implementation Guidelines](#implementation-guidelines)

---

## Executive Summary

This document outlines the UI architecture for two major enhancements to the Sales Dashboard application:

1. **Enhanced Navigation System**: A sophisticated dropdown-based filtering system integrated into the navbar
2. **Territory Map Feature**: Google Maps integration for visualizing account locations and territory management

Both features follow the existing design system (blue/gray theme, Tailwind CSS) and prioritize rapid development through component reusability and standard patterns.

---

## Feature 1: Enhanced Navbar with Dropdowns

### Visual Layout Description

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Sales Dashboard                          [Data View ▼] [Filters ▼] │
│         YOY Analytics                              Dashboard      SR        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Detailed Layout Breakdown**:

**Left Section** (unchanged):
- Logo with gradient blue background (40x40px)
- Company name and tagline

**Center Section** (new):
- **Data View Dropdown**: Primary navigation control
  - Default state: Shows current view ("Dashboard", "Territory Map", etc.)
  - Dropdown menu reveals 4 options with icons
  - Active state has blue background

**Right Section** (enhanced):
- **Filters Button**: Opens filter panel/modal
  - Icon with badge showing active filter count
  - Hover state reveals tooltip "Active Filters"
- User avatar (existing)

### Navbar Component Structure

#### Enhanced Header Component
The Header will be split into logical sub-components:

```
Header.tsx (Container)
├── Logo.tsx (Reusable branding)
├── DataViewDropdown.tsx (Primary navigation)
├── FilterPanel.tsx (Filter controls)
└── UserMenu.tsx (User avatar/settings)
```

### DataViewDropdown Wireframe

```
┌──────────────────────┐
│ ▼ Dashboard          │ ← Trigger Button (shows current view)
└──────────────────────┘
        │
        ▼ (On Click)
┌──────────────────────────────────┐
│ 📊 Full Dataset                  │ ← Option 1
│ 📈 Territory Overview            │ ← Option 2
│ 🏢 All Accounts                  │ ← Option 3
│ 🗺️  Territory Map       [New]    │ ← Option 4 (with badge)
└──────────────────────────────────┘
```

**Interaction Pattern**:
- Click trigger to toggle dropdown
- Click outside to close
- Keyboard navigation (Arrow keys, Enter, Esc)
- Smooth slide-down animation (200ms ease-out)
- Selected option shows checkmark icon
- Changes route on selection

### FilterPanel Design

**Desktop Layout** (Slide-in panel from right):
```
┌─────────────────────────────────────┐
│  Filters                        ✕   │
│─────────────────────────────────────│
│                                     │
│  Accounts                       ▼   │ ← Accordion section
│  ├─ Sort by Sales (High to Low)    │
│  ├─ Sort by Change %               │
│  ├─ Filter by City                 │
│  └─ Account Status                 │
│                                     │
│  Brands                         ▼   │
│  ├─ Sort by Units                  │
│  ├─ Sort by Account Count          │
│  └─ Filter by Color Group          │
│                                     │
│  Time Period                    ▼   │
│  ├─ Current Year                   │
│  └─ Previous Year Comparison       │
│                                     │
│  Territory                      ▼   │
│  ├─ North Phoenix                  │
│  ├─ Scottsdale                     │
│  ├─ Tempe                          │
│  └─ Mesa                           │
│                                     │
│  [Clear All]    [Apply Filters]    │
└─────────────────────────────────────┘
```

**Mobile Layout** (Bottom sheet):
```
┌─────────────────────┐
│    ━━━━━━━━         │ ← Drag handle
│                     │
│  Filters            │
│                     │
│  [Same content as   │
│   desktop but       │
│   scrollable]       │
│                     │
└─────────────────────┘
```

### Filter Components Breakdown

#### 1. Accounts Filter
```typescript
Options:
- Sort by Sales: High to Low, Low to High
- Sort by Change %: Biggest Gain, Biggest Loss
- Filter by City: [Dropdown with all cities]
- Account Status: New, Reactivated, Lost, Active
```

#### 2. Brands Filter
```typescript
Options:
- Sort by Units: High to Low, Low to High
- Sort by Account Count: Most Accounts, Fewest Accounts
- Filter by Color Group: [Dropdown with color groups]
```

#### 3. Time Period Filter
```typescript
Options:
- View: Current Year, Previous Year, Both (Comparison)
- Date Range: Custom date picker (future enhancement)
```

#### 4. Territory Zone Filter
```typescript
Options:
- All Territories
- North Phoenix
- Scottsdale
- Tempe
- Mesa
- Custom Zone (future)
```

### Tailwind Styling Approach

**Color Palette** (extending existing theme):
```css
/* Primary Actions */
bg-blue-600, hover:bg-blue-700
text-blue-600, text-blue-700

/* Backgrounds */
bg-white (cards/dropdowns)
bg-gray-50 (page background)
bg-gray-100 (hover states)

/* Borders */
border-gray-200 (dividers)
border-blue-500 (active states)

/* Text */
text-gray-900 (headings)
text-gray-600 (body)
text-gray-500 (secondary)

/* States */
ring-2 ring-blue-500 (focus)
shadow-lg (dropdowns)
backdrop-blur-sm (overlays)
```

**Component Classes**:
```typescript
// Dropdown Trigger
"flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300
 bg-white hover:bg-gray-50 transition-all duration-200 text-sm font-medium"

// Dropdown Menu
"absolute top-full mt-2 w-56 bg-white rounded-lg shadow-lg border
 border-gray-200 py-1 z-50 animate-slideDown"

// Dropdown Item
"flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"

// Filter Panel
"fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50
 transform transition-transform duration-300"

// Badge (active filters)
"absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs
 rounded-full flex items-center justify-center font-semibold"
```

### Animation Specifications

```css
/* Tailwind Config Extension */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Usage */
.animate-slideDown {
  animation: slideDown 200ms ease-out;
}

.animate-slideInRight {
  animation: slideInRight 300ms ease-out;
}
```

### Responsive Breakpoints

```typescript
// Mobile: < 640px
- Stack navigation vertically
- Bottom sheet for filters
- Full-width dropdowns

// Tablet: 640px - 1024px
- Horizontal nav with compact spacing
- Slide-in filter panel (narrower)
- Icon-only view option

// Desktop: > 1024px
- Full horizontal layout
- Side panel filters (384px wide)
- All labels visible
```

---

## Feature 2: Territory Map Feature

### Component Architecture Overview

```
TerritoryMapPage (Route: /map)
│
├── TerritoryMap.tsx (Main container)
│   ├── GoogleMap (Google Maps wrapper)
│   ├── MarkerCluster (Performance optimization)
│   └── InfoWindow (Account details popup)
│
├── MapControls.tsx (Left panel)
│   ├── ZoneFilter.tsx
│   ├── AccountTypeFilter.tsx
│   ├── RouteOptimizer.tsx
│   └── MapLegend.tsx
│
└── TerritoryContext.tsx (State management)
```

### Map Layout Wireframe

**Desktop View**:
```
┌────────────────────────────────────────────────────────────────┐
│ Header (unchanged)                                             │
├────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐                                               │
│ │ MAP CONTROLS │  ┌──────────────────────────────────────┐    │
│ │              │  │                                       │    │
│ │ Zone Filter  │  │                                       │    │
│ │ [North PHX ▼]│  │          GOOGLE MAP                  │    │
│ │              │  │                                       │    │
│ │ Account Type │  │    📍 📍    📍                        │    │
│ │ ☑ Active     │  │        📍                            │    │
│ │ ☐ Cold Call  │  │  📍         📍                       │    │
│ │ ☐ Lost       │  │              📍                      │    │
│ │              │  │                                       │    │
│ │ [🗺️ Routes]  │  │                                       │    │
│ │              │  │                                       │    │
│ │ LEGEND       │  │                                       │    │
│ │ 🟢 Active    │  └──────────────────────────────────────┘    │
│ │ 🔵 Cold Call │                                               │
│ │ 🔴 Lost      │  [Stats Bar: 45 accounts shown]             │
│ └──────────────┘                                               │
└────────────────────────────────────────────────────────────────┘
```

**Mobile View**:
```
┌─────────────────────┐
│ Header              │
├─────────────────────┤
│                     │
│   GOOGLE MAP        │
│                     │
│  📍 📍    📍        │
│     📍              │
│ 📍      📍          │
│                     │
│                     │
└─────────────────────┘
  [Filter] [Route] ← Floating action buttons
```

### TerritoryMap.tsx Component Design

```typescript
// Main Map Container
<div className="relative h-[calc(100vh-64px)]">
  {/* Map Controls - Left Panel */}
  <MapControls
    onZoneChange={handleZoneChange}
    onAccountTypeChange={handleAccountTypeChange}
    onRouteOptimize={handleRouteOptimize}
  />

  {/* Google Map */}
  <GoogleMapReact
    bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
    defaultCenter={{ lat: 33.4484, lng: -112.0740 }} // Phoenix
    defaultZoom={11}
    options={mapOptions}
  >
    {filteredAccounts.map(account => (
      <MapMarker
        key={account.id}
        lat={account.latitude}
        lng={account.longitude}
        account={account}
        onClick={() => setSelectedAccount(account)}
      />
    ))}
  </GoogleMapReact>

  {/* Info Window */}
  {selectedAccount && (
    <AccountInfoWindow
      account={selectedAccount}
      onClose={() => setSelectedAccount(null)}
    />
  )}

  {/* Stats Bar */}
  <MapStats accounts={filteredAccounts} />
</div>
```

### MapControls.tsx Panel Design

**Visual Structure**:
```
┌──────────────────────┐
│ Territory Controls   │
├──────────────────────┤
│                      │
│ 📍 Zone Selection    │
│ ┌──────────────────┐ │
│ │ All Territories ▼│ │
│ └──────────────────┘ │
│                      │
│ 🏢 Account Filters   │
│ ☑ Active (124)      │
│ ☑ Cold Call (45)    │
│ ☐ Lost (23)         │
│                      │
│ ────────────────────│
│                      │
│ 🗺️ Route Planning   │
│ [Optimize Route]    │
│                      │
│ Selected: 3 stops   │
│ Distance: 12.4 mi   │
│                      │
│ ────────────────────│
│                      │
│ 📊 Quick Stats       │
│ Total Sales: $234K  │
│ Avg/Account: $1.9K  │
│                      │
│ LEGEND              │
│ 🟢 Active           │
│ 🔵 Cold Call        │
│ 🔴 Lost             │
│ ⚪ New              │
│                      │
└──────────────────────┘
```

### Map Marker Design

**Marker Component Structure**:
```typescript
// Custom SVG Markers (color-coded)
const MarkerIcon = ({ status, selected }) => (
  <div className={`
    relative transform transition-all duration-200
    ${selected ? 'scale-125 z-50' : 'scale-100'}
  `}>
    {/* Outer Ring (selected state) */}
    {selected && (
      <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping" />
    )}

    {/* Main Marker */}
    <div className={`
      w-10 h-10 rounded-full border-3 border-white shadow-lg
      flex items-center justify-center cursor-pointer
      ${getStatusColor(status)}
    `}>
      <Building2 className="w-5 h-5 text-white" />
    </div>

    {/* Sales Amount Label */}
    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2
                    bg-white px-2 py-0.5 rounded shadow text-xs font-semibold">
      ${formatSales(account.sales)}
    </div>
  </div>
);

// Status Colors
function getStatusColor(status) {
  switch(status) {
    case 'active': return 'bg-green-500';
    case 'cold_call': return 'bg-blue-500';
    case 'lost': return 'bg-red-500';
    case 'new': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
}
```

**Marker Clustering**:
```typescript
// When zoomed out, cluster nearby markers
<MarkerClusterer
  averageCenter
  enableRetinaIcons
  gridSize={60}
  styles={[
    {
      textColor: 'white',
      url: '/cluster-icon.svg',
      height: 50,
      width: 50
    }
  ]}
>
  {markers}
</MarkerClusterer>
```

### AccountInfoWindow Component

**Popup Design**:
```
┌─────────────────────────────┐
│ ABC Optical Supply      ✕   │
├─────────────────────────────┤
│ 📍 1234 Main St            │
│    Phoenix, AZ 85001       │
│                            │
│ 💰 Sales                   │
│    Current: $12,450        │
│    Previous: $10,200       │
│    Change: +22.1% 🔼       │
│                            │
│ 📊 Top Brands              │
│    • Brand A (145 units)   │
│    • Brand B (89 units)    │
│                            │
│ [View Details] [Get Route] │
└─────────────────────────────┘
```

**Styling**:
```typescript
className="absolute bg-white rounded-lg shadow-2xl border border-gray-200
           w-80 p-4 z-50 animate-fadeIn"

// Position: Above marker with arrow pointer
style={{
  bottom: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginBottom: '12px'
}}
```

### Route Optimization Feature

**Route Planning Interface**:
```typescript
// User Flow:
1. Click "Start Route" button
2. Click markers to add waypoints (shows order numbers)
3. Click "Optimize" to reorder for shortest path
4. Export to Google Maps navigation

// Visual Feedback:
- Selected markers show numbered badges (1, 2, 3...)
- Route polyline drawn between markers (blue stroke)
- Total distance and estimated time displayed
- Waypoint list with drag-to-reorder
```

**RouteOptimizer Component**:
```
┌──────────────────────┐
│ Route Planning       │
├──────────────────────┤
│ 📍 Waypoints         │
│                      │
│ 1. ⋮⋮ ABC Optical   │ ← Drag handle
│ 2. ⋮⋮ XYZ Vision    │
│ 3. ⋮⋮ LensCrafters  │
│                      │
│ Total: 12.4 miles   │
│ Est. Time: 28 min   │
│                      │
│ [Optimize Route]    │
│ [Export to Maps]    │
│ [Clear Route]       │
└──────────────────────┘
```

### Map Configuration Options

```typescript
const mapOptions = {
  // Styling
  styles: [
    // Custom map style (light gray, minimal labels)
    // Can use Snazzy Maps or custom JSON
  ],

  // Controls
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,

  // Interaction
  gestureHandling: 'greedy', // Allows scroll zoom without Ctrl
  clickableIcons: false, // Disable POI clicks

  // Boundaries
  restriction: {
    latLngBounds: {
      north: 33.9, south: 33.0,
      east: -111.5, west: -112.5
    }, // Restrict to Phoenix metro area
    strictBounds: false
  }
};
```

---

## Component Hierarchy

### Overall Application Structure

```
App.tsx
├── DashboardProvider
├── TerritoryProvider (NEW)
└── Router
    ├── Header (Enhanced)
    │   ├── Logo
    │   ├── DataViewDropdown (NEW)
    │   ├── FilterPanel (NEW)
    │   └── UserMenu
    │
    └── Routes
        ├── HomePage
        ├── DashboardPage (with filters applied)
        ├── TerritoryMapPage (NEW)
        ├── UploadPage
        └── AboutPage
```

### New Component Tree

```
src/
├── components/
│   ├── navigation/
│   │   ├── Header.tsx (Enhanced)
│   │   ├── Logo.tsx (Extracted)
│   │   ├── DataViewDropdown.tsx (NEW)
│   │   ├── FilterPanel.tsx (NEW)
│   │   └── UserMenu.tsx (NEW)
│   │
│   ├── map/
│   │   ├── TerritoryMap.tsx (NEW)
│   │   ├── MapControls.tsx (NEW)
│   │   ├── MapMarker.tsx (NEW)
│   │   ├── AccountInfoWindow.tsx (NEW)
│   │   ├── RouteOptimizer.tsx (NEW)
│   │   ├── MapLegend.tsx (NEW)
│   │   └── MapStats.tsx (NEW)
│   │
│   └── shared/
│       ├── Dropdown.tsx (Reusable)
│       ├── Checkbox.tsx (Reusable)
│       ├── Badge.tsx (Reusable)
│       └── FilterButton.tsx (Reusable)
│
├── contexts/
│   ├── DashboardContext.tsx (Existing)
│   ├── TerritoryContext.tsx (NEW)
│   └── FilterContext.tsx (NEW)
│
├── pages/
│   └── TerritoryMapPage.tsx (NEW)
│
├── hooks/
│   ├── useFilters.ts (NEW)
│   ├── useGeocoding.ts (NEW)
│   └── useRouteOptimization.ts (NEW)
│
└── utils/
    ├── geocoding.ts (NEW)
    ├── mapHelpers.ts (NEW)
    └── routeCalculation.ts (NEW)
```

---

## TypeScript Interfaces

### Filter System Types

```typescript
// src/types/filters.ts

export type DataView = 'full' | 'territory_overview' | 'all_accounts' | 'territory_map';

export type AccountSortOption =
  | 'sales_high'
  | 'sales_low'
  | 'change_gain'
  | 'change_loss'
  | 'city_asc'
  | 'city_desc';

export type AccountStatusFilter = 'new' | 'reactivated' | 'lost' | 'active' | 'all';

export type BrandSortOption =
  | 'units_high'
  | 'units_low'
  | 'accounts_high'
  | 'accounts_low';

export type TimePeriod = 'current' | 'previous' | 'comparison';

export interface FilterState {
  // Account Filters
  accountSort: AccountSortOption;
  accountStatus: AccountStatusFilter[];
  selectedCities: string[];

  // Brand Filters
  brandSort: BrandSortOption;
  selectedColorGroups: string[];

  // Time Period
  timePeriod: TimePeriod;

  // Territory
  selectedZones: string[];
}

export interface FilterContextType {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}
```

### Territory & Map Types

```typescript
// src/types/territory.ts

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  zip?: string;
  formatted?: string;
}

export interface Territory {
  id: string;
  name: string;
  description?: string;
  color: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  zones: string[];
}

export interface AccountLocation extends Account {
  location: Coordinates;
  address: Address;
  status: 'active' | 'cold_call' | 'lost' | 'new';
  lastVisit?: string;
  nextVisit?: string;
}

export interface MapMarker {
  id: string;
  position: Coordinates;
  account: AccountLocation;
  color: string;
  label?: string;
}

export interface RouteWaypoint {
  id: string;
  position: Coordinates;
  account: AccountLocation;
  order: number;
}

export interface Route {
  id: string;
  name: string;
  waypoints: RouteWaypoint[];
  totalDistance: number; // miles
  estimatedTime: number; // minutes
  createdAt: string;
  optimized: boolean;
}

export interface TerritoryContextType {
  // Territories
  territories: Territory[];
  selectedTerritory: Territory | null;
  setSelectedTerritory: (territory: Territory | null) => void;

  // Account Locations
  accountLocations: AccountLocation[];
  isGeocoding: boolean;
  geocodingProgress: number;

  // Map State
  selectedMarkers: MapMarker[];
  toggleMarkerSelection: (marker: MapMarker) => void;
  clearSelection: () => void;

  // Routes
  routes: Route[];
  currentRoute: Route | null;
  createRoute: (waypoints: RouteWaypoint[]) => void;
  optimizeRoute: (routeId: string) => Promise<Route>;
  deleteRoute: (routeId: string) => void;

  // Geocoding Cache
  geocodeAccount: (account: Account) => Promise<Coordinates>;
  cacheGeocodedLocations: (locations: Record<number, Coordinates>) => void;
}
```

### Map Configuration Types

```typescript
// src/types/map.ts

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewport {
  center: Coordinates;
  zoom: number;
  bounds?: MapBounds;
}

export interface MapStyle {
  featureType: string;
  elementType: string;
  stylers: Array<{ [key: string]: any }>;
}

export interface MarkerClusterStyle {
  url: string;
  height: number;
  width: number;
  textColor: string;
  textSize: number;
}

export interface MapOptions {
  center: Coordinates;
  zoom: number;
  styles?: MapStyle[];
  gestureHandling?: 'greedy' | 'cooperative' | 'none';
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
}
```

---

## File Structure

### Recommended Directory Organization

```
src/
├── components/
│   ├── navigation/
│   │   ├── Header.tsx                    # Enhanced main header
│   │   ├── Logo.tsx                      # Extracted logo component
│   │   ├── DataViewDropdown.tsx          # Primary nav dropdown
│   │   ├── FilterPanel.tsx               # Filter slide-in panel
│   │   ├── FilterSection.tsx             # Reusable accordion section
│   │   └── UserMenu.tsx                  # User avatar dropdown
│   │
│   ├── map/
│   │   ├── TerritoryMap.tsx              # Main map container
│   │   ├── GoogleMapWrapper.tsx          # Google Maps React wrapper
│   │   ├── MapControls.tsx               # Left control panel
│   │   ├── MapMarker.tsx                 # Custom marker component
│   │   ├── MarkerCluster.tsx             # Clustering wrapper
│   │   ├── AccountInfoWindow.tsx         # Marker popup
│   │   ├── RouteOptimizer.tsx            # Route planning UI
│   │   ├── WaypointList.tsx              # Draggable waypoint list
│   │   ├── MapLegend.tsx                 # Map legend
│   │   ├── MapStats.tsx                  # Stats bar component
│   │   └── ZoneFilter.tsx                # Territory zone selector
│   │
│   ├── filters/
│   │   ├── AccountsFilter.tsx            # Account-specific filters
│   │   ├── BrandsFilter.tsx              # Brand-specific filters
│   │   ├── TimePeriodFilter.tsx          # Time period selector
│   │   └── TerritoryZoneFilter.tsx       # Zone selector
│   │
│   └── shared/
│       ├── Dropdown.tsx                  # Reusable dropdown
│       ├── DropdownItem.tsx              # Dropdown item
│       ├── Checkbox.tsx                  # Styled checkbox
│       ├── Badge.tsx                     # Count/status badge
│       ├── FilterButton.tsx              # Filter trigger button
│       ├── Accordion.tsx                 # Accordion container
│       ├── AccordionItem.tsx             # Accordion section
│       └── Modal.tsx                     # Base modal component
│
├── contexts/
│   ├── DashboardContext.tsx              # Existing
│   ├── TerritoryContext.tsx              # Territory state
│   └── FilterContext.tsx                 # Filter state
│
├── pages/
│   ├── HomePage.tsx                      # Existing
│   ├── DashboardPage.tsx                 # Existing (+ filter integration)
│   ├── TerritoryMapPage.tsx              # New map page
│   ├── UploadPage.tsx                    # Existing
│   └── AboutPage.tsx                     # Existing
│
├── hooks/
│   ├── useFilters.ts                     # Filter hook
│   ├── useGeocoding.ts                   # Geocoding hook
│   ├── useRouteOptimization.ts           # Route calculation
│   ├── useMapMarkers.ts                  # Marker management
│   └── useLocalStorage.ts                # localStorage helper
│
├── utils/
│   ├── geocoding.ts                      # Geocoding utilities
│   ├── mapHelpers.ts                     # Map calculations
│   ├── routeCalculation.ts               # Route optimization
│   ├── filterHelpers.ts                  # Filter logic
│   └── formatters.ts                     # Data formatters
│
├── types/
│   ├── index.ts                          # Existing types
│   ├── filters.ts                        # Filter types
│   ├── territory.ts                      # Territory types
│   └── map.ts                            # Map types
│
└── constants/
    ├── territories.ts                    # Territory definitions
    ├── mapStyles.ts                      # Map styling JSON
    └── filterOptions.ts                  # Filter dropdown options
```

### New Files to Create

1. **Navigation Components** (7 files):
   - `/src/components/navigation/DataViewDropdown.tsx`
   - `/src/components/navigation/FilterPanel.tsx`
   - `/src/components/navigation/FilterSection.tsx`
   - `/src/components/navigation/Logo.tsx`
   - `/src/components/navigation/UserMenu.tsx`
   - Enhanced `/src/components/navigation/Header.tsx`

2. **Map Components** (11 files):
   - `/src/components/map/TerritoryMap.tsx`
   - `/src/components/map/GoogleMapWrapper.tsx`
   - `/src/components/map/MapControls.tsx`
   - `/src/components/map/MapMarker.tsx`
   - `/src/components/map/MarkerCluster.tsx`
   - `/src/components/map/AccountInfoWindow.tsx`
   - `/src/components/map/RouteOptimizer.tsx`
   - `/src/components/map/WaypointList.tsx`
   - `/src/components/map/MapLegend.tsx`
   - `/src/components/map/MapStats.tsx`
   - `/src/components/map/ZoneFilter.tsx`

3. **Shared Components** (8 files):
   - `/src/components/shared/Dropdown.tsx`
   - `/src/components/shared/DropdownItem.tsx`
   - `/src/components/shared/Checkbox.tsx`
   - `/src/components/shared/Badge.tsx`
   - `/src/components/shared/FilterButton.tsx`
   - `/src/components/shared/Accordion.tsx`
   - `/src/components/shared/AccordionItem.tsx`
   - `/src/components/shared/Modal.tsx`

4. **Context Files** (2 files):
   - `/src/contexts/TerritoryContext.tsx`
   - `/src/contexts/FilterContext.tsx`

5. **Type Files** (3 files):
   - `/src/types/filters.ts`
   - `/src/types/territory.ts`
   - `/src/types/map.ts`

6. **Utility Files** (5 files):
   - `/src/utils/geocoding.ts`
   - `/src/utils/mapHelpers.ts`
   - `/src/utils/routeCalculation.ts`
   - `/src/utils/filterHelpers.ts`
   - `/src/hooks/useFilters.ts`
   - `/src/hooks/useGeocoding.ts`
   - `/src/hooks/useRouteOptimization.ts`

7. **Page Files** (1 file):
   - `/src/pages/TerritoryMapPage.tsx`

8. **Constants** (3 files):
   - `/src/constants/territories.ts`
   - `/src/constants/mapStyles.ts`
   - `/src/constants/filterOptions.ts`

**Total**: 40 new/modified files

---

## Implementation Guidelines

### Phase 1: Enhanced Navbar (Priority: High)

**Week 1 Goals**:
1. Create shared Dropdown component (reusable)
2. Build DataViewDropdown with routing
3. Extract Logo component
4. Create FilterButton with badge

**Week 2 Goals**:
1. Build FilterPanel with slide-in animation
2. Create FilterContext for state management
3. Build filter sections (Accounts, Brands, Time, Territory)
4. Connect filters to DashboardPage

**Technical Requirements**:
- Use Radix UI for accessible dropdowns
- Implement click-outside detection with `useOnClickOutside` hook
- Use Framer Motion for smooth animations
- Store filter state in localStorage for persistence

### Phase 2: Territory Map Feature (Priority: Medium)

**Week 3 Goals**:
1. Set up Google Maps API integration
2. Create TerritoryContext for state
3. Build basic TerritoryMap component
4. Implement geocoding utility

**Week 4 Goals**:
1. Create MapMarker with status colors
2. Build AccountInfoWindow popup
3. Implement MapControls panel
4. Add marker clustering

**Week 5 Goals**:
1. Build RouteOptimizer component
2. Implement route calculation algorithm
3. Add waypoint drag-and-drop
4. Export to Google Maps feature

**Week 6 Goals**:
1. Polish animations and interactions
2. Mobile responsive optimization
3. Performance testing (1000+ markers)
4. Documentation

**Technical Requirements**:
- Use `google-map-react` library
- Implement marker clustering for performance
- Cache geocoded addresses in localStorage
- Use Web Workers for route optimization
- Lazy load map page for faster initial load

### Development Best Practices

#### 1. Component Design Patterns

```typescript
// Always use proper TypeScript typing
interface ComponentProps {
  data: SomeType;
  onAction: (id: string) => void;
  className?: string;
}

// Use React.FC or explicit return type
const Component: React.FC<ComponentProps> = ({ data, onAction, className }) => {
  // Component logic
};

// Or
const Component = ({ data, onAction, className }: ComponentProps): JSX.Element => {
  // Component logic
};
```

#### 2. State Management Pattern

```typescript
// Context structure
interface ContextState {
  data: SomeType[];
  isLoading: boolean;
  error: string | null;
}

interface ContextActions {
  updateData: (data: SomeType[]) => void;
  clearData: () => void;
}

type ContextType = ContextState & ContextActions;

// Hook usage
const useCustomContext = () => {
  const context = useContext(CustomContext);
  if (!context) {
    throw new Error('useCustomContext must be used within CustomProvider');
  }
  return context;
};
```

#### 3. Tailwind Class Organization

```typescript
// Use template literals for conditional classes
const buttonClasses = `
  px-4 py-2 rounded-lg
  text-sm font-medium
  transition-all duration-200
  ${variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-white text-gray-700 hover:bg-gray-50'
  }
  ${isDisabled && 'opacity-50 cursor-not-allowed'}
`;

// Or use clsx/classnames library
import clsx from 'clsx';

const buttonClasses = clsx(
  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
  {
    'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
    'bg-white text-gray-700 hover:bg-gray-50': variant === 'secondary',
    'opacity-50 cursor-not-allowed': isDisabled
  }
);
```

#### 4. Performance Optimization

```typescript
// Memoize expensive calculations
const filteredData = useMemo(() => {
  return data.filter(item => filters.includes(item.type));
}, [data, filters]);

// Memoize callback functions
const handleClick = useCallback((id: string) => {
  // Handle click
}, []);

// Lazy load heavy components
const TerritoryMap = lazy(() => import('./components/map/TerritoryMap'));

// Virtual scrolling for large lists
import { FixedSizeList } from 'react-window';
```

#### 5. Accessibility Requirements

```typescript
// Keyboard navigation
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  aria-label="Descriptive label"
  tabIndex={0}
>
  Button Text
</button>

// Screen reader support
<div
  role="region"
  aria-label="Filter controls"
  aria-live="polite"
>
  {filterCount} filters active
</div>

// Focus management
import { useFocusTrap } from '@/hooks/useFocusTrap';

const Modal = () => {
  const trapRef = useFocusTrap();

  return (
    <div ref={trapRef} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  );
};
```

### Testing Strategy

#### Unit Tests
```typescript
// Test filter logic
describe('filterHelpers', () => {
  test('filters accounts by status', () => {
    const accounts = [...];
    const filtered = filterByStatus(accounts, 'new');
    expect(filtered).toHaveLength(expectedCount);
  });
});

// Test geocoding
describe('geocoding', () => {
  test('geocodes address correctly', async () => {
    const coords = await geocodeAddress('123 Main St, Phoenix, AZ');
    expect(coords).toHaveProperty('latitude');
    expect(coords).toHaveProperty('longitude');
  });
});
```

#### Integration Tests
```typescript
// Test filter panel interactions
describe('FilterPanel', () => {
  test('applies filters and updates dashboard', async () => {
    render(<App />);

    fireEvent.click(screen.getByText('Filters'));
    fireEvent.click(screen.getByText('Active Accounts'));
    fireEvent.click(screen.getByText('Apply Filters'));

    await waitFor(() => {
      expect(screen.getByText(/45 accounts/i)).toBeInTheDocument();
    });
  });
});
```

### Package Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.294.0",

    // NEW: Map integration
    "google-map-react": "^2.2.1",
    "@googlemaps/js-api-loader": "^1.16.2",

    // NEW: UI libraries
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-checkbox": "^1.0.4",

    // NEW: Utilities
    "clsx": "^2.0.0",
    "framer-motion": "^10.16.16",
    "react-window": "^1.8.10",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/google-map-react": "^2.1.10",
    "@types/react-window": "^1.8.8"
  }
}
```

### Environment Variables

```bash
# .env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Google Maps API Required APIs:
# - Maps JavaScript API
# - Geocoding API
# - Directions API (for route optimization)
```

### API Key Setup

1. Go to Google Cloud Console
2. Create new project or select existing
3. Enable required APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
4. Create API key with restrictions:
   - HTTP referrers (websites): `localhost:*`, `yourdomain.com/*`
   - API restrictions: Only selected APIs

---

## Quick Start Implementation Checklist

### Week 1: Foundation
- [ ] Install new dependencies (`npm install`)
- [ ] Create type files (filters.ts, territory.ts, map.ts)
- [ ] Set up FilterContext with basic state
- [ ] Create shared Dropdown component
- [ ] Build DataViewDropdown
- [ ] Extract Logo component

### Week 2: Filter System
- [ ] Create FilterPanel component
- [ ] Build filter sections (Accounts, Brands, Time, Territory)
- [ ] Connect FilterContext to DashboardPage
- [ ] Add localStorage persistence
- [ ] Test filter combinations

### Week 3: Map Setup
- [ ] Get Google Maps API key
- [ ] Install map dependencies
- [ ] Create TerritoryContext
- [ ] Build basic TerritoryMap component
- [ ] Test map rendering

### Week 4: Map Features
- [ ] Implement geocoding utility
- [ ] Create MapMarker component
- [ ] Build AccountInfoWindow
- [ ] Add MapControls panel
- [ ] Implement marker clustering

### Week 5: Route Planning
- [ ] Create RouteOptimizer component
- [ ] Build WaypointList with drag-drop
- [ ] Implement route calculation
- [ ] Add export to Google Maps
- [ ] Test route optimization

### Week 6: Polish
- [ ] Responsive design testing
- [ ] Animation polish
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Documentation

---

## Design Assets Needed

### Icons (Lucide React)
```typescript
// Navigation
import { BarChart3, Home, Upload, Info, Map, Filter } from 'lucide-react';

// Map
import { MapPin, Navigation, Route, Building2, CircleDot } from 'lucide-react';

// Filters
import { ChevronDown, Check, X, Settings2 } from 'lucide-react';

// Actions
import { Plus, Minus, Trash2, Edit, Save } from 'lucide-react';
```

### Color Tokens
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Primary blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        status: {
          active: '#10b981',    // Green
          cold: '#3b82f6',      // Blue
          lost: '#ef4444',      // Red
          new: '#8b5cf6',       // Purple
        }
      }
    }
  }
}
```

---

## Mobile Responsive Breakpoints

### Navbar Breakpoints
```typescript
// Mobile (< 640px)
- Hamburger menu icon
- Full-screen filter modal
- Stacked logo and controls

// Tablet (640px - 1024px)
- Horizontal nav with compact spacing
- Slide-in filter panel (280px)
- Icon + text labels

// Desktop (> 1024px)
- Full horizontal layout
- Side filter panel (384px)
- All features visible
```

### Map Breakpoints
```typescript
// Mobile (< 640px)
- Full-screen map
- Floating action buttons
- Bottom sheet controls
- Touch-optimized markers

// Tablet (640px - 1024px)
- Map with compact controls
- Slide-in panel (240px)
- Optimized info windows

// Desktop (> 1024px)
- Map with full controls (280px panel)
- Desktop info windows
- Keyboard shortcuts enabled
```

---

## Performance Targets

### Initial Load
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Bundle size: < 500KB (gzipped)

### Map Performance
- Marker rendering: < 100ms for 1000 markers
- Cluster recalculation: < 50ms on zoom
- Route optimization: < 2s for 20 waypoints

### Filter Performance
- Filter application: < 200ms
- UI response: < 16ms (60fps)
- Debounced search: 300ms delay

---

## Accessibility Standards

### WCAG 2.1 AA Compliance
- Minimum contrast ratio: 4.5:1 for text
- Focus indicators visible on all interactive elements
- Keyboard navigation for all features
- Screen reader support with ARIA labels
- Skip links for navigation
- Form labels and error messages

### Keyboard Shortcuts
```typescript
// Navigation
- Tab: Move focus forward
- Shift + Tab: Move focus backward
- Enter: Activate focused element
- Escape: Close dropdowns/modals

// Map
- Arrow keys: Pan map
- +/-: Zoom in/out
- Space: Toggle marker selection
- Delete: Remove waypoint
```

---

## Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: iOS 13+
- Chrome Android: Last 2 versions

---

## Deployment Checklist

- [ ] Google Maps API key configured
- [ ] Environment variables set
- [ ] Build optimization (code splitting)
- [ ] Image optimization
- [ ] Service worker for offline (future)
- [ ] Error boundary implementation
- [ ] Analytics integration
- [ ] Performance monitoring

---

## Future Enhancements (Post-MVP)

1. **Advanced Filters**
   - Multi-select with AND/OR logic
   - Saved filter presets
   - Quick filter chips

2. **Map Features**
   - Heat map overlay for sales density
   - Drawing tools for custom territories
   - Historical route tracking
   - Multi-day route planning

3. **Analytics**
   - Filter usage tracking
   - Most viewed accounts
   - Route efficiency metrics

4. **Collaboration**
   - Shared routes with team
   - Territory assignments
   - Visit scheduling

---

## Support & Documentation

### Developer Resources
- Component Storybook (to be created)
- API documentation (JSDoc)
- Example usage for each component
- Troubleshooting guide

### End User Guide
- Filter tutorial overlay
- Map interaction guide
- Video walkthrough
- FAQ section

---

**Document Version**: 1.0
**Last Updated**: December 1, 2025
**Next Review**: Post-implementation

**Contact**: UI Architecture Team
**Questions**: See issue tracker or team Slack channel
