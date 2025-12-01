# Sales Dashboard UI Design Package

## Quick Navigation

Welcome to the complete UI architecture design package for the Sales Dashboard enhanced features. This package contains everything needed to implement two major features:

1. **Enhanced Navbar with Dropdowns** - Advanced filtering system
2. **Territory Map Feature** - Google Maps integration for account visualization

---

## Document Guide

### Start Here

**New to the project?** Start with these documents in order:

1. **DESIGN_SUMMARY.md** - Overview and quick reference
2. **VISUAL_WIREFRAMES.md** - See what you're building
3. **IMPLEMENTATION_QUICK_START.md** - Begin coding

### Complete Documentation

#### 1. DESIGN_SUMMARY.md
**Purpose**: Executive overview and quick reference
**Use When**: You need a high-level understanding or quick lookup

**Contains**:
- Project overview
- Quick implementation path
- Design system reference (colors, spacing, typography)
- Timeline and phases
- Common issues and solutions

**Time to Read**: 10 minutes

---

#### 2. DESIGN_DOCUMENT.md
**Purpose**: Complete technical specification
**Use When**: You need detailed architectural information

**Contains**:
- Feature 1: Enhanced Navbar (detailed spec)
- Feature 2: Territory Map (detailed spec)
- Component hierarchy
- TypeScript interfaces (comprehensive)
- File structure (all 40 files)
- Implementation guidelines
- Performance targets
- Accessibility standards
- Testing strategy
- Package dependencies

**Time to Read**: 45 minutes

---

#### 3. VISUAL_WIREFRAMES.md
**Purpose**: Visual specifications and layouts
**Use When**: You need exact measurements, colors, or component layouts

**Contains**:
- ASCII wireframes for all components
- Exact spacing and sizing specifications
- Color palette with hex values
- Typography scale
- Component state matrix
- Responsive breakpoints
- Icon library reference
- Animation timing

**Time to Read**: 30 minutes

---

#### 4. IMPLEMENTATION_QUICK_START.md
**Purpose**: Step-by-step implementation guide
**Use When**: You're ready to start coding

**Contains**:
- Prerequisites and setup
- Phase-by-phase implementation
- Complete code examples
- Testing checklist
- Common issues with solutions
- Performance tips
- Accessibility requirements

**Time to Read**: 20 minutes

---

#### 5. COMPONENT_EXAMPLES.md
**Purpose**: Ready-to-use component code
**Use When**: You need copy-paste component implementations

**Contains**:
- 10 production-ready components
- Full TypeScript implementations
- Tailwind CSS styling
- Accessibility features
- Usage examples
- Tailwind config updates

**Time to Read**: Browse as needed

---

## Code Files (Ready to Use)

### Type Definitions
Located in `/src/types/`

**filters.ts**
- Filter system types
- Data view types
- Filter state interface
- Filter context type

**territory.ts**
- Territory definitions
- Account location types
- Map marker types
- Route types
- Geocoding cache

**map.ts**
- Google Maps configuration
- Map options and styles
- Directions API types
- Geocoding types

### Constants
Located in `/src/constants/`

**filterOptions.ts**
- Data view options
- Account sort/filter options
- Brand filter options
- Time period options
- Territory zone options
- Default filter state

**territories.ts**
- Phoenix metro territory definitions
- Status color mapping
- Map zoom levels
- Metro area bounds

**mapStyles.ts**
- Light map style (default)
- Dark map style (future)
- High contrast style (accessibility)

---

## Implementation Roadmap

### Week 1: Foundation (Days 1-5)
**Goal**: Set up shared components and contexts

**Tasks**:
- [ ] Install dependencies
- [ ] Create type files
- [ ] Build Dropdown component
- [ ] Build Badge component
- [ ] Set up FilterContext
- [ ] Add Tailwind animations

**Files Created**: 8
**Estimated Time**: 2-3 days

---

### Week 2: Enhanced Navbar (Days 6-10)
**Goal**: Complete navigation and filter system

**Tasks**:
- [ ] Build DataViewDropdown
- [ ] Create FilterPanel shell
- [ ] Build Accordion component
- [ ] Add filter sections
- [ ] Integrate with DashboardPage
- [ ] Test filtering logic

**Files Created**: 7
**Estimated Time**: 3-4 days

---

### Week 3: Map Setup (Days 11-15)
**Goal**: Get basic map working

**Tasks**:
- [ ] Get Google Maps API key
- [ ] Install map dependencies
- [ ] Create TerritoryContext
- [ ] Build basic TerritoryMap component
- [ ] Test map rendering
- [ ] Create geocoding utility

**Files Created**: 6
**Estimated Time**: 3-4 days

