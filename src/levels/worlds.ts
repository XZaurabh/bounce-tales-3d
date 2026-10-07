import { WorldId, WorldInfo } from '../types/game';

export const WORLDS: Record<WorldId, WorldInfo> = {
  1: {
    id: 1,
    name: 'Green Hills',
    subtitle: 'Gentle Meadows & Rolling Slopes',
    theme: 'grass',
    description: 'Learn the fundamentals of rolling, momentum, jumping, and spring mushrooms in lush sunny pastures.',
    skyColor: '#60a5fa',
    groundColor: '#22c55e', // Vibrant emerald grass cap
    cliffColor: '#78350f',  // Rich warm earth & bedrock sides
    edgeColor: '#86efac',   // Crisp highlighted grass trim
    accentColor: '#16a34a',
    fogColor: '#93c5fd',    // Sky blue natural distance mist
    mistColor: '#bfdbfe',
    ambientLight: '#ffffff',
    dirLight: '#fef08a',
    mechanicNote: 'Slopes, spring mushrooms, and rolling momentum.',
  },
  2: {
    id: 2,
    name: 'Dune Mirage',
    subtitle: 'Sinking Sands & Ancient Ruins',
    theme: 'desert',
    description: 'Traverse shifting desert sands, crumbling ruins, moving sandstone slabs, and patrolled cactus ridges.',
    skyColor: '#f59e0b',
    groundColor: '#f59e0b', // Sunlit golden sand dune cap
    cliffColor: '#9a3412',  // Terracotta & sandstone cliff sides
    edgeColor: '#fde68a',   // Bright sand rim
    accentColor: '#d97706',
    fogColor: '#fed7aa',    // Warm desert atmospheric haze
    mistColor: '#ffedd5',
    ambientLight: '#fff7ed',
    dirLight: '#fbbf24',
    mechanicNote: 'Moving sandstone blocks, sand pits, and collapsing slabs.',
  },
  3: {
    id: 3,
    name: 'Whispering Canopy',
    subtitle: 'Ancient Treetops & Swinging Beams',
    theme: 'forest',
    description: 'Ascend massive ancient redwoods, navigate swinging logs, and uncover secret leafy hollows high above.',
    skyColor: '#10b981',
    groundColor: '#15803d', // Deep lush mossy canopy top
    cliffColor: '#1c1917',  // Dark redwood bark & deep rock
    edgeColor: '#4ade80',   // Sunlit leafy rim
    accentColor: '#059669',
    fogColor: '#6ee7b7',    // Emerald forest canopy mist
    mistColor: '#a7f3d0',
    ambientLight: '#ecfdf5',
    dirLight: '#dcfce7',
    mechanicNote: 'Vertical climbing, swinging platforms, and hidden canopy paths.',
  },
  4: {
    id: 4,
    name: 'Glacier Peak',
    subtitle: 'Slippery Slopes & Freezing Gales',
    theme: 'snow',
    description: 'Master low-friction icy surfaces, drifting ice floes, howling wind currents, and treacherous mountain ledges.',
    skyColor: '#38bdf8',
    groundColor: '#f8fafc', // Pure snow blanket cap
    cliffColor: '#334155',  // Dark frozen slate cliff bedrock
    edgeColor: '#e0f2fe',   // Crystalline ice shimmer rim
    accentColor: '#0284c7',
    fogColor: '#bae6fd',    // Pale crystalline mountain mist
    mistColor: '#e0f2fe',
    ambientLight: '#f0f9ff',
    dirLight: '#e0e7ff',
    mechanicNote: 'Zero-friction ice drift, howling wind drafts, and ice platforms.',
  },
  5: {
    id: 5,
    name: 'Echo Chasm',
    subtitle: 'Luminescent Grotto & Stone Elevators',
    theme: 'cave',
    description: 'Delve into subterranean caverns with glowing crystals, pressure switches, opening gates, and stone elevators.',
    skyColor: '#1e1b4b',
    groundColor: '#475569', // Polished cave stone cap
    cliffColor: '#0f172a',  // Deep dark obsidian cavern rock
    edgeColor: '#a78bfa',   // Glowing violet crystal trim
    accentColor: '#818cf8',
    fogColor: '#1e1b4b',    // Deep mysterious grotto mist
    mistColor: '#312e81',
    ambientLight: '#818cf8',
    dirLight: '#c084fc',
    mechanicNote: 'Pressure switches, heavy security gates, and vertical elevators.',
  },
  6: {
    id: 6,
    name: 'Clockwork Foundry',
    subtitle: 'Industrial Gears & Fast Conveyors',
    theme: 'machinery',
    description: 'Conquer rapid conveyor belts, rotating gear platforms, timed crushing pistons, and steam-powered traps.',
    skyColor: '#475569',
    groundColor: '#64748b', // Galvanized steel plate floor
    cliffColor: '#1e293b',  // Dark heavy cast-iron chassis
    edgeColor: '#fb923c',   // Hazard warning amber trim
    accentColor: '#f97316',
    fogColor: '#475569',    // Factory steam & atmospheric haze
    mistColor: '#64748b',
    ambientLight: '#f8fafc',
    dirLight: '#fb923c',
    mechanicNote: 'Conveyor acceleration, rotating gears, and timed pistons.',
  },
  7: {
    id: 7,
    name: 'Obsidian Caldera',
    subtitle: 'Molten Magma & Scorching Geysers',
    theme: 'volcano',
    description: 'Leap across floating volcanic crusts above bubbling lava lakes with erupting fire plumes and crumbling basalt.',
    skyColor: '#7f1d1d',
    groundColor: '#292524', // Dark scorched volcanic crust
    cliffColor: '#450a0a',  // Burning red magma stone base
    edgeColor: '#ef4444',   // Molten heat crack rim
    accentColor: '#ef4444',
    fogColor: '#7f1d1d',    // Searing crimson volcanic smoke
    mistColor: '#991b1b',
    ambientLight: '#fee2e2',
    dirLight: '#f87171',
    mechanicNote: 'Lethal lava lakes, fire geysers, and rapid crumbling platforms.',
  },
  8: {
    id: 8,
    name: 'The Apex Citadel',
    subtitle: 'The Grand Master Challenge',
    theme: 'apex',
    description: 'The ultimate synthesis of every mechanic: ice, conveyors, moving platforms, switches, wind, and the Level 80 Finale.',
    skyColor: '#312e81',
    groundColor: '#4338ca', // Royal celestial citadel tile
    cliffColor: '#1e1b4b',  // Deep void abyss stone
    edgeColor: '#c084fc',   // Astral neon edge trim
    accentColor: '#a855f7',
    fogColor: '#312e81',    // Cosmic nebula mist
    mistColor: '#4c1d95',
    ambientLight: '#ede9fe',
    dirLight: '#c084fc',
    mechanicNote: 'Grand multi-phase gauntlets combining every world mechanic.',
  },
};
