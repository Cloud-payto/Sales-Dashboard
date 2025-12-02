import React, { useState, useEffect, useRef } from 'react';
import { useTerritory } from '../contexts/TerritoryContext';
import TerritoryMap from '../components/map/TerritoryMap';
import MapControls from '../components/map/MapControls';
import RoutePanel from '../components/map/RoutePanel';
import { PlaceMarker, PlaceStatus } from '../types/territory';
import { Loader2, AlertCircle, MapPin, Upload, RefreshCw, Search, X } from 'lucide-react';

const TerritoryMapPage: React.FC = () => {
  const {
    places,
    isLoading,
    loadError,
    loadPlacesFromFile,
    reloadPlaces,
    selectedMarkers,
    currentRoute,
    createRouteFromPlaces,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    visibleMarkers,
  } = useTerritory();

  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show route panel when route is created
  useEffect(() => {
    if (currentRoute) {
      setShowRoutePanel(true);
    }
  }, [currentRoute]);

  const handlePlanRoute = () => {
    if (selectedMarkers.length < 2) {
      alert('Please select at least 2 locations to plan a route');
      return;
    }

    const routeName = `Route ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    createRouteFromPlaces(routeName);
  };

  const handleMarkerClick = (marker: PlaceMarker) => {
    console.log('Marker clicked:', marker.place.title);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await loadPlacesFromFile(file);
    }
  };

  const handleStatusFilterChange = (status: PlaceStatus) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
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
    <div className="h-[calc(100vh-5rem)] bg-gray-100 relative">
      {/* Search and Filter Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-2xl px-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search places by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {(['active', 'cold_call', 'prospect', 'inactive'] as PlaceStatus[]).map((status) => {
              const isActive = statusFilter.includes(status);
              const colors: Record<PlaceStatus, { bg: string; text: string; activeBg: string }> = {
                active: { bg: 'bg-green-50', text: 'text-green-700', activeBg: 'bg-green-500' },
                cold_call: { bg: 'bg-blue-50', text: 'text-blue-700', activeBg: 'bg-blue-500' },
                prospect: { bg: 'bg-amber-50', text: 'text-amber-700', activeBg: 'bg-amber-500' },
                inactive: { bg: 'bg-gray-100', text: 'text-gray-700', activeBg: 'bg-gray-500' },
              };
              const labels: Record<PlaceStatus, string> = {
                active: 'Active',
                cold_call: 'Cold Call',
                prospect: 'Prospect',
                inactive: 'Inactive',
              };

              return (
                <button
                  key={status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? `${colors[status].activeBg} text-white`
                      : `${colors[status].bg} ${colors[status].text} hover:opacity-80`
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-white' : colors[status].activeBg
                    }`}
                  />
                  {labels[status]}
                </button>
              );
            })}
            {statusFilter.length > 0 && (
              <button
                onClick={() => setStatusFilter([])}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0">
        <TerritoryMap onMarkerClick={handleMarkerClick} className="w-full h-full" />
      </div>

      {/* Map Controls */}
      <MapControls onPlanRoute={handlePlanRoute} />

      {/* Route Panel */}
      {showRoutePanel && currentRoute && (
        <RoutePanel route={currentRoute} onClose={() => setShowRoutePanel(false)} />
      )}

      {/* Info Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-4 text-sm z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">
            {visibleMarkers.length} of {places.length} Places
          </span>
        </div>
        {selectedMarkers.length > 0 && (
          <>
            <div className="w-px h-4 bg-gray-300" />
            <span className="text-gray-600">
              {selectedMarkers.length} selected for route
            </span>
          </>
        )}
        <div className="w-px h-4 bg-gray-300" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Upload className="w-3 h-3" />
          Upload New
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
  );
};

export default TerritoryMapPage;
