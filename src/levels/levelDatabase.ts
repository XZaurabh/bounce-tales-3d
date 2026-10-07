import { LevelDef, WorldId } from '../types/game';

// Level names and subtitles per world
const WORLD_LEVEL_NAMES: Record<WorldId, { name: string; subtitle: string; style: string }[]> = {
  1: [
    { name: 'First Bounce', subtitle: 'Welcome to the Meadows', style: 'intro' },
    { name: 'Rolling Ridge', subtitle: 'Mastering Downhill Momentum', style: 'slopes' },
    { name: 'Mushroom Leap', subtitle: 'Spring-Powered Heights', style: 'springs' },
    { name: 'Twin Bridges', subtitle: 'Narrow Wooden Crossings', style: 'precision' },
    { name: 'Hills of Gold', subtitle: 'Ring Hunter Expedition', style: 'collectibles' },
    { name: 'The Stone Steps', subtitle: 'Terraced Ascent', style: 'vertical' },
    { name: 'Bramble Patrol', subtitle: 'Dodging Wandering Beetles', style: 'enemies' },
    { name: 'The Crest Trial', subtitle: 'High Velocity Platforming', style: 'challenge' },
    { name: 'Emerald Spiral', subtitle: 'Combined Springs & Slopes', style: 'advanced' },
    { name: 'Great Hillside Rush', subtitle: 'The Grand Meadow Escape', style: 'finale' },
  ],
  2: [
    { name: 'Dusty Threshold', subtitle: 'Entering the Sunlit Dunes', style: 'intro' },
    { name: 'Sinking Slabs', subtitle: 'Crumbling Sandstone Pathways', style: 'collapsing' },
    { name: 'Shifting Sands', subtitle: 'Gliding Desert Platforms', style: 'moving' },
    { name: 'Cactus Gulch', subtitle: 'Spiked Labyrinth Corridor', style: 'hazards' },
    { name: 'Sunken Temple', subtitle: 'Pressure Switches & Gates', style: 'switches' },
    { name: 'The Quicksand Gap', subtitle: 'Long Distance Momentum Jumps', style: 'precision' },
    { name: 'Scorpion Ridge', subtitle: 'Fast Patrolling Desert Bugs', style: 'enemies' },
    { name: 'Mirage Causeway', subtitle: 'Vanishing Desert Pillars', style: 'challenge' },
    { name: 'Pharaohs Ascent', subtitle: 'Moving Blocks & Traps', style: 'advanced' },
    { name: 'Dune Colossus Tomb', subtitle: 'The Ancient Sandstone Gauntlet', style: 'finale' },
  ],
  3: [
    { name: 'Lush Understory', subtitle: 'Deep into the Ancient Woods', style: 'intro' },
    { name: 'Bough & Branch', subtitle: 'Narrow Wooden Canopy Walkways', style: 'precision' },
    { name: 'Treetop Springs', subtitle: 'Bouncing through the Foliage', style: 'springs' },
    { name: 'The High Hollow', subtitle: 'Secret Forest Cavern', style: 'secrets' },
    { name: 'Swinging Timber', subtitle: 'Moving Forest Log Bridges', style: 'moving' },
    { name: 'Spore Drop', subtitle: 'Descending Spiked Canopies', style: 'hazards' },
    { name: 'Canopy Hornets', subtitle: 'Dodging Aerial Flyers', style: 'enemies' },
    { name: 'Verdant Spires', subtitle: 'Acrobatic Treetop Bounds', style: 'challenge' },
    { name: 'The Redwood Maze', subtitle: 'Vertical Canopy Puzzles', style: 'advanced' },
    { name: 'Heart of the Forest', subtitle: 'The Grand Sky-Canopy Ascent', style: 'finale' },
  ],
  4: [
    { name: 'Frostbite Pass', subtitle: 'First Steps on Frigid Ice', style: 'intro' },
    { name: 'Glacial Slide', subtitle: 'Frictionless Downhill Carving', style: 'ice' },
    { name: 'Drifting Floes', subtitle: 'Floating Ice Shelf Crossings', style: 'moving' },
    { name: 'Howling Gale', subtitle: 'Strong Crosswind Currents', style: 'wind' },
    { name: 'Icicle Cavern', subtitle: 'Falling Spikes & Chilly Drops', style: 'hazards' },
    { name: 'Snowdrifts', subtitle: 'Deep Snow Momentum Absorption', style: 'slopes' },
    { name: 'Frost Golems', subtitle: 'Lethal Chill Patrols', style: 'enemies' },
    { name: 'Summit Crevasse', subtitle: 'High-Altitude Ice Precision', style: 'challenge' },
    { name: 'Blizzard Ridge', subtitle: 'Wind, Ice & Moving Platforms', style: 'advanced' },
    { name: 'The Avalanche Run', subtitle: 'Race Down the Frigid Peak', style: 'finale' },
  ],
  5: [
    { name: 'Crystal Foyer', subtitle: 'Entering the Dark Grotto', style: 'intro' },
    { name: 'The Stone Lift', subtitle: 'Vertical Elevator Ascents', style: 'moving' },
    { name: 'Pressure Vault', subtitle: 'Floor Switch Puzzle Chamber', style: 'switches' },
    { name: 'Stalagmite Chasm', subtitle: 'Spike Pits in the Gloom', style: 'hazards' },
    { name: 'Glowstone Maze', subtitle: 'Underground Exploration Paths', style: 'secrets' },
    { name: 'Collapsing Bridges', subtitle: 'Unstable Mine Supports', style: 'collapsing' },
    { name: 'Cave Crawlers', subtitle: 'Chasing Subterranean Beetles', style: 'enemies' },
    { name: 'The Abyss Leap', subtitle: 'Blind Jumps Across the Dark', style: 'challenge' },
    { name: 'Crystal Engine', subtitle: 'Multi-Switch Hydraulic Gate', style: 'advanced' },
    { name: 'Heart of the Earth', subtitle: 'Subterranean Escape Sequence', style: 'finale' },
  ],
  6: [
    { name: 'Gearbox Entry', subtitle: 'Stepping into the Foundry', style: 'intro' },
    { name: 'Beltway Alpha', subtitle: 'High-Speed Conveyor Traversal', style: 'conveyors' },
    { name: 'Crushing Pistons', subtitle: 'Timed Mechanical Smashers', style: 'hazards' },
    { name: 'Counter-Currents', subtitle: 'Running Against Reverse Belts', style: 'conveyors' },
    { name: 'Steam Valves', subtitle: 'Thermal Updraft Vents', style: 'wind' },
    { name: 'Rotating Cogs', subtitle: 'Dynamic Moving Gears', style: 'moving' },
    { name: 'Assembly Drones', subtitle: 'Autonomous Patrol Sentinels', style: 'enemies' },
    { name: 'Piston Precision', subtitle: 'Fast-Paced Timing Platforming', style: 'challenge' },
    { name: 'Factory Floor Omega', subtitle: 'Conveyors, Pistons & Gates', style: 'advanced' },
    { name: 'Foundry Core Meltdown', subtitle: 'The Great Machine Overdrive', style: 'finale' },
  ],
  7: [
    { name: 'Magma Brink', subtitle: 'Heat Waves on Volcanic Rock', style: 'intro' },
    { name: 'Basalt Stepping Stones', subtitle: 'Fragile Crusts in the Lava', style: 'collapsing' },
    { name: 'Fire Spout Alley', subtitle: 'Geysers of Searing Flame', style: 'hazards' },
    { name: 'Molten River Ferry', subtitle: 'Riding Floating Obsidian Slabs', style: 'moving' },
    { name: 'Brimstone Springboard', subtitle: 'High Bounces Over Fire Pits', style: 'springs' },
    { name: 'Pyroclastic Surge', subtitle: 'Narrow Paths on Flaming Ledges', style: 'precision' },
    { name: 'Lava Salamanders', subtitle: 'Chasing Flaming Creatures', style: 'enemies' },
    { name: 'Caldera Gauntlet', subtitle: 'Long Jumps over Boiling Magma', style: 'challenge' },
    { name: 'Infernal Core', subtitle: 'Collapsing Basalt & Fire Geysers', style: 'advanced' },
    { name: 'Eruption Escape', subtitle: 'Climb Before the Lava Rises!', style: 'finale' },
  ],
  8: [
    { name: 'Citadel Gates', subtitle: 'The Threshold of Trials', style: 'intro' },
    { name: 'Dual Elements', subtitle: 'Ice Slopes & Conveyor Accelerators', style: 'combo' },
    { name: 'Floating Bastions', subtitle: 'Multi-Axis Moving Platforms', style: 'moving' },
    { name: 'Lethal Traps', subtitle: 'Lasers, Spikes & Fire Combined', style: 'hazards' },
    { name: 'The Wind Spire', subtitle: 'Vertical Aerial Navigation', style: 'wind' },
    { name: 'Lock & Keystone', subtitle: 'Triple Switch Labyrinth', style: 'switches' },
    { name: 'Citadel Sentinels', subtitle: 'Aggressive Elite Pursuers', style: 'enemies' },
    { name: 'The Apex Precipice', subtitle: 'Extreme Precision Platforming', style: 'challenge' },
    { name: 'The Master Course', subtitle: 'All Mechanics Pushed to the Limit', style: 'advanced' },
    { name: 'The Ultimate Odyssey', subtitle: 'Level 80: Grand Final Ascension', style: 'finale' },
  ],
};

