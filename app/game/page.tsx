'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThumbGate from '@/components/game/ThumbGate';
import RaceTrack from '@/components/game/RaceTrack';

export default function GamePage() {
  const router = useRouter();
  const [showThumbGate, setShowThumbGate] = useState(true);
  const [playerData, setPlayerData] = useState<{ name: string; carNumber: number } | null>(null);

  useEffect(() => {
    // Load player data from localStorage
    const stored = localStorage.getItem('playerData');

    if (!stored) {
      // No player data, redirect to registration
      router.push('/');
      return;
    }

    try {
      const data = JSON.parse(stored);
      setPlayerData(data);
    } catch (error) {
      console.error('Error parsing player data:', error);
      router.push('/');
    }
  }, [router]);

  const handleThumbDetected = () => {
    setShowThumbGate(false);
  };

  if (!playerData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      {showThumbGate && <ThumbGate onThumbDetected={handleThumbDetected} />}

      {!showThumbGate && (
        <RaceTrack playerName={playerData.name} playerCarNumber={playerData.carNumber} />
      )}
    </main>
  );
}
