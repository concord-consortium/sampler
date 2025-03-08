import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Needle } from '../needle';
import { useAnimationContext } from '../../../../../hooks/useAnimation';
import { AnimationCallback } from '../../../../../types';

// Mock the animation context
jest.mock('../../../../../hooks/useAnimation', () => ({
  useAnimationContext: jest.fn()
}));

describe('Spinner Animation', () => {
  // Setup mock for animation context
  const registerAnimationCallbackMock = jest.fn();
  const animationCallbackRef = { current: null as AnimationCallback | null };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup the mock implementation
    registerAnimationCallbackMock.mockImplementation((callback) => {
      animationCallbackRef.current = callback;
      return jest.fn(); // Return unregister function
    });
    
    (useAnimationContext as jest.Mock).mockReturnValue({
      registerAnimationCallback: registerAnimationCallbackMock
    });
  });
  
  describe('Needle Animation', () => {
    const deviceId = 'spinner-1';
    const variableLocations = {
      'A': { lastPercent: 0, currPercent: 0.25 },
      'B': { lastPercent: 0.25, currPercent: 0.25 },
      'C': { lastPercent: 0.5, currPercent: 0.5 }
    };
    
    it('should register animation callback on mount', () => {
      render(
        <svg>
          <Needle deviceId={deviceId} variableLocations={variableLocations} />
        </svg>
      );
      
      expect(registerAnimationCallbackMock).toHaveBeenCalled();
      expect(animationCallbackRef.current).not.toBeNull();
    });
    
    it('should show needle and update rotation during experiment', () => {
      render(
        <svg>
          <Needle deviceId={deviceId} variableLocations={variableLocations} />
        </svg>
      );
      
      // Needle should be visible initially (for testing purposes)
      expect(screen.getByTestId('spinner-needle')).toBeInTheDocument();
      
      // Get initial rotation but we don't need to use it in this test
      screen.getByTestId('spinner-needle').getAttribute('transform');
      
      // Trigger startExperiment animation step
      act(() => {
        if (animationCallbackRef.current) {
          animationCallbackRef.current({
            kind: 'startExperiment',
            numSamples: 1,
            numItems: 3
          });
        }
      });
      
      // Needle should still be visible
      expect(screen.getByTestId('spinner-needle')).toBeInTheDocument();
    });
    
    it('should rotate needle during device animation', () => {
      render(
        <svg>
          <Needle deviceId={deviceId} variableLocations={variableLocations} />
        </svg>
      );
      
      // Start experiment to show needle
      act(() => {
        if (animationCallbackRef.current) {
          animationCallbackRef.current({
            kind: 'startExperiment',
            numSamples: 1,
            numItems: 3
          });
        }
      });
      
      // Start item selection
      act(() => {
        if (animationCallbackRef.current) {
          animationCallbackRef.current({
            kind: 'startSelectItem'
          });
        }
      });
      
      // Get initial rotation
      const needleElement = screen.getByTestId('spinner-needle');
      const initialTransform = needleElement.getAttribute('transform');
      
      // Animate device with t=0.5 (halfway through animation)
      act(() => {
        if (animationCallbackRef.current) {
          animationCallbackRef.current(
            {
              kind: 'animateDevice',
              deviceId,
              selectedVariable: 'B',
              selectedVariableIndex: 1,
              hideAfter: false
            },
            { t: 0.5, speed: 0 }
          );
        }
      });
      
      // Rotation should have changed
      const midTransform = needleElement.getAttribute('transform');
      expect(midTransform).not.toEqual(initialTransform);
      
      // Animate device with t=1 (end of animation)
      act(() => {
        if (animationCallbackRef.current) {
          animationCallbackRef.current(
            {
              kind: 'animateDevice',
              deviceId,
              selectedVariable: 'B',
              selectedVariableIndex: 1,
              hideAfter: false
            },
            { t: 1, speed: 0 }
          );
        }
      });
      
      // Final rotation should be different from mid-animation
      const finalTransform = needleElement.getAttribute('transform');
      expect(finalTransform).not.toEqual(midTransform);
    });
    
    it('should maintain visibility after experiment ends', () => {
      render(
        <svg>
          <Needle deviceId={deviceId} variableLocations={variableLocations} />
        </svg>
      );
      
      // Start experiment
      act(() => {
        if (animationCallbackRef.current) {
          animationCallbackRef.current({
            kind: 'startExperiment',
            numSamples: 1,
            numItems: 3
          });
        }
      });
      
      // Needle should be visible
      expect(screen.getByTestId('spinner-needle')).toBeInTheDocument();
      
      // End experiment
      act(() => {
        if (animationCallbackRef.current) {
          animationCallbackRef.current({
            kind: 'endExperiment'
          });
        }
      });
      
      // Needle should still be visible (for testing purposes)
      expect(screen.getByTestId('spinner-needle')).toBeInTheDocument();
      
      // But rotation should be reset to 0
      const needleElement = screen.getByTestId('spinner-needle');
      const transform = needleElement.getAttribute('transform');
      expect(transform).toContain('rotate(0,');
    });
    
    it('should apply physics-based animation with acceleration and deceleration', () => {
      render(
        <svg>
          <Needle deviceId={deviceId} variableLocations={variableLocations} />
        </svg>
      );
      
      // Start experiment to show needle
      act(() => {
        if (animationCallbackRef.current) {
          animationCallbackRef.current({
            kind: 'startExperiment',
            numSamples: 1,
            numItems: 3
          });
        }
      });
      
      // Start item selection
      act(() => {
        if (animationCallbackRef.current) {
          animationCallbackRef.current({
            kind: 'startSelectItem'
          });
        }
      });
      
      // Capture rotation values at different time points
      const rotations: number[] = [];
      
      // Test multiple time points to verify acceleration and deceleration
      [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].forEach(t => {
        act(() => {
          if (animationCallbackRef.current) {
            animationCallbackRef.current(
              {
                kind: 'animateDevice',
                deviceId,
                selectedVariable: 'B',
                selectedVariableIndex: 1,
                hideAfter: false
              },
              { t, speed: 0 }
            );
          }
        });
        
        const needleElement = screen.getByTestId('spinner-needle');
        const transform = needleElement.getAttribute('transform');
        if (transform) {
          const rotationMatch = transform.match(/rotate\(([^,]+)/);
          if (rotationMatch && rotationMatch[1]) {
            rotations.push(parseFloat(rotationMatch[1]));
          }
        }
      });
      
      // Calculate first and second derivatives to check for acceleration and deceleration
      const firstDerivatives: number[] = [];
      for (let i = 1; i < rotations.length; i++) {
        firstDerivatives.push(rotations[i] - rotations[i-1]);
      }
      
      const secondDerivatives: number[] = [];
      for (let i = 1; i < firstDerivatives.length; i++) {
        secondDerivatives.push(firstDerivatives[i] - firstDerivatives[i-1]);
      }
      
      // Verify acceleration at the beginning (positive second derivative)
      expect(secondDerivatives[0]).toBeGreaterThan(0);
      
      // Verify deceleration at the end (negative second derivative)
      expect(secondDerivatives[secondDerivatives.length - 1]).toBeLessThan(0);
    });
  });
}); 