---

### Week 4: Map Features (Days 16-20)
**Goal**: Add markers and interactions

**Tasks**:
- [ ] Build MapMarker component
- [ ] Add status color coding
- [ ] Create AccountInfoWindow
- [ ] Build MapControls panel
- [ ] Implement marker clustering
- [ ] Add zone filtering

**Files Created**: 8
**Estimated Time**: 4-5 days

---

### Week 5: Route Planning (Days 21-25)
**Goal**: Complete route optimization

**Tasks**:
- [ ] Create RouteOptimizer component
- [ ] Build WaypointList with drag-drop
- [ ] Implement route calculation
- [ ] Add export to Google Maps
- [ ] Test route optimization
- [ ] Add route persistence

**Files Created**: 5
**Estimated Time**: 4-5 days

---

### Week 6: Polish (Days 26-30)
**Goal**: Finalize and launch

**Tasks**:
- [ ] Mobile responsive testing
- [ ] Animation polish
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Browser testing
- [ ] Documentation

**Files Created**: 0 (refinements only)
**Estimated Time**: 4-5 days

---

## Design System Quick Reference

### Colors (Tailwind Classes)

```css
/* Primary Blue */
bg-blue-500  #3b82f6
bg-blue-600  #2563eb
bg-blue-700  #1d4ed8

/* Status Colors */
bg-green-500  #10b981  (Active)
bg-blue-500   #3b82f6  (Cold Call)
bg-red-500    #ef4444  (Lost)
bg-purple-500 #8b5cf6  (New)
bg-amber-500  #f59e0b  (Reactivated)

/* Neutrals */
bg-gray-50   #f9fafb  (Page background)
bg-gray-100  #f3f4f6  (Hover states)
bg-gray-200  #e5e7eb  (Borders)
text-gray-600 #4b5563 (Body text)
text-gray-900 #111827 (Headings)
```

### Spacing Scale

```css
gap-1   4px    Tight
gap-2   8px    Small
gap-4   16px   Default
gap-6   24px   Medium
gap-8   32px   Large
gap-12  48px   XLarge
```

### Component Sizes

```css
Header:         h-16 (64px)
Button:         px-4 py-2 (40px height)
Filter Panel:   w-96 (384px desktop)
Map Controls:   w-70 (280px)
Marker:         w-10 h-10 (40x40px)
```

---

## File Structure Overview

```
sales_dashboard/
├── DESIGN_SUMMARY.md              ← Start here
├── DESIGN_DOCUMENT.md             ← Full specs
├── VISUAL_WIREFRAMES.md           ← Visual guide
├── IMPLEMENTATION_QUICK_START.md  ← Developer guide
├── COMPONENT_EXAMPLES.md          ← Code examples
│
├── src/
│   ├── components/
│   │   ├── shared/              (8 components)
│   │   ├── navigation/          (5 components)
│   │   ├── map/                 (11 components)
│   │   └── filters/             (4 components)
│   │
│   ├── contexts/
│   │   ├── FilterContext.tsx    ← New
│   │   └── TerritoryContext.tsx ← New
│   │
│   ├── types/
│   │   ├── filters.ts           ✓ Created
│   │   ├── territory.ts         ✓ Created
│   │   └── map.ts               ✓ Created
│   │
│   ├── constants/
│   │   ├── filterOptions.ts     ✓ Created
│   │   ├── territories.ts       ✓ Created
│   │   └── mapStyles.ts         ✓ Created
│   │
│   ├── pages/
│   │   └── TerritoryMapPage.tsx ← New
│   │
│   ├── hooks/
│   │   ├── useFilters.ts        ← New
│   │   └── useGeocoding.ts      ← New
│   │
│   └── utils/
│       ├── geocoding.ts         ← New
│       └── routeCalculation.ts  ← New
│
└── tailwind.config.js           ← Update animations
```

**Total New Files**: 40
**Already Created**: 6 (types + constants)
**To Create**: 34

---

## Dependencies to Install

```bash
# Core map dependencies
npm install google-map-react @googlemaps/js-api-loader

# UI component libraries
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-accordion
npm install @radix-ui/react-checkbox

# Utilities
npm install clsx framer-motion date-fns

# Dev dependencies
npm install -D @types/google-map-react
```

**Total Package Size**: ~800KB (minified + gzipped)

---

## Environment Setup

Create `.env` file:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Get API Key**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
4. Create API key
5. Add restrictions (HTTP referrers)

---

## Testing Checklist

### Enhanced Navbar
- [ ] Dropdown opens/closes on click
- [ ] Click outside closes dropdown
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Filter panel slides in smoothly
- [ ] Filter count badge updates correctly
- [ ] Filters persist after reload
- [ ] Mobile: Bottom sheet works
- [ ] Responsive on all breakpoints

