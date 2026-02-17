/**
 * Custom hook for real-time leaderboard updates using Socket.IO
 */
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { LeaderboardEntry } from '@/lib/leaderboard';

// Dynamically import socket.io-client only on client side
let ioClient: any = null;
if (typeof window !== 'undefined') {
  import('socket.io-client').then((module) => {
    ioClient = module.io;
  });
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<any>(null);
  const initializingRef = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    // Prevent multiple initializations
    if (initializingRef.current || socketRef.current) {
      return;
    }

    const initSocket = async () => {
      // Wait for client-side only
      if (typeof window === 'undefined') return;

      // Wait for io to be loaded
      let attempts = 0;
      while (!ioClient && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!ioClient) {
        console.error('Failed to load socket.io-client');
        return;
      }

      initializingRef.current = true;

      try {
        // Use the current window location for the socket connection
        // This works for both local development and production (Vercel)
        const socketUrl = window.location.origin;

        const socket = ioClient(socketUrl, {
          path: '/socket.io',
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          timeout: 10000,
        });

        socket.on('connect', () => {
          console.log('✅ Socket connected:', socket.id);
          console.log('📡 Connected to:', socketUrl);
          console.log('🌐 Transport:', socket.io.engine.transport.name);
          setIsConnected(true);
        });

        socket.on('disconnect', (reason: string) => {
          console.log('❌ Socket disconnected:', reason);
          console.log('📍 Was connected to:', socketUrl);
          setIsConnected(false);
        });

        socket.on('connect_error', (error: Error) => {
          console.error('❌ Socket connection error:', error.message);
          console.error('🔗 Attempted URL:', socketUrl);
          console.error('📱 User Agent:', navigator.userAgent);
          console.error('🌐 Full error:', error);
          setIsConnected(false);
        });

        socket.on('error', (error: Error) => {
          console.error('❌ Socket error:', error);
          console.error('📍 Socket URL:', socketUrl);
        });

        socket.on('leaderboard:updated', (data: { leaderboard: LeaderboardEntry[] }) => {
          console.log('📊 Leaderboard updated:', data);
          setLeaderboard(data.leaderboard);
        });

        socketRef.current = socket;
      } catch (error) {
        console.error('Error initializing socket:', error);
        initializingRef.current = false;
      }
    };

    initSocket();

    // Fetch initial leaderboard
    fetchLeaderboard();

    return () => {
      // Clean up on unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        initializingRef.current = false;
      }
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
      } else {
        console.error('Failed to fetch leaderboard:', response.status);
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
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('leaderboard:update', {
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
