import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import { FilterProvider } from './contexts/FilterContext';
import { TerritoryProvider } from './contexts/TerritoryContext';
import { RouteProvider } from './contexts/RouteContext';
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import ChatWidget from './components/ChatWidget';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import TerritoryMapPage from './pages/TerritoryMapPage';
import UploadPage from './pages/UploadPage';
import AboutPage from './pages/AboutPage';

// Main app content wrapper
const AppContent: React.FC = () => {
  return (
    <FilterProvider>
      <TerritoryProvider>
        <RouteProvider>
          <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <FilterPanel />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/territory-map" element={<TerritoryMapPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
            <ChatWidget />
          </div>
          </Router>
        </RouteProvider>
      </TerritoryProvider>
    </FilterProvider>
  );
};

const App: React.FC = () => {
  return (
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  );
};

export default App;
