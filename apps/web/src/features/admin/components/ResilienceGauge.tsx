import { useMemo } from 'react';

interface ResilienceGaugeProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ResilienceGauge({
  score,
  size = 'md',
  showLabel = true,
  className = '',
}: ResilienceGaugeProps) {
  const dimensions = useMemo(() => {
    switch (size) {
      case 'sm':
        return { width: 120, height: 120, strokeWidth: 8, fontSize: 24 };
      case 'lg':
        return { width: 200, height: 200, strokeWidth: 14, fontSize: 40 };
      default:
        return { width: 160, height: 160, strokeWidth: 12, fontSize: 32 };
    }
  }, [size]);

  const { width, height, strokeWidth, fontSize } = dimensions;
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = score ?? 0;
  const progress = (normalizedScore / 100) * circumference;

  const getScoreColor = (value: number) => {
    if (value >= 80) return '#22c55e'; // green
    if (value >= 60) return '#eab308'; // yellow
    if (value >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getScoreLabel = (value: number) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'At Risk';
  };

  const scoreColor = getScoreColor(normalizedScore);

  if (score === null) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div
          className="relative flex items-center justify-center"
          style={{ width, height }}
        >
          <svg width={width} height={height} className="transform -rotate-90">
            <circle
              cx={width / 2}
              cy={height / 2}
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-sm">No data</span>
          </div>
        </div>
        {showLabel && (
          <span className="mt-2 text-sm text-gray-500">Resilience Score</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width, height }}
      >
        <svg width={width} height={height} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold"
            style={{ fontSize, color: scoreColor }}
          >
            {Math.round(normalizedScore)}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {getScoreLabel(normalizedScore)}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="mt-2 text-sm font-medium text-gray-700">
          Resilience Score
        </span>
      )}
    </div>
  );
}
