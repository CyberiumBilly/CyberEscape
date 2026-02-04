import { useState, useEffect, useCallback } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Save, Plus, Trash2, Eye, EyeOff, ArrowLeft, Copy } from 'lucide-react';
import { api } from '@/lib/api';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';

const PUZZLE_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', fields: ['options', 'correctIndex'] },
  { value: 'PASSWORD_STRENGTH', label: 'Password Strength', fields: ['minScore', 'requirements'] },
  { value: 'PHISHING_CLASSIFICATION', label: 'Phishing Classification', fields: ['emails', 'correctAnswers'] },
  { value: 'DRAG_DROP', label: 'Drag & Drop', fields: ['items', 'targets', 'correctMapping'] },
  { value: 'CODE_ENTRY', label: 'Code Entry', fields: ['expectedCode', 'caseSensitive'] },
  { value: 'SEQUENCE', label: 'Sequence', fields: ['items', 'correctOrder'] },
  { value: 'MATCHING', label: 'Matching', fields: ['pairs'] },
  { value: 'SIMULATION', label: 'Simulation', fields: ['scenario', 'steps', 'correctActions'] },
];

const ROOM_TYPES = [
  { value: 'PASSWORD_AUTH', label: 'Password Authentication' },
  { value: 'PHISHING', label: 'Phishing Detection' },
  { value: 'DATA_PROTECTION', label: 'Data Protection' },
  { value: 'NETWORK_SECURITY', label: 'Network Security' },
  { value: 'INSIDER_THREAT', label: 'Insider Threat' },
  { value: 'INCIDENT_RESPONSE', label: 'Incident Response' },
];

interface Room {
  id: string;
  name: string;
  type: string;
}

interface CustomPuzzle {
  id: string;
  roomId: string;
  title: string;
  description: string;
  type: string;
  order: number;
  basePoints: number;
  timeLimit: number;
  config: Record<string, any>;
  hints: string[];
  answer: any;
  explanation: string | null;
  isActive: boolean;
  createdAt: string;
}

interface PuzzleFormData {
  roomId: string;
  title: string;
  description: string;
  type: string;
  order: number;
  basePoints: number;
  timeLimit: number;
  config: Record<string, any>;
  hints: string[];
  answer: any;
  explanation: string;
}

const defaultFormData: PuzzleFormData = {
  roomId: '',
  title: '',
  description: '',
  type: 'MULTIPLE_CHOICE',
  order: 0,
  basePoints: 100,
  timeLimit: 300,
  config: {},
  hints: [],
  answer: null,
  explanation: '',
};

