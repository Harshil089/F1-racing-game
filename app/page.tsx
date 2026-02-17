'use client';

import { useState } from 'react';
import DeviceSelection from '@/components/registration/DeviceSelection';
import RegistrationForm from '@/components/registration/RegistrationForm';

export default function HomePage() {
  const [deviceSelected, setDeviceSelected] = useState(false);

  const handleDeviceSelected = (deviceType: 'mobile' | 'laptop') => {
    setDeviceSelected(true);
  };

  return (
    <main className="min-h-screen f1-grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Google-style Header */}
        <div className="text-center mb-8 sm:mb-12 slide-in">
          {/* Google-colored logo */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-4xl sm:text-6xl font-bold mb-1 sm:mb-2">
              <span className="text-google-blue">F</span>
              <span className="text-google-red">1</span>{" "}
              <span className="text-google-yellow">RE</span>
              <span className="text-google-blue">FL</span>
              <span className="text-google-green">EX</span>
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-google-grey">
              RACING
            </h2>
          </div>

          <p className="text-google-grey text-lg mb-6">
            Test your reaction time like a Formula 1 driver
          </p>

          {/* Google-colored race lights indicator */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-4 h-4 bg-google-blue rounded-full animate-pulse google-shadow"></div>
            <div className="w-4 h-4 bg-google-red rounded-full animate-pulse google-shadow" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 bg-google-yellow rounded-full animate-pulse google-shadow" style={{ animationDelay: '0.4s' }}></div>
            <div className="w-4 h-4 bg-google-green rounded-full animate-pulse google-shadow" style={{ animationDelay: '0.6s' }}></div>
            <div className="w-4 h-4 bg-google-blue rounded-full animate-pulse google-shadow" style={{ animationDelay: '0.8s' }}></div>
          </div>
        </div>

        {/* Show Device Selection first, then Registration Form */}
        {!deviceSelected ? (
          <DeviceSelection onDeviceSelected={handleDeviceSelected} />
        ) : (
          <RegistrationForm />
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500 text-sm slide-in">
          <p className="flex items-center justify-center gap-2 flex-wrap">
            <span className="google-badge google-badge-primary">Mobile & Desktop</span>
            <span className="google-badge google-badge-success">Fast reactions</span>
            <span className="google-badge google-badge-warning">Best reaction wins</span>
          </p>
        </div>
      </div>
    </main>
  );
}
