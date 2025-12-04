import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CityData } from '../../types';
import { CityBoundary, fetchCityBoundaries, getCityPerformanceColor, getCityOpacity } from '../../utils/cityBoundaries';
import { useRoutes } from '../../contexts/RouteContext';
import { Loader2 } from 'lucide-react';

interface CityOverlayProps {
  map: google.maps.Map | null;
  cities: CityData[];
  onCityClick?: (city: CityData) => void;
  onCityHover?: (city: CityData | null) => void;
  onAssignCity?: (cityName: string, routeId: string) => void;
  showBoundaries?: boolean;
  colorMode?: 'performance' | 'routes';  // How to color cities
  // New props for click-to-assign mode
  cityAssignmentMode?: boolean;
  selectedRouteForAssignment?: string | null;
}

interface CityPolygonData {
  city: CityData;
  boundary: CityBoundary;
}

const CityOverlay: React.FC<CityOverlayProps> = ({
  map,
  cities,
  onCityClick,
  onCityHover,
  onAssignCity,
  showBoundaries = true,
  colorMode = 'performance',
  cityAssignmentMode = false,
  selectedRouteForAssignment = null,
}) => {
  const [cityPolygons, setCityPolygons] = useState<CityPolygonData[]>([]);
  const [isLoadingBoundaries, setIsLoadingBoundaries] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ completed: 0, total: 0 });
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polygonsRef = useRef<any[]>([]);

  const { routes, getCityRoute, selectedRouteId, addCityToRoute } = useRoutes();

  // Register global callback for info window buttons
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__assignCityToRoute = (cityName: string, routeId: string) => {
      addCityToRoute(routeId, cityName);
      if (onAssignCity) {
        onAssignCity(cityName, routeId);
      }
      // Close info window after assignment
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__assignCityToRoute;
    };
  }, [addCityToRoute, onAssignCity]);

  // Calculate max units for opacity scaling
  const maxUnits = Math.max(...cities.map(c => c.total_units_cy), 1);

  // Get color for a city based on color mode
  const getCityColor = useCallback((city: CityData): string => {
    if (colorMode === 'routes') {
      const route = getCityRoute(city.city);
      if (route) {
        return route.color;
      }
      return '#9ca3af'; // Gray for unassigned
    }
    return getCityPerformanceColor(city.units_change, city.units_change_pct);
  }, [colorMode, getCityRoute]);

  // Check if city should be highlighted (in selected route)
  const isCityHighlighted = useCallback((cityName: string): boolean => {
    if (!selectedRouteId) return false;
    const route = routes.find(r => r.id === selectedRouteId);
    return route?.cities.includes(cityName) || false;
  }, [selectedRouteId, routes]);

  // Fetch city boundaries when cities change
  useEffect(() => {
    if (!map || !showBoundaries || cities.length === 0) return;

    const fetchBoundaries = async () => {
      setIsLoadingBoundaries(true);
      setLoadingProgress({ completed: 0, total: cities.length });

      try {
        const cityNames = cities.map(c => c.city);
        const boundaries = await fetchCityBoundaries(
          cityNames,
          'Arizona',
          (completed, total) => {
            setLoadingProgress({ completed, total });
          }
        );

        // Create polygon data for each city
        const polygonData: CityPolygonData[] = [];
        cities.forEach(city => {
          const boundary = boundaries.get(city.city);
          if (boundary) {
            polygonData.push({
              city,
              boundary,
            });
          }
        });

        setCityPolygons(polygonData);
      } catch (error) {
        console.error('Error fetching city boundaries:', error);
      } finally {
        setIsLoadingBoundaries(false);
      }
    };

    fetchBoundaries();
  }, [cities, map, showBoundaries]);

  // Render polygons on the map
  useEffect(() => {
    if (!map || cityPolygons.length === 0) return;

    // Clear existing polygons
    polygonsRef.current.forEach(p => p.setMap(null));
    polygonsRef.current = [];

    // Create info window if not exists
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    // Create polygons for each city
    cityPolygons.forEach(({ city, boundary }) => {
      const color = getCityColor(city);
      const isHighlighted = isCityHighlighted(city.city);
      const baseOpacity = getCityOpacity(city.total_units_cy, maxUnits);
      // Dim non-highlighted cities when a route is selected
      const opacity = selectedRouteId
        ? (isHighlighted ? baseOpacity + 0.1 : baseOpacity * 0.3)
        : baseOpacity;

      // Handle both single polygon and multi-polygon
      const polygonPaths = Array.isArray(boundary.polygon[0])
        ? boundary.polygon as google.maps.LatLngLiteral[][]
        : [boundary.polygon as google.maps.LatLngLiteral[]];

      polygonPaths.forEach(path => {
        const polygon = new google.maps.Polygon({
          paths: path,
          strokeColor: color,
          strokeOpacity: isHighlighted ? 1 : 0.8,
          strokeWeight: isHighlighted ? 3 : 2,
          fillColor: color,
          fillOpacity: opacity,
          map,
          zIndex: isHighlighted ? 10 : 1,
        });

        // Add hover effects - lighter feedback, no info window
        polygon.addListener('mouseover', () => {
          polygon.setOptions({
            strokeWeight: isHighlighted ? 4 : 3,
            fillOpacity: Math.min(opacity + 0.1, 0.75),
          });
          onCityHover?.(city);
        });

        polygon.addListener('mouseout', () => {
          polygon.setOptions({
            strokeWeight: isHighlighted ? 3 : 2,
            fillOpacity: opacity,
          });
          onCityHover?.(null);
        });

        // Click handler - supports click-to-assign mode
        polygon.addListener('click', () => {
          // If in assignment mode and a route is selected, assign the city
          if (cityAssignmentMode && selectedRouteForAssignment) {
            addCityToRoute(selectedRouteForAssignment, city.city);
            if (onAssignCity) {
              onAssignCity(city.city, selectedRouteForAssignment);
            }
          } else {
            // Normal click - show city details
            onCityClick?.(city);
          }
        });

        polygonsRef.current.push(polygon);
      });
    });

    // Cleanup
    return () => {
      polygonsRef.current.forEach(p => p.setMap(null));
      polygonsRef.current = [];
    };
  }, [map, cityPolygons, maxUnits, onCityClick, onCityHover, getCityColor, isCityHighlighted, selectedRouteId, cityAssignmentMode, selectedRouteForAssignment, addCityToRoute, onAssignCity]);

  // Don't render anything if not showing boundaries
  if (!showBoundaries) return null;

  // Loading indicator
  if (isLoadingBoundaries) {
    return (
      <div className="absolute top-20 left-4 bg-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 z-10">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <div>
          <div className="text-sm font-medium text-gray-900">Loading City Boundaries</div>
          <div className="text-xs text-gray-500">
            {loadingProgress.completed} of {loadingProgress.total} cities
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CityOverlay;
