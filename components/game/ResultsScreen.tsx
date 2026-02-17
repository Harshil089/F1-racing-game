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
        return 'text-google-yellow';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-500';
      default:
        return 'text-google-grey';
    }
  };

  const getPositionBgColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-google-yellow/10 border-google-yellow';
      case 2:
        return 'bg-gray-200 border-gray-400';
      case 3:
        return 'bg-orange-100 border-orange-500';
      default:
        return 'bg-google-grey/10 border-google-grey/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/98 backdrop-blur-sm fade-in">
      <div className="w-full max-w-2xl px-6 py-8">
        {/* Google-style Results Card */}
        <div className="bg-white rounded-3xl p-8 google-shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">{getPositionEmoji(playerPosition)}</div>
            <h2 className="text-5xl font-bold mb-3 text-google-blue">
              {playerPosition === 1 ? 'VICTORY!' : playerPosition <= 3 ? 'PODIUM!' : 'RACE COMPLETE'}
            </h2>
            <div className={`inline-block px-6 py-2 rounded-full border-2 ${getPositionBgColor(playerPosition)}`}>
              <p className={`text-2xl font-bold ${getPositionColor(playerPosition)}`}>
                {playerPosition}{playerPosition === 1 ? 'st' : playerPosition === 2 ? 'nd' : playerPosition === 3 ? 'rd' : 'th'} PLACE
              </p>
            </div>
          </div>

          {/* Player Stats - Google Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center border border-google-green/20">
              <p className="text-google-grey text-sm font-medium mb-2">⚡ Reaction Time</p>
              <p className="text-4xl font-bold text-google-green">
                {playerReactionTime}ms
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-google-blue/20">
              <p className="text-google-grey text-sm font-medium mb-2">🏆 Best Time</p>
              <p className="text-4xl font-bold text-google-blue">
                {bestTime ? `${bestTime}ms` : '--'}
              </p>
            </div>
          </div>

          {/* Leaderboard - Google Style */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6 max-h-80 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-google-grey flex items-center justify-center gap-2">
              <span>🏁</span> Race Results
            </h3>
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.car.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    result.car.isPlayer
                      ? 'bg-google-blue/10 border-2 border-google-blue google-shadow'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className={`text-2xl font-bold w-8 ${getPositionColor(result.position)}`}>
                      {result.position}
                    </span>
                    <div
                      className="w-5 h-5 rounded-full border-2 border-white google-shadow"
                      style={{ backgroundColor: result.car.color }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-google-grey">
                        {result.car.name}
                        {result.car.isPlayer && (
                          <span className="ml-2 google-badge google-badge-primary">YOU</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">Car #{result.car.carNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xl font-bold text-google-green">
                      {result.car.reactionTime}ms
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons - Google Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleRaceAgain}
              className="google-btn-primary py-4 text-lg"
            >
              🔄 RACE AGAIN
            </button>
            <button
              onClick={handleNewPlayer}
              className="google-btn-secondary py-4 text-lg"
            >
              👤 NEW PLAYER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
