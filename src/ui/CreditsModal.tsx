import React from 'react';
import { X, Heart, Sparkles } from 'lucide-react';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-black text-white tracking-wide uppercase">Credits</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/20 mx-auto">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Bounce Tales 3D</h3>
            <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase mt-0.5">
              The 3D Nostalgic Ball Adventure
            </p>
          </div>

          <p className="text-xs text-white/70 leading-relaxed max-w-xs mx-auto">
            Created as an original 3D platformer tribute inspired by the joyful physics, charm, and
            memorable level progression of classic Nokia-era Bounce games.
          </p>

          <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-white/50">Lead Engineering</span>
              <span className="text-white font-medium">3D Spatial & Physics Engine</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-1.5">
              <span className="text-white/50">Audio & Synthesizer</span>
              <span className="text-white font-medium">Procedural Web Audio API</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-1.5">
              <span className="text-white/50">Level Design</span>
              <span className="text-white font-medium">80 Handcrafted Levels + 10 Bonus</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-1.5">
              <span className="text-white/50">Visuals & Shaders</span>
              <span className="text-white font-medium">Three.js WebGL & R3F</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
        >
          Back
        </button>
      </div>
    </div>
  );
};
