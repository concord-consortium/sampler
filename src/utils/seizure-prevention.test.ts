import {
  prefersReducedMotion,
  isSafeFrequency,
  shouldSkipAnimation,
  getSafeAnimationDuration,
  isSafeFlashing
} from './seizure-prevention';

// Mock window.matchMedia
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia
});

describe('Seizure Prevention Utilities', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('prefersReducedMotion', () => {
    it('returns true when user prefers reduced motion', () => {
      mockMatchMedia.mockReturnValue({
        matches: true
      });
      
      expect(prefersReducedMotion()).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('returns false when user does not prefer reduced motion', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(prefersReducedMotion()).toBe(false);
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('returns false when window is undefined (server-side rendering)', () => {
      // Save the original window object
      const originalWindow = global.window;
      
      // Set window to undefined to simulate server-side rendering
      // @ts-ignore - Intentionally setting window to undefined for testing
      global.window = undefined;
      
      expect(prefersReducedMotion()).toBe(false);
      
      // Restore the original window object
      global.window = originalWindow;
    });
  });

  describe('isSafeFrequency', () => {
    it('returns true for frequencies below the dangerous range', () => {
      expect(isSafeFrequency(1)).toBe(true);
      expect(isSafeFrequency(2.9)).toBe(true);
    });

    it('returns false for frequencies in the dangerous range', () => {
      expect(isSafeFrequency(3)).toBe(false);
      expect(isSafeFrequency(5)).toBe(false);
      expect(isSafeFrequency(15)).toBe(false);
      expect(isSafeFrequency(30)).toBe(false);
    });

    it('returns true for frequencies above the dangerous range', () => {
      expect(isSafeFrequency(30.1)).toBe(true);
      expect(isSafeFrequency(60)).toBe(true);
    });
  });

  describe('shouldSkipAnimation', () => {
    it('returns true when reduceMotion is true regardless of system preference', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(shouldSkipAnimation(true)).toBe(true);
    });

    it('returns true when system prefers reduced motion regardless of reduceMotion setting', () => {
      mockMatchMedia.mockReturnValue({
        matches: true
      });
      
      expect(shouldSkipAnimation(false)).toBe(true);
    });

    it('returns false when both reduceMotion is false and system does not prefer reduced motion', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(shouldSkipAnimation(false)).toBe(false);
    });

    it('uses default value of false for reduceMotion parameter', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(shouldSkipAnimation()).toBe(false);
    });
  });

  describe('getSafeAnimationDuration', () => {
    it('returns 0 when reduceMotion is true', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(getSafeAnimationDuration(500, true)).toBe(0);
    });

    it('returns 0 when system prefers reduced motion', () => {
      mockMatchMedia.mockReturnValue({
        matches: true
      });
      
      expect(getSafeAnimationDuration(500, false)).toBe(0);
    });

    it('returns the target duration when it is above the minimum safe duration', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(getSafeAnimationDuration(500, false)).toBe(500);
      expect(getSafeAnimationDuration(1000, false)).toBe(1000);
    });

    it('returns the minimum safe duration when target is too short', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(getSafeAnimationDuration(50, false)).toBe(100);
      expect(getSafeAnimationDuration(0, false)).toBe(100);
    });

    it('uses default value of false for reduceMotion parameter', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(getSafeAnimationDuration(500)).toBe(500);
    });
  });

  describe('isSafeFlashing', () => {
    it('returns false when reduceMotion is true regardless of flash rate', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(isSafeFlashing(1, true)).toBe(false);
      expect(isSafeFlashing(2, true)).toBe(false);
      expect(isSafeFlashing(3, true)).toBe(false);
    });

    it('returns false when system prefers reduced motion regardless of flash rate', () => {
      mockMatchMedia.mockReturnValue({
        matches: true
      });
      
      expect(isSafeFlashing(1, false)).toBe(false);
      expect(isSafeFlashing(2, false)).toBe(false);
      expect(isSafeFlashing(3, false)).toBe(false);
    });

    it('returns true when flash rate is within safe limits', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(isSafeFlashing(1, false)).toBe(true);
      expect(isSafeFlashing(2, false)).toBe(true);
      expect(isSafeFlashing(3, false)).toBe(true);
    });

    it('returns false when flash rate exceeds safe limits', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(isSafeFlashing(3.1, false)).toBe(false);
      expect(isSafeFlashing(4, false)).toBe(false);
      expect(isSafeFlashing(10, false)).toBe(false);
    });

    it('uses default value of false for reduceMotion parameter', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(isSafeFlashing(2)).toBe(true);
      expect(isSafeFlashing(4)).toBe(false);
    });
  });
}); 