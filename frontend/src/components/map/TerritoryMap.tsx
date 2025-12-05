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
import { Loader2, AlertCircle } from 'lucide-react';

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
  // Props controlled by sidebar
  showCityBoundaries: boolean;
  colorMode: 'performance' | 'routes';
  cityAssignmentMode: boolean;
  selectedRouteForAssignment: string | null;
  selectedCity: CityData | null;
  onSelectCity: (city: CityData | null) => void;
}

const TerritoryMap: React.FC<TerritoryMapProps> = ({
  onMarkerClick,
  className = '',
  showCityBoundaries,
  colorMode,
  cityAssignmentMode,
  selectedRouteForAssignment,
  selectedCity,
  onSelectCity,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();
  const { visibleMarkers, toggleMarkerSelection, selectedMarkers, isLoading } = useTerritory();
  const { dashboardData } = useDashboard();
  const [isInitializing, setIsInitializing] = useState(true);

  // Hovered city state (local only - for tooltip)
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);


  const { getCityRoute } = useRoutes();

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
          onCityClick={(city) => onSelectCity(city)}
          onCityHover={(city) => setHoveredCity(city)}
          cityAssignmentMode={cityAssignmentMode}
          selectedRouteForAssignment={selectedRouteForAssignment}
          onAssignCity={(cityName, routeId) => {
            // Show feedback when city is assigned
            console.log(`Assigned ${cityName} to route ${routeId}`);
          }}
        />
      )}

      {/* City Insights Panel - shows when a city is clicked */}
      {selectedCity && (
        <CityInsightsPanel
          city={selectedCity}
          onClose={() => onSelectCity(null)}
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

      {/* Minimal hover tooltip - just city name and route indicator */}
      {hoveredCity && !selectedCity && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white rounded-lg px-3 py-2 z-20 pointer-events-none">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{hoveredCity.city}</span>
            {(() => {
              const currentRoute = getCityRoute(hoveredCity.city);
              return currentRoute ? (
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentRoute.color }}
                />
              ) : null;
            })()}
          </div>
          {cityAssignmentMode && selectedRouteForAssignment && (
            <div className="text-xs text-gray-300 mt-1">Click to add to route</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TerritoryMap;
