'use client';

import { useState } from 'react';

interface DeviceSelectionProps {
  onDeviceSelected: (deviceType: 'mobile' | 'laptop') => void;
}

export default function DeviceSelection({ onDeviceSelected }: DeviceSelectionProps) {
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'laptop' | null>(null);

  const handleDeviceClick = (deviceType: 'mobile' | 'laptop') => {
    setSelectedDevice(deviceType);
  };

  const handleContinue = () => {
    if (selectedDevice) {
      // Store device type in localStorage
      localStorage.setItem('deviceType', selectedDevice);
      onDeviceSelected(selectedDevice);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 slide-in">
      {/* Google-style card container */}
      <div className="bg-white rounded-2xl p-8 google-shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-google-grey mb-3">
            Choose Your Device
          </h2>
          <p className="text-google-grey">
            Select how you'll be playing the F1 Reflex Racing game
          </p>
        </div>

        {/* Device Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Mobile Option */}
          <button
            onClick={() => handleDeviceClick('mobile')}
            className={`p-6 rounded-xl border-2 transition-all duration-200 text-center ${
              selectedDevice === 'mobile'
                ? 'border-google-blue bg-blue-50 google-shadow-lg scale-105'
                : 'border-gray-200 hover:border-google-blue hover:bg-blue-50/50'
            }`}
          >
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-google-grey mb-2">Mobile / Tablet</h3>
            <p className="text-sm text-gray-600 mb-3">
              Use touch gestures to control the game
            </p>
            <div className="text-xs text-gray-500 bg-white rounded-lg p-3 space-y-1">
              <p>✓ Touch and hold to start</p>
              <p>✓ Release on lights out</p>
              <p>✓ Optimized for touchscreens</p>
            </div>
          </button>

          {/* Laptop Option */}
          <button
            onClick={() => handleDeviceClick('laptop')}
            className={`p-6 rounded-xl border-2 transition-all duration-200 text-center ${
              selectedDevice === 'laptop'
                ? 'border-google-green bg-green-50 google-shadow-lg scale-105'
                : 'border-gray-200 hover:border-google-green hover:bg-green-50/50'
            }`}
          >
            <div className="text-6xl mb-4">💻</div>
            <h3 className="text-xl font-bold text-google-grey mb-2">Laptop / Desktop</h3>
            <p className="text-sm text-gray-600 mb-3">
              Use spacebar to control the game
            </p>
            <div className="text-xs text-gray-500 bg-white rounded-lg p-3 space-y-1">
              <p>✓ Press spacebar to start</p>
              <p>✓ Hold until lights out</p>
              <p>✓ Release at the right moment</p>
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedDevice}
          className={`w-full py-4 text-lg font-medium rounded-lg transition-all duration-200 ${
            selectedDevice
              ? 'google-btn-primary'
              : 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500'
          }`}
        >
          {selectedDevice ? '➡️ CONTINUE' : '👆 SELECT A DEVICE'}
        </button>

        {/* Info Alert */}
        {selectedDevice && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4 fade-in">
            <p className="text-sm text-google-grey text-center">
              💡 You selected:{' '}
              <strong>
                {selectedDevice === 'mobile' ? 'Mobile / Tablet' : 'Laptop / Desktop'}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Google-style helper text */}
      <p className="mt-4 text-center text-xs text-gray-500">
        You can change your device selection by refreshing the page
      </p>
    </div>
  );
}
