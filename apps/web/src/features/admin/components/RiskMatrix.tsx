import { useMemo } from 'react';

interface RiskUser {
  id: string;
  name: string;
  email: string;
  riskScore: number;
  trainingCompletion: number;
  performanceScore: number;
  daysSinceActivity: number;
  riskFactors: Array<{ factor: string; description: string }>;
}

interface RiskMatrixData {
  LOW: RiskUser[];
  MEDIUM: RiskUser[];
  HIGH: RiskUser[];
  CRITICAL: RiskUser[];
}

interface RiskMatrixProps {
  data: RiskMatrixData | null;
  onUserClick?: (userId: string) => void;
  className?: string;
}

const RISK_COLORS = {
  LOW: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800', dot: 'bg-green-500' },
  MEDIUM: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  HIGH: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', dot: 'bg-orange-500' },
  CRITICAL: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', dot: 'bg-red-500' },
};

export function RiskMatrix({ data, onUserClick, className = '' }: RiskMatrixProps) {
  const summary = useMemo(() => {
    if (!data) return null;
    return {
      total: data.LOW.length + data.MEDIUM.length + data.HIGH.length + data.CRITICAL.length,
      low: data.LOW.length,
      medium: data.MEDIUM.length,
      high: data.HIGH.length,
      critical: data.CRITICAL.length,
    };
  }, [data]);

  if (!data || !summary) {
    return (
      <div className={`bg-gray-50 rounded-lg p-8 text-center ${className}`}>
        <span className="text-gray-400">No risk data available</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Summary bar */}
      <div className="flex gap-4 mb-6">
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((level) => {
          const count = data[level].length;
          const percentage = summary.total > 0 ? (count / summary.total) * 100 : 0;
          const colors = RISK_COLORS[level];

          return (
            <div key={level} className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${colors.text}`}>{level}</span>
                <span className="text-xs text-gray-500">{count}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.dot} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk quadrants */}
      <div className="grid grid-cols-2 gap-4">
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((level) => {
          const users = data[level];
          const colors = RISK_COLORS[level];

          return (
            <div
              key={level}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium ${colors.text}`}>{level} Risk</h4>
                <span className={`text-sm ${colors.text}`}>{users.length} users</span>
              </div>

              {users.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No users in this category</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {users.slice(0, 10).map((user) => (
                    <div
                      key={user.id}
                      className="bg-white rounded p-2 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onUserClick?.(user.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{user.name}</span>
                        <span className={`text-xs font-bold ${colors.text}`}>
                          {user.riskScore}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-1 text-xs text-gray-500">
                        <span>Training: {user.trainingCompletion.toFixed(0)}%</span>
                        <span>Perf: {user.performanceScore.toFixed(0)}%</span>
                      </div>
                      {user.riskFactors.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {user.riskFactors.slice(0, 2).map((factor, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-100 px-1 rounded"
                              title={factor.description}
                            >
                              {factor.factor.replace(/_/g, ' ').toLowerCase()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {users.length > 10 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{users.length - 10} more users
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
