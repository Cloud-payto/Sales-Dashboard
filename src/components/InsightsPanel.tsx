import React from 'react';
import { AlertCircle, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface InsightsPanelProps {
  insights: string[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  const getInsightType = (insight: string): 'urgent' | 'alert' | 'opportunity' | 'info' => {
    if (insight.includes('URGENT')) return 'urgent';
    if (insight.includes('Alert') || insight.includes('declining')) return 'alert';
    if (insight.includes('Opportunity') || insight.includes('PERFORMER') || insight.includes('up ')) return 'opportunity';
    return 'info';
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          textColor: 'text-red-900'
        };
      case 'alert':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
          textColor: 'text-orange-900'
        };
      case 'opportunity':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <TrendingUp className="w-5 h-5 text-green-600" />,
          textColor: 'text-green-900'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <Lightbulb className="w-5 h-5 text-blue-600" />,
          textColor: 'text-blue-900'
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights & Alerts</h3>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const type = getInsightType(insight);
          const style = getInsightStyle(type);

          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border ${style.bg} ${style.border} transition-all hover:shadow-md`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {style.icon}
              </div>
              <p className={`text-sm font-medium ${style.textColor} flex-1`}>
                {insight}
              </p>
            </div>
          );
        })}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">No insights available</p>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;
