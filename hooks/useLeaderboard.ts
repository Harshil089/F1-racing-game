/**
 * Custom hook for leaderboard updates using polling
 * Compatible with Vercel serverless deployment
 */
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { LeaderboardEntry } from '@/lib/leaderboard';

const POLL_INTERVAL = 3000; // Poll every 3 seconds

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isConnected, setIsConnected] = useState(true); // Always "connected" for polling
  const [isLoading, setIsLoading] = useState(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Fetch leaderboard from API
  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('/api/leaderboard', {
        cache: 'no-store', // Don't cache, always get fresh data
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setIsConnected(true);
        lastUpdateRef.current = Date.now();
      } else {
        console.error('Failed to fetch leaderboard:', response.status);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize polling
  useEffect(() => {
    // Fetch immediately on mount
    fetchLeaderboard();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      fetchLeaderboard();
    }, POLL_INTERVAL);

    return () => {
      // Clean up on unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [fetchLeaderboard]);

  // Update leaderboard with new score
  const updateLeaderboard = useCallback(
    async (
      name: string,
      phone: string,
      reactionTime: number,
      carNumber: number
    ): Promise<{ position: number | null; leaderboard: LeaderboardEntry[] }> => {
      try {
        const response = await fetch('/api/leaderboard/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            phone,
            reactionTime,
            carNumber,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          // Immediately update local state
          setLeaderboard(data.leaderboard);
          lastUpdateRef.current = Date.now();

          return {
            position: data.position,
            leaderboard: data.leaderboard,
          };
        }

        return { position: null, leaderboard: [] };
      } catch (error) {
        console.error('Error updating leaderboard:', error);
        return { position: null, leaderboard: [] };
      }
    },
    []
  );

  return {
    leaderboard,
    isConnected,
    isLoading,
    updateLeaderboard,
    refreshLeaderboard: fetchLeaderboard,
  };
}