const BONUS_LEVEL_CONFIGS: { id: number; name: string; subtitle: string; worldId: WorldId; parTime: number }[] = [
  { id: 101, name: 'Emerald Ring Rush', subtitle: 'Collect 50 Rings in 45s', worldId: 1, parTime: 45 },
  { id: 102, name: 'Desert Speed Highway', subtitle: 'Sonic Dash Across Dunes', worldId: 2, parTime: 35 },
  { id: 103, name: 'Canopy Acrobatics', subtitle: 'High Altitude Mushroom Bounces', worldId: 3, parTime: 40 },
  { id: 104, name: 'Glacier Bobsled', subtitle: 'Super High-Speed Ice Course', worldId: 4, parTime: 30 },
  { id: 105, name: 'Crystal Cavern Secret', subtitle: 'Deep Puzzle & Hidden Stars', worldId: 5, parTime: 60 },
  { id: 106, name: 'Turbo Conveyor Chaos', subtitle: 'Mach Speed Factory Run', worldId: 6, parTime: 35 },
  { id: 107, name: 'Magma Surfing', subtitle: 'Sinking Crust Marathon', worldId: 7, parTime: 50 },
  { id: 108, name: 'Gravity Mastery', subtitle: 'Extreme Physics Bounce Arena', worldId: 8, parTime: 45 },
  { id: 109, name: 'Star Constellation', subtitle: 'Hunt Every Rare Star Gem', worldId: 8, parTime: 55 },
  { id: 110, name: 'The Champion Trial', subtitle: 'Ultimate Platformer Masterpiece', worldId: 8, parTime: 70 },
];

