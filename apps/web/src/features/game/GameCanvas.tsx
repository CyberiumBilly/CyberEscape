import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGameState } from '@/hooks/useGameState';
import { useCountdown } from '@/hooks/useCountdown';
import { useAudio } from '@/hooks/useAudio';
import { useUrgency } from '@/hooks/useUrgency';
import { api } from '@/lib/api';
import { getRoomTheme } from '@/lib/roomThemes';
import { getPuzzleContext } from '@/lib/roomNarratives';
import GameHeader from './components/GameHeader';
import PuzzleRenderer from './components/PuzzleRenderer';
import HintPanel from './components/HintPanel';
import FeedbackModal from './components/FeedbackModal';
import RoomIntro from './components/RoomIntro';
import RoomDebrief from './components/RoomDebrief';
import PuzzleContext from './components/PuzzleContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import VideoGrid from '@/features/multiplayer/components/VideoGrid';
import TextChat from '@/features/multiplayer/components/TextChat';
import ScanlineOverlay from '@/components/effects/ScanlineOverlay';
import ParticleField from '@/components/effects/ParticleField';
import Vignette from '@/components/effects/Vignette';
import WarningFlash from '@/components/effects/WarningFlash';
import Confetti from '@/components/effects/Confetti';
import ScreenShake from '@/components/effects/ScreenShake';
import { motion, AnimatePresence } from 'framer-motion';

interface RawPuzzle {
  id: string;
  type: string;
  title: string;
  config: unknown;
  hints: unknown;
  basePoints?: number;
}

function parsePuzzle(p: RawPuzzle) {
  const rawHints: string[] = typeof p.hints === 'string' ? JSON.parse(p.hints) : (p.hints || []);
  const hints = rawHints.map((h: string, i: number) => ({ index: i, text: h, cost: (i + 1) * 10 }));
  const content = typeof p.config === 'string' ? JSON.parse(p.config) : (p.config || {});
  return {
    id: p.id,
    type: p.type,
    title: p.title,
    content,
    hints,
    points: p.basePoints || 100,
  };
}

