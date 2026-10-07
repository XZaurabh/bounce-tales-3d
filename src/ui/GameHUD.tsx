import React from 'react';
import { Pause, Heart, CircleDot, Star, Timer } from 'lucide-react';
import { LevelDef } from '../types/game';
import { WORLDS } from '../levels/worlds';

interface GameHUDProps {
  level: LevelDef;
  rings: number;
  stars: number;
  lives: number;
  timeElapsed: number;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  rings,
  stars,
  lives,
  timeElapsed,
  onPause,
}) => {
  const worldInfo = WORLDS[level.worldId];

  // Format timer into 00:00.0
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);
  const tenths = Math.floor((timeElapsed % 1) * 10);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between px-2 sm:px-6 pt-2 sm:pt-4 pb-3 sm:pb-6 select-none box-border">
      {/* Top Bar HUD */}
      <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
        {/* Left: Pause, Level Info, and Stats Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto min-w-0 flex-shrink">
          {/* Pause Button */}
          <button
            data-interactive="true"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onPause();
            }}
            onTouchStart={e => {
              e.preventDefault();
              e.stopPropagation();
              onPause();
            }}
            className="w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0 rounded-full bg-black/25 hover:bg-black/40 active:scale-95 text-white flex items-center justify-center transition-all shadow-lg border border-white/20 touch-none backdrop-blur-md cursor-pointer"
            title="Pause Menu (Esc / P)"
          >
            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white" />
          </button>

          {/* Level Info & Compact Stats */}
          <div className="h-9 sm:h-11 px-2.5 sm:px-4 rounded-full bg-black/25 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1.5 sm:gap-3 min-w-0 flex-shrink">
            <div className="flex items-center gap-1 whitespace-nowrap min-w-0">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-amber-400 truncate max-w-[62px] xs:max-w-[90px] sm:max-w-none">
                {worldInfo.name}
              </span>
              <span className="text-white/30 text-[10px] sm:text-xs">/</span>
              <span className="text-[10px] sm:text-xs font-semibold text-white/90">
                {level.isBonus ? `B${level.worldLevelNumber}` : `Lv ${level.worldLevelNumber}`}
              </span>
              <span className="hidden md:inline text-white/30 text-xs">·</span>
              <span className="hidden md:inline text-xs font-bold text-white/90 truncate max-w-[130px]">
                {level.name}
              </span>
            </div>

            <div className="w-px h-3.5 sm:h-4 bg-white/15 flex-shrink-0" />

            {/* Inlined minimal stats */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {/* Rings */}
              <div className="flex items-center gap-0.5 sm:gap-1 text-amber-400">
                <CircleDot className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
                <span className="font-mono tabular-nums text-[11px] sm:text-xs font-bold text-white">
                  {rings}
                </span>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5 sm:gap-1 text-sky-400">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-sky-400" />
                <span className="font-mono tabular-nums text-[11px] sm:text-xs font-bold text-white">
                  {stars}
                </span>
              </div>

              {/* Lives */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < lives ? 'fill-rose-500 text-rose-500' : 'text-white/20 fill-white/10'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Timer & Par Time (flex-shrink-0 ensures it is NEVER clipped) */}
        <div className="h-9 sm:h-11 px-2.5 sm:px-4 rounded-full bg-black/25 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1.5 sm:gap-2 flex-shrink-0 pointer-events-auto">
          <div className="flex items-center gap-1 sm:gap-1.5 text-white/90">
            <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 flex-shrink-0" />
            <span className="font-mono tabular-nums text-xs sm:text-sm font-black tracking-wide text-white whitespace-nowrap">{formattedTime}</span>
          </div>
          <span className="hidden sm:inline text-[11px] text-white/40 border-l border-white/15 pl-2 font-medium whitespace-nowrap">
            Par {level.parTime}s
          </span>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="flex justify-between items-end">
        <div className="hidden md:flex items-center gap-2 bg-slate-900/70 backdrop-blur-sm border border-white/10 px-3.5 py-1.5 rounded-lg text-xs text-white/80 shadow-md">
          <span className="font-bold text-amber-400">WASD</span>
          <span>Move</span>
          <span>·</span>
          <span className="font-bold text-amber-400">Space</span>
          <span>Jump</span>
          <span>·</span>
          <span className="font-bold text-amber-400">Drag Anywhere</span>
          <span>360° Camera</span>
          <span>·</span>
          <span className="font-bold text-amber-400">Q / E</span>
          <span>Rotate</span>
          <span>·</span>
          <span className="font-bold text-amber-400">R</span>
          <span>Reset</span>
        </div>
      </div>
    </div>
  );
};
