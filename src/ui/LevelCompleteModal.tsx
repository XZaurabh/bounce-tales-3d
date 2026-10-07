import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, CircleDot, Timer, ArrowRight, RotateCcw, Grid, Trophy } from 'lucide-react';
import { LevelDef } from '../types/game';

interface LevelCompleteModalProps {
  level: LevelDef;
  starsAwarded: number;
  timeTaken: number;
  isNewBestTime: boolean;
  ringsCollected: number;
  totalRings: number;
  starsCollected: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  starsAwarded,
  timeTaken,
  isNewBestTime,
  ringsCollected,
  totalRings,
  starsCollected,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#facc15', '#38bdf8', '#4ade80'],
    });
  }, []);

  const minutes = Math.floor(timeTaken / 60);
  const seconds = Math.floor(timeTaken % 60);
  const tenths = Math.floor((timeTaken % 1) * 10);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;

  const completionPercentage = Math.round(
    ((ringsCollected / Math.max(1, totalRings)) * 0.5 + (starsCollected > 0 ? 0.3 : 0.1) + 0.4) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 animate-bounce">
          <Trophy className="w-8 h-8 text-slate-950" />
        </div>

        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Level Complete!</h2>
        <p className="text-sm font-medium text-amber-400/90 mt-1">
          {level.name} · {level.isBonus ? 'Bonus Stage' : `Level ${level.worldLevelNumber}`}
        </p>

        {/* 3-Star Rating Display */}
        <div className="flex items-center gap-3 my-6">
          {[1, 2, 3].map(i => {
            const hasStar = i <= starsAwarded;
            return (
              <div
                key={i}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  hasStar
                    ? 'bg-amber-400 text-slate-950 scale-105 shadow-lg shadow-amber-400/30'
                    : 'bg-slate-800 text-slate-600'
                }`}
              >
                <Star className={`w-8 h-8 ${hasStar ? 'fill-current' : ''}`} />
              </div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2 bg-slate-800/50 border border-white/5 rounded-2xl p-3 mb-6">
          {/* Time */}
          <div className="flex flex-col items-center p-2">
            <span className="text-xs text-white/50 flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-sky-400" />
              Time
            </span>
            <span className="font-mono text-sm font-bold text-white mt-1 tabular-nums">
              {formattedTime}
            </span>
            {isNewBestTime && (
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                New Best!
              </span>
            )}
          </div>

          {/* Rings */}
          <div className="flex flex-col items-center p-2 border-x border-white/5">
            <span className="text-xs text-white/50 flex items-center gap-1">
              <CircleDot className="w-3.5 h-3.5 text-amber-400" />
              Rings
            </span>
            <span className="font-mono text-sm font-bold text-white mt-1 tabular-nums">
              {ringsCollected}/{totalRings}
            </span>
          </div>

          {/* Completion */}
          <div className="flex flex-col items-center p-2">
            <span className="text-xs text-white/50 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-indigo-400" />
              Score
            </span>
            <span className="font-mono text-sm font-bold text-white mt-1 tabular-nums">
              {Math.min(100, completionPercentage)}%
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5">
          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98"
            >
              Next Level
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-white/5 active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              Replay
            </button>

            <button
              onClick={onLevelSelect}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-white/5 active:scale-98"
            >
              <Grid className="w-4 h-4" />
              Levels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
