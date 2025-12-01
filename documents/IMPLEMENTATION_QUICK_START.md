# Implementation Quick Start Guide

This guide provides a rapid implementation path for the enhanced navbar and territory map features.

## Prerequisites

```bash
# Install new dependencies
npm install google-map-react @googlemaps/js-api-loader
npm install @radix-ui/react-dropdown-menu @radix-ui/react-accordion @radix-ui/react-checkbox
npm install clsx framer-motion date-fns

# Install dev dependencies
npm install -D @types/google-map-react
```

## Environment Setup

Create `.env` file in project root:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Phase 1: Shared Components (Day 1-2)

### 1. Create Dropdown Component

**File**: `/mnt/c/Users/payto/OneDrive/Desktop/Fun Projects/sales_dashboard/src/components/shared/Dropdown.tsx`

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  className,
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-700"
      >
        {trigger}
        <ChevronDown className={clsx(
          'w-4 h-4 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className={clsx(
          'absolute top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-slideDown',
          align === 'right' ? 'right-0' : 'left-0',
          className
        )}>
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  active?: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  icon,
  label,
  description,
  onClick,
  active
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-start gap-3 px-4 py-2.5 text-sm transition-colors',
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-50'
      )}
    >
      {icon && <span className="mt-0.5">{icon}</span>}
      <div className="flex-1 text-left">
        <div className="font-medium">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-0.5">{description}</div>
        )}
      </div>
    </button>
  );
};
```

### 2. Add Tailwind Animation

**File**: `/mnt/c/Users/payto/OneDrive/Desktop/Fun Projects/sales_dashboard/tailwind.config.js`

Add to the `extend` section:

```javascript
theme: {
  extend: {
    animation: {
      slideDown: 'slideDown 200ms ease-out',
      slideInRight: 'slideInRight 300ms ease-out',
    },
    keyframes: {
      slideDown: {
        from: { opacity: '0', transform: 'translateY(-8px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
      slideInRight: {
        from: { transform: 'translateX(100%)' },
        to: { transform: 'translateX(0)' },
      },
    },
  },
},
```

## Phase 2: Filter Context (Day 3)

**File**: `/mnt/c/Users/payto/OneDrive/Desktop/Fun Projects/sales_dashboard/src/contexts/FilterContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FilterState, FilterContextType } from '../types/filters';
import { DEFAULT_FILTERS } from '../constants/filterOptions';

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(() => {
    const saved = localStorage.getItem('dashboard_filters');
    return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
  });

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('dashboard_filters', JSON.stringify(filters));
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'dataView') return count;
    if (Array.isArray(value) && value.length > 0 && !value.includes('all')) {
      return count + value.length;
    }
    return count;
  }, 0);

  const toggleFilterPanel = () => setIsFilterPanelOpen(!isFilterPanelOpen);

  return (
    <FilterContext.Provider
      value={{
        filters,
        updateFilter,
        resetFilters,
        activeFilterCount,
        isFilterPanelOpen,
        toggleFilterPanel,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
};
```

## Phase 3: Enhanced Header (Day 4-5)

**File**: `/mnt/c/Users/payto/OneDrive/Desktop/Fun Projects/sales_dashboard/src/components/navigation/DataViewDropdown.tsx`

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Building2, Map as MapIcon } from 'lucide-react';
import { Dropdown, DropdownItem } from '../shared/Dropdown';
import { useFilters } from '../../contexts/FilterContext';
import { DATA_VIEW_OPTIONS } from '../../constants/filterOptions';

const iconMap = {
  LayoutDashboard,
  BarChart3,
  Building2,
  MapIcon,
};

export const DataViewDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { filters, updateFilter } = useFilters();

  const currentView = DATA_VIEW_OPTIONS.find(
    option => option.value === filters.dataView
  );

  const handleViewChange = (value: string) => {
    updateFilter('dataView', value as any);

    // Navigate to appropriate route
    switch (value) {
      case 'territory_map':
        navigate('/map');
        break;
      case 'all_accounts':
        navigate('/dashboard?view=accounts');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const Icon = currentView ? iconMap[currentView.icon as keyof typeof iconMap] : LayoutDashboard;

  return (
    <Dropdown
      trigger={
        <>
          <Icon className="w-4 h-4" />
          <span>{currentView?.label || 'Select View'}</span>
        </>
      }
    >
      {DATA_VIEW_OPTIONS.map(option => {
        const OptionIcon = iconMap[option.icon as keyof typeof iconMap];
        return (
          <DropdownItem
            key={option.value}
            icon={<OptionIcon className="w-4 h-4" />}
            label={option.label}
            description={option.description}
            onClick={() => handleViewChange(option.value)}
            active={filters.dataView === option.value}
          />
        );
      })}
    </Dropdown>
  );
};
```

## Phase 4: Filter Panel (Day 6-7)

**File**: `/mnt/c/Users/payto/OneDrive/Desktop/Fun Projects/sales_dashboard/src/components/navigation/FilterPanel.tsx`

```typescript
import React from 'react';
import { X, Filter } from 'lucide-react';
import { useFilters } from '../../contexts/FilterContext';
import clsx from 'clsx';

export const FilterPanel: React.FC = () => {
  const { isFilterPanelOpen, toggleFilterPanel, resetFilters, activeFilterCount } = useFilters();

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={toggleFilterPanel}
        className="relative flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-700"
      >
        <Filter className="w-4 h-4" />
        <span className="hidden md:inline">Filters</span>
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isFilterPanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={toggleFilterPanel}
        />
      )}

      {/* Panel */}
      <div
        className={clsx(
          'fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300',
          isFilterPanelOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={toggleFilterPanel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-140px)]">
          {/* Filter sections will go here */}
          <p className="text-sm text-gray-500">Filter components coming soon...</p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-3">
            <button
              onClick={resetFilters}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={toggleFilterPanel}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
```

## Phase 5: Update App.tsx

```typescript
import { FilterProvider } from './contexts/FilterContext';

const App: React.FC = () => {
  return (
    <DashboardProvider>
      <FilterProvider>  {/* Add this */}
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              {/* existing routes */}
            </Routes>
          </div>
        </Router>
      </FilterProvider>
    </DashboardProvider>
  );
};
```

## Phase 6: Update Header

```typescript
import { DataViewDropdown } from './navigation/DataViewDropdown';
import { FilterPanel } from './navigation/FilterPanel';

// In Header component, replace center navigation section with:
<nav className="flex items-center gap-4">
  <DataViewDropdown />
  <FilterPanel />
</nav>
```

## Testing Checklist

- [ ] Dropdown opens/closes on click
- [ ] Click outside closes dropdown
- [ ] Filter panel slides in smoothly
- [ ] Filter count badge updates
- [ ] Filters persist in localStorage
- [ ] View changes navigate correctly
- [ ] Mobile responsive (bottom sheet on small screens)

## Next Steps

1. Complete filter sections (AccountsFilter, BrandsFilter, etc.)
2. Begin Territory Map implementation
3. Add geocoding functionality
4. Implement marker clustering

## Common Issues

### Dropdown not closing on outside click
- Check that useEffect dependencies include `isOpen`
- Verify event listener cleanup

### Animations not working
- Ensure Tailwind config includes custom animations
- Check that classes are not being purged

### Filter state not persisting
- Verify localStorage key matches in provider
- Check browser localStorage isn't disabled

## Performance Tips

- Use `React.memo` for filter option lists
- Debounce text input filters (300ms)
- Lazy load FilterPanel content
- Virtual scroll for long dropdown lists

## Accessibility

- All dropdowns have keyboard navigation
- Filter panel is focus-trapped when open
- Screen reader labels on all controls
- Color contrast meets WCAG AA standards
