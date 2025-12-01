# Visual Wireframes & Component Layouts

This document provides ASCII wireframes and detailed visual specifications for rapid implementation.

## 1. Enhanced Header Layout

### Desktop View (>1024px)
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  [🔷] Sales Dashboard          [📊 Dashboard ▼]  [🔍 Filters (3)]        [👤 SR]   │
│       YOY Analytics                                                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
   ↑                               ↑                  ↑                       ↑
   Logo                         Data View          Filter Panel            User Menu
   (40x40)                      Dropdown           Button                  Avatar
```

**Spacing**:
- Logo to DataView: 48px (3rem)
- DataView to Filters: 16px (1rem)
- Filters to User: auto margin-left
- Padding: 24px horizontal, 16px vertical

**Component Breakdown**:
```typescript
<header className="bg-white border-b border-gray-200 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      {/* Left: Logo */}
      <Logo />

      {/* Center: Navigation */}
      <div className="flex items-center gap-4">
        <DataViewDropdown />
        <FilterPanel />
      </div>

      {/* Right: User */}
      <UserMenu />
    </div>
  </div>
</header>
```

### Tablet View (640px - 1024px)
```
┌───────────────────────────────────────────────────────────┐
│  [🔷] Sales Dashboard    [📊▼] [🔍(3)]           [👤]    │
└───────────────────────────────────────────────────────────┘
```

**Changes**:
- Logo text abbreviated
- Dropdown labels icon-only
- Reduced padding (16px)

### Mobile View (<640px)
```
┌─────────────────────────────────────────┐
│  [🔷]  Sales      [☰]          [👤]    │
└─────────────────────────────────────────┘
```

**Changes**:
- Hamburger menu instead of inline navigation
- Filter panel becomes bottom sheet
- Full-width dropdowns

---

## 2. Data View Dropdown States

### Closed State
```
┌──────────────────────┐
│ 📊 Dashboard      ▼  │
└──────────────────────┘
```

**Styling**:
```css
px-4 py-2 rounded-lg border border-gray-300
bg-white hover:bg-gray-50
text-sm font-medium text-gray-700
transition-all duration-200
```

### Open State
```
┌──────────────────────┐
│ 📊 Dashboard      ▲  │ ← Trigger (rotated chevron)
└──────────────────────┘
          │
          ▼
┌──────────────────────────────────┐
│ ✓ Full Dataset                   │ ← Active option (blue bg)
│   Complete overview of all data  │
├──────────────────────────────────┤
│ 📈 Territory Overview            │
│   Summary metrics by territory   │
├──────────────────────────────────┤
│ 🏢 All Accounts                  │
│   Detailed account listings      │
├──────────────────────────────────┤
│ 🗺️ Territory Map          [New] │ ← Badge
│   Geographic visualization       │
└──────────────────────────────────┘
```

**Dropdown Menu Styling**:
```css
absolute top-full mt-2 w-72
bg-white rounded-lg shadow-lg border border-gray-200
py-1 z-50 animate-slideDown
```

**Dropdown Item Styling**:
```css
/* Default */
w-full flex items-start gap-3 px-4 py-2.5 text-sm
text-gray-700 hover:bg-gray-50 transition-colors

/* Active */
bg-blue-50 text-blue-700 font-medium
```

---

## 3. Filter Panel Layout

### Closed State (Button)
```
┌────────────────┐
│ 🔍 Filters (3) │ ← Badge shows active count
└────────────────┘
```

**Badge Positioning**:
```css
absolute -top-1 -right-1 w-5 h-5
bg-blue-600 text-white text-xs rounded-full
flex items-center justify-center font-semibold
```

### Open State (Slide-in Panel)
```
                    Backdrop →  ┌──────────────────────────────┐
                    (blur)      │ Filters                  ✕   │
                                ├──────────────────────────────┤
                                │                              │
                                │ 🏢 Accounts              ▼   │ ← Accordion
                                │ ┌──────────────────────────┐ │
                                │ │ Sort by:                 │ │
                                │ │ ○ Sales: High to Low     │ │
                                │ │ ○ Sales: Low to High     │ │
                                │ │ ○ Change: Biggest Gain   │ │
                                │ │                          │ │
                                │ │ Filter by Status:        │ │
                                │ │ ☑ Active (124)           │ │
                                │ │ ☐ New (23)               │ │
                                │ │ ☐ Lost (12)              │ │
                                │ └──────────────────────────┘ │
                                │                              │
                                │ 🎨 Brands                ▼   │
                                │ [Collapsed]                  │
                                │                              │
                                │ 📅 Time Period           ▼   │
                                │ [Collapsed]                  │
                                │                              │
                                │ 🗺️ Territory             ▼   │
                                │ [Collapsed]                  │
                                │                              │
                                ├──────────────────────────────┤
                                │ [Clear All]  [Apply Filters] │
                                └──────────────────────────────┘
                                     ↑ Fixed footer
