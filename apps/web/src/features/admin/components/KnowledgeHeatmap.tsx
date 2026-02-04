import { useMemo } from 'react';

interface TopicData {
  roomId: string;
  roomName: string;
  roomType: string;
  completionRate: number;
  avgScore: number;
  totalAttempts: number;
}

interface GroupData {
  groupId: string;
  groupName: string;
  topics: TopicData[];
}

interface KnowledgeHeatmapProps {
  data: {
    rooms: Array<{ id: string; name: string; type: string }>;
    heatmap: GroupData[];
  } | null;
  metric?: 'completionRate' | 'avgScore';
  onCellClick?: (groupId: string, roomId: string) => void;
  className?: string;
}

export function KnowledgeHeatmap({
  data,
  metric = 'avgScore',
  onCellClick,
  className = '',
}: KnowledgeHeatmapProps) {
  const getColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-green-300';
    if (value >= 40) return 'bg-yellow-400';
    if (value >= 20) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getTextColor = (value: number) => {
    if (value >= 60) return 'text-white';
    if (value >= 40) return 'text-gray-900';
    return 'text-white';
  };

  const legend = useMemo(() => [
    { label: '80-100', color: 'bg-green-500' },
    { label: '60-79', color: 'bg-green-300' },
    { label: '40-59', color: 'bg-yellow-400' },
    { label: '20-39', color: 'bg-orange-400' },
    { label: '0-19', color: 'bg-red-500' },
  ], []);

  if (!data || data.heatmap.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-8 text-center ${className}`}>
        <span className="text-gray-400">No knowledge gap data available</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mb-4">
        <span className="text-xs text-gray-500">
          {metric === 'avgScore' ? 'Average Score' : 'Completion Rate'}:
        </span>
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-4 h-4 rounded ${item.color}`} />
            <span className="text-xs text-gray-600">{item.label}%</span>
          </div>
        ))}
      </div>

      {/* Heatmap table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 text-sm font-medium text-gray-600 border-b sticky left-0 bg-white">
                Department / Group
              </th>
              {data.rooms.map((room) => (
                <th
                  key={room.id}
                  className="p-2 text-xs font-medium text-gray-600 border-b text-center"
                  style={{ minWidth: 100 }}
                >
                  <div className="truncate" title={room.name}>
                    {room.name}
                  </div>
                  <div className="text-gray-400 font-normal">
                    {room.type.replace(/_/g, ' ')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.heatmap.map((group) => (
              <tr key={group.groupId} className="hover:bg-gray-50">
                <td className="p-2 text-sm font-medium text-gray-800 border-b sticky left-0 bg-white">
                  {group.groupName}
                </td>
                {data.rooms.map((room) => {
                  const topicData = group.topics.find((t) => t.roomId === room.id);
                  const value = topicData
                    ? metric === 'avgScore'
                      ? topicData.avgScore
                      : topicData.completionRate
                    : 0;
                  const attempts = topicData?.totalAttempts || 0;

                  return (
                    <td
                      key={room.id}
                      className="p-1 border-b"
                    >
                      <div
                        className={`
                          ${getColor(value)} ${getTextColor(value)}
                          rounded p-2 text-center cursor-pointer
                          hover:opacity-80 transition-opacity
                        `}
                        onClick={() => onCellClick?.(group.groupId, room.id)}
                        title={`${group.groupName} - ${room.name}\n${metric === 'avgScore' ? 'Avg Score' : 'Completion'}: ${value.toFixed(1)}%\nAttempts: ${attempts}`}
                      >
                        <div className="text-sm font-bold">
                          {value.toFixed(0)}%
                        </div>
                        <div className="text-xs opacity-75">
                          {attempts} attempts
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Insights</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Weakest Topic:</span>{' '}
            <span className="font-medium text-red-600">
              {findWeakestTopic(data.heatmap, metric)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Strongest Topic:</span>{' '}
            <span className="font-medium text-green-600">
              {findStrongestTopic(data.heatmap, metric)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Group Needing Most Help:</span>{' '}
            <span className="font-medium text-orange-600">
              {findWeakestGroup(data.heatmap, metric)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Top Performing Group:</span>{' '}
            <span className="font-medium text-blue-600">
              {findStrongestGroup(data.heatmap, metric)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function findWeakestTopic(
  heatmap: GroupData[],
  metric: 'completionRate' | 'avgScore'
): string {
  const topicScores: Record<string, { total: number; count: number; name: string }> = {};

  for (const group of heatmap) {
    for (const topic of group.topics) {
      if (!topicScores[topic.roomId]) {
        topicScores[topic.roomId] = { total: 0, count: 0, name: topic.roomName };
      }
      topicScores[topic.roomId].total += metric === 'avgScore' ? topic.avgScore : topic.completionRate;
      topicScores[topic.roomId].count++;
    }
  }

  let weakest = { name: 'N/A', avg: Infinity };
  for (const [, data] of Object.entries(topicScores)) {
    const avg = data.total / data.count;
    if (avg < weakest.avg) {
      weakest = { name: data.name, avg };
    }
  }

  return weakest.name;
}

function findStrongestTopic(
  heatmap: GroupData[],
  metric: 'completionRate' | 'avgScore'
): string {
  const topicScores: Record<string, { total: number; count: number; name: string }> = {};

  for (const group of heatmap) {
    for (const topic of group.topics) {
      if (!topicScores[topic.roomId]) {
        topicScores[topic.roomId] = { total: 0, count: 0, name: topic.roomName };
      }
      topicScores[topic.roomId].total += metric === 'avgScore' ? topic.avgScore : topic.completionRate;
      topicScores[topic.roomId].count++;
    }
  }

  let strongest = { name: 'N/A', avg: -Infinity };
  for (const [, data] of Object.entries(topicScores)) {
    const avg = data.total / data.count;
    if (avg > strongest.avg) {
      strongest = { name: data.name, avg };
    }
  }

  return strongest.name;
}

function findWeakestGroup(
  heatmap: GroupData[],
  metric: 'completionRate' | 'avgScore'
): string {
  let weakest = { name: 'N/A', avg: Infinity };

  for (const group of heatmap) {
    if (group.topics.length === 0) continue;
    const avg =
      group.topics.reduce(
        (sum, t) => sum + (metric === 'avgScore' ? t.avgScore : t.completionRate),
        0
      ) / group.topics.length;

    if (avg < weakest.avg) {
      weakest = { name: group.groupName, avg };
    }
  }

  return weakest.name;
}

function findStrongestGroup(
  heatmap: GroupData[],
  metric: 'completionRate' | 'avgScore'
): string {
  let strongest = { name: 'N/A', avg: -Infinity };

  for (const group of heatmap) {
    if (group.topics.length === 0) continue;
    const avg =
      group.topics.reduce(
        (sum, t) => sum + (metric === 'avgScore' ? t.avgScore : t.completionRate),
        0
      ) / group.topics.length;

    if (avg > strongest.avg) {
      strongest = { name: group.groupName, avg };
    }
  }

  return strongest.name;
}
