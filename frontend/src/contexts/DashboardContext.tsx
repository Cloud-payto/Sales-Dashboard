import React, { createContext, useContext, useState, useEffect } from 'react';
import { DashboardData } from '../types';

interface DashboardContextType {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  updateDashboardData: (data: DashboardData) => void;
  clearDashboardData: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('sales_dashboard_data');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setDashboardData(parsed);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDashboardData = (data: DashboardData) => {
    setDashboardData(data);
    // Save to localStorage
    localStorage.setItem('sales_dashboard_data', JSON.stringify(data));
    setError(null);
  };

  const clearDashboardData = () => {
    setDashboardData(null);
    localStorage.removeItem('sales_dashboard_data');
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        isLoading,
        error,
        updateDashboardData,
        clearDashboardData
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
