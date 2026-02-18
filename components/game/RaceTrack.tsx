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
  getRaceResults,
  getLaneXPosition,
  getCarYPosition,
  drawTrack,
} from '@/lib/gameLogic';
import { audioEngine } from '@/lib/audioEngine';
import StartLights from './StartLights';
import ResultsScreen from './ResultsScreen';
import F1Car from './F1Car';

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
  const [deviceType, setDeviceType] = useState<'mobile' | 'laptop'>('mobile');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Refs to track timeouts and intervals for cleanup
  const lightIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lightsOutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaderboardTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerReleasedRef = useRef(false);

  // Load device type from localStorage
  useEffect(() => {
    const storedDeviceType = localStorage.getItem('deviceType') as 'mobile' | 'laptop' | null;
    if (storedDeviceType) {
      setDeviceType(storedDeviceType);
    }
  }, []);

  // Initialize cars
  useEffect(() => {
    const initialCars = initializeCars(playerName, playerCarNumber);
    setCars(initialCars);
  }, [playerName, playerCarNumber]);

  // Initialize audio on component mount
  useEffect(() => {
    audioEngine.init();
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (lightIntervalRef.current) {
        clearInterval(lightIntervalRef.current);
      }
      if (lightsOutTimeoutRef.current) {
        clearTimeout(lightsOutTimeoutRef.current);
      }
      if (leaderboardTimeoutRef.current) {
        clearTimeout(leaderboardTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
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
        lightIntervalRef.current = null;

        // Random delay before lights out
        const randomDelay =
          GAME_CONFIG.MIN_RANDOM_DELAY +
          Math.random() * (GAME_CONFIG.MAX_RANDOM_DELAY - GAME_CONFIG.MIN_RANDOM_DELAY);

        const lightsOutTimeout = setTimeout(() => {
          // Check if false start already occurred
          setLightsState((prev) => {
            if (prev.falseStart) {
              // Don't transition to racing if false start already detected
              return prev;
            }
            return { count: 5, allOut: true, falseStart: false };
          });

          setGameState((prevState) => {
            // Only transition to racing if not already finished (false start)
            if (prevState === 'finished') {
              return prevState;
            }
            setLightsOutTimestamp(Date.now());
            audioEngine.playEngineStart();
            audioEngine.vibrate(50);
            return 'racing';
          });
        }, randomDelay);

        lightsOutTimeoutRef.current = lightsOutTimeout;
      }
    }, GAME_CONFIG.LIGHT_INTERVAL);

    lightIntervalRef.current = lightInterval;
  }, []);

  // Handle touch events (for mobile)
  // touchstart begins the countdown, touchend registers release (reaction or false start)
  useEffect(() => {
    if (deviceType !== 'mobile') return;

    // Don't attach touch handlers when game is finished — allow normal scrolling
    if (gameState === 'finished') return;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') return;

      e.preventDefault();

      if (gameState === 'ready') {
        // Single touch starts the lights sequence immediately
        startLightsSequence();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') return;

      e.preventDefault();

      if (gameState === 'countdown') {
        // False start - released too early
        if (!lightsState.allOut) {
          // Clear any pending timeouts to prevent lights out transition
          if (lightsOutTimeoutRef.current) {
            clearTimeout(lightsOutTimeoutRef.current);
            lightsOutTimeoutRef.current = null;
          }
          if (lightIntervalRef.current) {
            clearInterval(lightIntervalRef.current);
            lightIntervalRef.current = null;
          }

          // Cancel any scheduled animation frames
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = undefined;
          }

          // Set false start state
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
      } else if (gameState === 'racing' && lightsState.allOut && !playerReleasedRef.current) {
        // Valid start - release after lights out (only process once)
        playerReleasedRef.current = true;

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

        // Show leaderboard 1 second after release (game keeps running in background)
        if (leaderboardTimeoutRef.current) {
          clearTimeout(leaderboardTimeoutRef.current);
        }
        leaderboardTimeoutRef.current = setTimeout(() => {
          setShowLeaderboard(true);
        }, 1000);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, lightsState, lightsOutTimestamp, startLightsSequence, deviceType]);

  // Handle keyboard events (for laptop)
  useEffect(() => {
    if (deviceType !== 'laptop') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond to spacebar
      if (e.code !== 'Space') return;

      e.preventDefault();

      if (gameState === 'ready') {
        // Start the lights sequence
        startLightsSequence();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Only respond to spacebar
      if (e.code !== 'Space') return;

      e.preventDefault();

      if (gameState === 'countdown') {
        // False start - released too early
        if (!lightsState.allOut) {
          // Clear any pending timeouts to prevent lights out transition
          if (lightsOutTimeoutRef.current) {
            clearTimeout(lightsOutTimeoutRef.current);
            lightsOutTimeoutRef.current = null;
          }
          if (lightIntervalRef.current) {
            clearInterval(lightIntervalRef.current);
            lightIntervalRef.current = null;
          }

          // Cancel any scheduled animation frames
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = undefined;
          }

          // Set false start state
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
      } else if (gameState === 'racing' && lightsState.allOut && !playerReleasedRef.current) {
        // Valid start - release after lights out (only process once)
        playerReleasedRef.current = true;

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

        // Show leaderboard 1 second after release (game keeps running in background)
        if (leaderboardTimeoutRef.current) {
          clearTimeout(leaderboardTimeoutRef.current);
        }
        leaderboardTimeoutRef.current = setTimeout(() => {
          setShowLeaderboard(true);
        }, 1000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, lightsState, lightsOutTimestamp, startLightsSequence, deviceType]);

  // Game loop
  useEffect(() => {
    // Only run game loop if racing and no false start
    if (gameState !== 'racing' || lightsState.falseStart) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // Double-check state hasn't changed to false start
      setLightsState((currentLightsState) => {
        if (currentLightsState.falseStart) {
          // Stop the game loop
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = undefined;
          }
          return currentLightsState;
        }

        // Update bot cars
        setCars((prevCars) => {
          const updatedCars = startBotCars(prevCars, lightsOutTimestamp, Date.now());
          const movedCars = updateCarPositions(updatedCars);


          return movedCars;
        });

        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return currentLightsState;
      });
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, lightsState.falseStart, lightsOutTimestamp]);

  // Render canvas (track only)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw track
    drawTrack(ctx, canvasSize.width, canvasSize.height);
  }, [canvasSize]);

  return (
    <div className={`relative w-full min-h-screen py-8 flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-white ${(gameState === 'countdown' || gameState === 'racing') ? 'touch-action-none overflow-hidden h-screen' : ''
      }`}
      style={{ touchAction: (gameState === 'countdown' || gameState === 'racing') ? 'none' : 'auto' }}
    >
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
          className="border-4 border-google-blue/20 rounded-2xl google-shadow-lg bg-white"
        />

        {/* F1 Cars - Rendered as React Components */}
        {cars.map((car, index) => {
          const x = getLaneXPosition(index, canvasSize.width);
          const y = getCarYPosition(car.position, canvasSize.height);
          const scale = 0.15; // Scale down the detailed car to fit

          return (
            <div
              key={car.id}
              className="absolute pointer-events-none"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'rotate(90deg)', // Rotate car to point downward for vertical racing
                transformOrigin: 'center center',
              }}
            >
              <F1Car color={car.color} scale={scale} />
              {/* Car number label */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-xs bg-black/50 rounded-full w-6 h-6 flex items-center justify-center"
                style={{ transform: 'translate(-50%, -50%) rotate(-90deg)' }}
              >
                {car.carNumber}
              </div>
            </div>
          );
        })}

        {/* Status Text - Google themed */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center z-20">
          {gameState === 'ready' && (
            <div className="bg-white/95 px-6 py-3 rounded-full google-shadow-lg">
              <p className="text-2xl font-bold text-google-blue animate-pulse">
                {deviceType === 'mobile' ? '👆 TOUCH & HOLD TO START' : '⌨️ PRESS SPACEBAR TO START'}
              </p>
            </div>
          )}
          {gameState === 'countdown' && !lightsState.allOut && (
            <div className="bg-white/95 px-6 py-3 rounded-full google-shadow mt-24">
              <p className="text-lg text-google-grey">
                {deviceType === 'mobile' ? '🤚 Keep your thumb pressed...' : '⌨️ Keep spacebar pressed...'}
              </p>
            </div>
          )}
          {gameState === 'racing' && lightsState.allOut && (
            <div className="bg-google-green/95 px-8 py-4 rounded-full google-shadow-lg mt-24">
              <p className="text-3xl font-bold text-white">
                🏁 GO! GO! GO!
              </p>
            </div>
          )}
        </div>

        {/* Player Info - Google Card Style */}
        <div className="absolute bottom-4 left-4 bg-white px-4 py-3 rounded-xl google-shadow">
          <p className="text-xs text-gray-500 font-medium">DRIVER</p>
          <p className="font-bold text-google-blue flex items-center gap-1">
            <span className="text-google-red">#{playerCarNumber}</span>
            <span className="text-google-grey">{playerName}</span>
          </p>
        </div>

        {/* Device Type Indicator */}
        <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-xl google-shadow">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            {deviceType === 'mobile' ? '📱 Mobile' : '💻 Laptop'}
          </p>
        </div>
      </div>

      {/* False Start Screen */}
      {gameState === 'finished' && lightsState.falseStart && (
        <FalseStartScreen />
      )}

      {/* Results Screen - shown 1 second after thumb/spacebar release */}
      {showLeaderboard && !lightsState.falseStart && (
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
  const [deviceType, setDeviceTypeLocal] = useState<'mobile' | 'laptop'>('mobile');

  useEffect(() => {
    const storedDeviceType = localStorage.getItem('deviceType') as 'mobile' | 'laptop' | null;
    if (storedDeviceType) {
      setDeviceTypeLocal(storedDeviceType);
    }
  }, []);

  const handleRaceAgain = () => {
    window.location.reload();
  };

  const handleNewPlayer = () => {
    localStorage.removeItem('playerData');
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white/98 backdrop-blur-sm fade-in leaderboard-scroll">
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="w-full max-w-2xl my-auto">
          {/* Google-style card */}
          <div className="bg-white rounded-3xl p-8 google-shadow-lg text-center">
            {/* False Start Icon */}
            <div className="text-8xl mb-6">🚫</div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-5xl font-bold mb-4 text-google-red">
                FALSE START!
              </h2>
              <p className="text-xl text-google-grey mb-2">
                {deviceType === 'mobile'
                  ? 'You released your thumb too early'
                  : 'You released the spacebar too early'}
              </p>
              <p className="text-base text-gray-500">
                Wait for all lights to go out before releasing
              </p>
            </div>

            {/* Penalty Notice - Google Alert Style */}
            <div className="google-alert-error mb-8">
              <p className="text-lg font-bold text-google-red mb-2">⚠️ PENALTY</p>
              <p className="text-google-grey">
                In Formula 1, a false start results in a time penalty or disqualification.
              </p>
            </div>

            {/* Action Buttons - Google Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleRaceAgain}
                className="google-btn-primary py-4 text-lg"
              >
                🔄 TRY AGAIN
              </button>
              <button
                onClick={handleNewPlayer}
                className="google-btn-secondary py-4 text-lg"
              >
                👤 NEW PLAYER
              </button>
            </div>

            {/* Tip - Google Info Style */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-google-grey">
                💡 <strong>Tip:</strong> {deviceType === 'mobile'
                  ? 'Keep your finger pressed until you see the "GO! GO! GO!" message'
                  : 'Keep the spacebar pressed until you see the "GO! GO! GO!" message'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
