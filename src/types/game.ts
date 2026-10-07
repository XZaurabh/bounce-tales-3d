export type WorldId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface WorldInfo {
  id: WorldId;
  name: string;
  subtitle: string;
  theme: 'grass' | 'desert' | 'forest' | 'snow' | 'cave' | 'machinery' | 'volcano' | 'apex';
  description: string;
  skyColor: string;
  groundColor: string;
  cliffColor: string;
  edgeColor: string;
  accentColor: string;
  fogColor: string;
  mistColor: string;
  ambientLight: string;
  dirLight: string;
  mechanicNote: string;
}

export type PlatformType =
  | 'normal'
  | 'bouncy'
  | 'ice'
  | 'conveyor'
  | 'collapsing'
  | 'moving'
  | 'slope'
  | 'hazard';

export interface PlatformDef {
  id: string;
  pos: [number, number, number];
  size: [number, number, number];
  type?: PlatformType;
  color?: string;
  rot?: [number, number, number];
  // For moving platform
  moveDelta?: [number, number, number];
  moveSpeed?: number;
  // For conveyor
  conveyorSpeed?: [number, number, number];
  // For collapsing
  collapseDelay?: number;
}

export interface HazardDef {
  id: string;
  type: 'spike' | 'lava' | 'water' | 'fire_geyser' | 'laser';
  pos: [number, number, number];
  size: [number, number, number];
  rot?: [number, number, number];
}

export interface EnemyDef {
  id: string;
  type: 'patrol' | 'flyer' | 'chaser' | 'roller';
  pos: [number, number, number];
  patrolDelta?: [number, number, number];
  speed?: number;
}

export interface CollectibleDef {
  id: string;
  type: 'ring' | 'star' | 'heart';
  pos: [number, number, number];
}

export interface CheckpointDef {
  id: string;
  pos: [number, number, number];
  spawnPos: [number, number, number];
}

export interface SwitchDef {
  id: string;
  pos: [number, number, number];
  targetDoorId: string;
  isTimed?: boolean;
  timeLimit?: number;
}

export interface DoorDef {
  id: string;
  pos: [number, number, number];
  size: [number, number, number];
  openOffset?: [number, number, number];
}

export interface SpringDef {
  id: string;
  pos: [number, number, number];
  power: number;
}

export interface PushableDef {
  id: string;
  pos: [number, number, number];
  size: [number, number, number];
  mass?: number;
}

export interface WindZoneDef {
  id: string;
  pos: [number, number, number];
  size: [number, number, number];
  force: [number, number, number];
}

export interface LevelDef {
  id: number; // 1-80 for main levels, 101-110 for bonus levels
  worldId: WorldId;
  worldLevelNumber: number; // 1 to 10
  name: string;
  subtitle: string;
  parTime: number; // in seconds
  spawnPos: [number, number, number];
  goalPos: [number, number, number];
  platforms: PlatformDef[];
  hazards?: HazardDef[];
  enemies?: EnemyDef[];
  collectibles: CollectibleDef[];
  checkpoints: CheckpointDef[];
  springs?: SpringDef[];
  switches?: SwitchDef[];
  doors?: DoorDef[];
  pushables?: PushableDef[];
  windZones?: WindZoneDef[];
  isBonus?: boolean;
}

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  unlocked: boolean;
  stars: number; // 0 - 3
  bestTime: number | null; // seconds
  ringsCollected: number;
  totalRings: number;
  starsCollected: number;
  hasFoundSecret?: boolean;
}

export interface GameSaveData {
  version: number;
  currentWorldId: WorldId;
  currentLevelId: number;
  levels: Record<number, LevelProgress>;
  totalRings: number;
  totalStars: number;
  bonusUnlocked: boolean;
  lives: number;
  settings: {
    graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
    cameraMode: 'assisted' | 'manual' | 'fixed';
    mouseSensitivity: number;
    touchSensitivity: number;
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    vibration: boolean;
    shadows: boolean;
    postProcessing: boolean;
  };
}

export type GameView =
  | 'main-menu'
  | 'world-map'
  | 'level-select'
  | 'gameplay'
  | 'bonus-select'
  | 'how-to-play'
  | 'settings'
  | 'credits';
