/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameView, WorldId, GameSaveData, LevelDef } from './types/game';
import { SaveManager } from './storage/saveManager';
import { buildLevel } from './levels/levelDatabase';
import { soundManager } from './audio/SoundManager';
import { InputManager } from './game/input/InputManager';
import { CameraController } from './game/camera/CameraController';

import { MainMenu } from './ui/MainMenu';
import { WorldMap } from './ui/WorldMap';
import { LevelSelect } from './ui/LevelSelect';
import { BonusSelect } from './ui/BonusSelect';
import { GameCanvas } from './game/GameCanvas';
import { GameHUD } from './ui/GameHUD';
import { PauseModal } from './ui/PauseModal';
import { LevelCompleteModal } from './ui/LevelCompleteModal';
import { SettingsModal } from './ui/SettingsModal';
import { HowToPlayModal } from './ui/HowToPlayModal';
import { CreditsModal } from './ui/CreditsModal';
import { MobileControls } from './ui/MobileControls';

export default function App() {
  const [saveData, setSaveData] = useState<GameSaveData>(() => SaveManager.load());
  const [currentView, setCurrentView] = useState<GameView>('main-menu');
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>(1);
  const [activeLevelId, setActiveLevelId] = useState<number>(1);

  // Gameplay Run State
  const [isPaused, setIsPaused] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  // Active level run counters
  const [runRings, setRunRings] = useState(0);
  const [runStars, setRunStars] = useState(0);
  const [runLives, setRunLives] = useState(3);
  const [runTime, setRunTime] = useState(0);
  const [completionResult, setCompletionResult] = useState<{
    starsAwarded: number;
    isNewBestTime: boolean;
    timeTaken: number;
    ringsCollected: number;
    totalRings: number;
    starsCollected: number;
  } | null>(null);

  // Touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const inputRef = useRef<InputManager | null>(null);
  const cameraCtrlRef = useRef<CameraController | null>(null);

  // Key to force reset/remount of game canvas on level restart
  const [gameSessionKey, setGameSessionKey] = useState(0);

  useEffect(() => {
    // Check if touch is supported
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);

    const onFirstTouch = () => {
      setIsTouchDevice(true);
      window.removeEventListener('touchstart', onFirstTouch);
    };
    window.addEventListener('touchstart', onFirstTouch, { passive: true });

    // Apply audio volumes
    soundManager.setVolumes(
      saveData.settings.masterVolume,
      saveData.settings.musicVolume,
      saveData.settings.sfxVolume
    );

    return () => {
      window.removeEventListener('touchstart', onFirstTouch);
    };
  }, []);

  // Update settings handler
  const handleUpdateSettings = (newSettings: GameSaveData['settings']) => {
    const updated = { ...saveData, settings: newSettings };
    setSaveData(updated);
    SaveManager.save(updated);
  };

  // Launch into a specific level
  const startLevel = (levelId: number) => {
    setActiveLevelId(levelId);
    setRunRings(0);
    setRunStars(0);
    setRunLives(3);
    setRunTime(0);
    setIsPaused(false);
    setShowLevelComplete(false);
    setCompletionResult(null);
    setGameSessionKey(k => k + 1);
    setCurrentView('gameplay');
  };

  // Continue or Quick Play
  const handleQuickPlay = () => {
    // Find the latest unlocked level that hasn't been completed
    let targetId = 1;
    for (let id = 1; id <= 80; id++) {
      if (SaveManager.isLevelUnlocked(saveData, id)) {
        targetId = id;
        if (!saveData.levels[id]?.completed) {
          break;
        }
      }
    }
    startLevel(targetId);
  };

  // Checkpoint hit
  const handleCheckpoint = () => {
    // Checkpoint recorded by physics world
  };

  // Goal portal reached
  const handleGoalReached = () => {
    const levelDef = buildLevel(activeLevelId);
    const result = SaveManager.recordLevelCompletion(
      saveData,
      activeLevelId,
      runTime,
      runRings,
      levelDef.collectibles.filter(c => c.type === 'ring').length,
      runStars,
      levelDef.parTime
    );

    setCompletionResult({
      starsAwarded: result.starsAwarded,
      isNewBestTime: result.isNewBestTime,
      timeTaken: runTime,
      ringsCollected: runRings,
      totalRings: levelDef.collectibles.filter(c => c.type === 'ring').length,
      starsCollected: runStars,
    });

    setSaveData({ ...saveData });
    setShowLevelComplete(true);
  };

  const handleNextLevel = () => {
    const nextId = activeLevelId < 80 ? activeLevelId + 1 : 1;
    startLevel(nextId);
  };

  const handleReplay = () => {
    startLevel(activeLevelId);
  };

  const currentLevelDef: LevelDef = buildLevel(activeLevelId);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Main Menu View */}
      {currentView === 'main-menu' && (
        <MainMenu
          saveData={saveData}
          onPlay={handleQuickPlay}
          onWorldMap={() => setCurrentView('world-map')}
          onBonus={() => setCurrentView('bonus-select')}
          onSettings={() => setShowSettings(true)}
          onHowToPlay={() => setShowHowToPlay(true)}
          onCredits={() => setShowCredits(true)}
        />
      )}

      {/* 2. World Selection Map */}
      {currentView === 'world-map' && (
        <WorldMap
          saveData={saveData}
          onSelectWorld={wId => {
            setSelectedWorldId(wId);
            setCurrentView('level-select');
          }}
          onBackToMenu={() => setCurrentView('main-menu')}
        />
      )}

      {/* 3. Level Selection Grid */}
      {currentView === 'level-select' && (
        <LevelSelect
          worldId={selectedWorldId}
          saveData={saveData}
          onSelectLevel={lvlId => startLevel(lvlId)}
          onBackToWorldMap={() => setCurrentView('world-map')}
        />
      )}

      {/* 4. Bonus Stages Vault */}
      {currentView === 'bonus-select' && (
        <BonusSelect
          saveData={saveData}
          onSelectLevel={lvlId => startLevel(lvlId)}
          onBackToMenu={() => setCurrentView('main-menu')}
        />
      )}

      {/* 5. 3D Gameplay View */}
      {currentView === 'gameplay' && (
        <div className="relative w-full h-full">
          <GameCanvas
            key={gameSessionKey}
            level={currentLevelDef}
            saveData={saveData}
            isPaused={isPaused || showLevelComplete || showSettings || showHowToPlay}
            onPauseToggle={() => setIsPaused(p => !p)}
            onRingCollected={count => setRunRings(count)}
            onStarCollected={count => setRunStars(count)}
            onLifeLost={lives => setRunLives(lives)}
            onCheckpoint={handleCheckpoint}
            onGoalReached={handleGoalReached}
            onTimeUpdate={sec => setRunTime(sec)}
            inputRef={inputRef}
            cameraCtrlRef={cameraCtrlRef}
          />

          {/* Gameplay Minimal HUD */}
          <GameHUD
            level={currentLevelDef}
            rings={runRings}
            stars={runStars}
            lives={runLives}
            timeElapsed={runTime}
            onPause={() => setIsPaused(true)}
          />

          {/* Virtual Mobile Joystick, Camera Controls and Action Buttons */}
          {isTouchDevice && (
            <MobileControls
              inputManager={inputRef.current}
              onCameraRotate={(dx, dy) => cameraCtrlRef.current?.rotate(dx, dy)}
              onCameraZoom={dz => cameraCtrlRef.current?.zoom(dz)}
              onResetCamera={() => cameraCtrlRef.current?.resetHeading()}
              onPause={() => setIsPaused(true)}
              sensitivity={saveData.settings.touchSensitivity}
            />
          )}

          {/* Pause Modal */}
          {isPaused && (
            <PauseModal
              level={currentLevelDef}
              saveData={saveData}
              timeElapsed={runTime}
              rings={runRings}
              stars={runStars}
              lives={runLives}
              onResume={() => setIsPaused(false)}
              onRestartCheckpoint={() => {
                setIsPaused(false);
                setGameSessionKey(k => k + 1);
              }}
              onRestartLevel={() => {
                setIsPaused(false);
                startLevel(activeLevelId);
              }}
              onOpenSettings={() => setShowSettings(true)}
              onOpenControls={() => setShowHowToPlay(true)}
              onLevelSelect={() => {
                setIsPaused(false);
                setSelectedWorldId(currentLevelDef.worldId);
                setCurrentView('level-select');
              }}
              onMainMenu={() => {
                setIsPaused(false);
                setCurrentView('main-menu');
              }}
            />
          )}

          {/* Level Complete Celebration Modal */}
          {showLevelComplete && completionResult && (
            <LevelCompleteModal
              level={currentLevelDef}
              starsAwarded={completionResult.starsAwarded}
              timeTaken={completionResult.timeTaken}
              isNewBestTime={completionResult.isNewBestTime}
              ringsCollected={completionResult.ringsCollected}
              totalRings={completionResult.totalRings}
              starsCollected={completionResult.starsCollected}
              hasNextLevel={activeLevelId < 80}
              onNextLevel={handleNextLevel}
              onReplay={handleReplay}
              onLevelSelect={() => {
                setSelectedWorldId(currentLevelDef.worldId);
                setCurrentView('level-select');
              }}
              onMainMenu={() => setCurrentView('main-menu')}
            />
          )}
        </div>
      )}

      {/* Global Modals */}
      {showSettings && (
        <SettingsModal
          settings={saveData.settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {showCredits && (
        <CreditsModal onClose={() => setShowCredits(false)} />
      )}
    </div>
  );
}