```

**Panel Dimensions**:
- Width: 384px (w-96)
- Height: 100vh
- Position: fixed right-0 top-0
- Shadow: shadow-2xl
- Z-index: 50 (backdrop: 40)

**Accordion Section**:
```typescript
<AccordionItem value="accounts">
  <AccordionTrigger>
    <Building2 className="w-4 h-4" />
    <span>Accounts</span>
  </AccordionTrigger>
  <AccordionContent>
    {/* Filter options */}
  </AccordionContent>
</AccordionItem>
```

**Animation**:
```css
/* Panel enters from right */
transform: translateX(0)
transition: transform 300ms ease-out

/* Panel exits to right */
transform: translateX(100%)
```

---

## 4. Territory Map Page Layout

### Desktop Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header (Same as above)                                              │
├───────────────┬─────────────────────────────────────────────────────┤
│               │                                                     │
│ MAP CONTROLS  │                                                     │
│ (280px wide)  │                                                     │
│               │                                                     │
│ ┌───────────┐ │                  GOOGLE MAP                        │
│ │Zone:     ▼│ │                                                     │
│ │All Zones  │ │        📍                                          │
│ └───────────┘ │    📍      📍                                      │
│               │                     📍                              │
│ Account Type: │  📍                                                │
│ ☑ Active(124) │              📍        📍                          │
│ ☑ Cold(45)    │                                                     │
│ ☐ Lost(23)    │       📍                                           │
│               │                  📍                                 │
│ ───────────── │                                                     │
│               │                                                     │
│ 🗺️ Routes     │                                                     │
│ [Start Route] │                                                     │
│               │                                                     │
│ LEGEND        │                                                     │
│ 🟢 Active     │                                                     │
│ 🔵 Cold Call  │                                                     │
│ 🔴 Lost       │                                                     │
│ ⚪ New        │                                                     │
│               ├─────────────────────────────────────────────────────┤
│               │ 📊 45 accounts shown | $234K total sales           │
└───────────────┴─────────────────────────────────────────────────────┘
                        ↑ Stats bar (fixed bottom)
```

### Mobile Layout
```
┌─────────────────────┐
│ Header              │
├─────────────────────┤
│                     │
│                     │
│   GOOGLE MAP        │
│                     │
│  📍     📍          │
│      📍             │
│   📍        📍      │
│                     │
│                     │
│                     │
│                     │
│                     │
│ [ 🔍 ]      [ 🗺️ ] │ ← Floating action buttons
└─────────────────────┘
```

**Floating Buttons**:
```css
position: fixed
bottom: 24px
right: 24px
w-14 h-14 rounded-full
bg-blue-600 text-white shadow-lg
```

---

## 5. Map Marker Design

### Active Account Marker
```
       ○ ← Pulse ring (when selected)
      ╱ ╲
     │🏢 │ ← Green circle with building icon
     ╲___╱
       │
    $12.5K ← Sales label (white bg)
```

**Marker Structure**:
```typescript
<div className="relative">
  {/* Pulse ring (selected only) */}
  {isSelected && (
    <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping" />
  )}

  {/* Marker circle */}
  <div className={`
    w-10 h-10 rounded-full border-3 border-white shadow-lg
    flex items-center justify-center cursor-pointer
    ${getStatusColor(status)}
    ${isSelected ? 'scale-125 z-50' : 'scale-100'}
    transition-all duration-200
  `}>
    <Building2 className="w-5 h-5 text-white" />
  </div>

  {/* Sales label */}
  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2
                  bg-white px-2 py-0.5 rounded shadow text-xs font-semibold
                  border border-gray-200">
    ${formatSales(account.sales)}
  </div>
</div>
```

**Color Coding**:
```typescript
Active:      bg-green-500  (#10b981)
Cold Call:   bg-blue-500   (#3b82f6)
Lost:        bg-red-500    (#ef4444)
New:         bg-purple-500 (#8b5cf6)
Reactivated: bg-amber-500  (#f59e0b)
```

---

## 6. Account Info Window (Popup)

