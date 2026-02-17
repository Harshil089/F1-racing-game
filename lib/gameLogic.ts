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
 * Also track finish times when cars cross the finish line
 */
export function updateCarPositions(cars: Car[]): Car[] {
  const currentTime = Date.now();

  return cars.map((car) => {
    const newPosition = Math.min(car.position + car.speed, GAME_CONFIG.RACE_DISTANCE);

    // If car just crossed finish line, record finish time
    if (newPosition >= GAME_CONFIG.RACE_DISTANCE && car.position < GAME_CONFIG.RACE_DISTANCE) {
      return {
        ...car,
        position: newPosition,
        finishTime: currentTime,
      };
    }

    return {
      ...car,
      position: newPosition,
    };
  });
}

/**
 * Check if race is finished (all cars crossed finish line)
 */
export function isRaceFinished(cars: Car[]): boolean {
  return cars.every((car) => car.position >= GAME_CONFIG.RACE_DISTANCE);
}

/**
 * Get race results sorted by finish position
 * Cars are ranked by who crossed the finish line first (earliest finishTime)
 */
export function getRaceResults(cars: Car[]): RaceResult[] {
  // Sort by finish time (ascending - earliest finish wins)
  // Cars without finish time go to the end
  const sortedCars = [...cars].sort((a, b) => {
    // If both have finish times, sort by time (earliest first)
    if (a.finishTime && b.finishTime) {
      return a.finishTime - b.finishTime;
    }
    // If only a has finish time, a wins
    if (a.finishTime) return -1;
    // If only b has finish time, b wins
    if (b.finishTime) return 1;
    // If neither has finish time, sort by current position
    return b.position - a.position;
  });

  return sortedCars.map((car, index) => ({
    car,
    position: index + 1,
    finishTime: car.finishTime || 0,
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
 * Calculate lane X position for a car (vertical layout - cars in horizontal lanes)
 */
export function getLaneXPosition(carIndex: number, canvasWidth: number): number {
  const laneWidth = canvasWidth / GAME_CONFIG.LANE_COUNT;
  return carIndex * laneWidth + laneWidth / 2 - GAME_CONFIG.CAR_WIDTH / 2;
}

/**
 * Calculate car Y position based on progress (vertical layout - moving top to bottom)
 */
export function getCarYPosition(position: number, canvasHeight: number): number {
  const startY = 50; // Start line offset
  const finishY = canvasHeight - 100; // Finish line position
  const trackLength = finishY - startY;

  const progress = position / GAME_CONFIG.RACE_DISTANCE;
  return startY + progress * trackLength;
}

/**
 * Draw a car on canvas with F1 styling
 */
export function drawCar(
  ctx: CanvasRenderingContext2D,
  car: Car,
  x: number,
  y: number
) {
  const width = GAME_CONFIG.CAR_WIDTH;
  const height = GAME_CONFIG.CAR_HEIGHT;

  ctx.save();

  // Main car body (tapered shape)
  ctx.fillStyle = car.color;
  ctx.beginPath();

  // Front nose (pointed)
  ctx.moveTo(x + width, y + height / 2);

  // Top side
  ctx.lineTo(x + width * 0.7, y + height * 0.3);
  ctx.lineTo(x + width * 0.4, y + height * 0.25);

  // Cockpit area
  ctx.lineTo(x + width * 0.3, y + height * 0.25);
  ctx.lineTo(x + width * 0.2, y + height * 0.3);

  // Rear wing mount
  ctx.lineTo(x, y + height * 0.35);
  ctx.lineTo(x, y + height * 0.65);

  // Bottom side (mirror of top)
  ctx.lineTo(x + width * 0.2, y + height * 0.7);
  ctx.lineTo(x + width * 0.3, y + height * 0.75);
  ctx.lineTo(x + width * 0.4, y + height * 0.75);
  ctx.lineTo(x + width * 0.7, y + height * 0.7);

  // Close at nose
  ctx.lineTo(x + width, y + height / 2);
  ctx.fill();

  // Add darker shade for depth
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.moveTo(x + width, y + height / 2);
  ctx.lineTo(x + width * 0.7, y + height * 0.7);
  ctx.lineTo(x + width * 0.4, y + height * 0.75);
  ctx.lineTo(x + width * 0.4, y + height * 0.5);
  ctx.fill();

  // Cockpit (darker area)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.ellipse(
    x + width * 0.25,
    y + height / 2,
    width * 0.08,
    height * 0.15,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Front wing
  ctx.strokeStyle = car.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + width * 0.95, y + height * 0.2);
  ctx.lineTo(x + width, y + height * 0.2);
  ctx.moveTo(x + width * 0.95, y + height * 0.8);
  ctx.lineTo(x + width, y + height * 0.8);
  ctx.stroke();

  // Rear wing
  ctx.fillStyle = car.color;
  ctx.fillRect(x - 5, y + height * 0.3, 5, height * 0.4);
  ctx.fillRect(x - 8, y + height * 0.25, 8, 3);

  // Wheels (simple circles)
  ctx.fillStyle = '#1A1A1A';
  // Front wheel
  ctx.beginPath();
  ctx.arc(x + width * 0.75, y + height * 0.2, 4, 0, Math.PI * 2);
  ctx.arc(x + width * 0.75, y + height * 0.8, 4, 0, Math.PI * 2);
  ctx.fill();

  // Rear wheel
  ctx.beginPath();
  ctx.arc(x + width * 0.15, y + height * 0.2, 4, 0, Math.PI * 2);
  ctx.arc(x + width * 0.15, y + height * 0.8, 4, 0, Math.PI * 2);
  ctx.fill();

  // Car number on body
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    car.carNumber.toString(),
    x + width * 0.5,
    y + height / 2
  );

  // Outline for definition
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + width, y + height / 2);
  ctx.lineTo(x + width * 0.7, y + height * 0.3);
  ctx.lineTo(x + width * 0.4, y + height * 0.25);
  ctx.lineTo(x + width * 0.3, y + height * 0.25);
  ctx.lineTo(x + width * 0.2, y + height * 0.3);
  ctx.lineTo(x, y + height * 0.35);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw track with lanes (vertical layout)
 */
export function drawTrack(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Background (asphalt)
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(0, 0, width, height);

  // Lane dividers (vertical lines for horizontal lanes)
  const laneWidth = width / GAME_CONFIG.LANE_COUNT;
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  ctx.setLineDash([10, 10]);

  for (let i = 1; i < GAME_CONFIG.LANE_COUNT; i++) {
    const x = i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  ctx.setLineDash([]);

  // Start line (horizontal line at top)
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 50);
  ctx.lineTo(width, 50);
  ctx.stroke();

  // Finish line (checkered pattern simulation - horizontal line at bottom)
  const finishY = height - 100;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, finishY);
  ctx.lineTo(width, finishY);
  ctx.stroke();
}
