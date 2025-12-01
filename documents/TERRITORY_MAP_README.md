# Territory Map Feature - Implementation Guide

## Overview

This document describes the enhanced navbar and territory map infrastructure added to the React + TypeScript + Tailwind CSS sales dashboard.

## New Features Implemented

### 1. Enhanced Navigation Bar
- **Data View Dropdown**: Allows switching between different dashboard views:
  - Full Dataset
  - Territory Overview
  - All Accounts
  - Territory Map (NEW)
- **Filter Button**: Opens slide-in filter panel with active filter count badge
- **Responsive Design**: Mobile-friendly with collapsible controls

### 2. Filter System
- **FilterContext**: Global state management for all filters with localStorage persistence
- **FilterPanel**: Slide-in panel with accordion sections for:
  - Account sorting and status filtering
  - Brand sorting and color group filtering
  - Time period selection (radio buttons)
  - Territory zone filtering (checkboxes)
- **Active Filter Count**: Visual badge showing number of active filters

### 3. Territory Map Infrastructure
- **Interactive Google Maps Integration**: Full-featured map with Phoenix Metro focus
- **Account Location Markers**: Color-coded by account status
  - Active: Green (#10b981)
  - New: Purple (#8b5cf6)
  - Reactivated: Amber (#f59e0b)
  - Lost: Red (#ef4444)
  - Cold Call: Blue (#3b82f6)
- **Smart Geocoding**:
  - Automatic address-to-coordinates conversion
  - localStorage caching to minimize API calls
  - Rate limiting (max 10 requests/second)
  - Batch processing for performance

### 4. Route Planning
- **Marker Selection**: Click markers to select multiple locations
- **Route Optimization**: Uses Google Directions API with waypoint optimization
- **Draggable Waypoints**: Reorder stops with drag-and-drop
- **Distance & Time Estimates**: Real-time calculations
- **Google Maps Integration**: "Open in Google Maps" button for turn-by-turn navigation

### 5. Map Controls
- **Territory Zone Filtering**: Filter by Phoenix Metro zones
- **Account Status Filtering**: Show/hide markers by status
- **Selected Markers Panel**: Shows count and allows bulk actions
- **Plan Route Button**: Enabled when 2+ markers selected

## File Structure

```
src/
├── components/
│   ├── Header.tsx                    (UPDATED) Enhanced with dropdowns
│   ├── FilterPanel.tsx              (NEW) Slide-in filter interface
│   └── map/
│       ├── TerritoryMap.tsx         (NEW) Main map component
│       ├── MapControls.tsx          (NEW) Filter and selection controls
│       ├── RoutePanel.tsx           (NEW) Route management UI
│       └── AccountMarkerInfo.tsx    (NEW) Marker info windows
├── contexts/
│   ├── FilterContext.tsx            (NEW) Filter state management
│   └── TerritoryContext.tsx         (NEW) Map and route state
├── hooks/
│   └── useGoogleMaps.ts             (NEW) Dynamic Maps API loading
├── pages/
│   └── TerritoryMapPage.tsx         (NEW) Full page map view
├── types/
│   ├── filters.ts                   (EXISTING) Filter type definitions
│   ├── territory.ts                 (EXISTING) Location & route types
│   ├── map.ts                       (EXISTING) Google Maps types
│   └── google-maps.d.ts             (NEW) TypeScript declarations
├── constants/
│   ├── filterOptions.ts             (EXISTING) Filter configurations
│   ├── territories.ts               (EXISTING) Territory definitions
│   └── mapStyles.ts                 (EXISTING) Map styling
└── App.tsx                          (UPDATED) Added route and contexts
```

## Usage Instructions

### Accessing the Territory Map

1. Navigate to the Dashboard page
2. Use the "Data View" dropdown in the header
3. Select "Territory Map" (marked with "New" badge)
4. Or directly visit `/territory-map` route

### Planning a Route

1. Click on markers to select multiple locations
2. Selected markers show blue border and larger size
3. Click "Plan Route" button (minimum 2 locations)
4. Route panel appears on the right side
5. Click "Optimize Route" to find the best order
6. Drag waypoints to manually reorder
7. Click "Open in Google Maps" for navigation

### Using Filters

1. Click the "Filters" button in the header
2. Filter panel slides in from the right
3. Adjust filters in accordion sections:
   - **Accounts**: Sort and filter by status
   - **Brands**: Sort by units or account count
   - **Time Period**: Select comparison mode
   - **Territory**: Choose specific zones
4. Active filter count shown in badge
5. Click "Reset All Filters" to clear

### Map Controls

- **Zoom**: Use mouse wheel or zoom controls
- **Pan**: Click and drag the map
- **Marker Info**: Click any marker to see details
- **Territory Filter**: Dropdown to focus on specific zones
- **Status Filter**: Checkboxes to show/hide marker types

## Technical Details

### Context Architecture

```typescript
// Filter state management
FilterContext
├── filters: FilterState
├── updateFilter()
├── resetFilters()
├── activeFilterCount: number
└── toggleFilterPanel()

// Territory and map state
TerritoryContext
├── territories: Territory[]
├── accountLocations: AccountLocation[]
├── selectedMarkers: MapMarker[]
├── routes: Route[]
├── geocodeAllAccounts()
├── optimizeRoute()
└── updateVisibleMarkers()
```

### Google Maps Integration

The map uses the official Google Maps JavaScript API:
- **API Key**: `AIzaSyDUrOVk--hReqOCMjP_saikhCLoYukc_kU`
- **Libraries**: places, geometry
- **Dynamic Loading**: Script injected only when needed
- **Type Safety**: Full TypeScript definitions included

### Geocoding Strategy

1. **Check Cache**: Look for cached coordinates in localStorage
2. **Batch Processing**: Process accounts in batches of 10
3. **Rate Limiting**: 100ms delay between batches
4. **Error Handling**: Graceful fallback for failed geocoding
5. **Progress Tracking**: Real-time progress bar during initial load

### Performance Optimizations

- **Marker Clustering**: Groups nearby markers at high zoom levels
- **Lazy Loading**: Map only loads when navigating to page
- **Optimized Rendering**: React memo and callbacks prevent unnecessary re-renders
- **localStorage Caching**: Reduces API calls and improves load times

## Phoenix Metro Territory Zones

The map includes 8 predefined Phoenix Metro zones:

1. **North Phoenix** - North of Loop 101
2. **Scottsdale** - Scottsdale city limits
3. **Tempe** - Tempe and ASU area
4. **Mesa** - Mesa and east valley
5. **Chandler** - Chandler area
6. **Gilbert** - Gilbert area
7. **Glendale** - Glendale and west valley
8. **Peoria** - Peoria area

Each zone has:
- Unique color coding
- Geographic bounds for filtering
- Sub-zones for detailed categorization

## Status Color Mapping

```typescript
{
  active: '#10b981',      // Green - Currently purchasing
  new: '#8b5cf6',         // Purple - First-time buyers
  reactivated: '#f59e0b', // Amber - Returned customers
  lost: '#ef4444',        // Red - No longer purchasing
  cold_call: '#3b82f6',   // Blue - Prospective accounts
}
```

## Key Features

### Account Status Detection
Automatically determines account status based on YOY data:
- **New**: PY Total = 0, CY Total > 0
- **Lost**: PY Total > 0, CY Total = 0
- **Active**: Both years have sales
- **Reactivated**: Detected from gaps in purchase history

### Route Optimization
Uses Google Directions API to:
- Find shortest total distance
- Minimize drive time
- Reorder waypoints automatically
- Calculate realistic ETAs

### Info Windows
Clicking a marker shows:
- Account name and number
- Location (city)
- Current year sales
- Previous year sales
- Year-over-year change (with color coding)
- Account status badge

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Touch-optimized controls

## Limitations & Future Enhancements

### Current Limitations
- Geocoding limited to city-level accuracy (no street addresses in data)
- Route optimization supports up to 25 waypoints (Google API limit)
- Requires internet connection for map tiles and geocoding

### Future Enhancements
- Heatmap visualization for sales density
- Territory boundary drawing
- Custom marker icons per brand
- Historical visit tracking
- Multi-day route planning
- Offline map caching
- Export routes to CSV/PDF

## Troubleshooting

### Map Not Loading
1. Check browser console for errors
2. Verify Google Maps API key is valid
3. Check network connectivity
4. Clear browser cache and reload

### Geocoding Fails
1. Check API quota limits
2. Verify account data has valid city names
3. Check localStorage for cached data
4. Try manual cache clearing

### Route Optimization Errors
- Ensure at least 2 waypoints selected
- Check if all markers have valid coordinates
- Verify Google Maps API has Directions API enabled

## Development Notes

### Adding New Territories
Edit `/src/constants/territories.ts`:

```typescript
{
  id: 'new_zone',
  name: 'New Zone',
  description: 'Description',
  color: '#hex_color',
  bounds: { north, south, east, west },
  zones: ['sub_zone_1', 'sub_zone_2'],
}
```

### Customizing Map Styles
Edit `/src/constants/mapStyles.ts` for:
- Light mode styling (default)
- Dark mode styling (future)
- High contrast mode (accessibility)

### Adding Filter Options
Edit `/src/constants/filterOptions.ts`:

```typescript
export const NEW_FILTER_OPTIONS: FilterOption[] = [
  {
    value: 'option_value',
    label: 'Display Label',
    description: 'Helper text',
  },
];
```

## Support

For questions or issues related to the territory map feature:
1. Check this documentation
2. Review TypeScript types in `/src/types/`
3. Examine example usage in components
4. Check browser developer console for errors

## License

This feature is part of the Sales Dashboard project and follows the same license terms.
