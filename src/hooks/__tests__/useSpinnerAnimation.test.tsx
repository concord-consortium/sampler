import { renderHook, act } from '@testing-library/react-hooks';
import { useSpinnerAnimation } from '../useSpinnerAnimation';
import { useAnimationContext } from '../useAnimation';
import { AnimationCallback } from '../../types';

// Mock the animation context
jest.mock('../useAnimation', () => ({
  useAnimationContext: jest.fn()
}));

describe('useSpinnerAnimation', () => {
  // Setup mock for animation context
  const registerAnimationCallbackMock = jest.fn();
  let animationCallback: AnimationCallback | null = null;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup the mock implementation
    registerAnimationCallbackMock.mockImplementation((callback) => {
      animationCallback = callback;
      return jest.fn(); // Return unregister function
    });
    
    (useAnimationContext as jest.Mock).mockReturnValue({
      registerAnimationCallback: registerAnimationCallbackMock
    });
  });
  
  const deviceId = 'spinner-1';
  const variableLocations = {
    'A': { lastPercent: 0, currPercent: 0.25 },
    'B': { lastPercent: 0.25, currPercent: 0.25 },
    'C': { lastPercent: 0.5, currPercent: 0.5 }
  };
  
  it('should register animation callback on mount', () => {
    renderHook(() => useSpinnerAnimation({ deviceId, variableLocations }));
    
    expect(registerAnimationCallbackMock).toHaveBeenCalled();
    expect(animationCallback).not.toBeNull();
  });
  
  it('should initialize with default animation state', () => {
    const { result } = renderHook(() => useSpinnerAnimation({ deviceId, variableLocations }));
    
    expect(result.current.isAnimating).toBe(false);
    expect(result.current.animationProgress).toBe(0);
    expect(result.current.rotation).toBe(0);
    expect(result.current.targetVariable).toBeNull();
    expect(result.current.targetVariableIndex).toBeNull();
  });
  
  it('should update animation state when experiment starts', () => {
    const { result } = renderHook(() => useSpinnerAnimation({ deviceId, variableLocations }));
    
    act(() => {
      if (animationCallback) {
        animationCallback({
          kind: 'startExperiment',
          numSamples: 1,
          numItems: 3
        });
      }
    });
    
    expect(result.current.isAnimating).toBe(false);
    expect(result.current.animationProgress).toBe(0);
    expect(result.current.rotation).toBe(0);
    expect(result.current.targetVariable).toBeNull();
    expect(result.current.targetVariableIndex).toBeNull();
  });
  
  it('should update animation state when item selection starts', () => {
    const { result } = renderHook(() => useSpinnerAnimation({ deviceId, variableLocations }));
    
    act(() => {
      if (animationCallback) {
        animationCallback({
          kind: 'startSelectItem'
        });
      }
    });
    
    expect(result.current.isAnimating).toBe(true);
    expect(result.current.animationProgress).toBe(0);
  });
  
  it('should update rotation and target during device animation', () => {
    const { result } = renderHook(() => useSpinnerAnimation({ deviceId, variableLocations }));
    
    // Start item selection
    act(() => {
      if (animationCallback) {
        animationCallback({
          kind: 'startSelectItem'
        });
      }
    });
    
    // Animate device with t=0.5 (halfway through animation)
    act(() => {
      if (animationCallback) {
        animationCallback(
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
    
    expect(result.current.isAnimating).toBe(true);
    expect(result.current.animationProgress).toBe(0.5);
    expect(result.current.rotation).toBeGreaterThan(0); // Rotation should have changed
    expect(result.current.targetVariable).toBe('B');
    expect(result.current.targetVariableIndex).toBe(1);
    
    // isAnimationTarget should return true for the target variable
    expect(result.current.isAnimationTarget('B')).toBe(true);
    expect(result.current.isAnimationTarget('A')).toBe(false);
  });
  
  it('should complete animation when item selection ends', () => {
    const { result } = renderHook(() => useSpinnerAnimation({ deviceId, variableLocations }));
    
    // Start item selection
    act(() => {
      if (animationCallback) {
        animationCallback({
          kind: 'startSelectItem'
        });
      }
    });
    
    // Animate device
    act(() => {
      if (animationCallback) {
        animationCallback(
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
    
    // End item selection
    act(() => {
      if (animationCallback) {
        animationCallback({
          kind: 'endSelectItem',
          variables: ['B']
        });
      }
    });
    
    expect(result.current.isAnimating).toBe(false);
    expect(result.current.animationProgress).toBe(1);
    // Target variable and rotation should be preserved
    expect(result.current.targetVariable).toBe('B');
    expect(result.current.targetVariableIndex).toBe(1);
  });
  
  it('should reset animation state when experiment ends', () => {
    const { result } = renderHook(() => useSpinnerAnimation({ deviceId, variableLocations }));
    
    // Start item selection and animate
    act(() => {
      if (animationCallback) {
        animationCallback({
          kind: 'startSelectItem'
        });
        animationCallback(
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
    
    // End experiment
    act(() => {
      if (animationCallback) {
        animationCallback({
          kind: 'endExperiment'
        });
      }
    });
    
    expect(result.current.isAnimating).toBe(false);
    expect(result.current.animationProgress).toBe(0);
    expect(result.current.rotation).toBe(0);
    expect(result.current.targetVariable).toBeNull();
    expect(result.current.targetVariableIndex).toBeNull();
  });
  
  it('should ignore animation steps for other devices', () => {
    const { result } = renderHook(() => useSpinnerAnimation({ deviceId, variableLocations }));
    
    // Start item selection
    act(() => {
      if (animationCallback) {
        animationCallback({
          kind: 'startSelectItem'
        });
      }
    });
    
    const initialState = { ...result.current };
    
    // Animate a different device
    act(() => {
      if (animationCallback) {
        animationCallback(
          {
            kind: 'animateDevice',
            deviceId: 'other-device',
            selectedVariable: 'X',
            selectedVariableIndex: 0,
            hideAfter: false
          },
          { t: 0.5, speed: 0 }
        );
      }
    });
    
    // State should not have changed
    expect(result.current).toEqual(initialState);
  });
}); 