export default function PuzzleBuilder() {
  const { user } = useSelector((state: RootState) => state.auth);
  const orgId = user?.organizationId;
  const navigate = useNavigate();

  const [tab, setTab] = useState('list');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [puzzles, setPuzzles] = useState<CustomPuzzle[]>([]);
  const [formData, setFormData] = useState<PuzzleFormData>(defaultFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [filterRoom, setFilterRoom] = useState<string>('');

  // Multiple choice specific state
  const [mcOptions, setMcOptions] = useState<string[]>(['', '', '', '']);
  const [mcCorrectIndex, setMcCorrectIndex] = useState(0);

  // Hints state
  const [newHint, setNewHint] = useState('');

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    try {
      const [roomsRes, puzzlesRes] = await Promise.all([
        api.get('/api/v1/rooms'),
        api.get(`/api/v1/organizations/${orgId}/custom-puzzles`),
      ]);
      setRooms(roomsRes.data || []);
      setPuzzles(puzzlesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, [orgId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setMcOptions(['', '', '', '']);
    setMcCorrectIndex(0);
    setNewHint('');
  };

  const handleCreate = () => {
    resetForm();
    setTab('create');
  };

  const handleEdit = (puzzle: CustomPuzzle) => {
    setFormData({
      roomId: puzzle.roomId,
      title: puzzle.title,
      description: puzzle.description,
      type: puzzle.type,
      order: puzzle.order,
      basePoints: puzzle.basePoints,
      timeLimit: puzzle.timeLimit,
      config: puzzle.config || {},
      hints: puzzle.hints || [],
      answer: puzzle.answer,
      explanation: puzzle.explanation || '',
    });
    setEditingId(puzzle.id);

    // Restore multiple choice state if applicable
    if (puzzle.type === 'MULTIPLE_CHOICE' && puzzle.config) {
      setMcOptions(puzzle.config.options || ['', '', '', '']);
      setMcCorrectIndex(puzzle.config.correctIndex || 0);
    }

    setTab('create');
  };

  const handleSave = async () => {
    if (!orgId || !formData.roomId || !formData.title) return;
    setSaving(true);

    try {
      // Build config and answer based on puzzle type
      let config = { ...formData.config };
      let answer = formData.answer;

      if (formData.type === 'MULTIPLE_CHOICE') {
        config = { options: mcOptions.filter(o => o.trim()), correctIndex: mcCorrectIndex };
        answer = { correctIndex: mcCorrectIndex };
      }

      const payload = {
        ...formData,
        config,
        answer: answer || {},
      };

      if (editingId) {
        await api.patch(`/api/v1/organizations/${orgId}/custom-puzzles/${editingId}`, payload);
      } else {
        await api.post(`/api/v1/organizations/${orgId}/custom-puzzles`, payload);
      }

      await fetchData();
      resetForm();
      setTab('list');
    } catch (err) {
      console.error('Failed to save puzzle:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (puzzleId: string) => {
    if (!orgId || !confirm('Delete this puzzle?')) return;
    try {
      await api.delete(`/api/v1/organizations/${orgId}/custom-puzzles/${puzzleId}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete puzzle:', err);
    }
  };

  const handleToggleActive = async (puzzle: CustomPuzzle) => {
    if (!orgId) return;
    try {
      await api.patch(`/api/v1/organizations/${orgId}/custom-puzzles/${puzzle.id}`, {
        isActive: !puzzle.isActive,
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle puzzle:', err);
    }
  };

  const addHint = () => {
    if (!newHint.trim()) return;
    setFormData(f => ({ ...f, hints: [...f.hints, newHint.trim()] }));
    setNewHint('');
  };

  const removeHint = (index: number) => {
    setFormData(f => ({ ...f, hints: f.hints.filter((_, i) => i !== index) }));
  };

  const filteredPuzzles = filterRoom
    ? puzzles.filter(p => p.roomId === filterRoom)
    : puzzles;

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-4">
            <p className="text-sm text-cyber-muted">Configure the answer options:</p>
            {mcOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={mcCorrectIndex === i}
                  onChange={() => setMcCorrectIndex(i)}
                  className="w-4 h-4"
                />
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={e => {
                    const newOpts = [...mcOptions];
                    newOpts[i] = e.target.value;
                    setMcOptions(newOpts);
                  }}
                  className="flex-1"
                />
                {mcOptions.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={() => {
                    setMcOptions(mcOptions.filter((_, idx) => idx !== i));
                    if (mcCorrectIndex >= i) setMcCorrectIndex(Math.max(0, mcCorrectIndex - 1));
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {mcOptions.length < 6 && (
              <Button variant="outline" size="sm" onClick={() => setMcOptions([...mcOptions, ''])}>
                <Plus className="h-4 w-4 mr-1" /> Add Option
              </Button>
            )}
            <p className="text-xs text-cyber-muted">Select the radio button next to the correct answer.</p>
          </div>
        );

      case 'CODE_ENTRY':
        return (
          <div className="space-y-4">
            <Input
              label="Expected Code/Answer"
              placeholder="SECRET123"
              value={formData.config.expectedCode || ''}
              onChange={e => setFormData(f => ({
                ...f,
                config: { ...f.config, expectedCode: e.target.value },
                answer: { code: e.target.value },
              }))}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.config.caseSensitive ?? true}
                onChange={e => setFormData(f => ({
                  ...f,
                  config: { ...f.config, caseSensitive: e.target.checked },
                }))}
              />
              <span className="text-sm">Case Sensitive</span>
            </div>
          </div>
        );

      case 'PASSWORD_STRENGTH':
        return (
          <div className="space-y-4">
            <Input
              label="Minimum Strength Score (0-100)"
              type="number"
              min={0}
              max={100}
              value={formData.config.minScore || 70}
              onChange={e => setFormData(f => ({
                ...f,
                config: { ...f.config, minScore: parseInt(e.target.value) || 70 },
                answer: { minScore: parseInt(e.target.value) || 70 },
              }))}
            />
            <p className="text-xs text-cyber-muted">User must create a password meeting this minimum strength threshold.</p>
          </div>
        );

      case 'SEQUENCE':
        return (
          <div className="space-y-4">
            <p className="text-sm text-cyber-muted">Enter items in correct order (one per line):</p>
            <textarea
              className="w-full h-32 p-2 rounded border border-cyber-border bg-cyber-card text-sm"
              placeholder="Step 1&#10;Step 2&#10;Step 3"
              value={(formData.config.items || []).join('\n')}
              onChange={e => {
                const items = e.target.value.split('\n').filter(i => i.trim());
                setFormData(f => ({
                  ...f,
                  config: { ...f.config, items, correctOrder: items.map((_, i) => i) },
                  answer: { correctOrder: items.map((_, i) => i) },
                }));
              }}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="text-sm text-cyber-muted">
              Advanced configuration for {formData.type}. Edit JSON config directly:
            </p>
            <textarea
              className="w-full h-40 p-2 rounded border border-cyber-border bg-cyber-card font-mono text-xs"
              value={JSON.stringify(formData.config, null, 2)}
              onChange={e => {
                try {
                  setFormData(f => ({ ...f, config: JSON.parse(e.target.value) }));
                } catch {}
              }}
            />
            <p className="text-sm text-cyber-muted">Answer JSON:</p>
            <textarea
              className="w-full h-20 p-2 rounded border border-cyber-border bg-cyber-card font-mono text-xs"
              value={JSON.stringify(formData.answer || {}, null, 2)}
              onChange={e => {
                try {
                  setFormData(f => ({ ...f, answer: JSON.parse(e.target.value) }));
                } catch {}
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Custom Puzzle Builder</h1>
          <p className="text-cyber-muted text-sm mt-1">Create and manage organization-specific puzzles</p>
        </div>
        {tab === 'list' && (
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />New Puzzle
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="list">Puzzle List</TabsTrigger>
          <TabsTrigger value="create">{editingId ? 'Edit Puzzle' : 'Create Puzzle'}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Custom Puzzles ({filteredPuzzles.length})</CardTitle>
              <Select value={filterRoom} onValueChange={setFilterRoom}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Rooms</SelectItem>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPuzzles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-cyber-muted py-8">
                        No custom puzzles yet. Click "New Puzzle" to create one.
                      </TableCell>
                    </TableRow>
                  ) : filteredPuzzles.map(puzzle => {
                    const room = rooms.find(r => r.id === puzzle.roomId);
                    return (
                      <TableRow key={puzzle.id}>
                        <TableCell className="font-medium">{puzzle.title}</TableCell>
                        <TableCell>{room?.name || puzzle.roomId}</TableCell>
                        <TableCell>
                          <Badge variant="muted">{puzzle.type.replace(/_/g, ' ')}</Badge>
                        </TableCell>
                        <TableCell>{puzzle.basePoints}</TableCell>
                        <TableCell>
                          <Badge variant={puzzle.isActive ? 'default' : 'muted'}>
                            {puzzle.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleActive(puzzle)}>
                            {puzzle.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(puzzle)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(puzzle.id)}>
                            <Trash2 className="h-4 w-4 text-cyber-danger" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Form */}
            <div className="space-y-6">
              <Card>
                <CardTitle>Basic Information</CardTitle>
                <CardContent className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm text-cyber-muted mb-1 block">Room</label>
                    <Select value={formData.roomId} onValueChange={v => setFormData(f => ({ ...f, roomId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                      <SelectContent>
                        {rooms.map(room => (
                          <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    label="Title"
                    placeholder="Identify the Phishing Email"
                    value={formData.title}
                    onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  />
                  <div>
                    <label className="text-sm text-cyber-muted mb-1 block">Description</label>
                    <textarea
                      className="w-full h-24 p-2 rounded border border-cyber-border bg-cyber-card text-sm"
                      placeholder="Describe what the user needs to do..."
                      value={formData.description}
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-cyber-muted mb-1 block">Puzzle Type</label>
                    <Select
                      value={formData.type}
                      onValueChange={v => {
                        setFormData(f => ({ ...f, type: v, config: {}, answer: null }));
                        if (v === 'MULTIPLE_CHOICE') {
                          setMcOptions(['', '', '', '']);
                          setMcCorrectIndex(0);
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PUZZLE_TYPES.map(pt => (
                          <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardTitle>Puzzle Configuration</CardTitle>
                <CardContent className="mt-4">
                  {renderTypeSpecificFields()}
                </CardContent>
              </Card>

              <Card>
                <CardTitle>Settings</CardTitle>
                <CardContent className="mt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Base Points"
                      type="number"
                      min={0}
                      max={1000}
                      value={formData.basePoints}
                      onChange={e => setFormData(f => ({ ...f, basePoints: parseInt(e.target.value) || 100 }))}
                    />
                    <Input
                      label="Time Limit (sec)"
                      type="number"
                      min={30}
                      max={3600}
                      value={formData.timeLimit}
                      onChange={e => setFormData(f => ({ ...f, timeLimit: parseInt(e.target.value) || 300 }))}
                    />
                    <Input
                      label="Order"
                      type="number"
                      min={0}
                      value={formData.order}
                      onChange={e => setFormData(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-cyber-muted mb-1 block">Explanation (shown after solving)</label>
                    <textarea
                      className="w-full h-20 p-2 rounded border border-cyber-border bg-cyber-card text-sm"
                      placeholder="Explain why this answer is correct..."
                      value={formData.explanation}
                      onChange={e => setFormData(f => ({ ...f, explanation: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardTitle>Hints</CardTitle>
                <CardContent className="mt-4 space-y-4">
                  {formData.hints.map((hint, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm text-cyber-muted w-16">Hint {i + 1}:</span>
                      <span className="flex-1 text-sm">{hint}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeHint(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a hint..."
                      value={newHint}
                      onChange={e => setNewHint(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addHint()}
                    />
                    <Button variant="outline" onClick={addHint}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button onClick={() => { resetForm(); setTab('list'); }} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />Cancel
                </Button>
                <Button onClick={handleSave} loading={saving} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />{editingId ? 'Update Puzzle' : 'Create Puzzle'}
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between">
                  <CardTitle>Preview</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                    {previewMode ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                    {previewMode ? 'Hide' : 'Show'} Answer
                  </Button>
                </div>
                <CardContent className="mt-4">
                  <div className="bg-cyber-bg rounded-lg p-6 border border-cyber-border">
                    <h3 className="text-lg font-bold mb-2">{formData.title || 'Puzzle Title'}</h3>
                    <p className="text-sm text-cyber-muted mb-4">{formData.description || 'Puzzle description will appear here...'}</p>

                    <Badge variant="muted" className="mb-4">{formData.type.replace(/_/g, ' ')}</Badge>

                    {formData.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2 mt-4">
                        {mcOptions.filter(o => o.trim()).map((opt, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded border ${
                              previewMode && i === mcCorrectIndex
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-cyber-border'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.type === 'CODE_ENTRY' && (
                      <div className="mt-4">
                        <Input placeholder="Enter code..." disabled />
                        {previewMode && formData.config.expectedCode && (
                          <p className="text-sm text-green-500 mt-2">Answer: {formData.config.expectedCode}</p>
                        )}
                      </div>
                    )}

                    {formData.hints.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-cyber-border">
                        <p className="text-xs text-cyber-muted mb-2">Hints available: {formData.hints.length}</p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-cyber-border flex justify-between text-xs text-cyber-muted">
                      <span>{formData.basePoints} points</span>
                      <span>{Math.floor(formData.timeLimit / 60)}:{(formData.timeLimit % 60).toString().padStart(2, '0')} time limit</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
