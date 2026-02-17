/**
 * Custom hook for real-time leaderboard updates using Socket.IO
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { LeaderboardEntry } from '@/lib/leaderboard';

let socket: Socket | null = null;

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    // Only initialize once
    if (!socket) {
      socket = io({
        path: '/socket.io',
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socket.on('leaderboard:updated', (data: { leaderboard: LeaderboardEntry[] }) => {
        console.log('Leaderboard updated:', data);
        setLeaderboard(data.leaderboard);
      });
    }

    // Fetch initial leaderboard
    fetchLeaderboard();

    return () => {
      // Don't disconnect on unmount to keep connection alive
      // socket?.disconnect();
    };
  }, []);

  // Fetch leaderboard from API
  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

          // Broadcast update to all connected clients
          if (socket) {
            socket.emit('leaderboard:update', {
              leaderboard: data.leaderboard,
            });
          }

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
