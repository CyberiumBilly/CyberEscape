import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGameState } from '@/hooks/useGameState';
import { useCountdown } from '@/hooks/useCountdown';
import { api } from '@/lib/api';
import GameHeader from './components/GameHeader';
import PuzzleRenderer from './components/PuzzleRenderer';
import HintPanel from './components/HintPanel';
import FeedbackModal from './components/FeedbackModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import VideoGrid from '@/features/multiplayer/components/VideoGrid';
import TextChat from '@/features/multiplayer/components/TextChat';
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

export default function GameCanvas() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = useGameState();
  const teamId = useSelector((s: RootState) => s.team.teamId);
  const isMultiplayer = !!teamId;
  const puzzlesRef = useRef<RawPuzzle[]>([]);

  useEffect(() => {
    if (!id) return;

    api.get(`/api/v1/rooms/${id}`).then(res => {
      const room = res.data;
      const puzzles: RawPuzzle[] = room.puzzles || [];
      puzzlesRef.current = puzzles;

      game.startRoom({
        roomId: room.id,
        roomName: room.name,
        timeLimit: room.timeLimit,
        totalPuzzles: puzzles.length,
      });

      // Start game progress on backend
      api.post(`/api/v1/rooms/${id}/start`).catch(() => {});

      setTimeout(() => {
        game.setIntro();
        setTimeout(() => {
          if (puzzles[0]) {
            game.startPuzzle(parsePuzzle(puzzles[0]));
          }
        }, 2000);
      }, 1000);
    }).catch(() => {});
  }, [id]);

  useCountdown(
    game.timeRemaining,
    () => game.tickTimer(),
    () => game.failRoom(),
    game.phase === 'PUZZLE_ACTIVE',
  );

  const handleSubmit = async (answer: Record<string, unknown>) => {
    game.submitAnswer();
    try {
      const res = await api.post(`/api/v1/puzzles/${game.currentPuzzle?.id}/submit`, {
        roomId: id,
        answer: answer.answer ?? answer,
      });

      const { result, score } = res.data;
      const correct = result?.isCorrect ?? false;
      const message = result?.feedback || (correct ? 'Correct!' : 'Incorrect, try again.');

      game.showFeedback({
        correct,
        message,
        scoreBreakdown: correct ? {
          basePoints: score || 0,
          timeBonus: 0,
          accuracyPenalty: 0,
          hintPenalty: 0,
          streakMultiplier: 1,
          totalPoints: score || 0,
        } : null,
      });

      if (correct) {
        setTimeout(() => {
          game.completePuzzle();
          const nextIndex = game.currentPuzzleIndex + 1;
          if (nextIndex < game.totalPuzzles && puzzlesRef.current[nextIndex]) {
            game.startPuzzle(parsePuzzle(puzzlesRef.current[nextIndex]));
          }
        }, 2000);
      } else {
        // After showing incorrect feedback, return to puzzle
        setTimeout(() => {
          game.startPuzzle(parsePuzzle(puzzlesRef.current[game.currentPuzzleIndex]));
        }, 2000);
      }
    } catch {
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
      game.revealHint(hints[hintIndex].text);
    }
  };

  if (game.phase === 'IDLE' || game.phase === 'LOADING') return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-4">
      <GameHeader
        roomName={game.roomName}
        timeRemaining={game.timeRemaining}
        score={game.score}
        hintsUsed={game.hintsUsed}
        puzzleIndex={game.currentPuzzleIndex}
        totalPuzzles={game.totalPuzzles}
      />

      <AnimatePresence mode="wait">
        {game.phase === 'INTRO' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <h2 className="text-3xl font-bold text-cyber-primary">{game.roomName}</h2>
            <p className="mt-4 text-cyber-muted">Preparing your challenge...</p>
          </motion.div>
        )}

        {game.phase === 'PUZZLE_ACTIVE' && game.currentPuzzle && (
          <motion.div key={game.currentPuzzle.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className={`grid grid-cols-1 gap-4 ${isMultiplayer ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}
          >
            <div className="lg:col-span-3">
              <PuzzleRenderer puzzle={game.currentPuzzle} onSubmit={handleSubmit} />
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

        {(game.phase === 'ROOM_COMPLETE' || game.phase === 'ROOM_FAILED') && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-20"
          >
            <h2 className={`text-4xl font-bold ${game.phase === 'ROOM_COMPLETE' ? 'text-cyber-accent' : 'text-cyber-danger'}`}>
              {game.phase === 'ROOM_COMPLETE' ? 'Room Complete!' : "Time's Up!"}
            </h2>
            <p className="mt-4 text-2xl">Score: {game.score}</p>
            <button onClick={() => navigate(`/rooms/${id}/results`)} className="mt-8 rounded-lg bg-cyber-primary px-6 py-3 text-cyber-bg font-medium">
              View Results
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {game.phase === 'PUZZLE_FEEDBACK' && (
        <FeedbackModal
          correct={game.feedbackCorrect}
          message={game.feedbackMessage}
          scoreBreakdown={game.lastScoreBreakdown}
        />
      )}
    </div>
  );
}
