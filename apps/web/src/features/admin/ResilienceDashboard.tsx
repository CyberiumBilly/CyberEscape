import { useState, useEffect, useCallback } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { RefreshCw, TrendingUp, AlertTriangle, Users, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { ResilienceGauge, ScoreTrendChart, RiskMatrix, KnowledgeHeatmap } from './components';

interface ResilienceScore {
  overallScore: number;
  completionScore: number;
  performanceScore: number;
  totalUsers: number;
  activeUsers: number;
  completedUsers: number;
  averageAccuracy: number;
  calculatedAt: string;
}

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

export default function ResilienceDashboard() {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [score, setScore] = useState<ResilienceScore | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [riskMatrix, setRiskMatrix] = useState<RiskMatrixData | null>(null);
  const [knowledgeGaps, setKnowledgeGaps] = useState<any>(null);
  const [historyDays, setHistoryDays] = useState('30');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [scoreRes, historyRes, riskRes, gapsRes] = await Promise.all([
        api.get('/api/v1/analytics/resilience-score'),
        api.get(`/api/v1/analytics/resilience-score/history?days=${historyDays}`),
        api.get('/api/v1/analytics/risk-matrix'),
        api.get('/api/v1/analytics/knowledge-gaps'),
      ]);
      setScore(scoreRes.data);
      setHistory(historyRes.data || []);
      setRiskMatrix(riskRes.data);
      setKnowledgeGaps(gapsRes.data);
    } catch (err) {
      console.error('Failed to fetch resilience data:', err);
    } finally {
      setLoading(false);
    }
  }, [historyDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRecalculate = async () => {
    setCalculating(true);
    try {
      await api.post('/api/v1/analytics/resilience-score/calculate');
      await fetchData();
    } catch (err) {
      console.error('Failed to recalculate score:', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleUserClick = (userId: string) => {
    window.location.href = `/admin/users/${userId}`;
  };

  const riskSummary = riskMatrix ? {
    critical: riskMatrix.CRITICAL.length,
    high: riskMatrix.HIGH.length,
    medium: riskMatrix.MEDIUM.length,
    low: riskMatrix.LOW.length,
    total: riskMatrix.CRITICAL.length + riskMatrix.HIGH.length + riskMatrix.MEDIUM.length + riskMatrix.LOW.length,
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resilience Dashboard</h1>
          <p className="text-cyber-muted text-sm mt-1">
            Organization security posture and risk assessment
          </p>
        </div>
        <Button onClick={handleRecalculate} loading={calculating} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Recalculate
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-primary/10">
              <Shield className="h-5 w-5 text-cyber-primary" />
            </div>
            <div>
              <p className="text-sm text-cyber-muted">Resilience Score</p>
              <p className="text-2xl font-bold">{score?.overallScore?.toFixed(1) ?? '-'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-cyber-muted">Completion Rate</p>
              <p className="text-2xl font-bold">{score?.completionScore?.toFixed(1) ?? '-'}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-cyber-muted">Active Users</p>
              <p className="text-2xl font-bold">{score?.activeUsers ?? 0} / {score?.totalUsers ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${riskSummary && (riskSummary.critical > 0 || riskSummary.high > 0) ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
              <AlertTriangle className={`h-5 w-5 ${riskSummary && (riskSummary.critical > 0 || riskSummary.high > 0) ? 'text-red-500' : 'text-yellow-500'}`} />
            </div>
            <div>
              <p className="text-sm text-cyber-muted">At-Risk Users</p>
              <p className="text-2xl font-bold">
                {riskSummary ? riskSummary.critical + riskSummary.high : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="gaps">Knowledge Gaps</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardTitle>Overall Resilience</CardTitle>
              <CardContent className="mt-4 flex justify-center py-8">
                <ResilienceGauge score={score?.overallScore ?? null} size="lg" />
              </CardContent>
            </Card>

            <Card>
              <CardTitle>Score Breakdown</CardTitle>
              <CardContent className="mt-4 space-y-6 py-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Training Completion</span>
                    <span className="font-medium">{score?.completionScore?.toFixed(1) ?? 0}%</span>
                  </div>
                  <div className="h-3 bg-cyber-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${score?.completionScore ?? 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Performance Score</span>
                    <span className="font-medium">{score?.performanceScore?.toFixed(1) ?? 0}%</span>
                  </div>
                  <div className="h-3 bg-cyber-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${score?.performanceScore ?? 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Average Accuracy</span>
                    <span className="font-medium">{score?.averageAccuracy?.toFixed(1) ?? 0}%</span>
                  </div>
                  <div className="h-3 bg-cyber-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${score?.averageAccuracy ?? 0}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-cyber-border text-sm text-cyber-muted">
                  Last calculated: {score?.calculatedAt ? new Date(score.calculatedAt).toLocaleString() : 'Never'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>Score History</CardTitle>
              <Select value={historyDays} onValueChange={setHistoryDays}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardContent className="mt-4">
              <ScoreTrendChart data={history} height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card>
            <CardTitle>Risk Distribution</CardTitle>
            <CardContent className="mt-4">
              <RiskMatrix data={riskMatrix} onUserClick={handleUserClick} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps">
          <Card>
            <CardTitle>Knowledge Gap Analysis</CardTitle>
            <CardContent className="mt-4">
              <KnowledgeHeatmap data={knowledgeGaps} onCellClick={(groupId, roomId) => console.log('View:', groupId, roomId)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
