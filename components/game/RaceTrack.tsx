'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Car, GameState, LightsState } from '@/types';
import { GAME_CONFIG } from '@/lib/constants';
import {
  initializeCars,
  calculateSpeed,
  startBotCars,
  updateCarPositions,
  isRaceFinished,
  getRaceResults,
  getLaneYPosition,
  getCarXPosition,
  drawCar,
  drawTrack,
} from '@/lib/gameLogic';
import { audioEngine } from '@/lib/audioEngine';
import StartLights from './StartLights';
import ResultsScreen from './ResultsScreen';

interface RaceTrackProps {
  playerName: string;
  playerCarNumber: number;
}

export default function RaceTrack({ playerName, playerCarNumber }: RaceTrackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const [gameState, setGameState] = useState<GameState>('ready');
  const [cars, setCars] = useState<Car[]>([]);
  const [lightsState, setLightsState] = useState<LightsState>({
    count: 0,
    allOut: false,
    falseStart: false,
  });
  const [lightsOutTimestamp, setLightsOutTimestamp] = useState<number>(0);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Initialize cars
  useEffect(() => {
    const initialCars = initializeCars(playerName, playerCarNumber);
    setCars(initialCars);
  }, [playerName, playerCarNumber]);

  // Initialize audio on component mount
  useEffect(() => {
    audioEngine.init();
  }, []);

  // Handle responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      const maxWidth = Math.min(window.innerWidth - 32, GAME_CONFIG.CANVAS_WIDTH);
      const scale = maxWidth / GAME_CONFIG.CANVAS_WIDTH;
      const height = GAME_CONFIG.CANVAS_HEIGHT * scale;

      setCanvasSize({
        width: maxWidth,
        height: height,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Start lights sequence
  const startLightsSequence = useCallback(() => {
    setGameState('countdown');
    let lightCount = 0;

    const lightInterval = setInterval(() => {
      lightCount++;
      setLightsState((prev) => ({ ...prev, count: lightCount }));
      audioEngine.playBeep();

      if (lightCount === 5) {
        clearInterval(lightInterval);

        // Random delay before lights out
        const randomDelay =
          GAME_CONFIG.MIN_RANDOM_DELAY +
          Math.random() * (GAME_CONFIG.MAX_RANDOM_DELAY - GAME_CONFIG.MIN_RANDOM_DELAY);

        setTimeout(() => {
          // Lights out!
          setLightsState({ count: 5, allOut: true, falseStart: false });
          setLightsOutTimestamp(Date.now());
          setGameState('racing');
          audioEngine.playEngineStart();
          audioEngine.vibrate(50);
        }, randomDelay);
      }
    }, GAME_CONFIG.LIGHT_INTERVAL);
  }, []);

  // Handle touch events
  useEffect(() => {
    const handleTouchEnd = (e: TouchEvent) => {
      // Only prevent default for canvas touches, not button clicks
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') {
        return; // Let button clicks work normally
      }

      e.preventDefault();

      if (gameState === 'ready') {
        // Start the lights sequence
        startLightsSequence();
      } else if (gameState === 'countdown') {
        // False start - released too early
        if (!lightsState.allOut) {
          setLightsState((prev) => ({ ...prev, falseStart: true }));
          setGameState('finished');
          audioEngine.vibrate(100);

          // Set player car with penalty
          setCars((prevCars) =>
            prevCars.map((car) =>
              car.isPlayer
                ? { ...car, reactionTime: 999, speed: 0 }
                : car
            )
          );
        }
      } else if (gameState === 'racing' && lightsState.allOut) {
        // Valid start - release after lights out
        const releaseTime = Date.now();
        const reactionTime = releaseTime - lightsOutTimestamp;

        setCars((prevCars) =>
          prevCars.map((car) =>
            car.isPlayer
              ? {
                  ...car,
                  reactionTime,
                  speed: calculateSpeed(reactionTime),
                }
              : car
          )
        );
      }
    };

    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, lightsState, lightsOutTimestamp, startLightsSequence]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'racing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // Update bot cars
      setCars((prevCars) => {
        const updatedCars = startBotCars(prevCars, lightsOutTimestamp, Date.now());
        const movedCars = updateCarPositions(updatedCars);

        // Check if race is finished
        if (isRaceFinished(movedCars)) {
          setGameState('finished');
        }

        return movedCars;
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, lightsOutTimestamp]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw track
    drawTrack(ctx, canvasSize.width, canvasSize.height);

    // Draw cars
    cars.forEach((car, index) => {
      const x = getCarXPosition(car.position, canvasSize.width);
      const y = getLaneYPosition(index, canvasSize.height);
      drawCar(ctx, car, x, y);
    });
  }, [cars, canvasSize]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black">
      {/* Start Lights */}
      {gameState === 'countdown' && (
        <StartLights lightsState={lightsState} canvasWidth={canvasSize.width} />
      )}

      {/* Race Track Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border-2 border-f1-gray rounded-lg"
        />

        {/* Status Text */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center z-20">
          {gameState === 'ready' && (
            <p className="text-2xl font-bold text-f1-neon neon-glow pulse-animation">
              TOUCH TO START
            </p>
          )}
          {gameState === 'countdown' && !lightsState.allOut && (
            <p className="text-xl text-gray-400 mt-24">
              Keep your thumb pressed...
            </p>
          )}
          {gameState === 'racing' && lightsState.allOut && (
            <p className="text-3xl font-bold text-f1-neon neon-glow mt-24">
              GO! GO! GO!
            </p>
          )}
          {lightsState.falseStart && (
            <div className="bg-f1-red/90 text-white px-6 py-3 rounded-lg mt-24">
              <p className="text-2xl font-bold">FALSE START!</p>
              <p className="text-sm">You released too early</p>
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
          <p className="text-sm text-gray-400">Driver</p>
          <p className="font-bold text-f1-red">
            #{playerCarNumber} {playerName}
          </p>
        </div>
      </div>

      {/* Results Screen */}
      {gameState === 'finished' && (
        <ResultsScreen results={getRaceResults(cars)} />
      )}
    </div>
  );
}
