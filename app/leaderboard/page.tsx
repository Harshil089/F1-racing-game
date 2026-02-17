'use client';

import { useLeaderboard } from '@/hooks/useLeaderboard';
import { getPositionEmoji } from '@/lib/leaderboard';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const router = useRouter();
  const { leaderboard, isConnected, isLoading } = useLeaderboard();

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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white flex items-start justify-center p-4 py-8 overflow-y-auto leaderboard-scroll">
      <div className="w-full max-w-3xl my-auto">
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-8 google-shadow-lg mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-google-blue mb-2">
                🏁 F1 Racing Leaderboard
              </h1>
              <p className="text-google-grey">Real-time fastest reaction times</p>
            </div>

            {/* Connection Status */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-google-grey">
                  {isConnected ? '🟢 Live Updates' : '🔴 Disconnected'}
                </span>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-google-blue hover:underline"
              >
                ← Back to Game
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-google-blue/20">
              <p className="text-sm text-google-grey mb-1">Total Records</p>
              <p className="text-3xl font-bold text-google-blue">{leaderboard.length}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 text-center border border-google-yellow/20">
              <p className="text-sm text-google-grey mb-1">Fastest Time</p>
              <p className="text-3xl font-bold text-google-yellow">
                {leaderboard.length > 0 ? `${leaderboard[0].reactionTime}ms` : '--'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-google-green/20">
              <p className="text-sm text-google-grey mb-1">Average Time</p>
              <p className="text-3xl font-bold text-google-green">
                {leaderboard.length > 0
                  ? `${Math.round(
                    leaderboard.reduce((sum, entry) => sum + entry.reactionTime, 0) /
                    leaderboard.length
                  )}ms`
                  : '--'}
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard Card */}
        <div className="bg-white rounded-3xl p-8 google-shadow-lg">
          <h2 className="text-2xl font-bold text-google-grey mb-6 flex items-center gap-2">
            <span>🏆</span> Top 3 Champions
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-google-blue border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-google-grey">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏁</div>
              <p className="text-xl text-google-grey mb-2">No records yet!</p>
              <p className="text-sm text-gray-500 mb-6">Be the first to set a time</p>
              <button
                onClick={() => router.push('/')}
                className="google-btn-primary px-8 py-3"
              >
                🏁 Start Racing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => {
                const position = index + 1;
                const lastFourDigits = entry.phone ? entry.phone.slice(-4) : '????';

                return (
                  <div
                    key={`${entry.name}-${entry.phone}-${entry.timestamp}`}
                    className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${getPositionBgColor(
                      position
                    )} google-shadow hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-6 flex-1">
                      {/* Position */}
                      <div className="flex flex-col items-center min-w-[60px] max-w-[200px]">
                        <span className={`text-5xl ${getPositionColor(position)}`}>
                          {getPositionEmoji(position)}
                        </span>
                        <span className={`text-sm font-bold mt-1 ${getPositionColor(position)}`}>
                          #{position}
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-google-blue text-center mt-3 leading-tight">
                          Visit Google Developer Group club catalyst stall to claim your reward.
                        </p>
                      </div>

                      {/* Player Info */}
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-google-grey mb-1">
                          {entry.name}
                        </p>
                        <p className="text-sm text-gray-500 mb-1">
                          ···{lastFourDigits}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>📅 {new Date(entry.timestamp).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>🏎️ Car #{entry.carNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reaction Time */}
                    <div className="text-right">
                      <p className="font-mono text-4xl font-bold text-google-green mb-1">
                        {entry.reactionTime}
                        <span className="text-lg text-gray-500">ms</span>
                      </p>
                      {position === 1 && (
                        <div className="inline-block bg-google-yellow text-white text-xs font-bold px-3 py-1 rounded-full">
                          ⚡ FASTEST
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Updates automatically when new records are set
          </p>
        </div>
      </div>
    </div>
  );
}
