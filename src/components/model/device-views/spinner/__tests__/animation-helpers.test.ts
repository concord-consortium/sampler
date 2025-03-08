import {
  calculateEasedRotation,
  cubicBezier,
  calculateWedgeOpacity,
  calculatePulseEffect,
  calculateHighlightIntensity
} from '../animation-helpers';

describe('Animation Helpers', () => {
  describe('cubicBezier', () => {
    it('should return 0 when t is 0', () => {
      expect(cubicBezier(0.25, 0.1, 0.25, 1.0, 0)).toBe(0);
    });
    
    it('should return 1 when t is 1', () => {
      expect(cubicBezier(0.25, 0.1, 0.25, 1.0, 1)).toBe(1);
    });
    
    it('should clamp t values outside 0-1 range', () => {
      expect(cubicBezier(0.25, 0.1, 0.25, 1.0, -0.5)).toBe(0);
      expect(cubicBezier(0.25, 0.1, 0.25, 1.0, 1.5)).toBe(1);
    });
    
    it('should calculate intermediate values correctly', () => {
      const result = cubicBezier(0.25, 0.1, 0.25, 1.0, 0.5);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });
  
  describe('calculateEasedRotation', () => {
    it('should return start rotation when t is 0', () => {
      const result = calculateEasedRotation(45, 135, 0);
      expect(result).toBeCloseTo(45);
    });
    
    it('should return a value close to end rotation when t is 1', () => {
      // The end result includes multiple rotations, so we normalize to compare
      const result = calculateEasedRotation(45, 135, 1) % 360;
      expect(result).toBeCloseTo(135);
    });
    
    it('should handle crossing the 0/360 boundary', () => {
      const result = calculateEasedRotation(350, 30, 0.5);
      // Should be rotating in the positive direction
      expect(result).toBeGreaterThan(350);
    });
    
    it('should include at least 2 full rotations', () => {
      const result = calculateEasedRotation(45, 135, 1);
      // Should be at least 2 full rotations (720) plus the angle difference (90)
      expect(result).toBeGreaterThanOrEqual(45 + 720 + 90);
    });
    
    it('should accelerate at the beginning and decelerate at the end', () => {
      // Calculate rotation at different time points
      const rotations = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map(t => 
        calculateEasedRotation(0, 90, t)
      );
      
      // Calculate first derivatives (velocity)
      const velocities = [];
      for (let i = 1; i < rotations.length; i++) {
        velocities.push(rotations[i] - rotations[i-1]);
      }
      
      // Calculate second derivatives (acceleration)
      const accelerations = [];
      for (let i = 1; i < velocities.length; i++) {
        accelerations.push(velocities[i] - velocities[i-1]);
      }
      
      // Acceleration should be positive at the beginning
      expect(accelerations[0]).toBeGreaterThan(0);
      
      // Deceleration (negative acceleration) should happen at the end
      expect(accelerations[accelerations.length - 1]).toBeLessThan(0);
    });
  });
  
  describe('calculateWedgeOpacity', () => {
    it('should return 1 for target wedges regardless of t', () => {
      expect(calculateWedgeOpacity(true, 0)).toBe(1);
      expect(calculateWedgeOpacity(true, 0.5)).toBe(1);
      expect(calculateWedgeOpacity(true, 1)).toBe(1);
    });
    
    it('should return decreasing opacity for non-target wedges as t increases', () => {
      const opacities = [0, 0.25, 0.5, 0.75, 1].map(t => 
        calculateWedgeOpacity(false, t)
      );
      
      // Opacity should start at 1
      expect(opacities[0]).toBe(1);
      
      // Opacity should decrease as t increases
      for (let i = 1; i < opacities.length; i++) {
        expect(opacities[i]).toBeLessThan(opacities[i-1]);
      }
      
      // Final opacity should be at least 0.4
      expect(opacities[opacities.length - 1]).toBeGreaterThanOrEqual(0.4);
    });
  });
  
  describe('calculatePulseEffect', () => {
    it('should oscillate around 1', () => {
      const values = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map(t => 
        calculatePulseEffect(t)
      );
      
      // Should have both values above and below 1
      const hasValuesAboveOne = values.some(v => v > 1);
      const hasValuesBelowOne = values.some(v => v < 1);
      
      expect(hasValuesAboveOne).toBe(true);
      expect(hasValuesBelowOne).toBe(true);
    });
    
    it('should have limited amplitude', () => {
      const values = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map(t => 
        calculatePulseEffect(t)
      );
      
      // Maximum deviation from 1 should be limited to 0.05 (5%)
      values.forEach(v => {
        expect(Math.abs(v - 1)).toBeLessThanOrEqual(0.05 + 1e-10); // Add small epsilon for floating point precision
      });
    });
  });
  
  describe('calculateHighlightIntensity', () => {
    it('should return 0 when t is 0', () => {
      expect(calculateHighlightIntensity(0)).toBe(0);
    });
    
    it('should return 1 when t is 1', () => {
      expect(calculateHighlightIntensity(1)).toBe(1);
    });
    
    it('should increase as t increases', () => {
      const intensities = [0, 0.25, 0.5, 0.75, 1].map(t => 
        calculateHighlightIntensity(t)
      );
      
      for (let i = 1; i < intensities.length; i++) {
        expect(intensities[i]).toBeGreaterThan(intensities[i-1]);
      }
    });
  });
}); 
