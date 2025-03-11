import { useGlobalStateContext } from './useGlobalState';

/**
 * Hook to access the reduced motion setting
 * @returns The current reduced motion setting
 */
export const useReducedMotion = (): boolean => {
  const { globalState } = useGlobalStateContext();
  return globalState.reduceMotion;
}; 