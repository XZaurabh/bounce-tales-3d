import React from 'react';
import { X, Volume2, Monitor, Camera, Gamepad } from 'lucide-react';
import { GameSaveData } from '../types/game';
import { soundManager } from '../audio/SoundManager';

interface SettingsModalProps {
  settings: GameSaveData['settings'];
  onUpdateSettings: (newSettings: GameSaveData['settings']) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleVolumeChange = (type: 'master' | 'music' | 'sfx', value: number) => {
    const updated = {
      ...settings,
      [`${type}Volume`]: value,
    };
    onUpdateSettings(updated);
    soundManager.setVolumes(updated.masterVolume, updated.musicVolume, updated.sfxVolume);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-wide uppercase">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Audio */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Volume2 className="w-4 h-4" />
            Audio Controls
          </div>

          <div className="space-y-3 bg-slate-800/40 border border-white/5 rounded-2xl p-4">
            <div>
              <div className="flex justify-between text-xs text-white/80 font-medium mb-1.5">
                <span>Master Volume</span>
                <span className="font-mono">{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={e => handleVolumeChange('master', parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/80 font-medium mb-1.5">
                <span>Music Volume</span>
                <span className="font-mono">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={e => handleVolumeChange('music', parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/80 font-medium mb-1.5">
                <span>Sound Effects (SFX)</span>
                <span className="font-mono">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={e => handleVolumeChange('sfx', parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Graphics */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Monitor className="w-4 h-4" />
            Display & Graphics
          </div>

          <div className="space-y-4 bg-slate-800/40 border border-white/5 rounded-2xl p-4">
            <div>
              <label className="text-xs text-white/80 font-medium block mb-2">Graphics Quality</label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'ultra'] as const).map(quality => (
                  <button
                    key={quality}
                    onClick={() => onUpdateSettings({ ...settings, graphicsQuality: quality })}
                    className={`py-2 text-xs font-bold uppercase rounded-xl transition-all ${
                      settings.graphicsQuality === quality
                        ? 'bg-sky-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-white/60 hover:text-white'
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-xs text-white/80 font-medium">Dynamic Shadows</span>
              <button
                onClick={() => onUpdateSettings({ ...settings, shadows: !settings.shadows })}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  settings.shadows ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.shadows ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={toggleFullscreen}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all border border-white/5"
            >
              Toggle Fullscreen View
            </button>
          </div>
        </div>

        {/* Section 3: Camera & Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            Camera & Controls
          </div>

          <div className="space-y-4 bg-slate-800/40 border border-white/5 rounded-2xl p-4">
            <div>
              <label className="text-xs text-white/80 font-medium block mb-2">Camera Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(['assisted', 'manual', 'fixed'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => onUpdateSettings({ ...settings, cameraMode: mode })}
                    className={`py-2 text-xs font-bold capitalize rounded-xl transition-all ${
                      settings.cameraMode === mode
                        ? 'bg-violet-500 text-white shadow-md'
                        : 'bg-slate-800 text-white/60 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/80 font-medium mb-1.5">
                <span>Camera Orbit Sensitivity</span>
                <span className="font-mono">{settings.mouseSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={settings.mouseSensitivity}
                onChange={e =>
                  onUpdateSettings({
                    ...settings,
                    mouseSensitivity: parseFloat(e.target.value),
                    touchSensitivity: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-violet-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
