import { GameConfig, BotDriver } from '@/types';

// Game configuration constants
export const GAME_CONFIG: GameConfig = {
  LIGHT_INTERVAL: 1000,        // 1 second between each light
  MIN_RANDOM_DELAY: 1000,      // Minimum random delay before lights out
  MAX_RANDOM_DELAY: 3000,      // Maximum random delay before lights out
  RACE_DISTANCE: 600,          // Distance to finish line in pixels
  CANVAS_WIDTH: 400,           // Base canvas width (vertical layout - narrower for single car)
  CANVAS_HEIGHT: 800,          // Base canvas height (vertical layout - taller)
  LANE_COUNT: 1,               // Total number of lanes (1 player only)
  CAR_WIDTH: 60,               // Car width in pixels (for detailed F1 car)
  CAR_HEIGHT: 30,              // Car height in pixels (for detailed F1 car)
  BASE_SPEED: 2,               // Base movement speed
};

// F1-themed bot drivers (fictional names) - Google Colors
// Removed: Single player mode only
export const BOT_DRIVERS: BotDriver[] = [];

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