/**
 * Handcrafts a complete, detailed 3D Level definition based on world theme, level index, and mechanics
 */
export function buildLevel(levelId: number): LevelDef {
  // Check if it's a bonus level
  if (levelId >= 101 && levelId <= 110) {
    const bonusConf = BONUS_LEVEL_CONFIGS.find(b => b.id === levelId) || BONUS_LEVEL_CONFIGS[0];
    return generateBonusLevel(bonusConf);
  }

  // Main levels 1 to 80
  const normalizedId = Math.max(1, Math.min(80, levelId));
  const worldId = (Math.floor((normalizedId - 1) / 10) + 1) as WorldId;
  const levelIndex = (normalizedId - 1) % 10; // 0 to 9
  const meta = WORLD_LEVEL_NAMES[worldId][levelIndex];

  return generateMainLevel(normalizedId, worldId, levelIndex + 1, meta.name, meta.subtitle, meta.style);
}

function generateMainLevel(
  id: number,
  worldId: WorldId,
  levelNum: number,
  name: string,
  subtitle: string,
  style: string
): LevelDef {
  // Base par times increase with level progression
  const parTime = 30 + levelNum * 8 + worldId * 5;

  // Level geometry building
  const platforms: LevelDef['platforms'] = [];
  const hazards: LevelDef['hazards'] = [];
  const enemies: LevelDef['enemies'] = [];
  const collectibles: LevelDef['collectibles'] = [];
  const checkpoints: LevelDef['checkpoints'] = [];
  const springs: LevelDef['springs'] = [];
  const switches: LevelDef['switches'] = [];
  const doors: LevelDef['doors'] = [];
  const windZones: LevelDef['windZones'] = [];

  // Elevation Archetypes:
  // 1. 'ascent': Destination portal is perched high in the clouds (y = 12-16). Climb staircases & mushroom catapults!
  // 2. 'descent': Start high on summit (y = 14), leap down cliff terraces to the valley portal (y = 0)!
  // 3. 'peaks': Roller-coaster skyway, deep drops have bouncy mushrooms 🍄 at bottom to bounce up to next peak!
  const elevationMode: 'ascent' | 'descent' | 'peaks' =
    levelNum % 3 === 1 ? 'ascent' : levelNum % 3 === 2 ? 'descent' : 'peaks';

  const startY = elevationMode === 'descent' ? 14.0 : 0.0;
  // Ball center rests solidly on the top surface of the 1.0m platform (top = startY + 0.5, ball radius = 0.5)
  const spawnPos: [number, number, number] = [0, startY + 1.0, 0];
  platforms.push({
    id: `spawn-platform`,
    pos: [0, startY, 0],
    size: [6, 1, 6],
    type: 'normal',
  });

  // Track current building coordinates through the course
  let curX = 0;
  let curY = startY;
  let curZ = -5;

  // Length and stages scale with level number
  const numSections = Math.min(15, 5 + Math.floor(levelNum * 0.9) + (worldId >= 6 ? 2 : 0));

  // Determine section types based on world, style, and elevation archetype
  for (let s = 1; s <= numSections; s++) {
    const isMidpoint = s === Math.floor(numSections / 2);
    const isQuarter = s === Math.floor(numSections / 4) && numSections >= 8;
    const isThreeQuarter = s === Math.floor((numSections * 3) / 4) && numSections >= 10;

    // Advance direction (curves and turns)
    const turnAngle = (s * 0.72 + levelNum * 0.45) % (Math.PI * 2);
    const xStep = Math.sin(turnAngle) * 3.8;
    const zStep = -(5.2 + (s % 3) * 1.2);

    // Dynamic height step calculation based on elevation archetype:
    let yStep = 0;
    let placeSpringOnPrevious = false;
    let springPower = 16.5;

    if (elevationMode === 'ascent') {
      if (s % 3 === 0) {
        // High cliff climb: requires bouncy mushroom 🍄!
        yStep = 4.2;
        placeSpringOnPrevious = true;
        springPower = 18.5;
      } else {
        // Normal stepped climb (easily jumpable without mushroom)
        yStep = 0.95;
      }
    } else if (elevationMode === 'descent') {
      if (s % 3 === 0) {
        // Deep drop down: landing platform below gets mushroom to bounce safely forward
        yStep = -3.8;
      } else {
        yStep = -1.2;
      }
    } else {
      // Peaks and valleys: alternating ascents and plunges
      if (s % 4 === 1) {
        yStep = 3.8;
        placeSpringOnPrevious = true;
        springPower = 18.0;
      } else if (s % 4 === 2) {
        yStep = 0.6;
      } else if (s % 4 === 3) {
        yStep = -4.2; // Plunge into valley
      } else {
        yStep = 4.0; // Launch out of valley
        placeSpringOnPrevious = true;
        springPower = 18.5;
      }
    }

    // Place bouncy mushroom on the previous platform if launching up to a tall height
    if (placeSpringOnPrevious && platforms.length > 0) {
      const prevPlat = platforms[platforms.length - 1];
      springs.push({
        id: `spring-catapult-${s}`,
        pos: [prevPlat.pos[0], prevPlat.pos[1] + prevPlat.size[1] / 2, prevPlat.pos[2]],
        power: springPower,
      });
    }

    curX += xStep;
    curY += yStep;
    curZ += zStep;

    const platId = `plat-s${s}`;
    let platType: LevelDef['platforms'][0]['type'] = 'normal';
    let platSize: [number, number, number] = [4.6, 0.8, 4.8];

    // Weak / collapsing platforms: player can only be there for ~380ms before it collapses!
    // Placed on intermediate stepping stones and gap bridges
    if ((s % 4 === 2 || (worldId >= 2 && s % 3 === 1)) && s < numSections && !placeSpringOnPrevious) {
      platType = 'collapsing';
      platSize = [3.8, 0.6, 3.8];
    } else if (worldId === 4 && s % 2 === 0) {
      platType = 'ice';
    } else if (worldId === 6 && s % 2 === 0) {
      platType = 'conveyor';
    }

    // Descent valley floor mushroom
    if (elevationMode === 'descent' && s % 3 === 0 && platType !== 'collapsing') {
      springs.push({
        id: `spring-descent-${s}`,
        pos: [curX, curY + 0.45, curZ],
        power: 16.5,
      });
    }

    // Hazards (spikes under gaps and drops)
    if ((s % 4 === 0 && levelNum >= 3) || worldId === 7) {
      hazards.push({
        id: `hazard-${s}`,
        type: worldId === 7 ? 'lava' : 'spike',
        pos: [curX, curY - 2.5, curZ],
        size: [4.5, 0.5, 4.5],
      });
    }

    // Conveyor speed parameters
    const conveyorSpeed: [number, number, number] | undefined = platType === 'conveyor'
      ? [0, 0, (s % 2 === 0 ? -6 : -8)]
      : undefined;

    // All platforms are completely stable (no moving platforms)
    platforms.push({
      id: platId,
      pos: [curX, curY, curZ],
      size: platSize,
      type: platType,
      conveyorSpeed,
      collapseDelay: 0.38,
    });

    // Checkpoints at key milestones (platform top is curY + 0.4, ball radius is 0.5)
    if (isMidpoint || isQuarter || isThreeQuarter) {
      checkpoints.push({
        id: `cp-${s}`,
        pos: [curX, curY + 0.4, curZ],
        spawnPos: [curX, curY + 0.9, curZ],
      });
    }

    // Collectibles: Golden Rings & Star Gems
    const ringCount = 2 + (s % 2);
    for (let r = 0; r < ringCount; r++) {
      const ringOffsetZ = (r - 1) * 1.4;
      collectibles.push({
        id: `ring-${s}-${r}`,
        type: 'ring',
        pos: [curX, curY + 1.2 + (r % 2) * 0.5, curZ + ringOffsetZ],
      });
    }

    // Rare Star Gem placement (1-3 stars per level)
    if (s === 2 || s === Math.floor(numSections * 0.7) || (levelNum >= 5 && s === numSections - 1)) {
      collectibles.push({
        id: `star-${s}`,
        type: 'star',
        pos: [curX + (s % 2 === 0 ? 2 : -2), curY + 2.0, curZ],
      });
    }

    // Health heart for longer levels
    if (isMidpoint && (worldId >= 3 || levelNum >= 6)) {
      collectibles.push({
        id: `heart-${s}`,
        type: 'heart',
        pos: [curX, curY + 1.5, curZ - 1.5],
      });
    }

    // Devils 👿 on solid platforms (patrolling obstacles)
    if (s % 3 === 2 && s > 1 && platType !== 'collapsing') {
      enemies.push({
        id: `devil-${s}`,
        type: (worldId >= 4 && s % 2 === 0) ? 'chaser' : 'patrol',
        pos: [curX, curY + 0.9, curZ],
        patrolDelta: [2.2, 0, 0],
        speed: 1.35 + (levelNum * 0.08),
      });
    }
  }

  // Final Goal Platform and Star Portal
  curZ -= 6;
  curY += (elevationMode === 'ascent' ? 1.0 : -0.5);
  platforms.push({
    id: `goal-platform`,
    pos: [curX, curY, curZ],
    size: [6, 1, 6],
    type: 'normal',
  });

  const goalPos: [number, number, number] = [curX, curY + 1.2, curZ];

  // Rigorous Jump Reachability Verification:
  // "don't place mushroom-less platforms in extreme heights because the player would not be able to jump to reach the other block"
  for (let i = 0; i < platforms.length - 1; i++) {
    const p1 = platforms[i];
    const p2 = platforms[i + 1];
    const dy = p2.pos[1] - p1.pos[1];
    if (dy > 1.3) {
      const alreadyHasSpring = springs.some(sp =>
        Math.abs(sp.pos[0] - p1.pos[0]) < 2.2 &&
        Math.abs(sp.pos[2] - p1.pos[2]) < 2.2
      );
      if (!alreadyHasSpring) {
        springs.push({
          id: `safety-spring-${i}`,
          pos: [p1.pos[0], p1.pos[1] + p1.size[1] / 2, p1.pos[2]],
          power: Math.max(16.0, 12.0 + dy * 1.65),
        });
      }
    }
  }

  return {
    id,
    worldId,
    worldLevelNumber: levelNum,
    name,
    subtitle,
    parTime,
    spawnPos,
    goalPos,
    platforms,
    hazards,
    enemies,
    collectibles,
    checkpoints,
    springs,
    switches,
    doors,
    windZones,
    isBonus: false,
  };
}

