'use client';

import { useEffect, useCallback, useRef } from 'react';
// import confetti from 'canvas-confetti'; // Uncomment when @magicui/confetti is installed

interface ConfettiEffectProps {
    trigger: boolean;
}

export default function ConfettiEffect({ trigger }: ConfettiEffectProps) {
    const hasTriggered = useRef(false);

    const fireConfetti = useCallback(() => {
        // UNCOMMENT THE FOLLOWING WHEN @magicui/confetti is installed:
        /*
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
        
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
        
        const interval = window.setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          
          if (timeLeft <= 0) {
            return clearInterval(interval);
          }
          
          const particleCount = 50 * (timeLeft / duration);
          
          // Fire from left
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#87281b', '#ffcd74', '#519872', '#0267c1'], // Theme colors
          });
          
          // Fire from right
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#87281b', '#ffcd74', '#519872', '#0267c1'],
          });
        }, 250);
        
        // Initial burst in center
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#87281b', '#ffcd74', '#519872', '#0267c1'],
          zIndex: 9999,
        });
        */

        // Temporary console log until confetti is installed
        console.log('🎉 Confetti would fire here! Install @magicui/confetti to enable.');
    }, []);

    useEffect(() => {
        if (trigger && !hasTriggered.current) {
            hasTriggered.current = true;
            fireConfetti();
        }

        // Reset when trigger becomes false
        if (!trigger) {
            hasTriggered.current = false;
        }
    }, [trigger, fireConfetti]);

    return null;
}

/*
 * Alternative implementation using MagicUI's Confetti component directly:
 * 
 * import { Confetti } from '@/components/ui/confetti';
 * 
 * export default function ConfettiEffect({ trigger }: ConfettiEffectProps) {
 *   if (!trigger) return null;
 *   
 *   return (
 *     <Confetti
 *       options={{
 *         spread: 360,
 *         ticks: 60,
 *         gravity: 0,
 *         decay: 0.96,
 *         startVelocity: 20,
 *         colors: ['#87281b', '#ffcd74', '#519872', '#0267c1'],
 *       }}
 *     />
 *   );
 * }
 */
