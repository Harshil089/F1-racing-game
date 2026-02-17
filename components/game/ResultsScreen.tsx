'use client';

import { useEffect, useState } from 'react';
import { RaceResult } from '@/types';
import { useRouter } from 'next/navigation';
import {
  getLeaderboard,
  updateLeaderboard,
  qualifiesForLeaderboard,
  getPositionEmoji,
  LeaderboardEntry
} from '@/lib/leaderboard';

interface ResultsScreenProps {
  results: RaceResult[];
}

export default function ResultsScreen({ results }: ResultsScreenProps) {
  const router = useRouter();
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [playerPhone, setPlayerPhone] = useState<string>('');

  const playerResult = results.find((r) => r.car.isPlayer);
  const playerReactionTime = playerResult?.car.reactionTime || 0;
  const playerName = playerResult?.car.name || '';
  const playerCarNumber = playerResult?.car.carNumber || 0;

  useEffect(() => {
    // Load player phone from localStorage
    const playerData = localStorage.getItem('playerData');
    let phone = '';
    if (playerData) {
      try {
        const data = JSON.parse(playerData);
        phone = data.phone || '';
        setPlayerPhone(phone);
      } catch (error) {
        console.error('Error parsing player data:', error);
      }
    }

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

    // Load and update leaderboard
    const currentLeaderboard = getLeaderboard();

    // Check if player qualifies for leaderboard
    if (qualifiesForLeaderboard(playerReactionTime) && phone) {
      const position = updateLeaderboard(playerName, phone, playerReactionTime, playerCarNumber);
      if (position !== null) {
        setLeaderboardPosition(position);
        setIsNewRecord(position === 1 && currentLeaderboard.length > 0);
      }
    }

    // Reload leaderboard after potential update
    setLeaderboard(getLeaderboard());
  }, [playerReactionTime, playerName, playerCarNumber]);

  const handleRaceAgain = () => {
    window.location.reload();
  };

  const handleNewPlayer = () => {
    localStorage.removeItem('playerData');
    router.push('/');
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
            <div className="text-7xl mb-4">
              {isNewRecord ? '🏆' : leaderboardPosition ? getPositionEmoji(leaderboardPosition) : '🏁'}
            </div>
            <h2 className="text-5xl font-bold mb-3 text-google-blue">
              {isNewRecord ? 'NEW RECORD!' : leaderboardPosition ? 'LEADERBOARD!' : 'RACE COMPLETE'}
            </h2>
            {leaderboardPosition && (
              <div className={`inline-block px-6 py-2 rounded-full border-2 ${getPositionBgColor(leaderboardPosition)}`}>
                <p className={`text-2xl font-bold ${getPositionColor(leaderboardPosition)}`}>
                  {leaderboardPosition}{leaderboardPosition === 1 ? 'st' : leaderboardPosition === 2 ? 'nd' : leaderboardPosition === 3 ? 'rd' : 'th'} PLACE
                </p>
              </div>
            )}
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
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 text-google-grey flex items-center justify-center gap-2">
              <span>🏆</span> Top 3 Fastest Times
            </h3>
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">No records yet!</p>
                  <p className="text-sm">Be the first to set a time</p>
                </div>
              ) : (
                leaderboard.map((entry, index) => {
                  const position = index + 1;
                  const isCurrentPlayer = entry.name === playerName &&
                                         entry.phone === playerPhone &&
                                         Math.abs(entry.timestamp - Date.now()) < 5000; // Within last 5 seconds
                  const lastFourDigits = entry.phone.slice(-4);

                  return (
                    <div
                      key={`${entry.name}-${entry.phone}-${entry.timestamp}`}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        isCurrentPlayer
                          ? 'bg-google-blue/10 border-2 border-google-blue google-shadow animate-pulse'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className={`text-3xl font-bold w-12 ${getPositionColor(position)}`}>
                          {getPositionEmoji(position)}
                        </span>
                        <div className="flex-1">
                          <p className="font-bold text-google-grey">
                            {entry.name}
                            {isCurrentPlayer && (
                              <span className="ml-2 google-badge google-badge-primary">YOU</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            ···{lastFourDigits}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(entry.timestamp).toLocaleDateString()} • Car #{entry.carNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-2xl font-bold text-google-green">
                          {entry.reactionTime}ms
                        </p>
                        {position === 1 && (
                          <p className="text-xs text-google-yellow font-bold">FASTEST</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
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
