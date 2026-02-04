import { useMemo } from 'react';

interface TrendDataPoint {
  date: string;
  overallScore: number;
  completionScore: number;
  performanceScore: number;
}

interface ScoreTrendChartProps {
  data: TrendDataPoint[];
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export function ScoreTrendChart({
  data,
  height = 200,
  showLegend = true,
  className = '',
}: ScoreTrendChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 600;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxScore = 100;
    const minScore = 0;

    const xScale = (index: number) =>
      padding.left + (index / (data.length - 1 || 1)) * chartWidth;
    const yScale = (value: number) =>
      padding.top + chartHeight - ((value - minScore) / (maxScore - minScore)) * chartHeight;

    const createPath = (values: number[]) => {
      return values
        .map((val, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(val)}`)
        .join(' ');
    };

    return {
      width,
      height,
      padding,
      chartWidth,
      chartHeight,
      xScale,
      yScale,
      overallPath: createPath(data.map((d) => d.overallScore)),
      completionPath: createPath(data.map((d) => d.completionScore)),
      performancePath: createPath(data.map((d) => d.performanceScore)),
      gridLines: [0, 25, 50, 75, 100].map((val) => ({
        y: yScale(val),
        label: val.toString(),
      })),
      xLabels: data.filter((_, i) => i % Math.ceil(data.length / 5) === 0 || i === data.length - 1),
    };
  }, [data, height]);

  if (!chartData || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}
        style={{ height }}
      >
        <span className="text-gray-400">No trend data available</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${chartData.width} ${chartData.height}`}
        className="w-full"
        style={{ height }}
      >
        {/* Grid lines */}
        {chartData.gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={chartData.padding.left}
              y1={line.y}
              x2={chartData.width - chartData.padding.right}
              y2={line.y}
              stroke="#e5e7eb"
              strokeDasharray="4"
            />
            <text
              x={chartData.padding.left - 8}
              y={line.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#9ca3af"
            >
              {line.label}
            </text>
          </g>
        ))}

        {/* Completion score line */}
        <path
          d={chartData.completionPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />

        {/* Performance score line */}
        <path
          d={chartData.performancePath}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />

        {/* Overall score line (main) */}
        <path
          d={chartData.overallPath}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points for overall */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={chartData.xScale(i)}
            cy={chartData.yScale(d.overallScore)}
            r="4"
            fill="#22c55e"
            className="hover:r-6 transition-all cursor-pointer"
          >
            <title>
              {new Date(d.date).toLocaleDateString()}: {d.overallScore.toFixed(1)}
            </title>
          </circle>
        ))}

        {/* X-axis labels */}
        {chartData.xLabels.map((d, i) => {
          const index = data.indexOf(d);
          return (
            <text
              key={i}
              x={chartData.xScale(index)}
              y={chartData.height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#9ca3af"
            >
              {new Date(d.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </text>
          );
        })}
      </svg>

      {showLegend && (
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">Overall</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 opacity-60" />
            <span className="text-xs text-gray-600">Completion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 opacity-60" />
            <span className="text-xs text-gray-600">Performance</span>
          </div>
        </div>
      )}
    </div>
  );
}
