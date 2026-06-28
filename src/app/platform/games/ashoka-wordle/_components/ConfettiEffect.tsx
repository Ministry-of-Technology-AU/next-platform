'use client';

import { useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiEffectProps {
  trigger: boolean;
}

export default function ConfettiEffect({ trigger }: ConfettiEffectProps) {
  const hasTriggered = useRef(false);

  const fireSideCannons = useCallback(() => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    // Theme colors: primary, secondary, green, blue
    const colors = ['#87281b', '#ffcd74', '#519872', '#0267c1'];

    const frame = () => {
      if (Date.now() > end) return;

      // Left cannon
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
        zIndex: 9999,
      });

      // Right cannon
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
        zIndex: 9999,
      });

      requestAnimationFrame(frame);
    };

    frame();
  }, []);

  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;
      fireSideCannons();
    }

    // Reset when trigger becomes false
    if (!trigger) {
      hasTriggered.current = false;
    }
  }, [trigger, fireSideCannons]);

  return null;
}
