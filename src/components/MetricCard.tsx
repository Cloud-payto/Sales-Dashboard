import React from 'react';
import { DollarSign, Users, TrendingUp, TrendingDown, UserPlus, UserCheck } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon: 'sales' | 'accounts' | 'average' | 'new' | 'growing' | 'declining';
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
  trend = 'neutral'
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'sales':
        return <DollarSign className="w-5 h-5" />;
      case 'accounts':
        return <Users className="w-5 h-5" />;
      case 'average':
        return <DollarSign className="w-5 h-5" />;
      case 'new':
        return <UserPlus className="w-5 h-5" />;
      case 'growing':
        return <TrendingUp className="w-5 h-5" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getTrendColor = () => {
    if (icon === 'declining') return 'text-red-600';
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          icon === 'declining' ? 'bg-red-100 text-red-600' :
          icon === 'growing' ? 'bg-green-100 text-green-600' :
          icon === 'new' ? 'bg-blue-100 text-blue-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          {getIcon()}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-600 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
        {changeLabel && (
          <p className="text-sm text-gray-500 mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
