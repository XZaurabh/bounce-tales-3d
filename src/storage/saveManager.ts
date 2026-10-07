import { GameSaveData, LevelProgress, WorldId } from '../types/game';

const SAVE_KEY = 'bounce_tales_3d_save_v1';

export const DEFAULT_SAVE_DATA: GameSaveData = {
  version: 1,
  currentWorldId: 1,
  currentLevelId: 1,
  levels: {
    1: {
      levelId: 1,
      completed: false,
      unlocked: true,
      stars: 0,
      bestTime: null,
      ringsCollected: 0,
      totalRings: 15,
      starsCollected: 0,
    },
  },
  totalRings: 0,
  totalStars: 0,
  bonusUnlocked: false,
  lives: 3,
  settings: {
    graphicsQuality: 'high',
    cameraMode: 'manual',
    mouseSensitivity: 1.0,
    touchSensitivity: 1.0,
    masterVolume: 0.8,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    vibration: true,
    shadows: true,
    postProcessing: true,
  },
};

export class SaveManager {
  private static cachedData: GameSaveData | null = null;

  public static load(): GameSaveData {
    if (this.cachedData) return this.cachedData;

    try {
      const serialized = localStorage.getItem(SAVE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        // Merge with defaults to ensure schema consistency
        this.cachedData = {
          ...DEFAULT_SAVE_DATA,
          ...parsed,
          settings: { ...DEFAULT_SAVE_DATA.settings, ...(parsed.settings || {}) },
          levels: { ...DEFAULT_SAVE_DATA.levels, ...(parsed.levels || {}) },
        };
        return this.cachedData!;
      }
    } catch (e) {
      console.warn('Failed to load save data from localStorage:', e);
    }

    this.cachedData = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    return this.cachedData!;
  }

  public static save(data: GameSaveData): void {
    this.cachedData = data;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save data to localStorage:', e);
    }
  }

  public static isWorldUnlocked(data: GameSaveData, worldId: WorldId): boolean {
    if (worldId === 1) return true;
    // Check if the previous world's final level (worldId-1)*10 is completed
    const prevWorldLastLevel = (worldId - 1) * 10;
    return Boolean(data.levels[prevWorldLastLevel]?.completed);
  }

  public static isLevelUnlocked(data: GameSaveData, levelId: number): boolean {
    if (levelId === 1) return true;
    if (levelId >= 101 && levelId <= 110) {
      // Bonus levels unlock based on star milestones (e.g. 10 stars for bonus 1, 20 for bonus 2, etc.)
      const requiredStars = (levelId - 100) * 8;
      return data.totalStars >= requiredStars;
    }

    const prevLevelProgress = data.levels[levelId - 1];
    return Boolean(prevLevelProgress?.completed || data.levels[levelId]?.unlocked);
  }

  public static recordLevelCompletion(
    data: GameSaveData,
    levelId: number,
    timeTaken: number,
    ringsCollected: number,
    totalLevelRings: number,
    starsFound: number,
    parTime: number
  ): { starsAwarded: number; isNewBestTime: boolean; unlockedNextLevel: boolean; nextLevelId: number } {
    const existing = data.levels[levelId] || {
      levelId,
      completed: false,
      unlocked: true,
      stars: 0,
      bestTime: null,
      ringsCollected: 0,
      totalRings: totalLevelRings,
      starsCollected: 0,
    };

    // Calculate stars:
    // Star 1: Completion
    // Star 2: Under par time
    // Star 3: Collected 75%+ of rings or all stars
    let starsEarned = 1;
    if (timeTaken <= parTime) starsEarned++;
    if (ringsCollected >= Math.floor(totalLevelRings * 0.75)) starsEarned++;

    const isNewBestTime = existing.bestTime === null || timeTaken < existing.bestTime;
    const finalStars = Math.max(existing.stars, starsEarned);

    const updatedLevel: LevelProgress = {
      levelId,
      completed: true,
      unlocked: true,
      stars: finalStars,
      bestTime: isNewBestTime ? timeTaken : existing.bestTime,
      ringsCollected: Math.max(existing.ringsCollected, ringsCollected),
      totalRings: totalLevelRings,
      starsCollected: Math.max(existing.starsCollected, starsFound),
    };

    data.levels[levelId] = updatedLevel;

    // Unlock next level if in 1-80 range
    let unlockedNextLevel = false;
    let nextLevelId = levelId + 1;
    if (levelId < 80) {
      if (!data.levels[nextLevelId]) {
        data.levels[nextLevelId] = {
          levelId: nextLevelId,
          completed: false,
          unlocked: true,
          stars: 0,
          bestTime: null,
          ringsCollected: 0,
          totalRings: 15,
          starsCollected: 0,
        };
        unlockedNextLevel = true;
      } else {
        data.levels[nextLevelId].unlocked = true;
      }
    }

    // Recalculate totals
    let totalR = 0;
    let totalS = 0;
    Object.values(data.levels).forEach(lvl => {
      totalR += lvl.ringsCollected;
      totalS += lvl.stars;
    });
    data.totalRings = totalR;
    data.totalStars = totalS;

    this.save(data);

    return {
      starsAwarded: starsEarned,
      isNewBestTime,
      unlockedNextLevel,
      nextLevelId,
    };
  }

  public static resetProgress(): GameSaveData {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    this.save(fresh);
    return fresh;
  }
}