// Demo room data for when API is unavailable
const DEMO_ROOMS: Record<string, { name: string; type: string; timeLimit: number; puzzles: RawPuzzle[] }> = {
  'password-auth': {
    name: 'Password Authentication',
    type: 'password-auth',
    timeLimit: 600,
    puzzles: [
      {
        id: 'pw-1',
        type: 'PASSWORD_STRENGTH',
        title: 'Create a Strong Password',
        config: { minLength: 12, requireUpper: true, requireLower: true, requireNumber: true, requireSpecial: true },
        hints: ['Use a mix of uppercase and lowercase letters', 'Include numbers and special characters like !@#$', 'Make it at least 12 characters long'],
        basePoints: 100,
      },
    ],
  },
  'phishing': {
    name: 'Phishing Detection',
    type: 'phishing',
    timeLimit: 600,
    puzzles: [
      {
        id: 'ph-1',
        type: 'PHISHING_INBOX',
        title: 'Identify Phishing Emails',
        config: {
          emails: [
            { id: 'e1', from: 'security@bankofamerica.com.fake-domain.net', subject: 'Urgent: Verify Your Account', body: 'Dear Customer,\n\nWe detected suspicious activity on your account. Click here immediately to verify your identity or your account will be suspended.\n\nClick: http://bit.ly/verify-now-123\n\nBank of America Security Team', isPhishing: true },
            { id: 'e2', from: 'noreply@github.com', subject: 'Your repository was forked', body: 'Hey there!\n\nuser123 just forked your repository awesome-project.\n\nView the fork: https://github.com/user123/awesome-project\n\nHappy coding!\nThe GitHub Team', isPhishing: false },
            { id: 'e3', from: 'support@paypa1.com', subject: 'Payment Received - Action Required', body: 'You received $500.00!\n\nTo claim your payment, log in now:\nhttp://paypa1-secure.com/claim\n\nThis link expires in 24 hours.\n\nPayPal', isPhishing: true },
          ],
        },
        hints: ['Check the sender email domain carefully', 'Look for urgency tactics and suspicious links', 'Legitimate companies use their official domains'],
        basePoints: 150,
      },
    ],
  },
  'network-security': {
    name: 'Network Security',
    type: 'network-security',
    timeLimit: 600,
    puzzles: [
      {
        id: 'ns-1',
        type: 'MULTIPLE_CHOICE',
        title: 'Firewall Configuration',
        config: {
          question: 'Which firewall rule should be applied to block incoming connections from unknown sources while allowing established outbound connections?',
          options: [
            { id: 'a', text: 'Allow all incoming, block all outgoing' },
            { id: 'b', text: 'Block all incoming, allow all outgoing' },
            { id: 'c', text: 'Default deny incoming, allow established/related outgoing' },
            { id: 'd', text: 'Allow all traffic on all ports' },
          ],
          correctId: 'c',
        },
        hints: ['Think about the principle of least privilege', 'Outbound connections you initiate are usually safe', 'Default deny is a security best practice'],
        basePoints: 100,
      },
    ],
  },
  'data-protection': {
    name: 'Data Protection',
    type: 'data-protection',
    timeLimit: 600,
    puzzles: [
      {
        id: 'dp-1',
        type: 'DRAG_DROP',
        title: 'Classify Sensitive Data',
        config: {
          instruction: 'Drag each data type to the correct classification level',
          items: [
            { id: 'i1', text: 'Employee Social Security Numbers' },
            { id: 'i2', text: 'Company Holiday Schedule' },
            { id: 'i3', text: 'Customer Credit Card Numbers' },
            { id: 'i4', text: 'Public Press Releases' },
          ],
          categories: [
            { id: 'public', name: 'Public', correctItems: ['i4'] },
            { id: 'internal', name: 'Internal', correctItems: ['i2'] },
            { id: 'confidential', name: 'Confidential', correctItems: ['i1', 'i3'] },
          ],
        },
        hints: ['PII and financial data need the highest protection', 'Information freely shared externally is public', 'Internal data is for employees only'],
        basePoints: 100,
      },
    ],
  },
  'insider-threat': {
    name: 'Insider Threat',
    type: 'insider-threat',
    timeLimit: 600,
    puzzles: [
      {
        id: 'it-1',
        type: 'MULTIPLE_CHOICE',
        title: 'Identify Suspicious Behavior',
        config: {
          question: 'An employee who recently gave their two-week notice has been accessing large amounts of proprietary data after hours. What should you do?',
          options: [
            { id: 'a', text: 'Ignore it - they are still employed' },
            { id: 'b', text: 'Report to security team and restrict access immediately' },
            { id: 'c', text: 'Confront the employee directly' },
            { id: 'd', text: 'Wait until they leave to investigate' },
          ],
          correctId: 'b',
        },
        hints: ['Departing employees pose elevated risk', 'Security teams have proper investigation procedures', 'Acting quickly prevents data exfiltration'],
        basePoints: 100,
      },
    ],
  },
  'incident-response': {
    name: 'Incident Response',
    type: 'incident-response',
    timeLimit: 600,
    puzzles: [
      {
        id: 'ir-1',
        type: 'MULTIPLE_CHOICE',
        title: 'Ransomware Response',
        config: {
          question: 'Your organization has been hit by ransomware. What is the FIRST step you should take?',
          options: [
            { id: 'a', text: 'Pay the ransom to recover files quickly' },
            { id: 'b', text: 'Isolate affected systems from the network' },
            { id: 'c', text: 'Delete all encrypted files' },
            { id: 'd', text: 'Restore from backup immediately' },
          ],
          correctId: 'b',
        },
        hints: ['Containment prevents spread to other systems', 'Never pay ransoms - it encourages more attacks', 'Preserve evidence before restoration'],
        basePoints: 100,
      },
    ],
  },
};

