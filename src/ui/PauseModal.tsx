import React, { useState } from 'react';
import { Play, RotateCcw, Flag, Sliders, Gamepad2, Grid, Home, Trophy, Timer, CircleDot, Star, Heart, X } from 'lucide-react';
import { LevelDef, GameSaveData } from '../types/game';
import { WORLDS } from '../levels/worlds';
import { SaveManager } from '../storage/saveManager';

interface PauseModalProps {
  level: LevelDef;
  saveData: GameSaveData;
  timeElapsed: number;
  rings: number;
  stars: number;
  lives: number;
  onResume: () => void;
  onRestartCheckpoint: () => void;
  onRestartLevel: () => void;
  onOpenSettings: () => void;
  onOpenControls: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  level,
  saveData,
  timeElapsed,
  rings,
  stars,
  lives,
  onResume,
  onRestartCheckpoint,
  onRestartLevel,
  onOpenSettings,
  onOpenControls,
  onLevelSelect,
  onMainMenu,
}) => {
  const [showScoresTab, setShowScoresTab] = useState(false);
  const worldInfo = WORLDS[level.worldId];
  const levelProgress = saveData.levels[level.id];
  const totalStars = saveData.totalStars;

  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md bg-slate-900/95 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-amber-400">
              {worldInfo.name}
            </span>
            <span className="text-white/40 text-xs">/</span>
            <span className="text-xs font-semibold text-white/80">
              {level.isBonus ? `Bonus ${level.worldLevelNumber}` : `Level ${level.worldLevelNumber}`}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            {level.name}
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-rose-500 rounded-full mt-1" />
        </div>

        {/* Scores & Progress Card */}
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-3.5 flex items-center justify-around gap-2 text-white">
          {/* Current Time */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-sky-400 text-xs font-bold mb-0.5">
              <Timer className="w-3.5 h-3.5" />
              <span>TIME</span>
            </div>
            <span className="font-mono text-sm font-extrabold">{formattedTime}</span>
            <span className="text-[10px] text-white/40">Par: {level.parTime}s</span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Rings */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-0.5">
              <CircleDot className="w-3.5 h-3.5" />
              <span>RINGS</span>
            </div>
            <span className="font-mono text-sm font-extrabold">{rings}</span>
            <span className="text-[10px] text-white/40">
              Best: {levelProgress?.ringsCollected || 0}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Stars */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>STARS</span>
            </div>
            <span className="font-mono text-sm font-extrabold">{stars} / 3</span>
            <span className="text-[10px] text-white/40">Total: {totalStars}★</span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Lives */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-rose-500 text-xs font-bold mb-0.5">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>LIVES</span>
            </div>
            <div className="flex items-center gap-0.5 mt-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-3 h-3 ${i < lives ? 'fill-rose-500 text-rose-500' : 'text-slate-600 fill-slate-700/50'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scores & Records Expanded Popup / Tab */}
        {showScoresTab && (
          <div className="bg-slate-950/80 border border-amber-400/30 rounded-2xl p-4 text-left flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Level Records & High Scores
                </span>
              </div>
              <button
                onClick={() => setShowScoresTab(false)}
                className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 border border-white/5 p-2 rounded-xl">
                <span className="text-white/50 block text-[11px]">Personal Best Time</span>
                <span className="font-mono font-bold text-sky-400 text-sm">
                  {levelProgress?.bestTime !== null && levelProgress?.bestTime !== undefined
                    ? `${levelProgress.bestTime.toFixed(1)}s`
                    : 'Not cleared yet'}
                </span>
              </div>
              <div className="bg-slate-900 border border-white/5 p-2 rounded-xl">
                <span className="text-white/50 block text-[11px]">Level Stars Earned</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {levelProgress?.stars || 0} / 3 ★
                </span>
              </div>
              <div className="bg-slate-900 border border-white/5 p-2 rounded-xl">
                <span className="text-white/50 block text-[11px]">Target Par Time</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {level.parTime} seconds
                </span>
              </div>
              <div className="bg-slate-900 border border-white/5 p-2 rounded-xl">
                <span className="text-white/50 block text-[11px]">Overall Game Stars</span>
                <span className="font-mono font-bold text-yellow-400 text-sm">
                  {totalStars} Collected
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Menu Buttons List */}
        <div className="flex flex-col gap-2 mt-1">
          {/* 1. Continue / Resume */}
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-98 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-emerald-500/20 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            Continue
          </button>

          {/* 2. New Game / Restart Level */}
          <button
            onClick={onRestartLevel}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all border border-white/10 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            Restart Level (New Game)
          </button>

          {/* 3. Restart Checkpoint */}
          <button
            onClick={onRestartCheckpoint}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-98 text-white/90 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all border border-white/5 cursor-pointer"
          >
            <Flag className="w-4 h-4 text-emerald-400" />
            Restart from Checkpoint
          </button>

          <div className="grid grid-cols-2 gap-2 mt-1">
            {/* 4. Levels */}
            <button
              onClick={onLevelSelect}
              className="py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-white/5 cursor-pointer"
            >
              <Grid className="w-4 h-4 text-amber-400" />
              Levels
            </button>

            {/* 5. Scores */}
            <button
              onClick={() => setShowScoresTab(t => !t)}
              className="py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-white/5 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              Scores
            </button>

            {/* 6. Settings */}
            <button
              onClick={onOpenSettings}
              className="py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-white/5 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-violet-400" />
              Settings
            </button>

            {/* 7. Controls */}
            <button
              onClick={onOpenControls}
              className="py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-white/5 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 text-sky-400" />
              Controls
            </button>
          </div>

          {/* 8. Homepage / Main Menu */}
          <button
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 active:scale-98 font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-rose-500/20 mt-1 cursor-pointer"
          >
            <Home className="w-4 h-4 text-rose-400" />
            Homepage (Main Menu)
          </button>
        </div>
      </div>
    </div>
  );
};
