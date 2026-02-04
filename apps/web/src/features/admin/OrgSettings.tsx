import { useState, useEffect, useCallback } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Plus, Save, Palette, Settings2, FileText, Shield, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface Environment {
  themePrimaryColor: string;
  themeSecondaryColor: string;
  themeMode: string;
  defaultDifficulty: string;
  allowHints: boolean;
  maxHintsPerPuzzle: number;
  showLeaderboard: boolean;
  allowRetries: boolean;
  maxRetriesPerPuzzle: number;
  timeLimitMultiplier: number;
  enableBadges: boolean;
  enableStreaks: boolean;
  enableXP: boolean;
  enableLeaderboards: boolean;
  enableTeamMode: boolean;
  welcomeMessage: string;
  completionMessage: string;
}

interface RoomConfig {
  id: string;
  roomId: string;
  roomName: string;
  roomType: string;
  enabled: boolean;
  customTimeLimit: number | null;
  customDifficulty: string | null;
  customOrder: number | null;
}

interface ContentOverride {
  id: string;
  contentType: string;
  contentId: string;
  field: string;
  originalValue: string | null;
  overrideValue: string;
  isActive: boolean;
}

interface ComplianceSettings {
  trainingDeadlineDays: number;
  requiredRooms: string[];
  minimumPassScore: number;
  requireAllPuzzles: boolean;
  recertificationEnabled: boolean;
  recertificationMonths: number;
  certificatesEnabled: boolean;
  certificateSignatory: string | null;
  certificateSignatoryTitle: string | null;
  reminderDays: number[];
  escalationEnabled: boolean;
  escalationDays: number;
  complianceOfficerEmail: string | null;
  weeklyReportEnabled: boolean;
}

const ROOM_TYPES = ['PASSWORD_AUTH', 'PHISHING', 'DATA_PROTECTION', 'NETWORK_SECURITY', 'INSIDER_THREAT', 'INCIDENT_RESPONSE'];
const DIFFICULTY_LEVELS = ['EASY', 'NORMAL', 'HARD', 'EXPERT'];

