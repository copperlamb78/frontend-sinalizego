import confetti from 'canvas-confetti';

/**
 * Fires a subtle, elegant confetti celebration in institutional Teal & Gold colors
 */
export const triggerCelebrationConfetti = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // Subtle left burst
    confetti({
      particleCount: 25,
      angle: 60,
      spread: 45,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#14B8A6', '#2DD4BF', '#F59E0B', '#FFFFFF'],
      disableForReducedMotion: true,
      ticks: 150
    });

    // Subtle right burst
    confetti({
      particleCount: 25,
      angle: 120,
      spread: 45,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#14B8A6', '#2DD4BF', '#F59E0B', '#FFFFFF'],
      disableForReducedMotion: true,
      ticks: 150
    });
  } catch {
    // Graceful fallback
  }
};
