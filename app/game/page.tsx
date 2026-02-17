'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThumbGate from '@/components/game/ThumbGate';
import RaceTrack from '@/components/game/RaceTrack';

export default function GamePage() {
  const router = useRouter();
  const [showThumbGate, setShowThumbGate] = useState(true);
  const [playerData, setPlayerData] = useState<{ name: string; carNumber: number } | null>(null);
  const [deviceType, setDeviceType] = useState<'mobile' | 'laptop'>('mobile');

  useEffect(() => {
    // Load device type from localStorage
    const storedDeviceType = localStorage.getItem('deviceType') as 'mobile' | 'laptop' | null;
    if (storedDeviceType) {
      setDeviceType(storedDeviceType);
      // Skip ThumbGate for laptop users
      if (storedDeviceType === 'laptop') {
        setShowThumbGate(false);
      }
    }

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-google-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-google-grey font-medium">Loading race data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white">
      {/* Only show ThumbGate for mobile users */}
      {showThumbGate && deviceType === 'mobile' && <ThumbGate onThumbDetected={handleThumbDetected} />}

      {/* Show RaceTrack when: laptop user OR mobile user who passed ThumbGate */}
      {(deviceType === 'laptop' || !showThumbGate) && (
        <RaceTrack playerName={playerData.name} playerCarNumber={playerData.carNumber} />
      )}
    </main>
  );
}
