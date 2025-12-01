import React from 'react';
import { MapPin, TrendingUp, TrendingDown, DollarSign, Calendar, Plus } from 'lucide-react';
import { MapMarker } from '../../types/territory';
import { STATUS_COLORS } from '../../constants/territories';

interface AccountMarkerInfoProps {
  marker: MapMarker;
  onAddToRoute?: (marker: MapMarker) => void;
  isInRoute?: boolean;
}

const AccountMarkerInfo: React.FC<AccountMarkerInfoProps> = ({
  marker,
  onAddToRoute,
  isInRoute = false,
}) => {
  const { account } = marker;
  const difference = account.Difference;
  const percentChange = account['PY Total'] > 0
    ? ((difference / account['PY Total']) * 100).toFixed(1)
    : 'N/A';

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base mb-1">
              {account.Name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="w-3 h-3" />
              {account.City}
            </div>
          </div>
          <span
            className="px-2 py-1 text-xs font-semibold rounded-full uppercase tracking-wide"
            style={{
              backgroundColor: `${getStatusColor(account.status)}20`,
              color: getStatusColor(account.status),
            }}
          >
            {getStatusLabel(account.status)}
          </span>
        </div>
      </div>

      {/* Account Details */}
      <div className="p-4 space-y-4">
        {/* Account Number */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Account #:</span>
          <span className="font-mono">{account['Acct #']}</span>
        </div>

        {/* Sales Data */}
        <div className="space-y-3">
          {/* Current Year */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Year</span>
            <div className="flex items-center gap-1 font-semibold text-gray-900">
              <DollarSign className="w-4 h-4" />
              {account['CY Total'].toLocaleString()}
            </div>
          </div>

          {/* Previous Year */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Previous Year</span>
            <div className="flex items-center gap-1 font-semibold text-gray-900">
              <DollarSign className="w-4 h-4" />
              {account['PY Total'].toLocaleString()}
            </div>
          </div>

          {/* Change */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Change</span>
              <div className="flex items-center gap-2">
                {difference >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`font-bold ${
                    difference >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {difference >= 0 ? '+' : ''}${difference.toLocaleString()}
                </span>
              </div>
            </div>
            {percentChange !== 'N/A' && (
              <div className="text-right text-sm text-gray-500 mt-1">
                {percentChange}%
              </div>
            )}
          </div>
        </div>

        {/* Visit Information (if available) */}
        {(account.lastVisit || account.nextVisit) && (
          <div className="pt-3 border-t border-gray-200 space-y-2">
            {account.lastVisit && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Visit</span>
                <div className="flex items-center gap-1 text-gray-900">
                  <Calendar className="w-3 h-3" />
                  {new Date(account.lastVisit).toLocaleDateString()}
                </div>
              </div>
            )}
            {account.nextVisit && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Next Visit</span>
                <div className="flex items-center gap-1 text-gray-900">
                  <Calendar className="w-3 h-3" />
                  {new Date(account.nextVisit).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Territory/Zone (if available) */}
        {(account.territory || account.zone) && (
          <div className="pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {account.territory && (
                <div>
                  <span className="text-gray-600">Territory</span>
                  <div className="font-medium text-gray-900 mt-0.5">
                    {account.territory}
                  </div>
                </div>
              )}
              {account.zone && (
                <div>
                  <span className="text-gray-600">Zone</span>
                  <div className="font-medium text-gray-900 mt-0.5">
                    {account.zone}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {onAddToRoute && !isInRoute && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onAddToRoute(marker)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add to Route
          </button>
        </div>
      )}

      {isInRoute && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-1 text-sm text-green-600 font-medium">
            <Plus className="w-4 h-4" />
            Already in route
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMarkerInfo;
