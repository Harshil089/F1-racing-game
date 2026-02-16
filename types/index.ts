// User data interface
export interface UserData {
  name: string;
  phone: string;
  carNumber: number;
  timestamp?: string;
}

// Car interface for race
export interface Car {
  id: number;
  name: string;
  carNumber: number;
  color: string;
  position: number;
  speed: number;
  reactionTime: number;
  isPlayer: boolean;
}

// Game state types
export type GameState =
  | 'waiting'      // Waiting for thumb press
  | 'ready'        // Thumb pressed, ready to start
  | 'countdown'    // Start lights sequence
  | 'racing'       // Race in progress
  | 'finished';    // Race completed

// Start lights state
export interface LightsState {
  count: number;      // Number of lights currently on (0-5)
  allOut: boolean;    // Whether all lights are off (race start)
  falseStart: boolean; // Whether player released too early
}

// Race result interface
export interface RaceResult {
  car: Car;
  position: number;
  finishTime: number;
}

// Game configuration constants
export interface GameConfig {
  LIGHT_INTERVAL: number;
  MIN_RANDOM_DELAY: number;
  MAX_RANDOM_DELAY: number;
  RACE_DISTANCE: number;
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  LANE_COUNT: number;
  CAR_WIDTH: number;
  CAR_HEIGHT: number;
  BASE_SPEED: number;
}

// Bot driver configuration
export interface BotDriver {
  name: string;
  carNumber: number;
  color: string;
  minReactionTime: number;
  maxReactionTime: number;
}
