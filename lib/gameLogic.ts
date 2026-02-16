import { Car, RaceResult } from '@/types';
import { BOT_DRIVERS, GAME_CONFIG } from './constants';

/**
 * Initialize all cars (1 player + 5 bots)
 */
export function initializeCars(playerName: string, playerCarNumber: number): Car[] {
  const cars: Car[] = [];

  // Player car
  cars.push({
    id: 0,
    name: playerName,
    carNumber: playerCarNumber,
    color: '#DC0000', // F1 red
    position: 0,
    speed: 0,
    reactionTime: 0,
    isPlayer: true,
  });

  // Bot cars
  BOT_DRIVERS.forEach((bot, index) => {
    cars.push({
      id: index + 1,
      name: bot.name,
      carNumber: bot.carNumber,
      color: bot.color,
      position: 0,
      speed: 0,
      reactionTime: 0,
      isPlayer: false,
    });
  });

  return cars;
}

/**
 * Calculate random reaction time for a bot
 */
export function generateBotReactionTime(botIndex: number): number {
  const bot = BOT_DRIVERS[botIndex];
  const min = bot.minReactionTime;
  const max = bot.maxReactionTime;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate speed based on reaction time
 * Better reaction time = faster initial speed
 */
export function calculateSpeed(reactionTime: number): number {
  // Formula: speedMultiplier = 1 + (400 - reactionTime) / 1000
  // Example: 200ms reaction = 1.2x speed, 300ms = 1.1x speed
  const speedMultiplier = 1 + Math.max(0, (400 - reactionTime) / 1000);

  // Add slight randomness (±5%) for variety
  const randomFactor = 0.95 + Math.random() * 0.1;

  return GAME_CONFIG.BASE_SPEED * speedMultiplier * randomFactor;
}

/**
 * Start bot cars with their simulated reaction times
 * Bots start after their reaction delay
 */
export function startBotCars(
  cars: Car[],
  lightsOutTimestamp: number,
  currentTime: number
): Car[] {
  return cars.map((car) => {
    if (car.isPlayer) return car;

    // Check if this bot should start moving yet
    const botDelay = car.reactionTime || generateBotReactionTime(car.id - 1);
    const botStartTime = lightsOutTimestamp + botDelay;

    if (currentTime >= botStartTime && car.speed === 0) {
      // Bot is starting now
      return {
        ...car,
        reactionTime: botDelay,
        speed: calculateSpeed(botDelay),
      };
    }

    return car;
  });
}

/**
 * Update car positions based on their speeds
 */
export function updateCarPositions(cars: Car[]): Car[] {
  return cars.map((car) => ({
    ...car,
    position: Math.min(car.position + car.speed, GAME_CONFIG.RACE_DISTANCE),
  }));
}

/**
 * Check if race is finished (all cars crossed finish line)
 */
export function isRaceFinished(cars: Car[]): boolean {
  return cars.every((car) => car.position >= GAME_CONFIG.RACE_DISTANCE);
}

/**
 * Get race results sorted by finish position
 */
export function getRaceResults(cars: Car[]): RaceResult[] {
  // Sort by position (descending) and assign positions
  const sortedCars = [...cars].sort((a, b) => b.position - a.position);

  return sortedCars.map((car, index) => ({
    car,
    position: index + 1,
    finishTime: car.reactionTime, // Simplified - could add actual finish time
  }));
}

/**
 * Get player position in the race
 */
export function getPlayerPosition(cars: Car[]): number {
  const results = getRaceResults(cars);
  const playerResult = results.find((result) => result.car.isPlayer);
  return playerResult?.position || 0;
}

/**
 * Calculate lane Y position for a car
 */
export function getLaneYPosition(carIndex: number, canvasHeight: number): number {
  const laneHeight = canvasHeight / GAME_CONFIG.LANE_COUNT;
  return carIndex * laneHeight + laneHeight / 2 - GAME_CONFIG.CAR_HEIGHT / 2;
}

/**
 * Calculate car X position based on progress
 */
export function getCarXPosition(position: number, canvasWidth: number): number {
  const startX = 50; // Start line offset
  const finishX = canvasWidth - 100; // Finish line position
  const trackLength = finishX - startX;

  const progress = position / GAME_CONFIG.RACE_DISTANCE;
  return startX + progress * trackLength;
}

/**
 * Draw a car on canvas
 */
export function drawCar(
  ctx: CanvasRenderingContext2D,
  car: Car,
  x: number,
  y: number
) {
  // Draw car body (rounded rectangle)
  ctx.fillStyle = car.color;
  ctx.beginPath();
  ctx.roundRect(x, y, GAME_CONFIG.CAR_WIDTH, GAME_CONFIG.CAR_HEIGHT, 5);
  ctx.fill();

  // Draw car outline
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw car number
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    car.carNumber.toString(),
    x + GAME_CONFIG.CAR_WIDTH / 2,
    y + GAME_CONFIG.CAR_HEIGHT / 2
  );
}

/**
 * Draw track with lanes
 */
export function drawTrack(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Background (asphalt)
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(0, 0, width, height);

  // Lane dividers
  const laneHeight = height / GAME_CONFIG.LANE_COUNT;
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  ctx.setLineDash([10, 10]);

  for (let i = 1; i < GAME_CONFIG.LANE_COUNT; i++) {
    const y = i * laneHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.setLineDash([]);

  // Start line
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(50, 0);
  ctx.lineTo(50, height);
  ctx.stroke();

  // Finish line (checkered pattern simulation)
  const finishX = width - 100;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(finishX, 0);
  ctx.lineTo(finishX, height);
  ctx.stroke();
}
