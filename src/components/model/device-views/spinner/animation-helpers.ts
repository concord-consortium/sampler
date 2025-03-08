/**
 * Animation helper functions for the Spinner component
 * These functions provide physics-based animation calculations for the spinner
 */

/**
 * Calculates the eased rotation value based on the current animation progress
 * Uses a cubic bezier curve for natural acceleration and deceleration
 * 
 * @param startRotation - The starting rotation angle in degrees
 * @param endRotation - The target rotation angle in degrees
 * @param t - The animation progress (0 to 1)
 * @returns The current rotation angle in degrees
 */
export const calculateEasedRotation = (
  startRotation: number,
  endRotation: number,
  t: number
): number => {
  // Ensure t is between 0 and 1
  const progress = Math.max(0, Math.min(1, t));
  
  // Calculate the minimum number of full rotations needed (at least 2)
  const minFullRotations = 2;
  
  // Normalize angles to 0-360 range
  const normalizedStart = startRotation % 360;
  const normalizedEnd = endRotation % 360;
  
  // Calculate the direct angle difference
  let angleDifference = normalizedEnd - normalizedStart;
  
  // Ensure we're taking the shortest path
  if (angleDifference <= 0) {
    angleDifference += 360;
  }
  
  // Calculate total rotation including full rotations
  const totalRotation = (minFullRotations * 360) + angleDifference;
  
  // Apply cubic bezier easing for natural motion
  // This creates acceleration at the start and deceleration at the end
  const easedProgress = cubicBezier(0.25, 0.1, 0.25, 1.0, progress);
  
  return normalizedStart + (totalRotation * easedProgress);
};

/**
 * Cubic bezier function for easing animations
 * 
 * @param p1x - First control point x
 * @param p1y - First control point y
 * @param p2x - Second control point x
 * @param p2y - Second control point y
 * @param t - Input value (0 to 1)
 * @returns The eased value
 */
export const cubicBezier = (
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  t: number
): number => {
  // Ensure t is between 0 and 1
  const clampedT = Math.max(0, Math.min(1, t));
  
  // Calculate the coefficients
  // Note: cx and bx are not used in the final calculation as we only need the y-value
  // const cx = 3 * p1x;
  // const bx = 3 * (p2x - p1x) - cx;
  // const ax = 1 - cx - bx;
  
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  
  // Calculate the y value for the given t
  const tSquared = clampedT * clampedT;
  const tCubed = tSquared * clampedT;
  
  return ay * tCubed + by * tSquared + cy * clampedT;
};

/**
 * Calculates the opacity for wedges during animation
 * Non-target wedges fade out slightly during animation
 * 
 * @param isTarget - Whether this wedge is the target of the animation
 * @param t - The animation progress (0 to 1)
 * @returns The opacity value (0 to 1)
 */
export const calculateWedgeOpacity = (
  isTarget: boolean,
  t: number
): number => {
  if (isTarget) {
    // Target wedge stays fully opaque
    return 1;
  }
  
  // Non-target wedges fade out to 40% opacity
  const minOpacity = 0.4;
  const opacityRange = 1 - minOpacity;
  
  // Ease in the opacity change
  const easedT = cubicBezier(0.4, 0, 0.2, 1, t);
  return 1 - (opacityRange * easedT);
};

/**
 * Calculates the pulse effect scale for the selected wedge
 * Creates a subtle pulsing effect during animation
 * 
 * @param t - The animation progress (0 to 1)
 * @returns The scale factor for the pulse effect
 */
export const calculatePulseEffect = (t: number): number => {
  // Use a sine wave to create a pulsing effect
  // Frequency determines how many pulses occur during the animation
  const frequency = 3;
  const amplitude = 0.05; // Maximum scale change (5%)
  
  // Calculate the pulse using a sine wave
  const pulse = Math.sin(t * Math.PI * 2 * frequency) * amplitude;
  
  // Return the scale factor (centered around 1)
  return 1 + pulse;
};

/**
 * Calculates the highlight intensity for the target wedge
 * Creates a glowing effect that intensifies as the animation progresses
 * 
 * @param t - The animation progress (0 to 1)
 * @returns The highlight intensity (0 to 1)
 */
export const calculateHighlightIntensity = (t: number): number => {
  // Intensity increases as animation progresses
  // Use easing to make it more dramatic near the end
  const easedT = cubicBezier(0.2, 0, 0.8, 1, t);
  return easedT;
}; 
