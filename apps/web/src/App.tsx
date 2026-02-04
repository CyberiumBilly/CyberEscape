import { lazy, Suspense, Component, type ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const SSOCallback = lazy(() => import('./features/auth/SSOCallback'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const GameCanvas = lazy(() => import('./features/game/GameCanvas'));
const GameCanvas3D = lazy(() => import('./features/game/GameCanvas3D'));
const ResultsScreen = lazy(() => import('./features/game/components/ResultsScreen'));
const TeamLobby = lazy(() => import('./features/multiplayer/components/TeamLobby'));
const AchievementsPage = lazy(() => import('./features/gamification/AchievementsPage'));
const LeaderboardPage = lazy(() => import('./features/gamification/LeaderboardPage'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./features/admin/UserManagement'));
const UserDetail = lazy(() => import('./features/admin/UserDetail'));
const GroupManagement = lazy(() => import('./features/admin/GroupManagement'));
const AnalyticsPage = lazy(() => import('./features/admin/AnalyticsPage'));
const ReportsPage = lazy(() => import('./features/admin/ReportsPage'));
const CampaignManagement = lazy(() => import('./features/admin/CampaignManagement'));
const OrgSettings = lazy(() => import('./features/admin/OrgSettings'));
const ResilienceDashboard = lazy(() => import('./features/admin/ResilienceDashboard'));
const AdminLayout = lazy(() => import('./features/admin/AdminLayout'));

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-cyber-bg p-8">
          <div className="max-w-lg rounded-xl border border-cyber-danger bg-cyber-card p-6">
            <h1 className="text-xl font-bold text-cyber-danger">Something went wrong</h1>
            <pre className="mt-4 overflow-auto text-sm text-cyber-muted whitespace-pre-wrap">{this.state.error.message}{'\n'}{this.state.error.stack}</pre>
            <button onClick={() => window.location.reload()} className="mt-4 rounded bg-cyber-primary px-4 py-2 text-sm text-black">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const fallback = <LoadingSpinner />;

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<SSOCallback />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/rooms/:id" element={<GameCanvas />} />
              <Route path="/rooms/:id/3d" element={<GameCanvas3D />} />
              <Route path="/rooms/:id/results" element={<ResultsScreen />} />
              <Route path="/team/lobby/:id" element={<TeamLobby />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="users/:id" element={<UserDetail />} />
                <Route path="groups" element={<GroupManagement />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="campaigns" element={<CampaignManagement />} />
                <Route path="settings" element={<OrgSettings />} />
                <Route path="resilience" element={<ResilienceDashboard />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
