import React, { useState } from 'react';
import {
  Navigation,
  Clock,
  MapPin,
  Trash2,
  Loader2,
  ExternalLink,
  Zap,
  X,
} from 'lucide-react';
import { useTerritory } from '../../contexts/TerritoryContext';
import { Route } from '../../types/territory';

interface RoutePanelProps {
  route: Route | null;
  onClose?: () => void;
}

const RoutePanel: React.FC<RoutePanelProps> = ({ route, onClose }) => {
  const { optimizeRoute, deleteRoute } = useTerritory();
  const [isOptimizing, setIsOptimizing] = useState(false);

  if (!route) return null;

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    try {
      await optimizeRoute(route.id);
    } catch (error) {
      console.error('Failed to optimize route:', error);
      alert('Failed to optimize route. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDeleteRoute = () => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      deleteRoute(route.id);
      onClose?.();
    }
  };

  const handleOpenInGoogleMaps = () => {
    if (route.waypoints.length < 2) return;

    const origin = route.waypoints[0].position;
    const destination = route.waypoints[route.waypoints.length - 1].position;
    const waypoints = route.waypoints
      .slice(1, -1)
      .map((wp) => `${wp.position.latitude},${wp.position.longitude}`)
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&waypoints=${waypoints}&travelmode=driving`;

    window.open(url, '_blank');
  };

  const formatDistance = (miles: number) => {
    return `${miles.toFixed(1)} mi`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Get waypoint display info - handle both old account-based and new place-based waypoints
  const getWaypointInfo = (waypoint: any) => {
    // New place-based waypoint
    if (waypoint.place) {
      return {
        name: waypoint.place.title,
        location: waypoint.place.address.split(',')[0], // First part of address
      };
    }
    // Old account-based waypoint (for backwards compatibility)
    if (waypoint.account) {
      return {
        name: waypoint.account.Name,
        location: waypoint.account.City,
      };
    }
    return {
      name: 'Unknown Location',
      location: '',
    };
  };

  return (
    <div className="absolute top-24 right-80 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col z-10">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 text-sm">{route.name}</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDeleteRoute}
              className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
              title="Delete route"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Route Stats */}
        {route.optimized && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Navigation className="w-4 h-4" />
              <span>{formatDistance(route.totalDistance)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(route.estimatedTime)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Waypoints List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          {route.waypoints.length} Stops
        </div>

        {route.waypoints.map((waypoint, index) => {
          const info = getWaypointInfo(waypoint);
          return (
            <div
              key={waypoint.id}
              className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
            >
              <span className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5">
                {index + 1}
              </span>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {info.name}
                </div>
                {info.location && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {info.location}
                  </div>
                )}
              </div>

              {index === 0 && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  Start
                </span>
              )}
              {index === route.waypoints.length - 1 && index > 0 && (
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                  End
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-gray-200 space-y-2">
        {!route.optimized && (
          <button
            onClick={handleOptimizeRoute}
            disabled={isOptimizing || route.waypoints.length < 2}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Optimize Route
              </>
            )}
          </button>
        )}

        <button
          onClick={handleOpenInGoogleMaps}
          disabled={route.waypoints.length < 2}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 text-sm font-medium rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Google Maps
        </button>

        {route.optimized && (
          <div className="flex items-center justify-center gap-1 text-xs text-green-600">
            <Zap className="w-3 h-3" />
            Route optimized
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutePanel;