function generateBonusLevel(conf: typeof BONUS_LEVEL_CONFIGS[0]): LevelDef {
  const platforms: LevelDef['platforms'] = [];
  const collectibles: LevelDef['collectibles'] = [];
  const springs: LevelDef['springs'] = [];
  const hazards: LevelDef['hazards'] = [];

  const spawnPos: [number, number, number] = [0, 1.0, 0];
  platforms.push({
    id: `bonus-spawn`,
    pos: [0, 0, 0],
    size: [6, 1, 6],
    type: 'normal',
  });

  let curX = 0;
  let curY = 0;
  let curZ = -5;

  const count = 12;
  for (let i = 1; i <= count; i++) {
    curZ -= 6;
    curX += (i % 2 === 0 ? 3 : -3);
    curY += (i % 3 === 0 ? 1.5 : 0.5);

    platforms.push({
      id: `bonus-plat-${i}`,
      pos: [curX, curY, curZ],
      size: [4, 0.8, 4],
      type: 'normal',
    });

    if (i % 3 === 1) {
      springs.push({
        id: `bonus-spring-${i}`,
        pos: [curX, curY + 0.5, curZ],
        power: 16,
      });
    }

    // High density of rings
    for (let r = 0; r < 4; r++) {
      collectibles.push({
        id: `bonus-ring-${i}-${r}`,
        type: 'ring',
        pos: [curX + (r - 1.5) * 1.0, curY + 1.2, curZ],
      });
    }

    if (i % 4 === 0) {
      collectibles.push({
        id: `bonus-star-${i}`,
        type: 'star',
        pos: [curX, curY + 2.5, curZ],
      });
    }
  }

  curZ -= 6;
  platforms.push({
    id: `bonus-goal-plat`,
    pos: [curX, curY, curZ],
    size: [6, 1, 6],
    type: 'normal',
  });

  return {
    id: conf.id,
    worldId: conf.worldId,
    worldLevelNumber: conf.id - 100,
    name: conf.name,
    subtitle: conf.subtitle,
    parTime: conf.parTime,
    spawnPos,
    goalPos: [curX, curY + 1.2, curZ],
    platforms,
    hazards,
    collectibles,
    checkpoints: [],
    springs,
    isBonus: true,
  };
}
