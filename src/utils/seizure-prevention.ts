/**
 * Utility functions for preventing seizures and other accessibility concerns
 * related to animations and motion.
 */

/**
 * Checks if the user has requested reduced motion via the prefers-reduced-motion media query
 * @returns True if the user prefers reduced motion
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Checks if the animation is safe for users with photosensitive epilepsy
 * @param frequency The frequency of the animation in Hz
 * @returns True if the animation is safe
 */
export function isSafeFrequency(frequency: number) {
  // Frequencies between 5-30Hz can trigger seizures in photosensitive individuals
  // See: https://www.w3.org/TR/UNDERSTANDING-WCAG20/seizure-does-not-violate.html
  return frequency < 3 || frequency > 30;
}

/**
 * Determines if an animation should be skipped based on user preferences and settings
 * @param reduceMotion Whether reduced motion is enabled in the application settings
 * @returns True if the animation should be skipped
 */
export function shouldSkipAnimation(reduceMotion = false) {
  return reduceMotion || prefersReducedMotion();
}

/**
 * Calculates a safe animation duration based on frequency
 * @param targetDuration The desired duration in milliseconds
 * @param reduceMotion Whether reduced motion is enabled
 * @returns A safe duration in milliseconds
 */
export function getSafeAnimationDuration(targetDuration: number, reduceMotion = false) {
  if (shouldSkipAnimation(reduceMotion)) {
    return 0; // Skip animation entirely
  }
  
  // Ensure animation isn't too fast (minimum 100ms for perceptible animations)
  return Math.max(targetDuration, 100);
}

/**
 * Determines if flashing content is safe
 * @param flashesPerSecond Number of flashes per second
 * @param reduceMotion Whether reduced motion is enabled
 * @returns True if the flashing content is safe
 */
export function isSafeFlashing(flashesPerSecond: number, reduceMotion = false) {
  if (shouldSkipAnimation(reduceMotion)) {
    return false; // No flashing is safe when reduced motion is enabled
  }
  
  // WCAG 2.0 guideline 2.3.1: no more than three flashes in any one-second period
  return flashesPerSecond <= 3;
} 