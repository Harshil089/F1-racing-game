'use client';

import { useEffect, useState } from 'react';
import { RaceResult } from '@/types';
import { useRouter } from 'next/navigation';
import {
  getPositionEmoji,
  LeaderboardEntry
} from '@/lib/leaderboard';
import { useLeaderboard } from '@/hooks/useLeaderboard';

interface ResultsScreenProps {
  results: RaceResult[];
}

export default function ResultsScreen({ results }: ResultsScreenProps) {
  const router = useRouter();
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isCurrentTime, setIsCurrentTime] = useState(false); // Whether this race's time earned the position
  const [playerPhone, setPlayerPhone] = useState<string>('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Use real-time leaderboard hook
  const { leaderboard, isConnected, isLoading, updateLeaderboard: updateLeaderboardRealtime } = useLeaderboard();

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

    // Submit score to server — server handles dedup and best-time logic
    if (playerReactionTime > 0 && playerReactionTime < 999 && phone) {
      console.log('[ResultsScreen] Submitting score to leaderboard...');
      updateLeaderboardRealtime(playerName, phone, playerReactionTime, playerCarNumber)
        .then(result => {
          if (result.position !== null) {
            console.log('[ResultsScreen] Position received:', result.position, 'isCurrentTime:', result.isCurrentTime);
            setLeaderboardPosition(result.position);
            setIsCurrentTime(result.isCurrentTime);
            // Only mark as new record if this race's time is actually the fastest AND it's this race's time
            setIsNewRecord(result.position === 1 && result.leaderboard.length > 1 && result.isCurrentTime);
          }
          setScoreSubmitted(true);
        })
        .catch(error => {
          console.error('Error updating leaderboard:', error);
          setScoreSubmitted(true); // Still mark as ready even on error
        });
    } else {
      // No submission needed (false start or no phone), mark as ready immediately
      setScoreSubmitted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white/98 backdrop-blur-sm fade-in leaderboard-scroll">
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="w-full max-w-2xl my-auto">
          {/* Google-style Results Card */}
          <div className="bg-white rounded-3xl p-8 google-shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-7xl mb-4">
                {isNewRecord ? '🏆' : (leaderboardPosition && isCurrentTime) ? getPositionEmoji(leaderboardPosition) : '🏁'}
              </div>
              <h2 className="text-5xl font-bold mb-3 text-google-blue">
                {isNewRecord ? 'NEW RECORD!' : (leaderboardPosition && isCurrentTime) ? 'LEADERBOARD!' : 'RACE COMPLETE'}
              </h2>
              {leaderboardPosition && isCurrentTime && (
                <div className={`inline-block px-6 py-2 rounded-full border-2 ${getPositionBgColor(leaderboardPosition)}`}>
                  <p className={`text-2xl font-bold ${getPositionColor(leaderboardPosition)}`}>
                    {leaderboardPosition}{leaderboardPosition === 1 ? 'st' : leaderboardPosition === 2 ? 'nd' : leaderboardPosition === 3 ? 'rd' : 'th'} PLACE
                  </p>
                </div>
              )}
              {leaderboardPosition && !isCurrentTime && (
                <p className="text-sm text-gray-500 mt-2">
                  Your previous best ({leaderboard.find(e => e.name === playerName && e.phone === playerPhone)?.reactionTime}ms) is still on the leaderboard
                </p>
              )}
              <p className="text-sm font-bold text-black mt-3">
                Visit Google Developer Groups Club Catalyst Stall to claim your reward.
              </p>
            </div>

            {/* Player Stats - Google Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center border border-google-green/20">
                <p className="text-google-grey text-sm font-medium mb-2">⚡ Reaction Time</p>
                <p className="text-4xl font-bold text-google-green">
                  {playerReactionTime}ms
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-google-blue/20">
                <p className="text-google-grey text-sm font-medium mb-2">🏆 Best Time</p>
                <p className="text-4xl font-bold text-google-blue">
                  {!scoreSubmitted || isLoading ? (
                    <span className="animate-pulse">···</span>
                  ) : leaderboard.length > 0 ? (
                    `${leaderboard[0].reactionTime}ms`
                  ) : '--'}
                </p>
              </div>
            </div>

            {/* Leaderboard - Google Style */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-google-grey flex items-center gap-2">
                  <span>🏆</span> Top 3 Fastest Times
                </h3>
                {/* Real-time indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
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
                    const lastFourDigits = entry.phone ? entry.phone.slice(-4) : '????';

                    return (
                      <div
                        key={`${entry.name}-${entry.phone}-${entry.timestamp}`}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all ${isCurrentPlayer
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
    </div>
  );
}
