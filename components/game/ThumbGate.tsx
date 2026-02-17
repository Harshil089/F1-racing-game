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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-white via-blue-50 to-white fade-in">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center">
          {/* Google-style Card */}
          <div className="bg-white rounded-3xl p-10 google-shadow-lg">
            {/* Animated hand icon */}
            <div className="mb-8 text-8xl animate-bounce">
              👇
            </div>

            {/* Main message - Google colors */}
            <h2 className="text-4xl font-bold mb-3 text-google-blue">
              PLACE YOUR THUMB
            </h2>
            <h3 className="text-2xl text-google-green mb-6 font-medium">
              ON THE SCREEN
            </h3>

            <p className="text-google-grey max-w-md mx-auto leading-relaxed text-base">
              Keep your thumb pressed until the start lights go out.
              Release immediately to launch your car!
            </p>

            {/* Pulsing indicator - Google Blue */}
            <div className="mt-10 flex items-center justify-center">
              <div className="relative">
                <div className="w-28 h-28 bg-google-blue rounded-full opacity-20 absolute animate-ping"></div>
                <div className="w-28 h-28 bg-google-blue rounded-full flex items-center justify-center google-shadow-lg">
                  <span className="text-4xl">🏁</span>
                </div>
              </div>
            </div>

            {/* Instructions - Google badges style */}
            <div className="mt-10 space-y-3">
              <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl">
                <span className="text-google-blue text-xl">1️⃣</span>
                <p className="text-sm text-google-grey font-medium">Touch anywhere to begin</p>
              </div>
              <div className="flex items-center gap-3 bg-yellow-50 px-4 py-3 rounded-xl">
                <span className="text-google-yellow text-xl">2️⃣</span>
                <p className="text-sm text-google-grey font-medium">Keep thumb pressed during countdown</p>
              </div>
              <div className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-xl">
                <span className="text-google-green text-xl">3️⃣</span>
                <p className="text-sm text-google-grey font-medium">Release when lights go out</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
