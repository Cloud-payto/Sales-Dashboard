import React from 'react';
import { useTerritory } from '../../contexts/TerritoryContext';
import { UNASSIGNED_COLOR } from '../../constants/territories';
import { AlertTriangle } from 'lucide-react';

interface ZoneLegendProps {
  showUnassignedCount?: boolean;
}

const ZoneLegend: React.FC<ZoneLegendProps> = ({ showUnassignedCount = true }) => {
  const { zones, unassignedPlaces, places } = useTerritory();

  // Count places per zone
  const zoneCounts = zones.map(zone => ({
    ...zone,
    count: places.filter(p => p.zoneId === zone.id).length,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Zone Legend</h3>

      <div className="space-y-2">
        {zoneCounts.map(zone => (
          <div key={zone.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: zone.color }}
              />
              <span className="text-sm text-gray-700">{zone.name}</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {zone.count}
            </span>
          </div>
        ))}

        {/* Unassigned */}
        {showUnassignedCount && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: UNASSIGNED_COLOR }}
              />
              <span className="text-sm text-gray-500 flex items-center gap-1">
                Unassigned
                {unassignedPlaces.length > 0 && (
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                )}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              unassignedPlaces.length > 0
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {unassignedPlaces.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneLegend;
