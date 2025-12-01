import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FilterState, FilterContextType } from '../types/filters';
import { DEFAULT_FILTERS } from '../constants/filterOptions';

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const STORAGE_KEY = 'sales_dashboard_filters';

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(() => {
    // Load filters from localStorage on initialization
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored filters:', error);
        return DEFAULT_FILTERS;
      }
    }
    return DEFAULT_FILTERS;
  });

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Persist filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to persist filters:', error);
    }
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen((prev) => !prev);
  };

  // Calculate active filter count (excluding defaults)
  const activeFilterCount = React.useMemo(() => {
    let count = 0;

    // Account status filters (if not 'all')
    if (
      filters.accountStatus.length !== 1 ||
      filters.accountStatus[0] !== 'all'
    ) {
      count++;
    }

    // Selected cities
    if (filters.selectedCities.length > 0) {
      count++;
    }

    // Selected color groups
    if (filters.selectedColorGroups.length > 0) {
      count++;
    }

    // Selected zones (if not 'all')
    if (
      filters.selectedZones.length !== 1 ||
      filters.selectedZones[0] !== 'all'
    ) {
      count++;
    }

    // Account sort (if not default)
    if (filters.accountSort !== DEFAULT_FILTERS.accountSort) {
      count++;
    }

    // Brand sort (if not default)
    if (filters.brandSort !== DEFAULT_FILTERS.brandSort) {
      count++;
    }

    // Time period (if not default)
    if (filters.timePeriod !== DEFAULT_FILTERS.timePeriod) {
      count++;
    }

    return count;
  }, [filters]);

  const contextValue: FilterContextType = {
    filters,
    updateFilter,
    resetFilters,
    activeFilterCount,
    isFilterPanelOpen,
    toggleFilterPanel,
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