export default function GameCanvas() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = useGameState();
  const teamId = useSelector((s: RootState) => s.team.teamId);
  const reducedMotion = useSelector((s: RootState) => s.settings.reducedMotion);
  const isMultiplayer = !!teamId;
  const puzzlesRef = useRef<RawPuzzle[]>([]);

  // Audio
  const { playSFX, playAmbient, stopAmbient } = useAudio();

  // Urgency
  const urgency = useUrgency(game.timeRemaining, game.timeLimit);

  // Visual effect states
  const [showConfetti, setShowConfetti] = useState(false);
  const [triggerShake, setTriggerShake] = useState(false);
  const [warningFlashTrigger, setWarningFlashTrigger] = useState(false);

  // Get room theme
  const roomTheme = getRoomTheme(game.roomName);

  // Handle time milestones
  const handleMilestone = useCallback((milestone: string) => {
    setWarningFlashTrigger(true);
    setTimeout(() => setWarningFlashTrigger(false), 100);

    if (milestone === '30s' || milestone === '10s' || milestone === '5s') {
      playSFX('warning-beep');
    }
  }, [playSFX]);

  useEffect(() => {
    if (!id) return;

    const loadRoom = (room: { id: string; name: string; type: string; timeLimit: number; puzzles: RawPuzzle[] }) => {
      const puzzles = room.puzzles || [];
      puzzlesRef.current = puzzles;

      game.startRoom({
        roomId: room.id,
        roomName: room.name,
        roomType: room.type || 'default',
        timeLimit: room.timeLimit,
        totalPuzzles: puzzles.length,
      });

      // Show briefing/intro
      setTimeout(() => {
        game.setBriefing();
      }, 500);
    };

    api.get(`/api/rooms/${id}`).then(res => {
      const room = res.data;
      loadRoom({ id: room.id, name: room.name, type: room.type, timeLimit: room.timeLimit, puzzles: room.puzzles || [] });
      // Start game progress on backend
      api.post(`/api/rooms/${id}/start`).catch(() => {});
    }).catch(() => {
      // Use demo room data as fallback
      const demoRoom = DEMO_ROOMS[id];
      if (demoRoom) {
        loadRoom({ id, name: demoRoom.name, type: demoRoom.type, timeLimit: demoRoom.timeLimit, puzzles: demoRoom.puzzles });
      }
    });

    return () => {
      stopAmbient();
    };
  }, [id]);

  // Play ambient sound when room loads and phase changes
  useEffect(() => {
    if (game.phase === 'PUZZLE_ACTIVE' || game.phase === 'BRIEFING' || game.phase === 'INTRO') {
      playAmbient(roomTheme.ambientSound);
    }
    if (game.phase === 'ROOM_COMPLETE' || game.phase === 'ROOM_FAILED') {
      stopAmbient();
    }
  }, [game.phase, roomTheme.ambientSound, playAmbient, stopAmbient]);

  // Play urgency sounds
  useEffect(() => {
    if (game.phase !== 'PUZZLE_ACTIVE') return;

    if (urgency.playAlarm) {
      playSFX('alarm');
    }
  }, [urgency.playAlarm, game.phase, playSFX]);

  useCountdown(
    game.timeRemaining,
    () => game.tickTimer(),
    () => game.failRoom(),
    game.phase === 'PUZZLE_ACTIVE',
    handleMilestone,
  );

  const handleIntroComplete = () => {
    game.setIntro();
    setTimeout(() => {
      if (puzzlesRef.current[0]) {
        game.startPuzzle(parsePuzzle(puzzlesRef.current[0]));
      }
    }, 500);
  };

  // Local validation for demo puzzles
  const validateDemoAnswer = (puzzle: RawPuzzle, answer: Record<string, unknown>): { correct: boolean; message: string } => {
    const config = typeof puzzle.config === 'string' ? JSON.parse(puzzle.config) : puzzle.config;
    const ans = answer.answer ?? answer;

    switch (puzzle.type) {
      case 'PASSWORD_STRENGTH': {
        const pw = (ans as { password?: string })?.password || '';
        const minLen = (config as { minLength?: number }).minLength || 12;
        const checks = [
          pw.length >= minLen,
          /[A-Z]/.test(pw),
          /[a-z]/.test(pw),
          /[0-9]/.test(pw),
          /[^A-Za-z0-9]/.test(pw),
          !/^(password|123456|qwerty)/i.test(pw) && pw.length > 0,
        ];
        const correct = checks.every(Boolean);
        return { correct, message: correct ? 'Great password! It meets all security requirements.' : 'Password does not meet all requirements.' };
      }
      case 'PHISHING_INBOX':
      case 'PHISHING_CLASSIFICATION': {
        const classifications = (ans as { classifications?: Record<string, string> })?.classifications || {};
        const emails = (config as { emails?: { id: string; isPhishing: boolean }[] }).emails || [];
        const allCorrect = emails.every(e => {
          const userClass = classifications[e.id];
          return (e.isPhishing && userClass === 'phishing') || (!e.isPhishing && userClass === 'legitimate');
        });
        return { correct: allCorrect, message: allCorrect ? 'Excellent! You correctly identified all emails.' : 'Some emails were misclassified. Look for suspicious sender domains and urgent language.' };
      }
      case 'MULTIPLE_CHOICE': {
        const selectedIds = (ans as { selectedIds?: string[] })?.selectedIds || [];
        const correctId = (config as { correctId?: string }).correctId;
        const correct = selectedIds.length === 1 && selectedIds[0] === correctId;
        return { correct, message: correct ? 'Correct answer!' : 'That\'s not quite right. Think about security best practices.' };
      }
      case 'DRAG_DROP':
      case 'DRAG_DROP_CLASSIFICATION': {
        const placements = (ans as { placements?: Record<string, string> })?.placements || {};
        const categories = (config as { categories?: { id: string; correctItems: string[] }[] }).categories || [];
        let allCorrect = true;
        for (const cat of categories) {
          for (const itemId of cat.correctItems) {
            if (placements[itemId] !== cat.id) allCorrect = false;
          }
        }
        return { correct: allCorrect, message: allCorrect ? 'Perfect classification!' : 'Some items are in the wrong category.' };
      }
      default:
        return { correct: true, message: 'Answer accepted.' };
    }
  };

  const handleSubmit = async (answer: Record<string, unknown>) => {
    game.submitAnswer();

    // Check if this is a demo puzzle (ID starts with common demo prefixes)
    const isDemo = id && DEMO_ROOMS[id] !== undefined;

    try {
      let correct: boolean;
      let message: string;
      let score = 100;

      if (isDemo && game.currentPuzzle) {
        // Local validation for demo puzzles
        const currentRawPuzzle = puzzlesRef.current[game.currentPuzzleIndex];
        const result = validateDemoAnswer(currentRawPuzzle, answer);
        correct = result.correct;
        message = result.message;
        score = correct ? (currentRawPuzzle.basePoints || 100) : 0;
      } else {
        // API validation for real puzzles
        const res = await api.post(`/api/puzzles/${game.currentPuzzle?.id}/submit`, {
          roomId: id,
          answer: answer.answer ?? answer,
        });
        const { result, score: apiScore } = res.data;
        correct = result?.isCorrect ?? false;
        message = result?.feedback || (correct ? 'Correct!' : 'Incorrect, try again.');
        score = apiScore || 0;
      }

      if (correct) {
        playSFX('correct');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        playSFX('incorrect');
        setTriggerShake(true);
        setTimeout(() => setTriggerShake(false), 100);
      }

      game.showFeedback({
        correct,
        message,
        scoreBreakdown: correct ? {
          basePoints: score || 0,
          timeBonus: 0,
          accuracyPenalty: 0,
          hintPenalty: 0,
          streakMultiplier: game.currentStreak >= 3 ? 1.5 : 1,
          totalPoints: score || 0,
        } : null,
      });

      if (correct) {
        setTimeout(() => {
          game.completePuzzle();
          const nextIndex = game.currentPuzzleIndex + 1;
          if (nextIndex < game.totalPuzzles && puzzlesRef.current[nextIndex]) {
            game.startPuzzle(parsePuzzle(puzzlesRef.current[nextIndex]));
          } else {
            playSFX('victory');
          }
        }, 2000);
      } else {
        // After showing incorrect feedback, return to puzzle
        setTimeout(() => {
          game.startPuzzle(parsePuzzle(puzzlesRef.current[game.currentPuzzleIndex]));
        }, 2000);
      }
    } catch {
      playSFX('incorrect');
      game.showFeedback({ correct: false, message: 'Error submitting answer', scoreBreakdown: null });
      setTimeout(() => {
        game.startPuzzle(parsePuzzle(puzzlesRef.current[game.currentPuzzleIndex]));
      }, 2000);
    }
  };

  const handleHint = async () => {
    if (!game.currentPuzzle) return;
    const hints = game.currentPuzzle.hints || [];
    const hintIndex = game.hintsRevealed.length;
    if (hintIndex < hints.length) {
      playSFX('hint-reveal');
      game.revealHint(hints[hintIndex].text);
    }
  };

  const handleDebriefContinue = () => {
    navigate(`/rooms/${id}/results`);
  };

  if (game.phase === 'IDLE' || game.phase === 'LOADING') return <LoadingSpinner />;

  const puzzleContext = game.currentPuzzle
    ? getPuzzleContext(game.roomName, game.currentPuzzle.type)
    : null;

  return (
    <ScreenShake active={triggerShake}>
      <div className={`relative min-h-screen bg-gradient-to-b ${roomTheme.bgGradient}`}>
        {/* Atmospheric overlays */}
        {!reducedMotion && <ScanlineOverlay opacity={0.02} />}
        {!reducedMotion && <ParticleField count={20} color={roomTheme.particleColor} />}

        {/* Urgency effects */}
        {urgency.showVignette && (
          <Vignette
            intensity={urgency.vignetteIntensity}
            pulse={urgency.level === 'critical'}
          />
        )}
        <WarningFlash trigger={warningFlashTrigger} />

        {/* Confetti on correct answers */}
        <Confetti active={showConfetti} />

        {/* Main content */}
        <div className="relative z-10 flex flex-col gap-4 p-4">
          {game.phase !== 'BRIEFING' && (
            <GameHeader
              roomName={game.roomName}
              timeRemaining={game.timeRemaining}
              score={game.score}
              hintsUsed={game.hintsUsed}
              puzzleIndex={game.currentPuzzleIndex}
              totalPuzzles={game.totalPuzzles}
              currentStreak={game.currentStreak}
              urgencyLevel={urgency.level}
            />
          )}

          <AnimatePresence mode="wait">
            {game.phase === 'BRIEFING' && (
              <motion.div key="briefing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RoomIntro
                  roomName={game.roomName}
                  timeLimit={game.timeLimit}
                  onComplete={handleIntroComplete}
                />
              </motion.div>
            )}

            {game.phase === 'INTRO' && (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <h2 className="text-3xl font-bold text-cyber-primary">{game.roomName}</h2>
                <p className="mt-4 text-cyber-muted">Initializing puzzle...</p>
              </motion.div>
            )}

            {game.phase === 'PUZZLE_ACTIVE' && game.currentPuzzle && (
              <motion.div key={game.currentPuzzle.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className={`grid grid-cols-1 gap-4 ${isMultiplayer ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}
              >
                <div className="lg:col-span-3">
                  <PuzzleContext context={puzzleContext} />
                  <PuzzleRenderer
                    puzzle={game.currentPuzzle}
                    onSubmit={handleSubmit}
                    roomTheme={roomTheme}
                  />
                </div>
                <div>
                  <HintPanel
                    hints={game.currentPuzzle.hints}
                    revealedHints={game.hintsRevealed}
                    onRequestHint={handleHint}
                  />
                </div>
                {isMultiplayer && (
                  <div className="space-y-4">
                    <VideoGrid roomId={teamId} />
                    <TextChat teamId={teamId} />
                  </div>
                )}
              </motion.div>
            )}

            {game.phase === 'DEBRIEF' && (
              <motion.div key="debrief" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RoomDebrief
                  roomName={game.roomName}
                  success={true}
                  score={game.score}
                  onContinue={handleDebriefContinue}
                />
              </motion.div>
            )}

            {(game.phase === 'ROOM_COMPLETE' || game.phase === 'ROOM_FAILED') && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <RoomDebrief
                  roomName={game.roomName}
                  success={game.phase === 'ROOM_COMPLETE'}
                  score={game.score}
                  onContinue={handleDebriefContinue}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {game.phase === 'PUZZLE_FEEDBACK' && (
            <FeedbackModal
              correct={game.feedbackCorrect}
              message={game.feedbackMessage}
              scoreBreakdown={game.lastScoreBreakdown}
              streak={game.currentStreak}
            />
          )}
        </div>
      </div>
    </ScreenShake>
  );
}
