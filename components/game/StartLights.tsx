'use client';

import { useEffect, useRef } from 'react';
import { START_LIGHTS } from '@/lib/constants';
import { LightsState } from '@/types';

interface StartLightsProps {
  lightsState: LightsState;
  canvasWidth: number;
}

export default function StartLights({ lightsState, canvasWidth }: StartLightsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate center position
    const totalWidth = START_LIGHTS.COUNT * START_LIGHTS.SPACING;
    const startX = (canvas.width - totalWidth) / 2 + START_LIGHTS.RADIUS;
    const y = canvas.height / 2;

    // Draw all 5 lights
    for (let i = 0; i < START_LIGHTS.COUNT; i++) {
      const x = startX + i * START_LIGHTS.SPACING;
      const isOn = !lightsState.allOut && i < lightsState.count;

      // Draw glow effect for active lights
      if (isOn) {
        ctx.shadowBlur = START_LIGHTS.GLOW_BLUR;
        ctx.shadowColor = START_LIGHTS.COLOR_ON;
      } else {
        ctx.shadowBlur = 0;
      }

      // Draw light circle
      ctx.fillStyle = isOn ? START_LIGHTS.COLOR_ON : START_LIGHTS.COLOR_OFF;
      ctx.beginPath();
      ctx.arc(x, y, START_LIGHTS.RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Draw light outline - Google style
      ctx.strokeStyle = isOn ? '#D93025' : '#DADCE0';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;
    }
  }, [lightsState, canvasWidth]);

  return (
    <div className="absolute top-8 left-0 right-0 flex justify-center z-10">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={100}
        className="pointer-events-none"
      />
    </div>
  );
}
