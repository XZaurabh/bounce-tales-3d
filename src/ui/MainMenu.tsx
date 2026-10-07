import React from 'react';
import { Play, Grid, Sparkles, Sliders, HelpCircle, Info } from 'lucide-react';
import { MenuBackgroundCanvas } from '../game/MenuBackgroundCanvas';
import { GameSaveData } from '../types/game';

interface MainMenuProps {
  saveData: GameSaveData;
  onPlay: () => void;
  onWorldMap: () => void;
  onBonus: () => void;
  onSettings: () => void;
  onHowToPlay: () => void;
  onCredits: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onPlay,
  onWorldMap,
  onBonus,
  onSettings,
  onHowToPlay,
  onCredits,
}) => {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden select-none flex flex-col justify-between p-5 sm:p-10 md:p-12 bg-[#030712]">
      {/* Live 3D Atmospheric Background */}
      <MenuBackgroundCanvas />

      {/* Header with Signature Typography */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left-Aligned Signature Wordmark & Byline */}
        <div className="flex flex-col items-start select-none">
          {/* Continuous Wordmark: Bold White First Word, Thin Faded Second Word */}
          <div
            className="inline-flex items-baseline tracking-[-0.05em] uppercase italic"
            style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif" }}
          >
            <span className="font-black text-white text-4xl sm:text-6xl md:text-7xl leading-none">
              BOUNCE
            </span>
            <span className="font-extralight text-white/20 text-4xl sm:text-6xl md:text-7xl leading-none ml-2 sm:ml-3">
              TALES
            </span>
          </div>

          {/* Understated Byline with Emerald Accent Dot */}
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-[0.28em] text-neutral-400 uppercase mt-2.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>BY SOURAV</span>
            <span className="text-neutral-600 font-light">|</span>
            <span className="text-neutral-400">3.0 PRO</span>
          </div>
        </div>

        {/* Top-Right Compact Stats Badge */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto bg-neutral-900/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-neutral-300 shadow-md">
          <span className="text-amber-400 font-bold">★ {saveData.totalStars} Stars</span>
          <span className="text-neutral-600 text-xs">·</span>
          <span className="text-sky-400 font-bold">◎ {saveData.totalRings} Rings</span>
          <span className="text-neutral-600 text-xs hidden md:inline">·</span>
          <span className="text-neutral-400 text-[11px] uppercase tracking-wider hidden md:inline">8 Worlds</span>
        </div>
      </header>

      {/* Menu Actions Container (Aligned full-width left-to-right matching content boundaries) */}
      <main className="relative z-10 w-full max-w-6xl mx-auto mt-auto mb-6 sm:mb-8">
        <div className="w-full sm:max-w-sm md:max-w-md flex flex-col gap-2.5">
          {/* Primary Play Button */}
          <button
            onClick={onPlay}
            className="group w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-xl bg-white hover:bg-neutral-100 active:scale-[0.98] text-black font-black text-sm uppercase italic tracking-wider flex items-center justify-between shadow-2xl transition-all duration-150 cursor-pointer"
          >
            <span className="flex items-center gap-2.5 sm:gap-3">
              <Play className="w-4 h-4 fill-black text-black" />
              <span>PLAY GAME</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest bg-black text-white px-2 py-0.5 rounded uppercase font-bold not-italic">
              START
            </span>
          </button>

          {/* World Selection */}
          <button
            onClick={onWorldMap}
            className="w-full py-3 px-4 sm:px-5 rounded-xl bg-neutral-900/75 hover:bg-neutral-800/85 active:scale-[0.98] border border-white/10 backdrop-blur-md text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Grid className="w-3.5 h-3.5 text-amber-400" />
              <span>WORLD SELECTION</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">8 WORLDS</span>
          </button>

          {/* Bonus Stages */}
          <button
            onClick={onBonus}
            className="w-full py-3 px-4 sm:px-5 rounded-xl bg-neutral-900/75 hover:bg-neutral-800/85 active:scale-[0.98] border border-white/10 backdrop-blur-md text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>BONUS VAULT</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">10 VAULTS</span>
          </button>

          {/* Utilities Row: Settings, Controls, Credits */}
          <div className="grid grid-cols-3 gap-2 pt-0.5 w-full">
            <button
              onClick={onSettings}
              className="py-2.5 px-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/70 active:scale-[0.98] border border-white/5 backdrop-blur-md text-neutral-300 hover:text-white font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-neutral-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={onHowToPlay}
              className="py-2.5 px-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/70 active:scale-[0.98] border border-white/5 backdrop-blur-md text-neutral-300 hover:text-white font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
              <span>Controls</span>
            </button>

            <button
              onClick={onCredits}
              className="py-2.5 px-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/70 active:scale-[0.98] border border-white/5 backdrop-blur-md text-neutral-300 hover:text-white font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              <span>Credits</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Branding & Platform Info */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between text-[10px] font-medium tracking-[0.2em] text-neutral-500 uppercase">
        <span>ORIGINAL 3D PLATFORMER</span>
        <span>PC · GAMEPAD · MOBILE</span>
      </footer>
    </div>
  );
};
