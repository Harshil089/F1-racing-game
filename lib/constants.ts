import { GameConfig, BotDriver } from '@/types';

// Game configuration constants
export const GAME_CONFIG: GameConfig = {
  LIGHT_INTERVAL: 1000,        // 1 second between each light
  MIN_RANDOM_DELAY: 1000,      // Minimum random delay before lights out
  MAX_RANDOM_DELAY: 3000,      // Maximum random delay before lights out
  RACE_DISTANCE: 600,          // Distance to finish line in pixels
  CANVAS_WIDTH: 800,           // Base canvas width
  CANVAS_HEIGHT: 600,          // Base canvas height
  LANE_COUNT: 6,               // Total number of lanes (1 player + 5 bots)
  CAR_WIDTH: 60,               // Car width in pixels
  CAR_HEIGHT: 30,              // Car height in pixels
  BASE_SPEED: 2,               // Base movement speed
};

// F1-themed bot drivers (fictional names)
export const BOT_DRIVERS: BotDriver[] = [
  {
    name: 'Rossi',
    carNumber: 44,
    color: '#3B82F6', // Blue
    minReactionTime: 150,
    maxReactionTime: 300,
  },
  {
    name: 'Martinez',
    carNumber: 7,
    color: '#10B981', // Green
    minReactionTime: 180,
    maxReactionTime: 350,
  },
  {
    name: 'Chen',
    carNumber: 11,
    color: '#F59E0B', // Yellow
    minReactionTime: 160,
    maxReactionTime: 320,
  },
  {
    name: 'Mueller',
    carNumber: 16,
    color: '#F97316', // Orange
    minReactionTime: 170,
    maxReactionTime: 340,
  },
  {
    name: 'Silva',
    carNumber: 23,
    color: '#6B7280', // Gray
    minReactionTime: 190,
    maxReactionTime: 380,
  },
];

// Color scheme
export const COLORS = {
  background: '#000000',
  primary: '#DC0000',    // Ferrari red
  neon: '#00FF41',       // Neon green accent
  text: '#FFFFFF',
  secondary: '#333333',
  asphalt: '#1A1A1A',
};

// Start lights configuration
export const START_LIGHTS = {
  COUNT: 5,
  RADIUS: 20,
  SPACING: 60,
  COLOR_ON: '#DC0000',
  COLOR_OFF: '#333333',
  GLOW_BLUR: 20,
};