### Territory Map
- [ ] Map loads and centers correctly
- [ ] Markers appear at correct locations
- [ ] Clicking marker shows info window
- [ ] Info window displays correct data
- [ ] Filter by zone updates markers
- [ ] Route planning adds waypoints
- [ ] Optimize route works
- [ ] Export to Google Maps opens correctly
- [ ] Mobile: Floating buttons work
- [ ] Performance: 1000+ markers render quickly

---

## Performance Targets

### Initial Load
- First Contentful Paint: **< 1.5s**
- Time to Interactive: **< 3.0s**
- Bundle size: **< 500KB** (gzipped)

### Map Performance
- Marker rendering: **< 100ms** for 1000 markers
- Cluster recalculation: **< 50ms** on zoom
- Route optimization: **< 2s** for 20 waypoints

### UI Responsiveness
- Filter application: **< 200ms**
- Dropdown open: **< 100ms**
- Animation frame rate: **60fps**

---

## Accessibility Compliance

### WCAG 2.1 AA Standards

**Visual**:
- Contrast ratio: 4.5:1 minimum
- Focus indicators visible
- Color not sole indicator

**Keyboard**:
- All features keyboard accessible
- Logical tab order
- Skip links available

**Screen Reader**:
- ARIA labels on all interactive elements
- Live regions for updates
- Semantic HTML structure

**Motor**:
- Touch targets: 44x44px minimum
- No time-based interactions
- Keyboard alternatives for drag-drop

---

## Browser Support

**Fully Supported**:
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: iOS 13+
- Chrome Android: Last 2 versions

**Not Supported**:
- Internet Explorer (any version)

---

## Getting Help

### Common Questions

**Q: Where do I start?**
A: Read DESIGN_SUMMARY.md, then follow IMPLEMENTATION_QUICK_START.md

**Q: I need exact component layouts**
A: Check VISUAL_WIREFRAMES.md for ASCII diagrams and measurements

**Q: How do I implement a specific component?**
A: See COMPONENT_EXAMPLES.md for ready-to-use code

**Q: What are the TypeScript types?**
A: All types are defined in /src/types/ (already created)

**Q: How do I handle Google Maps API?**
A: See IMPLEMENTATION_QUICK_START.md Week 3 section

**Q: The dropdown isn't working**
A: Check IMPLEMENTATION_QUICK_START.md "Common Issues" section

---

## Project Status

**Created Files** (6):
- ✓ /src/types/filters.ts
- ✓ /src/types/territory.ts
- ✓ /src/types/map.ts
- ✓ /src/constants/filterOptions.ts
- ✓ /src/constants/territories.ts
- ✓ /src/constants/mapStyles.ts

**Documentation** (5):
- ✓ DESIGN_SUMMARY.md
- ✓ DESIGN_DOCUMENT.md
- ✓ VISUAL_WIREFRAMES.md
- ✓ IMPLEMENTATION_QUICK_START.md
- ✓ COMPONENT_EXAMPLES.md

**Ready to Implement**: Yes
**Estimated Development Time**: 6 weeks (30 working days)

---

## Success Criteria

Your implementation is successful when:

1. **Enhanced Navbar**:
   - [ ] Users can switch between data views
   - [ ] Filter panel opens with smooth animation
   - [ ] Filters update dashboard data
   - [ ] Active filter count displays correctly
   - [ ] Filters persist after page reload

2. **Territory Map**:
   - [ ] Map displays all account locations
   - [ ] Markers are color-coded by status
   - [ ] Clicking markers shows account details
   - [ ] Users can filter by zone
   - [ ] Route planning works end-to-end
   - [ ] Routes export to Google Maps

3. **Quality**:
   - [ ] Mobile responsive on all devices
   - [ ] Passes accessibility audit
   - [ ] Meets performance targets
   - [ ] Works on all supported browsers

---

## Next Steps

1. **Read Documents** (2 hours)
   - DESIGN_SUMMARY.md
   - VISUAL_WIREFRAMES.md
   - IMPLEMENTATION_QUICK_START.md

2. **Setup Environment** (30 minutes)
   - Install dependencies
   - Get Google Maps API key
   - Configure .env file

3. **Start Building** (Week 1)
   - Create shared components
   - Set up FilterContext
   - Build Dropdown component

4. **Iterate** (Weeks 2-6)
   - Follow week-by-week roadmap
   - Test incrementally
   - Refine based on feedback

---

**Design Package Version**: 1.0
**Last Updated**: December 1, 2025
**Status**: Ready for Implementation

**Good luck building!** 🚀
