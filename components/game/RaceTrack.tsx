'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
        </div>

        {/* Player Info */}
        <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
          <p className="text-sm text-gray-400">Driver</p>
          <p className="font-bold text-f1-red">
            #{playerCarNumber} {playerName}
          </p>
        </div>
      </div>

      {/* False Start Screen */}
      {gameState === 'finished' && lightsState.falseStart && (
        <FalseStartScreen />
      )}

      {/* Results Screen (only for normal finish) */}
      {gameState === 'finished' && !lightsState.falseStart && (
        <ResultsScreen results={getRaceResults(cars)} />
      )}
    </div>
  );
}

/**
 * False Start Screen Component
 */
function FalseStartScreen() {
  const router = useRouter();

  const handleRaceAgain = () => {
    window.location.reload();
  };

  const handleNewPlayer = () => {
    localStorage.removeItem('playerData');
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 fade-in">
      <div className="w-full max-w-2xl px-6 py-8 text-center">
        {/* False Start Icon */}
        <div className="text-8xl mb-6">🚫</div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-6xl font-bold mb-4 text-f1-red neon-glow-red">
            FALSE START!
          </h2>
          <p className="text-2xl text-gray-300 mb-2">
            You released your thumb too early
          </p>
          <p className="text-lg text-gray-500">
            Wait for all lights to go out before releasing
          </p>
        </div>

        {/* Penalty Notice */}
        <div className="bg-f1-red/20 border-2 border-f1-red rounded-lg p-6 mb-8">
          <p className="text-xl font-bold text-f1-red mb-2">⚠️ PENALTY</p>
          <p className="text-gray-300">
            In Formula 1, a false start results in a time penalty or disqualification.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleRaceAgain}
            className="py-4 bg-f1-red text-white font-bold rounded-lg hover:bg-red-600 transition-colors text-lg"
          >
            🏁 TRY AGAIN
          </button>
          <button
            onClick={handleNewPlayer}
            className="py-4 bg-f1-gray text-white font-bold rounded-lg hover:bg-gray-700 transition-colors border-2 border-f1-gray text-lg"
          >
            👤 NEW PLAYER
          </button>
        </div>

        {/* Tip */}
        <div className="mt-6 text-sm text-gray-500">
          💡 Tip: Keep your finger pressed until you see the "GO! GO! GO!" message
        </div>
      </div>
    </div>
  );
}
