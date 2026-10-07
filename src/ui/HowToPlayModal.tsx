import React, { useState } from 'react';
import { X, Keyboard, Gamepad, Smartphone, CheckCircle2 } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'pc' | 'gamepad' | 'mobile'>('pc');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-black text-white tracking-wide uppercase">How To Play</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setTab('pc')}
            className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'pc' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            PC / Keyboard
          </button>
          <button
            onClick={() => setTab('gamepad')}
            className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'gamepad' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            <Gamepad className="w-4 h-4" />
            Gamepad
          </button>
          <button
            onClick={() => setTab('mobile')}
            className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'mobile' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile Touch
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'pc' && (
          <div className="space-y-3">
            <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80 font-medium">Roll / Move</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-amber-300 font-bold text-xs">
                  W, A, S, D / Arrow Keys
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                <span className="text-white/80 font-medium">Jump / Bounce</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-amber-300 font-bold text-xs">
                  Spacebar
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                <span className="text-white/80 font-medium">Speed Boost</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-amber-300 font-bold text-xs">
                  Left Shift
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                <span className="text-white/80 font-medium">Rotate Camera 360°</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-amber-300 font-bold text-xs">
                  Q / E Keys or Mouse Drag
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                <span className="text-white/80 font-medium">Reset Camera Behind Ball</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-amber-300 font-bold text-xs">
                  R Key / Compass Icon
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                <span className="text-white/80 font-medium">Zoom Distance</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-amber-300 font-bold text-xs">
                  Mouse Scroll Wheel
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                <span className="text-white/80 font-medium">Pause Menu</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-amber-300 font-bold text-xs">
                  Esc / P Key
                </span>
              </div>
            </div>
          </div>
        )}

        {tab === 'gamepad' && (
          <div className="space-y-3">
            <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80 font-medium">Move Ball</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-sky-300 font-bold text-xs">
                  Left Thumbstick
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                <span className="text-white/80 font-medium">Jump</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-sky-300 font-bold text-xs">
                  A / Cross Button
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                <span className="text-white/80 font-medium">Speed Boost</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-sky-300 font-bold text-xs">
                  B / Right Bumper
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                <span className="text-white/80 font-medium">Orbit Camera</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-sky-300 font-bold text-xs">
                  Right Thumbstick
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                <span className="text-white/80 font-medium">Pause</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-sky-300 font-bold text-xs">
                  Start Button
                </span>
              </div>
            </div>
          </div>
        )}

        {tab === 'mobile' && (
          <div className="space-y-3">
            <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80 font-medium">Left Screen</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-emerald-300 font-bold text-xs">
                  Virtual Joystick
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                <span className="text-white/80 font-medium">Right Screen</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-emerald-300 font-bold text-xs">
                  Large Jump & Boost Buttons
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                <span className="text-white/80 font-medium">Center Swipe</span>
                <span className="font-mono bg-slate-700 px-2.5 py-1 rounded text-emerald-300 font-bold text-xs">
                  Drag to Orbit Camera
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Gameplay Mechanics Tips */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-2">
          <span className="text-xs uppercase font-black text-amber-400 tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Nostalgic Pro Tips
          </span>
          <p className="text-xs text-white/70 leading-relaxed">
            • Roll down slopes to build high downhill momentum for massive jumps.
            <br />
            • Red spring mushrooms catapult you to secret high canopy routes and star gems.
            <br />
            • Ice platforms let you slide with zero friction, while sandy ruins require calculated hops.
            <br />
            • Step on red floor switches in dark caverns to open massive stone doors.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};