### Layout
```
┌───────────────────────────────────┐
│ ABC Optical Supply            ✕   │
├───────────────────────────────────┤
│ 📍 1234 Main Street               │
│    Phoenix, AZ 85001              │
│                                   │
│ 💰 Sales Performance              │
│ ┌───────────────────────────────┐ │
│ │ Current:   $12,450       ▲    │ │
│ │ Previous:  $10,200            │ │
│ │ Change:    +22.1%         🔼  │ │
│ └───────────────────────────────┘ │
│                                   │
│ 📊 Top Brands (3 of 8)            │
│ • Ray-Ban            145 units    │
│ • Oakley              89 units    │
│ • Costa               67 units    │
│                                   │
│ 🕐 Last Visit: Nov 15, 2025       │
│                                   │
│ ┌──────────────┬────────────────┐ │
│ │ View Details │  Get Directions│ │
│ └──────────────┴────────────────┘ │
└───────────────────────────────────┘
         │  ← Arrow pointer to marker
         ▼
       📍
```

**Positioning**:
```css
position: absolute
bottom: 100% (above marker)
left: 50%
transform: translateX(-50%)
margin-bottom: 12px
width: 320px
```

**Styling**:
```css
bg-white rounded-lg shadow-2xl border border-gray-200
p-4 z-50 animate-fadeIn
```

**Arrow Pointer**:
```css
/* Using CSS triangle */
&::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-top-color: white;
}
```

---

## 7. Route Optimizer Panel

### Waypoint List
```
┌──────────────────────────────┐
│ Route Planning               │
├──────────────────────────────┤
│ 📍 Waypoints (3)             │
│                              │
│ ⋮⋮ 1. ABC Optical   ✕       │ ← Drag handle | Remove
│    Phoenix, AZ               │
│    $12,450                   │
│                              │
│ ⋮⋮ 2. XYZ Vision    ✕       │
│    Scottsdale, AZ            │
│    $8,320                    │
│                              │
│ ⋮⋮ 3. LensCrafters  ✕       │
│    Tempe, AZ                 │
│    $15,670                   │
│                              │
├──────────────────────────────┤
│ 📏 Total: 12.4 miles         │
│ 🕐 Est. Time: 28 minutes     │
├──────────────────────────────┤
│ [⚡ Optimize Route]          │
│ [🗺️ Export to Google Maps]  │
│ [🗑️ Clear Route]             │
└──────────────────────────────┘
```

**Draggable Waypoint**:
```typescript
<div
  draggable
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-move transition-colors"
>
  <GripVertical className="w-4 h-4 text-gray-400" />
  <div className="flex-1">
    <div className="font-medium">{order}. {account.name}</div>
    <div className="text-xs text-gray-500">{account.city}</div>
  </div>
  <button onClick={() => removeWaypoint(id)}>
    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
  </button>
</div>
```

---

## 8. Map Stats Bar

### Desktop Stats Bar
```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 45 accounts | 💰 $234,560 total | 📈 +12.3% vs last year    │
└─────────────────────────────────────────────────────────────────┘
```

**Styling**:
```css
position: fixed
bottom: 0
left: 0
right: 0
height: 48px
bg-white/95 backdrop-blur-sm
border-t border-gray-200
px-6 py-3
flex items-center justify-center gap-8
text-sm font-medium
z-40
```

---

## 9. Color System Reference

### Primary Colors
```
Blue Scale (Brand):
50:  #eff6ff (backgrounds)
100: #dbeafe (hover states)
500: #3b82f6 (primary actions)
600: #2563eb (primary hover)
700: #1d4ed8 (active states)

Gray Scale (Neutrals):
50:  #f9fafb (page background)
100: #f3f4f6 (hover states)
200: #e5e7eb (borders)
300: #d1d5db (disabled borders)
500: #6b7280 (secondary text)
600: #4b5563 (body text)
700: #374151 (headings - unused, use 900)
900: #111827 (primary text)
```

### Status Colors
```
Success/Active:     #10b981 (Green-500)
Info/Cold Call:     #3b82f6 (Blue-500)
Error/Lost:         #ef4444 (Red-500)
Warning/New:        #8b5cf6 (Purple-500)
Attention/React:    #f59e0b (Amber-500)
```

---

## 10. Spacing System

### Component Spacing
```
Tight:   4px  (gap-1)
Small:   8px  (gap-2)
Default: 16px (gap-4)
Medium:  24px (gap-6)
Large:   32px (gap-8)
XLarge:  48px (gap-12)
```

### Padding/Margin Scale
```
p-1:  4px
p-2:  8px
p-3:  12px
p-4:  16px
p-6:  24px
p-8:  32px
p-12: 48px
```

### Layout Spacing
```
Header height:        64px
Filter panel width:   384px (w-96)
Map controls width:   280px
Stats bar height:     48px
Max content width:    1280px (max-w-7xl)
```

---

## 11. Typography Scale

### Font Sizes
```
Display:  text-4xl (36px / 40px line-height)
H1:       text-3xl (30px / 36px)
H2:       text-2xl (24px / 32px)
H3:       text-xl  (20px / 28px)
H4:       text-lg  (18px / 28px)
Body:     text-base (16px / 24px)
Small:    text-sm (14px / 20px)
Tiny:     text-xs (12px / 16px)
```

