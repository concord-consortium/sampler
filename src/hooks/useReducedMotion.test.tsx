import { renderHook } from '@testing-library/react-hooks';
import { useReducedMotion } from './useReducedMotion';
import { useGlobalStateContext } from './useGlobalState';

// Mock the useGlobalStateContext hook
jest.mock('./useGlobalState', () => ({
  useGlobalStateContext: jest.fn()
}));

describe('useReducedMotion', () => {
  it('should return the reduceMotion value from global state', () => {
    // Mock the global state with reduceMotion set to true
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { reduceMotion: true }
    });
    
    const { result } = renderHook(() => useReducedMotion());
    
    // Check that the hook returns the correct value
    expect(result.current).toBe(true);
    
    // Mock the global state with reduceMotion set to false
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { reduceMotion: false }
    });
    
    const { result: result2 } = renderHook(() => useReducedMotion());
    
    // Check that the hook returns the correct value
    expect(result2.current).toBe(false);
  });
}); 