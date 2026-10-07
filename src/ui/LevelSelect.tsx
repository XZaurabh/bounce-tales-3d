import React from 'react';
import { ArrowLeft, Lock, Star, Play, CircleDot, Timer, Flame, Sparkles } from 'lucide-react';
import { WorldId, GameSaveData } from '../types/game';
import { WORLDS } from '../levels/worlds';
import { buildLevel } from '../levels/levelDatabase';
import { SaveManager } from '../storage/saveManager';

interface LevelSelectProps {
  worldId: WorldId;
  saveData: GameSaveData;
  onSelectLevel: (levelId: number) => void;
  onBackToWorldMap: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  worldId,
  saveData,
  onSelectLevel,
  onBackToWorldMap,
}) => {
  const worldInfo = WORLDS[worldId];

  // 10 levels for this world
  const levels = Array.from({ length: 10 }, (_, i) => {
    const levelId = (worldId - 1) * 10 + (i + 1);
    const def = buildLevel(levelId);
    const progress = saveData.levels[levelId];
    const isUnlocked = SaveManager.isLevelUnlocked(saveData, levelId);
    return {
      levelId,
      levelNum: i + 1,
      def,
      progress,
      isUnlocked,
    };
  });

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-white flex flex-col p-6 sm:p-10 select-none overflow-y-auto">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full mb-8">
        <button
          onClick={onBackToWorldMap}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-white font-semibold text-xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          World Map
        </button>

        <div className="text-center">
          <div className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
            World 0{worldId}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            {worldInfo.name}
          </h1>
          <p className="text-xs text-white/50 mt-0.5">{worldInfo.mechanicNote}</p>
        </div>

        <div className="w-24" />
      </div>

      {/* Levels Grid (10 handcrafted levels) */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pb-12">
        {levels.map(({ levelId, levelNum, def, progress, isUnlocked }) => {
          const stars = progress?.stars || 0;
          const isCompleted = Boolean(progress?.completed);
          const bestTime = progress?.bestTime;

          const isChallenge = levelNum === 8;
          const isAdvanced = levelNum === 9;
          const isFinale = levelNum === 10;

          return (
            <div
              key={levelId}
              onClick={() => isUnlocked && onSelectLevel(levelId)}
              className={`rounded-2xl p-4 border flex flex-col justify-between transition-all duration-150 ${
                isUnlocked
                  ? 'bg-slate-900/80 border-white/10 hover:border-amber-400/60 cursor-pointer hover:-translate-y-1 shadow-md hover:shadow-xl'
                  : 'bg-slate-900/30 border-white/5 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Card Top: Number & Stars */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-mono font-black text-sm px-2 py-0.5 rounded-lg ${
                      isFinale
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isChallenge || isAdvanced
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-white/80'
                    }`}
                  >
                    #{levelNum}
                  </span>

                  {!isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-white/40" />
                  ) : (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map(s => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Level Name & Subtitle */}
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">{def.name}</h3>
                <p className="text-[11px] text-white/50 leading-tight mt-0.5 line-clamp-1">
                  {def.subtitle}
                </p>

                {/* Special Tags for 8, 9, 10 */}
                {isChallenge && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-2">
                    <Flame className="w-3 h-3" /> Challenge Trial
                  </span>
                )}
                {isAdvanced && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider mt-2">
                    <Sparkles className="w-3 h-3" /> Advanced Combo
                  </span>
                )}
                {isFinale && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider mt-2">
                    <Flame className="w-3 h-3" /> World Finale
                  </span>
                )}
              </div>

              {/* Card Bottom: Stats */}
              <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[11px] text-white/60">
                {isUnlocked ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Timer className="w-3 h-3 text-sky-400" />
                      <span className="font-mono tabular-nums">
                        {bestTime ? `${bestTime.toFixed(1)}s` : `--`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <CircleDot className="w-3 h-3 text-amber-400" />
                      <span className="font-mono tabular-nums">
                        {progress ? `${progress.ringsCollected}` : '0'}
                      </span>
                    </div>

                    <Play className="w-3 h-3 text-white/40 group-hover:text-white" />
                  </>
                ) : (
                  <span className="text-[10px] text-white/30">Locked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
