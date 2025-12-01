import React, { useState } from 'react';
import { useTerritory } from '../../contexts/TerritoryContext';
import { ZONE_COLOR_PALETTE, UNASSIGNED_COLOR } from '../../constants/territories';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Palette,
} from 'lucide-react';

const ZoneEditorPanel: React.FC = () => {
  const {
    zones,
    addZone,
    updateZone,
    deleteZone,
    places,
    unassignedPlaces,
    selectedMarkers,
    assignPlacesToZone,
    colorByZone,
    setColorByZone,
  } = useTerritory();

  const [isExpanded, setIsExpanded] = useState(true);
  const [newZoneName, setNewZoneName] = useState('');
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  // Count places per zone
  const getZoneCount = (zoneId: string) => {
    return places.filter(p => p.zoneId === zoneId).length;
  };

  const handleAddZone = () => {
    if (newZoneName.trim()) {
      addZone(newZoneName.trim());
      setNewZoneName('');
    }
  };

  const handleStartEdit = (zoneId: string, currentName: string) => {
    setEditingZoneId(zoneId);
    setEditingName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingZoneId && editingName.trim()) {
      updateZone(editingZoneId, { name: editingName.trim() });
      setEditingZoneId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingZoneId(null);
    setEditingName('');
  };

  const handleColorChange = (zoneId: string, color: string) => {
    updateZone(zoneId, { color });
    setShowColorPicker(null);
  };

  const handleAssignSelected = (zoneId: string | undefined) => {
    if (selectedMarkers.length > 0) {
      const placeIds = selectedMarkers.map(m => m.id);
      assignPlacesToZone(placeIds, zoneId);
    }
  };

  const handleDeleteZone = (zoneId: string) => {
    const count = getZoneCount(zoneId);
    if (count > 0) {
      if (!confirm(`This zone has ${count} places assigned. They will become unassigned. Continue?`)) {
        return;
      }
    }
    deleteZone(zoneId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Zone Manager
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Color by zone toggle */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Color by zone</span>
            <button
              onClick={() => setColorByZone(!colorByZone)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                colorByZone ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  colorByZone ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Zone list */}
          <div className="space-y-2">
            {zones.map(zone => (
              <div
                key={zone.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group"
              >
                {/* Color picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(showColorPicker === zone.id ? null : zone.id)}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: zone.color }}
                  />
                  {showColorPicker === zone.id && (
                    <div className="absolute top-8 left-0 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2 grid grid-cols-4 gap-1">
                      {ZONE_COLOR_PALETTE.map(color => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(zone.id, color)}
                          className={`w-6 h-6 rounded-full hover:scale-110 transition-transform ${
                            zone.color === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Zone name */}
                {editingZoneId === zone.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-700">{zone.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {getZoneCount(zone.id)}
                    </span>
                    <button
                      onClick={() => handleStartEdit(zone.id, zone.name)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}

            {/* Unassigned indicator */}
            {unassignedPlaces.length > 0 && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: UNASSIGNED_COLOR }}
                >
                  <AlertTriangle className="w-3 h-3 text-white" />
                </div>
                <span className="flex-1 text-sm text-amber-700">Unassigned</span>
                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                  {unassignedPlaces.length}
                </span>
              </div>
            )}
          </div>

          {/* Add new zone */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="New zone name..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddZone();
              }}
            />
            <button
              onClick={handleAddZone}
              disabled={!newZoneName.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Assign selected markers */}
          {selectedMarkers.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">
                Assign {selectedMarkers.length} selected place{selectedMarkers.length > 1 ? 's' : ''} to:
              </p>
              <div className="flex flex-wrap gap-1">
                {zones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => handleAssignSelected(zone.id)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: zone.color + '20', color: zone.color, border: `1px solid ${zone.color}` }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    />
                    {zone.name}
                  </button>
                ))}
                <button
                  onClick={() => handleAssignSelected(undefined)}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-2 h-2" />
                  Unassign
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ZoneEditorPanel;
