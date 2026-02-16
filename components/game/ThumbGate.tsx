'use client';

import { useEffect, useState } from 'react';

interface ThumbGateProps {
  onThumbDetected: () => void;
}

export default function ThumbGate({ onThumbDetected }: ThumbGateProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (isVisible) {
        setIsVisible(false);
        setTimeout(() => {
          onThumbDetected();
        }, 300); // Delay for fade-out animation
      }
    };

    // Add touch listener
    document.addEventListener('touchstart', handleTouch, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouch);
    };
  }, [isVisible, onThumbDetected]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black fade-in">
      <div className="text-center px-6">
        {/* Animated hand icon (text-based) */}
        <div className="mb-8 text-8xl animate-bounce">
          👇
        </div>

        {/* Main message */}
        <h2 className="text-3xl font-bold mb-4 neon-glow-red">
          PLACE YOUR THUMB
        </h2>
        <h3 className="text-xl text-f1-neon mb-6">
          ON THE SCREEN
        </h3>

        <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
          Keep your thumb pressed until the start lights go out.
          Release immediately to launch your car!
        </p>

        {/* Pulsing indicator */}
        <div className="mt-12 flex items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-f1-red rounded-full opacity-50 absolute animate-ping"></div>
            <div className="w-24 h-24 bg-f1-red rounded-full flex items-center justify-center">
              <span className="text-3xl">🏁</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 space-y-2 text-sm text-gray-500">
          <p>• Touch anywhere to begin</p>
          <p>• Keep thumb pressed during countdown</p>
          <p>• Release when lights go out</p>
        </div>
      </div>
    </div>
  );
}
