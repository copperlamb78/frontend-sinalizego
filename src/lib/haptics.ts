/**
 * Subtle and non-intrusive haptic feedback utility
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'warning' = 'light'): void => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(12);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'success':
          navigator.vibrate([15, 40, 20]);
          break;
        case 'warning':
          navigator.vibrate([30, 50, 30]);
          break;
        default:
          navigator.vibrate(15);
      }
    } catch {
      // Ignore browsers that block vibration without user interaction
    }
  }
};
