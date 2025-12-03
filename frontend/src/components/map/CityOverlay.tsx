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

  // Create info window content for a city
  const createInfoWindowContent = useCallback((city: CityData): string => {
    const changeColor = city.units_change >= 0 ? '#22c55e' : '#ef4444';
    const changeIcon = city.units_change >= 0 ? '↑' : '↓';
    const changePct = Math.abs(city.units_change_pct).toFixed(1);
    const route = getCityRoute(city.city);

    // Build route assignment buttons HTML
    const routeButtonsHtml = routes.length > 0 && !route
      ? `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
          <div style="font-size: 11px; color: #6b7280; margin-bottom: 8px; text-align: center;">Add to route:</div>
          <div style="display: flex; justify-content: center; gap: 6px; flex-wrap: wrap;">
            ${routes.slice(0, 6).map(r => `
              <button
                onclick="window.__assignCityToRoute && window.__assignCityToRoute('${city.city}', '${r.id}')"
                style="display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: ${r.color}15; border: 1px solid ${r.color}40; border-radius: 12px; cursor: pointer; font-size: 11px; color: ${r.color}; font-weight: 500; transition: all 0.15s;"
                onmouseover="this.style.background='${r.color}25'"
                onmouseout="this.style.background='${r.color}15'"
              >
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${r.color};"></span>
                ${r.name}
              </button>
            `).join('')}
          </div>
        </div>
      `
      : '';

    return `
      <div style="padding: 16px; min-width: 280px; max-width: 350px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${getCityColor(city)};"></div>
          <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">
            ${city.city}
          </h3>
          ${route ? `<span style="font-size: 11px; padding: 2px 8px; background-color: ${route.color}20; color: ${route.color}; border-radius: 12px; font-weight: 500;">${route.name}</span>` : ''}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div style="background: #f3f4f6; padding: 10px; border-radius: 8px;">
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Accounts</div>
            <div style="font-size: 20px; font-weight: 600; color: #1f2937;">${city.total_accounts}</div>
          </div>
          <div style="background: #f3f4f6; padding: 10px; border-radius: 8px;">
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Units CY</div>
            <div style="font-size: 20px; font-weight: 600; color: #1f2937;">${city.total_units_cy.toLocaleString()}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; padding: 10px; background: ${changeColor}10; border-radius: 8px; margin-bottom: 12px;">
          <span style="font-size: 16px;">${changeIcon}</span>
          <span style="font-size: 14px; color: ${changeColor}; font-weight: 600;">
            ${city.units_change >= 0 ? '+' : ''}${city.units_change.toLocaleString()} units (${changePct}%)
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
          <div style="text-align: center;">
            <div style="font-size: 16px; font-weight: 600; color: #22c55e;">${city.growing_count}</div>
            <div style="font-size: 10px; color: #6b7280;">Growing</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 16px; font-weight: 600; color: #ef4444;">${city.declining_count}</div>
            <div style="font-size: 10px; color: #6b7280;">Declining</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 16px; font-weight: 600; color: #f59e0b;">${city.lost_count}</div>
            <div style="font-size: 10px; color: #6b7280;">Lost</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 16px; font-weight: 600; color: #3b82f6;">${city.new_count}</div>
            <div style="font-size: 10px; color: #6b7280;">New</div>
          </div>
        </div>

        ${routeButtonsHtml}

        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center;">
          Click for detailed city insights
        </div>
      </div>
    `;
  }, [getCityRoute, getCityColor, routes]);

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

        // Add hover effects
        polygon.addListener('mouseover', () => {
          polygon.setOptions({
            strokeWeight: isHighlighted ? 4 : 3,
            fillOpacity: Math.min(opacity + 0.15, 0.85),
          });
          onCityHover?.(city);

          // Show info window on hover
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(createInfoWindowContent(city));
            infoWindowRef.current.setPosition({
              lat: boundary.center.lat,
              lng: boundary.center.lng,
            });
            infoWindowRef.current.open(map);
          }
        });

        polygon.addListener('mouseout', () => {
          polygon.setOptions({
            strokeWeight: isHighlighted ? 3 : 2,
            fillOpacity: opacity,
          });
          onCityHover?.(null);
        });

        polygon.addListener('click', () => {
          onCityClick?.(city);
        });

        polygonsRef.current.push(polygon);
      });
    });

    // Cleanup
    return () => {
      polygonsRef.current.forEach(p => p.setMap(null));
      polygonsRef.current = [];
    };
  }, [map, cityPolygons, maxUnits, onCityClick, onCityHover, createInfoWindowContent, getCityColor, isCityHighlighted, selectedRouteId]);

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
