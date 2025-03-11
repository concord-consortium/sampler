import { useRef, useState, useEffect } from 'react';
import { AnimationCallback, AnimationStep, IAnimationStepSettings } from '../types';
import { useAnimationContext } from './useAnimation';
import { calculateEasedRotation } from '../components/model/device-views/spinner/animation-helpers';

interface SpinnerAnimationState {
  isAnimating: boolean;
  animationProgress: number;
  rotation: number;
  targetVariable: string | null;
  targetVariableIndex: number | null;
}

interface UseSpinnerAnimationProps {
  deviceId: string;
  variableLocations: Record<string, { lastPercent: number; currPercent: number }>;
}

/**
 * Custom hook for managing spinner animation state
 * Handles rotation, animation progress, and target variable tracking
 */
export const useSpinnerAnimation = ({ deviceId, variableLocations }: UseSpinnerAnimationProps) => {
  const { registerAnimationCallback } = useAnimationContext();
  const [animationState, setAnimationState] = useState<SpinnerAnimationState>({
    isAnimating: false,
    animationProgress: 0,
    rotation: 0,
    targetVariable: null,
    targetVariableIndex: null
  });
  
  // Use refs to avoid binding over state values in the animation function
  const startRotationRef = useRef(0);
  const currentRotationRef = useRef(0);
  const endRotationRef = useRef(0);
  const variableLocationsRef = useRef<Record<string, { lastPercent: number; currPercent: number }>>({});
  const isAnimatingRef = useRef(false);
  const targetVariableRef = useRef<string | null>(null);
  const targetVariableIndexRef = useRef<number | null>(null);
  
  // Update refs when props change
  variableLocationsRef.current = variableLocations;
  
  /**
   * Animation callback function that handles different animation steps
   */
  const animate: AnimationCallback = (step: AnimationStep, settings?: IAnimationStepSettings) => {
    const { kind } = step;
    const reduceMotion = settings?.reduceMotion || false;
    
    if (kind === "startExperiment") {
      // Reset animation state at the start of an experiment
      currentRotationRef.current = 0;
      isAnimatingRef.current = false;
      targetVariableRef.current = null;
      targetVariableIndexRef.current = null;
      
      setAnimationState({
        isAnimating: false,
        animationProgress: 0,
        rotation: 0,
        targetVariable: null,
        targetVariableIndex: null
      });
    } 
    else if (kind === "startSelectItem") {
      // Store the current rotation as the starting point
      startRotationRef.current = currentRotationRef.current;
      endRotationRef.current = -1; // Set to -1 to recalculate the end rotation when animating
      isAnimatingRef.current = true;
      
      setAnimationState(prev => ({
        ...prev,
        isAnimating: true,
        animationProgress: 0
      }));
    }
    else if (kind === "animateDevice" && step.deviceId === deviceId) {
      if (!isAnimatingRef.current) return;
      
      const { t = 0 } = settings || {};
      
      // If this is the first animation frame, determine the target variable
      if (targetVariableRef.current === null) {
        targetVariableRef.current = step.selectedVariable;
        targetVariableIndexRef.current = step.selectedVariableIndex;
        
        // Calculate the end rotation based on the target variable's position
        if (endRotationRef.current === -1 && targetVariableRef.current) {
          const targetLocation = variableLocationsRef.current[targetVariableRef.current];
          if (targetLocation) {
            // Calculate the angle in degrees (0-360) based on the percentage position
            const endAngle = targetLocation.currPercent * 360;
            endRotationRef.current = endAngle;
          }
        }
      }
      
      // Calculate the current rotation based on animation progress
      let newRotation;
      
      if (reduceMotion) {
        // If reduced motion is enabled, skip directly to the end rotation
        newRotation = endRotationRef.current;
      } else {
        // Otherwise, use the eased rotation calculation
        newRotation = calculateEasedRotation(
          startRotationRef.current,
          endRotationRef.current,
          t
        );
      }
      
      currentRotationRef.current = newRotation;
      
      setAnimationState(prev => ({
        ...prev,
        rotation: newRotation,
        animationProgress: t,
        targetVariable: targetVariableRef.current,
        targetVariableIndex: targetVariableIndexRef.current
      }));
    }
    else if (kind === "endSelectItem") {
      // Animation for this item selection is complete
      isAnimatingRef.current = false;
      
      setAnimationState(prev => ({
        ...prev,
        isAnimating: false,
        animationProgress: 1
      }));
    }
    else if (kind === "endExperiment") {
      // Reset all animation state at the end of the experiment
      isAnimatingRef.current = false;
      targetVariableRef.current = null;
      targetVariableIndexRef.current = null;
      
      setAnimationState({
        isAnimating: false,
        animationProgress: 0,
        rotation: 0,
        targetVariable: null,
        targetVariableIndex: null
      });
    }
  };
  
  // Register the animation callback
  useEffect(() => {
    return registerAnimationCallback(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return {
    ...animationState,
    isAnimationTarget: (variableName: string) => 
      animationState.isAnimating && animationState.targetVariable === variableName
  };
}; 