### Font Weights
```
Regular:  font-normal (400)
Medium:   font-medium (500)
Semibold: font-semibold (600)
Bold:     font-bold (700)
```

---

## 12. Responsive Breakpoints

```typescript
// Tailwind Breakpoints
sm:  640px   // Small tablets
md:  768px   // Tablets
lg:  1024px  // Small laptops
xl:  1280px  // Desktops
2xl: 1536px  // Large desktops

// Usage
<div className="
  w-full           // Mobile: full width
  md:w-1/2         // Tablet: half width
  lg:w-1/3         // Desktop: third width
">
```

### Component Responsive Behavior
```typescript
// Filter Panel
Mobile:  Bottom sheet (full width)
Tablet:  Slide-in (280px)
Desktop: Slide-in (384px)

// Map Controls
Mobile:  Hidden (FAB instead)
Tablet:  Slide-in (240px)
Desktop: Fixed sidebar (280px)

// Data View Dropdown
Mobile:  Full width
Tablet:  Auto width
Desktop: Auto width

// Header Navigation
Mobile:  Hamburger menu
Tablet:  Icon + text
Desktop: Full labels
```

---

## 13. Icon Library (Lucide React)

### Navigation Icons
```typescript
import {
  LayoutDashboard,  // Full Dataset
  BarChart3,        // Territory Overview
  Building2,        // All Accounts
  Map,              // Territory Map
  Filter,           // Filters
  Home,             // Home
  Upload,           // Upload Data
  Info,             // About
} from 'lucide-react';
```

### Map Icons
```typescript
import {
  MapPin,           // Location marker
  Navigation,       // Directions
  Route,            // Route planning
  CircleDot,        // Selected marker
  Crosshair,        // Center map
  ZoomIn,           // Zoom controls
  ZoomOut,
} from 'lucide-react';
```

### UI Icons
```typescript
import {
  ChevronDown,      // Dropdown toggle
  Check,            // Selected item
  X,                // Close/remove
  Settings2,        // Settings
  Plus,             // Add
  Minus,            // Remove
  Trash2,           // Delete
  Edit,             // Edit
  Save,             // Save
  GripVertical,     // Drag handle
} from 'lucide-react';
```

---

## 14. Component State Matrix

### Dropdown States
```
Default:   border-gray-300 bg-white text-gray-700
Hover:     bg-gray-50
Focus:     ring-2 ring-blue-500
Active:    bg-blue-50 text-blue-700
Disabled:  opacity-50 cursor-not-allowed
```

### Button States
```
Primary Default:  bg-blue-600 text-white
Primary Hover:    bg-blue-700
Primary Active:   bg-blue-800
Primary Disabled: bg-blue-300 cursor-not-allowed

Secondary Default:  bg-white text-gray-700 border border-gray-300
Secondary Hover:    bg-gray-50
Secondary Active:   bg-gray-100
```

### Input States
```
Default:  border-gray-300
Focus:    border-blue-500 ring-2 ring-blue-500/20
Error:    border-red-500 ring-2 ring-red-500/20
Success:  border-green-500 ring-2 ring-green-500/20
```

---

## 15. Animation Timing

### Transitions
```
Fast:      100ms (hover effects)
Default:   200ms (dropdowns, toggles)
Slow:      300ms (panels, modals)
Delayed:   500ms (lazy loading)
```

### Easing Functions
```
ease-in:     cubic-bezier(0.4, 0, 1, 1)
ease-out:    cubic-bezier(0, 0, 0.2, 1)      // Preferred
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Implementation Priority Order

### Week 1 (Foundation)
1. Shared Dropdown component
2. Tailwind animation config
3. FilterContext setup
4. Type definitions

### Week 2 (Navigation)
1. DataViewDropdown
2. FilterPanel shell
3. Logo extraction
4. Header integration

### Week 3 (Filters)
1. Filter sections
2. Accordion components
3. Checkbox/Radio components
4. Filter application logic

### Week 4 (Map Setup)
1. Google Maps integration
2. Basic TerritoryMap page
3. TerritoryContext
4. Geocoding utility

### Week 5 (Map Features)
1. MapMarker component
2. AccountInfoWindow
3. MapControls panel
4. Status filtering

### Week 6 (Routes)
1. RouteOptimizer
2. Waypoint list
3. Drag-and-drop
4. Route export

### Week 7 (Polish)
1. Mobile responsive
2. Animations
3. Performance
4. Accessibility

---

**End of Visual Wireframes Document**
**Version**: 1.0
**Last Updated**: December 1, 2025
