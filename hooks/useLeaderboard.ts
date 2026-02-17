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
  const isUpdatingRef = useRef<boolean>(false); // Track if an update is in progress

  // Fetch leaderboard from API
  const fetchLeaderboard = useCallback(async (skipIfRecent = false) => {
    try {
      // Skip fetch if we just updated recently (within last 2 seconds)
      if (skipIfRecent && Date.now() - lastUpdateRef.current < 2000) {
        return;
      }

      // Don't fetch if an update is currently in progress
      // This prevents race conditions where fetch overwrites the update
      if (isUpdatingRef.current) {
        console.log('[Polling] Skipping fetch - update in progress');
        return;
      }

      const response = await fetch('/api/leaderboard', {
        cache: 'no-store', // Don't cache, always get fresh data
      });

      if (response.ok) {
        const data = await response.json();

        // Double-check that no update started while we were fetching
        // This prevents stale data from overwriting fresh updates
        if (!isUpdatingRef.current) {
          setLeaderboard(data.leaderboard || []);
        } else {
          console.log('[Polling] Discarding fetch result - update in progress');
        }

        setIsConnected(true);
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
    fetchLeaderboard(false);

    // Set up polling interval - skip fetch if we just updated
    pollingIntervalRef.current = setInterval(() => {
      fetchLeaderboard(true);
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
      // Mark that an update is in progress
      // This prevents polling from overwriting the update
      isUpdatingRef.current = true;
      console.log('[Update] Starting leaderboard update...');

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

          // Update local state immediately with the fresh data from the server
          setLeaderboard(data.leaderboard);
          lastUpdateRef.current = Date.now();

          console.log('[Update] Leaderboard updated successfully', data);

          // Allow polling to resume after a short delay
          // This ensures the update is visible before polling can overwrite
          setTimeout(() => {
            isUpdatingRef.current = false;
            console.log('[Update] Update complete - polling can resume');
          }, 1500);

          return {
            position: data.position,
            leaderboard: data.leaderboard,
          };
        }

        // If update failed, allow polling to resume immediately
        isUpdatingRef.current = false;
        return { position: null, leaderboard: [] };
      } catch (error) {
        console.error('Error updating leaderboard:', error);
        // If update failed, allow polling to resume immediately
        isUpdatingRef.current = false;
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
