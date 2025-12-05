import React, { useState, useRef } from 'react';
import { useTerritory } from '../contexts/TerritoryContext';
import TerritoryMap from '../components/map/TerritoryMap';
import TerritoryMapSidebar from '../components/map/TerritoryMapSidebar';
import { PlaceMarker } from '../types/territory';
import { CityData } from '../types';
import { Loader2, AlertCircle, MapPin, Upload, RefreshCw } from 'lucide-react';

const TerritoryMapPage: React.FC = () => {
  const {
    places,
    isLoading,
    loadError,
    loadPlacesFromFile,
    reloadPlaces,
  } = useTerritory();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map display state (lifted to page level for sidebar control)
  const [showCityBoundaries, setShowCityBoundaries] = useState(true);
  const [colorMode, setColorMode] = useState<'performance' | 'routes'>('performance');
  const [cityAssignmentMode, setCityAssignmentMode] = useState(false);
  const [selectedRouteForAssignment, setSelectedRouteForAssignment] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);

  const handleMarkerClick = (marker: PlaceMarker) => {
    console.log('Marker clicked:', marker.place.title);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await loadPlacesFromFile(file);
    }
  };

  // Loading state
  if (isLoading && places.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Places
          </h2>
          <p className="text-gray-600 mb-6">
            Loading your saved locations from the CSV file...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError && places.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to Load Places
          </h2>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <div className="space-y-3">
            <button
              onClick={reloadPlaces}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <div className="text-gray-500 text-sm">or</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload CSV File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (places.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Places Loaded
          </h2>
          <p className="text-gray-600 mb-6">
            Upload a CSV file with your places to view them on the map.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload CSV File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <p className="mt-4 text-sm text-gray-500">
            Expected columns: Title, Address, Latitude, Longitude
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] bg-gray-100 flex">
      {/* Sidebar */}
      <TerritoryMapSidebar
        showCityBoundaries={showCityBoundaries}
        onToggleCityBoundaries={() => setShowCityBoundaries(!showCityBoundaries)}
        colorMode={colorMode}
        onColorModeChange={setColorMode}
        onSelectCity={(city) => setSelectedCity(city)}
        cityAssignmentMode={cityAssignmentMode}
        onToggleCityAssignmentMode={() => setCityAssignmentMode(!cityAssignmentMode)}
        selectedRouteForAssignment={selectedRouteForAssignment}
        onSelectRouteForAssignment={setSelectedRouteForAssignment}
      />

      {/* Map Container */}
      <div className="flex-1 relative">
        <TerritoryMap
          onMarkerClick={handleMarkerClick}
          className="w-full h-full"
          showCityBoundaries={showCityBoundaries}
          colorMode={colorMode}
          cityAssignmentMode={cityAssignmentMode}
          selectedRouteForAssignment={selectedRouteForAssignment}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
        />
      </div>

      {/* Hidden file input for CSV upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default TerritoryMapPage;
