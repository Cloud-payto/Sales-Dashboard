import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import { useTerritory } from '../../contexts/TerritoryContext';
import { useDashboard } from '../../contexts/DashboardContext';
import { useRoutes } from '../../contexts/RouteContext';
import { PHOENIX_METRO_CENTER } from '../../constants/territories';
import { LIGHT_MAP_STYLE } from '../../constants/mapStyles';
import { PlaceMarker } from '../../types/territory';
import { CityData } from '../../types';
import CityOverlay from './CityOverlay';
import CityInsightsPanel from './CityInsightsPanel';
import RouteManagerPanel from './RouteManagerPanel';
import RouteAnalyticsPanel from './RouteAnalyticsPanel';
import { Loader2, AlertCircle, Map, MapPin, GitBranch, BarChart3, Settings, Minimize2 } from 'lucide-react';

// Status labels for display
const STATUS_LABELS: Record<string, string> = {
  active: 'Active Account',
  cold_call: 'Cold Call',
  prospect: 'Prospect',
  inactive: 'Inactive',
};

interface TerritoryMapProps {
  onMarkerClick?: (marker: PlaceMarker) => void;
  className?: string;
}

const TerritoryMap: React.FC<TerritoryMapProps> = ({ onMarkerClick, className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();
  const { visibleMarkers, toggleMarkerSelection, selectedMarkers, isLoading, places } = useTerritory();
  const { dashboardData } = useDashboard();
  const [isInitializing, setIsInitializing] = useState(true);

  // City insights state
  const [showCityBoundaries, setShowCityBoundaries] = useState(true);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);

  // Route management state
  const [colorMode, setColorMode] = useState<'performance' | 'routes'>('performance');
  const [showRouteManager, setShowRouteManager] = useState(false);
  const [showRouteAnalytics, setShowRouteAnalytics] = useState(false);
  const [controlsMinimized, setControlsMinimized] = useState(false);


  const { routes, selectedRouteId, selectRoute, addCityToRoute, getCityRoute } = useRoutes();

  // Get city insights data from dashboard
  const cityInsights = dashboardData?.city_insights;

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Calculate center based on places if available
    let center = {
      lat: PHOENIX_METRO_CENTER.latitude,
      lng: PHOENIX_METRO_CENTER.longitude,
    };

    // Use wider bounds for display since places are across multiple states
    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: 6, // Zoom out to see larger area
      styles: LIGHT_MAP_STYLE,
      gestureHandling: 'greedy',
      zoomControl: true,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      scaleControl: true,
      rotateControl: false,
      clickableIcons: false,
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    setIsInitializing(false);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }
    };
  }, [isLoaded]);

  // Fit map bounds to show all markers when places load
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || visibleMarkers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    visibleMarkers.forEach(marker => {
      bounds.extend({
        lat: marker.position.latitude,
        lng: marker.position.longitude,
      });
    });

    // Only fit bounds if we have markers
    if (visibleMarkers.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);

      // Don't zoom in too far for a single marker - use setTimeout to check after bounds are applied
      setTimeout(() => {
        const zoom = mapInstanceRef.current?.getZoom();
        if (zoom && zoom > 15) {
          mapInstanceRef.current?.setZoom(15);
        }
      }, 100);
    }
  }, [visibleMarkers.length, isLoaded]);

  // Update markers when visible markers change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || isInitializing) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    visibleMarkers.forEach((markerData) => {
      const isSelected = selectedMarkers.some((m) => m.id === markerData.id);

      // Create custom marker icon (using Symbol)
      const icon: google.maps.Symbol = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: markerData.color,
        fillOpacity: isSelected ? 1 : 0.8,
        strokeColor: isSelected ? '#1e40af' : '#ffffff',
        strokeWeight: isSelected ? 3 : 2,
        scale: isSelected ? 12 : 10,
      };

      const marker = new google.maps.Marker({
        position: {
          lat: markerData.position.latitude,
          lng: markerData.position.longitude,
        },
        map: mapInstanceRef.current ?? undefined,
        icon,
        title: markerData.place.title,
        optimized: true,
      });

      // Add click listener
      marker.addListener('click', () => {
        toggleMarkerSelection(markerData);
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }

        // Show info window
        if (infoWindowRef.current) {
          const place = markerData.place;
          const statusLabel = STATUS_LABELS[place.status] || place.status;

          const content = `
            <div style="padding: 12px; min-width: 250px; max-width: 350px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                ${place.title}
              </h3>
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">
                <div style="margin-bottom: 6px;">
                  <strong>Address:</strong><br/>
                  <span style="color: #374151;">${place.address}</span>
                </div>
                ${place.notes ? `
                <div style="margin-bottom: 6px;">
                  <strong>Notes:</strong><br/>
                  <span style="color: #374151;">${place.notes}</span>
                </div>
                ` : ''}
                ${place.lastVisit ? `
                <div style="margin-bottom: 6px;">
                  <strong>Last Visit:</strong> ${place.lastVisit}
                </div>
                ` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <span style="display: inline-block; padding: 4px 12px; background-color: ${markerData.color}20; color: ${markerData.color}; border-radius: 16px; font-size: 12px; font-weight: 600;">
                  ${statusLabel}
                </span>
                ${place.originalUrl ? `
                <a href="${place.originalUrl}" target="_blank" rel="noopener noreferrer"
                   style="color: #3b82f6; font-size: 12px; text-decoration: none; margin-left: auto;">
                  View on Maps →
                </a>
                ` : ''}
              </div>
              <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af;">
                Click to ${isSelected ? 'deselect' : 'select'} for route planning
              </div>
            </div>
          `;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapInstanceRef.current ?? undefined, marker);
        }
      });

      markersRef.current.push(marker);
    });
  }, [visibleMarkers, selectedMarkers, isLoaded, isInitializing, toggleMarkerSelection, onMarkerClick]);

  // Update marker styles when selection changes
  useEffect(() => {
    if (!isLoaded || isInitializing) return;

    markersRef.current.forEach((marker, index) => {
      const markerData = visibleMarkers[index];
      if (markerData) {
        const isSelected = selectedMarkers.some((m) => m.id === markerData.id);
        const icon: google.maps.Symbol = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: markerData.color,
          fillOpacity: isSelected ? 1 : 0.8,
          strokeColor: isSelected ? '#1e40af' : '#ffffff',
          strokeWeight: isSelected ? 3 : 2,
          scale: isSelected ? 12 : 10,
        };
        marker.setIcon(icon);
      }
    });
  }, [selectedMarkers, visibleMarkers, isLoaded, isInitializing]);

  // Loading state for Google Maps
  if (!isLoaded && !loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Google Maps...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Error state for Google Maps
  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Failed to Load Map</p>
          <p className="text-sm text-gray-600">
            {loadError.message || 'An error occurred while loading Google Maps'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapRef} className="w-full h-full" />

      {/* City Overlay - renders city boundaries */}
      {isLoaded && mapInstanceRef.current && cityInsights && (
        <CityOverlay
          map={mapInstanceRef.current}
          cities={cityInsights.cities}
          showBoundaries={showCityBoundaries}
          colorMode={colorMode}
          onCityClick={(city) => setSelectedCity(city)}
          onCityHover={(city) => setHoveredCity(city)}
          onAssignCity={() => {
            // City was assigned to a route from the info window
            // The CityOverlay handles the actual assignment
          }}
        />
      )}

      {/* City Insights Panel - shows when a city is clicked */}
      {selectedCity && (
        <CityInsightsPanel
          city={selectedCity}
          onClose={() => setSelectedCity(null)}
        />
      )}

      {/* Loading overlay for places */}
      {(isInitializing || isLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {isLoading ? 'Loading places...' : 'Initializing map...'}
            </p>
          </div>
        </div>
      )}

      {/* Map Controls - Floating Toolbar (Top Right) */}
      {!isLoading && !isInitializing && cityInsights && (
        <div className="absolute top-4 right-4 z-10">
          {/* Collapsed Controls - Single Icon Button */}
          {controlsMinimized ? (
            <button
              onClick={() => setControlsMinimized(false)}
              className="bg-white rounded-lg shadow-md p-2.5 hover:bg-gray-50 transition-colors"
              title="Show Map Controls"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Header with minimize button */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500">Controls</span>
                  <button
                    onClick={() => setControlsMinimized(true)}
                    className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                    title="Minimize Controls"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <button
                  onClick={() => setShowCityBoundaries(!showCityBoundaries)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors w-full ${
                    showCityBoundaries
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  {showCityBoundaries ? 'Hide Cities' : 'Show Cities'}
                </button>
              </div>

              {/* Color Mode Toggle */}
              {showCityBoundaries && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="flex">
                    <button
                      onClick={() => setColorMode('performance')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                        colorMode === 'performance'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Performance
                    </button>
                    <button
                      onClick={() => setColorMode('routes')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                        colorMode === 'routes'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Routes
                    </button>
                  </div>
                </div>
              )}

              {/* Route Management Buttons */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => {
                    setShowRouteManager(!showRouteManager);
                    setShowRouteAnalytics(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors w-full ${
                    showRouteManager
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <GitBranch className="w-4 h-4" />
                  Manage Routes
                  {routes.length > 0 && (
                    <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                      {routes.length}
                    </span>
                  )}
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={() => {
                    setShowRouteAnalytics(!showRouteAnalytics);
                    setShowRouteManager(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors w-full ${
                    showRouteAnalytics
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Route Analytics
                </button>
              </div>

              {/* Clear Route Selection */}
              {selectedRouteId && (
                <button
                  onClick={() => selectRoute(null)}
                  className="bg-white rounded-lg shadow-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Route Manager Panel */}
      {showRouteManager && (
        <RouteManagerPanel
          onClose={() => setShowRouteManager(false)}
          onSelectCity={(city) => setSelectedCity(city)}
        />
      )}

      {/* Route Analytics Panel */}
      {showRouteAnalytics && (
        <RouteAnalyticsPanel
          onClose={() => setShowRouteAnalytics(false)}
          onSelectCity={(city) => setSelectedCity(city)}
        />
      )}

      {/* Places count indicator */}
      {!isLoading && !isInitializing && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 text-sm z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">{visibleMarkers.length}</span>
              <span className="text-gray-500">
                {visibleMarkers.length === 1 ? 'location' : 'locations'}
              </span>
              {places.length !== visibleMarkers.length && (
                <span className="text-gray-400">of {places.length}</span>
              )}
            </div>
            {cityInsights && (
              <>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-900">{cityInsights.total_cities}</span>
                  <span className="text-gray-500">cities</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hovered City Quick Info with Route Assignment */}
      {hoveredCity && !selectedCity && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-3 z-20 min-w-[280px]">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{hoveredCity.city}</div>
            <div className="text-sm text-gray-500 flex items-center justify-center gap-3 mt-1">
              <span>{hoveredCity.total_accounts} accounts</span>
              <span className={hoveredCity.units_change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {hoveredCity.units_change >= 0 ? '+' : ''}{hoveredCity.units_change.toLocaleString()} units
              </span>
            </div>

            {/* Route Assignment */}
            {routes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {(() => {
                  const currentRoute = getCityRoute(hoveredCity.city);
                  return currentRoute ? (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: currentRoute.color }}
                      />
                      <span className="text-gray-600">In route: <span className="font-medium">{currentRoute.name}</span></span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-gray-500">Add to route:</span>
                      <div className="flex gap-1">
                        {routes.slice(0, 4).map((route) => (
                          <button
                            key={route.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              addCityToRoute(route.id, hoveredCity.city);
                            }}
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                            style={{ backgroundColor: route.color }}
                            title={`Add to ${route.name}`}
                          />
                        ))}
                        {routes.length > 4 && (
                          <span className="text-xs text-gray-400 ml-1">+{routes.length - 4}</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TerritoryMap;
