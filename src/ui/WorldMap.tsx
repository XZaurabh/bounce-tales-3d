import React from 'react';
import { ArrowLeft, Lock, Star, Play, Sparkles } from 'lucide-react';
import { WorldId, GameSaveData } from '../types/game';
import { WORLDS } from '../levels/worlds';
import { SaveManager } from '../storage/saveManager';

interface WorldMapProps {
  saveData: GameSaveData;
  onSelectWorld: (worldId: WorldId) => void;
  onBackToMenu: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  saveData,
  onSelectWorld,
  onBackToMenu,
}) => {
  const worldList: WorldId[] = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-white flex flex-col p-6 sm:p-10 select-none overflow-y-auto">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full mb-8">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-white font-semibold text-xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Main Menu
        </button>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">World Map</h1>
          <p className="text-xs text-white/50 mt-0.5">Select a realm to enter its 10 platforming stages</p>
        </div>

        {/* Total Stars Counter */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-amber-400">
          <Star className="w-4 h-4 fill-amber-400" />
          <span className="font-mono font-bold text-sm text-white">{saveData.totalStars} Stars</span>
        </div>
      </div>

      {/* World Cards Grid */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-12">
        {worldList.map(wId => {
          const info = WORLDS[wId];
          const isUnlocked = SaveManager.isWorldUnlocked(saveData, wId);

          // Calculate stars in this world (10 levels * 3 = 30 max stars)
          let worldStars = 0;
          let completedCount = 0;
          for (let l = 1; l <= 10; l++) {
            const levelId = (wId - 1) * 10 + l;
            const prog = saveData.levels[levelId];
            if (prog) {
              worldStars += prog.stars;
              if (prog.completed) completedCount++;
            }
          }

          // Thematic color gradients
          let bgGradient = 'from-emerald-950/70 to-slate-900';
          let borderAccent = 'hover:border-emerald-400/50';
          let badgeColor = 'text-emerald-400';

          if (info.theme === 'desert') {
            bgGradient = 'from-amber-950/70 to-slate-900';
            borderAccent = 'hover:border-amber-400/50';
            badgeColor = 'text-amber-400';
          } else if (info.theme === 'forest') {
            bgGradient = 'from-teal-950/70 to-slate-900';
            borderAccent = 'hover:border-teal-400/50';
            badgeColor = 'text-teal-400';
          } else if (info.theme === 'snow') {
            bgGradient = 'from-sky-950/70 to-slate-900';
            borderAccent = 'hover:border-sky-400/50';
            badgeColor = 'text-sky-400';
          } else if (info.theme === 'cave') {
            bgGradient = 'from-indigo-950/70 to-slate-900';
            borderAccent = 'hover:border-indigo-400/50';
            badgeColor = 'text-indigo-400';
          } else if (info.theme === 'machinery') {
            bgGradient = 'from-orange-950/70 to-slate-900';
            borderAccent = 'hover:border-orange-400/50';
            badgeColor = 'text-orange-400';
          } else if (info.theme === 'volcano') {
            bgGradient = 'from-red-950/70 to-slate-900';
            borderAccent = 'hover:border-red-400/50';
            badgeColor = 'text-red-400';
          } else if (info.theme === 'apex') {
            bgGradient = 'from-purple-950/70 to-slate-900';
            borderAccent = 'hover:border-purple-400/50';
            badgeColor = 'text-purple-400';
          }

          return (
            <div
              key={wId}
              onClick={() => isUnlocked && onSelectWorld(wId)}
              className={`relative rounded-3xl p-6 border flex flex-col justify-between transition-all duration-200 ${
                isUnlocked
                  ? `bg-gradient-to-b ${bgGradient} border-white/10 ${borderAccent} cursor-pointer hover:-translate-y-1 shadow-xl hover:shadow-2xl`
                  : 'bg-slate-900/40 border-white/5 opacity-55 cursor-not-allowed'
              }`}
            >
              {/* World Number Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-black uppercase tracking-wider ${badgeColor}`}>
                  World 0{wId}
                </span>

                {!isUnlocked ? (
                  <div className="flex items-center gap-1 text-white/40 text-xs font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    Locked
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {worldStars}/30
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="mb-6">
                <h3 className="text-xl font-black text-white tracking-tight">{info.name}</h3>
                <p className="text-xs text-white/60 font-medium mt-1 leading-snug">{info.subtitle}</p>
                <p className="text-[11px] text-white/40 mt-3 line-clamp-2 leading-relaxed">
                  {info.description}
                </p>
              </div>

              {/* Progress Footer */}
              <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                <span className="text-xs text-white/50 font-medium">
                  {completedCount}/10 Cleared
                </span>

                {isUnlocked ? (
                  <button className="flex items-center gap-1 text-xs font-bold text-white group-hover:text-amber-400">
                    Enter
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                ) : (
                  <span className="text-[11px] text-white/30">Clear World {wId - 1}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
