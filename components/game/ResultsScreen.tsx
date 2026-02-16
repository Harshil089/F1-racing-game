'use client';

import { useEffect, useState } from 'react';
import { RaceResult } from '@/types';
import { useRouter } from 'next/navigation';

interface ResultsScreenProps {
  results: RaceResult[];
}

export default function ResultsScreen({ results }: ResultsScreenProps) {
  const router = useRouter();
  const [bestTime, setBestTime] = useState<number | null>(null);

  const playerResult = results.find((r) => r.car.isPlayer);
  const playerPosition = playerResult?.position || 0;
  const playerReactionTime = playerResult?.car.reactionTime || 0;

  useEffect(() => {
    // Load best time from localStorage
    const stored = localStorage.getItem('bestReactionTime');
    if (stored) {
      const prevBest = parseInt(stored, 10);
      setBestTime(prevBest);

      // Update if this is better
      if (playerReactionTime > 0 && playerReactionTime < prevBest) {
        localStorage.setItem('bestReactionTime', playerReactionTime.toString());
        setBestTime(playerReactionTime);
      }
    } else if (playerReactionTime > 0) {
      // First time
      localStorage.setItem('bestReactionTime', playerReactionTime.toString());
      setBestTime(playerReactionTime);
    }
  }, [playerReactionTime]);

  const handleRaceAgain = () => {
    window.location.reload();
  };

  const handleNewPlayer = () => {
    localStorage.removeItem('playerData');
    router.push('/');
  };

  const getPositionEmoji = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🏁';
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-300';
      case 3:
        return 'text-orange-400';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 fade-in">
      <div className="w-full max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{getPositionEmoji(playerPosition)}</div>
          <h2 className="text-5xl font-bold mb-2 neon-glow-red">
            {playerPosition === 1 ? 'VICTORY!' : playerPosition <= 3 ? 'PODIUM!' : 'RACE COMPLETE'}
          </h2>
          <p className={`text-3xl font-bold ${getPositionColor(playerPosition)}`}>
            {playerPosition}{playerPosition === 1 ? 'st' : playerPosition === 2 ? 'nd' : playerPosition === 3 ? 'rd' : 'th'} PLACE
          </p>
        </div>

        {/* Player Stats */}
        <div className="bg-f1-gray border-2 border-f1-red rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Reaction Time</p>
              <p className="text-3xl font-bold text-f1-neon">
                {playerReactionTime}ms
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Best Time</p>
              <p className="text-3xl font-bold text-f1-red">
                {bestTime ? `${bestTime}ms` : '--'}
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-f1-gray rounded-lg p-6 mb-8 max-h-64 overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 text-center">Race Results</h3>
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.car.id}
                className={`flex items-center justify-between p-3 rounded ${
                  result.car.isPlayer
                    ? 'bg-f1-red/20 border-2 border-f1-red'
                    : 'bg-black/50'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className={`text-2xl font-bold w-8 ${getPositionColor(result.position)}`}>
                    {result.position}
                  </span>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: result.car.color }}
                  />
                  <div className="flex-1">
                    <p className="font-bold">
                      {result.car.name}
                      {result.car.isPlayer && ' (YOU)'}
                    </p>
                    <p className="text-sm text-gray-400">Car #{result.car.carNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-bold text-f1-neon">
                    {result.car.reactionTime}ms
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleRaceAgain}
            className="py-4 bg-f1-red text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
          >
            🏁 RACE AGAIN
          </button>
          <button
            onClick={handleNewPlayer}
            className="py-4 bg-f1-gray text-white font-bold rounded-lg hover:bg-gray-700 transition-colors border-2 border-f1-gray"
          >
            👤 NEW PLAYER
          </button>
        </div>
      </div>
    </div>
  );
}
