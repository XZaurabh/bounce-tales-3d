import React from 'react';
import { ArrowLeft, Lock, Star, Play, Sparkles, Timer } from 'lucide-react';
import { GameSaveData } from '../types/game';
import { buildLevel } from '../levels/levelDatabase';
import { SaveManager } from '../storage/saveManager';

interface BonusSelectProps {
  saveData: GameSaveData;
  onSelectLevel: (levelId: number) => void;
  onBackToMenu: () => void;
}

export const BonusSelect: React.FC<BonusSelectProps> = ({
  saveData,
  onSelectLevel,
  onBackToMenu,
}) => {
  const bonusIds = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-white flex flex-col p-6 sm:p-10 select-none overflow-y-auto">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full mb-8">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-white font-semibold text-xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Main Menu
        </button>

        <div className="text-center">
          <div className="text-xs uppercase tracking-wider font-extrabold text-amber-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Secret & Bonus Stages
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Bonus Vault
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Earn stars across the 80 main stages to unlock these master trials
          </p>
        </div>

        {/* Total Stars Counter */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-amber-400">
          <Star className="w-4 h-4 fill-amber-400" />
          <span className="font-mono font-bold text-sm text-white">{saveData.totalStars} Stars</span>
        </div>
      </div>

      {/* Bonus Levels Grid */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pb-12">
        {bonusIds.map((bId, idx) => {
          const def = buildLevel(bId);
          const isUnlocked = SaveManager.isLevelUnlocked(saveData, bId);
          const progress = saveData.levels[bId];
          const requiredStars = (idx + 1) * 8;

          return (
            <div
              key={bId}
              onClick={() => isUnlocked && onSelectLevel(bId)}
              className={`rounded-2xl p-4 border flex flex-col justify-between transition-all duration-150 ${
                isUnlocked
                  ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-white/10 hover:border-amber-400 cursor-pointer hover:-translate-y-1 shadow-md hover:shadow-xl'
                  : 'bg-slate-900/30 border-white/5 opacity-50 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30">
                    B-{idx + 1}
                  </span>

                  {!isUnlocked ? (
                    <div className="flex items-center gap-1 text-[11px] text-white/40">
                      <Lock className="w-3 h-3" />
                      <span>{requiredStars} ★</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                      {progress?.completed ? 'Cleared!' : 'Open'}
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">{def.name}</h3>
                <p className="text-[11px] text-white/50 leading-tight mt-0.5 line-clamp-2">
                  {def.subtitle}
                </p>
              </div>

              <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[11px] text-white/60">
                {isUnlocked ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Timer className="w-3 h-3 text-sky-400" />
                      <span className="font-mono tabular-nums">
                        {progress?.bestTime ? `${progress.bestTime.toFixed(1)}s` : `${def.parTime}s`}
                      </span>
                    </div>
                    <Play className="w-3.5 h-3.5 text-white/50 group-hover:text-white" />
                  </>
                ) : (
                  <span className="text-[10px] text-amber-400/70 font-semibold">
                    Need {requiredStars} Stars
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