export default function OrgSettings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const orgId = user?.organizationId;

  const [settings, setSettings] = useState<any>({});
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [roomConfigs, setRoomConfigs] = useState<RoomConfig[]>([]);
  const [contentOverrides, setContentOverrides] = useState<ContentOverride[]>([]);
  const [compliance, setCompliance] = useState<ComplianceSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');
  const [newOverride, setNewOverride] = useState({ contentType: 'ROOM', contentId: '', field: '', overrideValue: '' });

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    try {
      const [settingsRes, envRes, roomsRes, overridesRes, complianceRes] = await Promise.all([
        api.get('/api/organizations/settings').catch(() => ({ data: {} })),
        api.get(`/api/v1/organizations/${orgId}/environment`).catch(() => ({ data: null })),
        api.get(`/api/v1/organizations/${orgId}/rooms`).catch(() => ({ data: [] })),
        api.get(`/api/v1/organizations/${orgId}/content-overrides`).catch(() => ({ data: [] })),
        api.get(`/api/v1/organizations/${orgId}/compliance`).catch(() => ({ data: null })),
      ]);
      setSettings(settingsRes.data || {});
      setEnvironment(envRes.data);
      setRoomConfigs(roomsRes.data || []);
      setContentOverrides(overridesRes.data || []);
      setCompliance(complianceRes.data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  }, [orgId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveGeneral = async () => {
    setSaving(true);
    try {
      await api.put('/api/organizations/settings', settings);
    } finally {
      setSaving(false);
    }
  };

  const saveEnvironment = async () => {
    if (!orgId || !environment) return;
    setSaving(true);
    try {
      await api.put(`/api/v1/organizations/${orgId}/environment`, environment);
    } finally {
      setSaving(false);
    }
  };

  const saveRoomConfig = async (roomId: string, config: Partial<RoomConfig>) => {
    if (!orgId) return;
    setSaving(true);
    try {
      await api.put(`/api/v1/organizations/${orgId}/rooms/${roomId}/config`, config);
      await fetchData();
    } finally {
      setSaving(false);
    }
  };

  const saveCompliance = async () => {
    if (!orgId || !compliance) return;
    setSaving(true);
    try {
      await api.put(`/api/v1/organizations/${orgId}/compliance`, compliance);
    } finally {
      setSaving(false);
    }
  };

  const addContentOverride = async () => {
    if (!orgId || !newOverride.contentId || !newOverride.field || !newOverride.overrideValue) return;
    setSaving(true);
    try {
      await api.post(`/api/v1/organizations/${orgId}/content-overrides`, newOverride);
      setNewOverride({ contentType: 'ROOM', contentId: '', field: '', overrideValue: '' });
      await fetchData();
    } finally {
      setSaving(false);
    }
  };

  const deleteContentOverride = async (overrideId: string) => {
    if (!orgId) return;
    try {
      await api.delete(`/api/v1/organizations/${orgId}/content-overrides/${overrideId}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete override:', err);
    }
  };

  const toggle = (key: string) => setSettings((s: any) => ({ ...s, [key]: !s[key] }));
  const toggleEnv = (key: keyof Environment) => setEnvironment((e) => e ? { ...e, [key]: !e[key] } : e);
  const toggleCompliance = (key: keyof ComplianceSettings) => setCompliance((c) => c ? { ...c, [key]: !c[key] } : c);

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-cyber-primary' : 'bg-cyber-border'}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organization Settings</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="general"><Settings2 className="w-4 h-4 mr-1" />General</TabsTrigger>
          <TabsTrigger value="environment"><Palette className="w-4 h-4 mr-1" />Environment</TabsTrigger>
          <TabsTrigger value="rooms"><FileText className="w-4 h-4 mr-1" />Rooms</TabsTrigger>
          <TabsTrigger value="content"><FileText className="w-4 h-4 mr-1" />Content</TabsTrigger>
          <TabsTrigger value="compliance"><Shield className="w-4 h-4 mr-1" />Compliance</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="sso">SSO</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardTitle>Organization</CardTitle>
            <CardContent className="mt-4 space-y-4">
              <Input label="Organization Name" value={settings.name || ''} onChange={e => setSettings((s: any) => ({ ...s, name: e.target.value }))} />
              <Input label="Timezone" value={settings.timezone || 'UTC'} onChange={e => setSettings((s: any) => ({ ...s, timezone: e.target.value }))} />
              <div className="flex items-center justify-between">
                <span>Allow Self-Registration</span>
                <ToggleSwitch checked={settings.allowSelfRegistration || false} onChange={() => toggle('allowSelfRegistration')} />
              </div>
              <Button onClick={saveGeneral} loading={saving}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Tab */}
        <TabsContent value="environment">
          <div className="space-y-6">
            <Card>
              <CardTitle>Theme Settings</CardTitle>
              <CardContent className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Primary Color" type="color" value={environment?.themePrimaryColor || '#6366f1'}
                    onChange={e => setEnvironment(env => env ? { ...env, themePrimaryColor: e.target.value } : env)} />
                  <Input label="Secondary Color" type="color" value={environment?.themeSecondaryColor || '#8b5cf6'}
                    onChange={e => setEnvironment(env => env ? { ...env, themeSecondaryColor: e.target.value } : env)} />
                </div>
                <div>
                  <label className="text-sm text-cyber-muted mb-1 block">Theme Mode</label>
                  <Select value={environment?.themeMode || 'light'} onValueChange={(v) => setEnvironment(env => env ? { ...env, themeMode: v } : env)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardTitle>Game Settings</CardTitle>
              <CardContent className="mt-4 space-y-4">
                <div>
                  <label className="text-sm text-cyber-muted mb-1 block">Default Difficulty</label>
                  <Select value={environment?.defaultDifficulty || 'NORMAL'} onValueChange={(v) => setEnvironment(env => env ? { ...env, defaultDifficulty: v } : env)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <span>Allow Hints</span>
                  <ToggleSwitch checked={environment?.allowHints ?? true} onChange={() => toggleEnv('allowHints')} />
                </div>
                {environment?.allowHints && (
                  <Input label="Max Hints per Puzzle" type="number" min={0} max={10} value={environment?.maxHintsPerPuzzle ?? 3}
                    onChange={e => setEnvironment(env => env ? { ...env, maxHintsPerPuzzle: parseInt(e.target.value) || 0 } : env)} />
                )}
                <div className="flex items-center justify-between">
                  <span>Allow Retries</span>
                  <ToggleSwitch checked={environment?.allowRetries ?? true} onChange={() => toggleEnv('allowRetries')} />
                </div>
                {environment?.allowRetries && (
                  <Input label="Max Retries per Puzzle" type="number" min={0} max={10} value={environment?.maxRetriesPerPuzzle ?? 3}
                    onChange={e => setEnvironment(env => env ? { ...env, maxRetriesPerPuzzle: parseInt(e.target.value) || 0 } : env)} />
                )}
                <Input label="Time Limit Multiplier" type="number" min={0.5} max={3} step={0.1} value={environment?.timeLimitMultiplier ?? 1}
                  onChange={e => setEnvironment(env => env ? { ...env, timeLimitMultiplier: parseFloat(e.target.value) || 1 } : env)} />
              </CardContent>
            </Card>

            <Card>
              <CardTitle>Messages</CardTitle>
              <CardContent className="mt-4 space-y-4">
                <Input label="Welcome Message" placeholder="Welcome to your cybersecurity training..."
                  value={environment?.welcomeMessage || ''} onChange={e => setEnvironment(env => env ? { ...env, welcomeMessage: e.target.value } : env)} />
                <Input label="Completion Message" placeholder="Congratulations on completing your training!"
                  value={environment?.completionMessage || ''} onChange={e => setEnvironment(env => env ? { ...env, completionMessage: e.target.value } : env)} />
              </CardContent>
            </Card>

            <Button onClick={saveEnvironment} loading={saving}><Save className="w-4 h-4 mr-2" />Save Environment</Button>
          </div>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms">
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Time Limit</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomConfigs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-cyber-muted py-8">
                      No room configurations. Default settings apply.
                    </TableCell>
                  </TableRow>
                ) : roomConfigs.map((room) => (
                  <TableRow key={room.id || room.roomId}>
                    <TableCell className="font-medium">{room.roomName || room.roomId}</TableCell>
                    <TableCell><Badge variant="muted">{room.roomType?.replace(/_/g, ' ')}</Badge></TableCell>
                    <TableCell>
                      <ToggleSwitch checked={room.enabled} onChange={() => saveRoomConfig(room.roomId, { enabled: !room.enabled })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" className="w-24" value={room.customTimeLimit || ''} placeholder="Default"
                        onChange={(e) => saveRoomConfig(room.roomId, { customTimeLimit: e.target.value ? parseInt(e.target.value) : null })} />
                    </TableCell>
                    <TableCell>
                      <Select value={room.customDifficulty || ''} onValueChange={(v) => saveRoomConfig(room.roomId, { customDifficulty: v || null })}>
                        <SelectTrigger className="w-28"><SelectValue placeholder="Default" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Default</SelectItem>
                          {DIFFICULTY_LEVELS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input type="number" className="w-16" value={room.customOrder || ''} placeholder="-"
                        onChange={(e) => saveRoomConfig(room.roomId, { customOrder: e.target.value ? parseInt(e.target.value) : null })} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => saveRoomConfig(room.roomId, room)}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="space-y-6">
            <Card>
              <CardTitle>Add Content Override</CardTitle>
              <CardContent className="mt-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <label className="text-sm text-cyber-muted mb-1 block">Content Type</label>
                    <Select value={newOverride.contentType} onValueChange={(v) => setNewOverride(o => ({ ...o, contentType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ROOM">Room</SelectItem>
                        <SelectItem value="PUZZLE">Puzzle</SelectItem>
                        <SelectItem value="HINT">Hint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input label="Content ID" placeholder="e.g., room-id-123" value={newOverride.contentId}
                    onChange={e => setNewOverride(o => ({ ...o, contentId: e.target.value }))} />
                  <Input label="Field" placeholder="e.g., title, description" value={newOverride.field}
                    onChange={e => setNewOverride(o => ({ ...o, field: e.target.value }))} />
                  <Input label="Override Value" placeholder="New value" value={newOverride.overrideValue}
                    onChange={e => setNewOverride(o => ({ ...o, overrideValue: e.target.value }))} />
                </div>
                <Button onClick={addContentOverride} loading={saving} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />Add Override
                </Button>
              </CardContent>
            </Card>

            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Content ID</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Override Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentOverrides.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-cyber-muted py-8">
                        No content overrides. Default content is used.
                      </TableCell>
                    </TableRow>
                  ) : contentOverrides.map((override) => (
                    <TableRow key={override.id}>
                      <TableCell><Badge variant="muted">{override.contentType}</Badge></TableCell>
                      <TableCell className="font-mono text-sm">{override.contentId.slice(0, 12)}...</TableCell>
                      <TableCell>{override.field}</TableCell>
                      <TableCell className="max-w-xs truncate">{override.overrideValue}</TableCell>
                      <TableCell>
                        <Badge variant={override.isActive ? 'default' : 'muted'}>
                          {override.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => deleteContentOverride(override.id)}>
                          <Trash2 className="h-4 w-4 text-cyber-danger" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance">
          <div className="space-y-6">
            <Card>
              <CardTitle>Training Requirements</CardTitle>
              <CardContent className="mt-4 space-y-4">
                <Input label="Training Deadline (days from assignment)" type="number" min={1} max={365}
                  value={compliance?.trainingDeadlineDays ?? 30}
                  onChange={e => setCompliance(c => c ? { ...c, trainingDeadlineDays: parseInt(e.target.value) || 30 } : c)} />
                <Input label="Minimum Pass Score (%)" type="number" min={0} max={100}
                  value={compliance?.minimumPassScore ?? 70}
                  onChange={e => setCompliance(c => c ? { ...c, minimumPassScore: parseInt(e.target.value) || 70 } : c)} />
                <div className="flex items-center justify-between">
                  <span>Require All Puzzles</span>
                  <ToggleSwitch checked={compliance?.requireAllPuzzles ?? true} onChange={() => toggleCompliance('requireAllPuzzles')} />
                </div>
                <div>
                  <label className="text-sm text-cyber-muted mb-2 block">Required Rooms</label>
                  <div className="flex flex-wrap gap-2">
                    {ROOM_TYPES.map(room => (
                      <button key={room}
                        onClick={() => setCompliance(c => {
                          if (!c) return c;
                          const required = c.requiredRooms || [];
                          return {
                            ...c,
                            requiredRooms: required.includes(room)
                              ? required.filter(r => r !== room)
                              : [...required, room]
                          };
                        })}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          compliance?.requiredRooms?.includes(room)
                            ? 'bg-cyber-primary text-black'
                            : 'bg-cyber-border text-cyber-muted'
                        }`}
                      >
                        {room.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardTitle>Recertification</CardTitle>
              <CardContent className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span>Enable Recertification</span>
                  <ToggleSwitch checked={compliance?.recertificationEnabled ?? false} onChange={() => toggleCompliance('recertificationEnabled')} />
                </div>
                {compliance?.recertificationEnabled && (
                  <Input label="Recertification Period (months)" type="number" min={1} max={36}
                    value={compliance?.recertificationMonths ?? 12}
                    onChange={e => setCompliance(c => c ? { ...c, recertificationMonths: parseInt(e.target.value) || 12 } : c)} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardTitle>Certificates</CardTitle>
              <CardContent className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span>Enable Certificates</span>
                  <ToggleSwitch checked={compliance?.certificatesEnabled ?? true} onChange={() => toggleCompliance('certificatesEnabled')} />
                </div>
                {compliance?.certificatesEnabled && (
                  <>
                    <Input label="Certificate Signatory Name" placeholder="John Smith"
                      value={compliance?.certificateSignatory || ''}
                      onChange={e => setCompliance(c => c ? { ...c, certificateSignatory: e.target.value || null } : c)} />
                    <Input label="Signatory Title" placeholder="Chief Security Officer"
                      value={compliance?.certificateSignatoryTitle || ''}
                      onChange={e => setCompliance(c => c ? { ...c, certificateSignatoryTitle: e.target.value || null } : c)} />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardTitle>Notifications & Escalation</CardTitle>
              <CardContent className="mt-4 space-y-4">
                <Input label="Compliance Officer Email" type="email" placeholder="compliance@example.com"
                  value={compliance?.complianceOfficerEmail || ''}
                  onChange={e => setCompliance(c => c ? { ...c, complianceOfficerEmail: e.target.value || null } : c)} />
                <div className="flex items-center justify-between">
                  <span>Weekly Report</span>
                  <ToggleSwitch checked={compliance?.weeklyReportEnabled ?? false} onChange={() => toggleCompliance('weeklyReportEnabled')} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Escalation Enabled</span>
                  <ToggleSwitch checked={compliance?.escalationEnabled ?? false} onChange={() => toggleCompliance('escalationEnabled')} />
                </div>
                {compliance?.escalationEnabled && (
                  <Input label="Escalation Days (after deadline)" type="number" min={1} max={30}
                    value={compliance?.escalationDays ?? 7}
                    onChange={e => setCompliance(c => c ? { ...c, escalationDays: parseInt(e.target.value) || 7 } : c)} />
                )}
              </CardContent>
            </Card>

            <Button onClick={saveCompliance} loading={saving}><Save className="w-4 h-4 mr-2" />Save Compliance Settings</Button>
          </div>
        </TabsContent>

        {/* Gamification Tab */}
        <TabsContent value="gamification">
          <Card>
            <CardTitle>Gamification Settings</CardTitle>
            <CardContent className="mt-4 space-y-4">
              {environment && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Enable Badges</span>
                    <ToggleSwitch checked={environment.enableBadges} onChange={() => toggleEnv('enableBadges')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Enable Streaks</span>
                    <ToggleSwitch checked={environment.enableStreaks} onChange={() => toggleEnv('enableStreaks')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Enable XP System</span>
                    <ToggleSwitch checked={environment.enableXP} onChange={() => toggleEnv('enableXP')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Enable Leaderboards</span>
                    <ToggleSwitch checked={environment.enableLeaderboards} onChange={() => toggleEnv('enableLeaderboards')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Enable Team Mode</span>
                    <ToggleSwitch checked={environment.enableTeamMode} onChange={() => toggleEnv('enableTeamMode')} />
                  </div>
                </>
              )}
              {!environment && (
                <p className="text-cyber-muted">Loading gamification settings...</p>
              )}
              <Button onClick={saveEnvironment} loading={saving}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardTitle>Webhook Configuration</CardTitle>
            <CardContent className="mt-4 space-y-4">
              <Input label="Slack Webhook URL" placeholder="https://hooks.slack.com/services/..." />
              <Input label="Teams Webhook URL" placeholder="https://outlook.office.com/webhook/..." />
              <Button onClick={saveGeneral} loading={saving}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SSO Tab */}
        <TabsContent value="sso">
          <Card>
            <CardTitle>SSO Configuration</CardTitle>
            <CardContent className="mt-4 space-y-4">
              <Input label="SAML Entity ID" placeholder="https://your-idp.com/entity" />
              <Input label="SSO URL" placeholder="https://your-idp.com/sso" />
              <Input label="Certificate" placeholder="Paste IdP certificate..." />
              <Button onClick={saveGeneral} loading={saving}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
