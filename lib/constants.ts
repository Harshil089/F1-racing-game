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

// F1-themed bot drivers (fictional names) - Google Colors
export const BOT_DRIVERS: BotDriver[] = [
  {
    name: 'Rossi',
    carNumber: 44,
    color: '#4285F4', // Google Blue
    minReactionTime: 150,
    maxReactionTime: 300,
  },
  {
    name: 'Martinez',
    carNumber: 7,
    color: '#34A853', // Google Green
    minReactionTime: 180,
    maxReactionTime: 350,
  },
  {
    name: 'Chen',
    carNumber: 11,
    color: '#FBBC05', // Google Yellow
    minReactionTime: 160,
    maxReactionTime: 320,
  },
  {
    name: 'Mueller',
    carNumber: 16,
    color: '#EA4335', // Google Red
    minReactionTime: 170,
    maxReactionTime: 340,
  },
  {
    name: 'Silva',
    carNumber: 23,
    color: '#3C4043', // Google Grey
    minReactionTime: 190,
    maxReactionTime: 380,
  },
];

// Color scheme - Google Brand Colors
export const COLORS = {
  background: '#FFFFFF',
  primary: '#4285F4',    // Google Blue
  success: '#34A853',    // Google Green
  warning: '#FBBC05',    // Google Yellow
  danger: '#EA4335',     // Google Red
  text: '#3C4043',       // Google Grey
  secondary: '#F1F3F4',
  asphalt: '#E8EAED',
};

// Start lights configuration - Google Colors
export const START_LIGHTS = {
  COUNT: 5,
  RADIUS: 20,
  SPACING: 60,
  COLOR_ON: '#EA4335',   // Google Red
  COLOR_OFF: '#E8EAED',  // Light grey
  GLOW_BLUR: 15,
};
