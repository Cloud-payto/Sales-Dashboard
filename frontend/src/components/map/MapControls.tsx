import React, { useState } from 'react';
import { Filter, MapPin, X, Navigation, ChevronDown, ChevronUp } from 'lucide-react';
import { useTerritory } from '../../contexts/TerritoryContext';
import { PlaceStatus } from '../../types/territory';

// Place status color definitions
const PLACE_STATUS_COLORS: Record<PlaceStatus, string> = {
  active: '#10b981',
  cold_call: '#3b82f6',
  prospect: '#f59e0b',
  inactive: '#6b7280',
};

interface MapControlsProps {
  onPlanRoute?: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ onPlanRoute }) => {
  const {
    selectedMarkers,
    clearSelection,
    territories,
    territoryFilter,
    setTerritoryFilter,
    statusFilter,
    setStatusFilter,
  } = useTerritory();

  const [isExpanded, setIsExpanded] = useState(true);

  const handleTerritoryChange = (territoryId: string) => {
    setTerritoryFilter(territoryId === 'all' ? null : territoryId);
  };

  const handleStatusChange = (status: PlaceStatus) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const statusOptions: { value: PlaceStatus; label: string; color: string }[] = [
    { value: 'active', label: 'Active Account', color: PLACE_STATUS_COLORS.active },
    { value: 'cold_call', label: 'Cold Call', color: PLACE_STATUS_COLORS.cold_call },
    { value: 'prospect', label: 'Prospect', color: PLACE_STATUS_COLORS.prospect },
    { value: 'inactive', label: 'Inactive', color: PLACE_STATUS_COLORS.inactive },
  ];

  return (
    <div className="absolute top-24 right-4 bg-white rounded-lg shadow-lg border border-gray-200 w-72 z-10">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Map Controls</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Territory/Zone Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Territory Zone
            </label>
            <select
              value={territoryFilter || 'all'}
              onChange={(e) => handleTerritoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Territories</option>
              {territories.map((territory) => (
                <option key={territory.id} value={territory.id}>
                  {territory.name}
                </option>
              ))}
            </select>
          </div>

          {/* Place Status Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Place Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={statusFilter.length === 0 || statusFilter.includes(option.value)}
                    onChange={() => handleStatusChange(option.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {option.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {statusFilter.length > 0 && (
              <button
                onClick={() => setStatusFilter([])}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Show all statuses
              </button>
            )}
          </div>

          {/* Selected Markers Info */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  {selectedMarkers.length} Selected
                </span>
              </div>
              {selectedMarkers.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Selected locations list */}
            {selectedMarkers.length > 0 && (
              <div className="max-h-32 overflow-y-auto mb-3 space-y-1">
                {selectedMarkers.map((marker, index) => (
                  <div
                    key={marker.id}
                    className="flex items-center gap-2 text-xs text-gray-600 py-1 px-2 bg-gray-50 rounded"
                  >
                    <span className="w-4 h-4 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="truncate flex-1">{marker.place.title}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Plan Route Button */}
            <button
              onClick={onPlanRoute}
              disabled={selectedMarkers.length < 2}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                selectedMarkers.length >= 2
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Navigation className="w-4 h-4" />
              Plan Route
              {selectedMarkers.length >= 2 && (
                <span className="ml-1 text-xs bg-blue-500 px-1.5 py-0.5 rounded">
                  {selectedMarkers.length} stops
                </span>
              )}
            </button>

            {selectedMarkers.length === 0 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Click markers on the map to select locations
              </p>
            )}
            {selectedMarkers.length === 1 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Select at least 2 locations for a route
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapControls;
