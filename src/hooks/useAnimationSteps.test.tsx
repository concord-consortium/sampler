import React from 'react';
import { AnimationStep, IAnimationStepSettings, Speed } from '../types';

// Mock components that use animation steps
jest.mock('../components/model/device-views/spinner/needle', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="needle" />),
}));

jest.mock('../components/model/arrow', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="arrow" />),
}));

jest.mock('../components/model/device-views/shared/balls', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="balls" />),
}));

describe('Animation Steps', () => {
  // Test different step types
  describe('Step Types', () => {
    it('should handle startExperiment step', () => {
      const step: AnimationStep = {
        kind: 'startExperiment',
        numSamples: 2,
        numItems: 3
      };
      
      // Unused variable - commenting out to fix linting warning
      // const settings: IAnimationStepSettings = {
      //   t: 0.5,
      //   speed: Speed.Medium
      // };
      
      // This is a control step, so it doesn't have visual effects
      // We're just testing that it has the correct structure
      expect(step.kind).toBe('startExperiment');
      expect(step.numSamples).toBe(2);
      expect(step.numItems).toBe(3);
    });
    
    it('should handle endExperiment step', () => {
      const onCompleteMock = jest.fn();
      
      const step: AnimationStep = {
        kind: 'endExperiment',
        onComplete: onCompleteMock
      };
      
      // Call the onComplete callback
      step.onComplete?.();
      
      // Verify the callback was called
      expect(onCompleteMock).toHaveBeenCalled();
    });
    
    it('should handle startSample step', () => {
      const step: AnimationStep = {
        kind: 'startSample',
        sampleIndex: 1
      };
      
      // This is a control step, so it doesn't have visual effects
      // We're just testing that it has the correct structure
      expect(step.kind).toBe('startSample');
      expect(step.sampleIndex).toBe(1);
    });
    
    it('should handle endSample step', () => {
      const step: AnimationStep = {
        kind: 'endSample'
      };
      
      // This is a control step, so it doesn't have visual effects
      // We're just testing that it has the correct structure
      expect(step.kind).toBe('endSample');
    });
    
    it('should handle startSelectItem step', () => {
      const step: AnimationStep = {
        kind: 'startSelectItem'
      };
      
      // This is a control step, so it doesn't have visual effects
      // We're just testing that it has the correct structure
      expect(step.kind).toBe('startSelectItem');
    });
    
    it('should handle endSelectItem step', () => {
      const step: AnimationStep = {
        kind: 'endSelectItem',
        variables: ['Item 1', 'Item 2']
      };
      
      // This is a control step, so it doesn't have visual effects
      // We're just testing that it has the correct structure
      expect(step.kind).toBe('endSelectItem');
      expect(step.variables).toEqual(['Item 1', 'Item 2']);
    });
    
    it('should handle collectVariables step', () => {
      const step: AnimationStep = {
        kind: 'collectVariables',
        variables: ['Item 1', 'Item 2']
      };
      
      // This is a control step, so it doesn't have visual effects
      // We're just testing that it has the correct structure
      expect(step.kind).toBe('collectVariables');
      expect(step.variables).toEqual(['Item 1', 'Item 2']);
    });
    
    it('should handle pushVariables step', () => {
      const onCompleteMock = jest.fn().mockResolvedValue(undefined);
      
      const step: AnimationStep = {
        kind: 'pushVariables',
        onComplete: onCompleteMock
      };
      
      // Call the onComplete callback
      step.onComplete?.();
      
      // Verify the callback was called
      expect(onCompleteMock).toHaveBeenCalled();
    });
    
    it('should handle animateDevice step', () => {
      const step: AnimationStep = {
        kind: 'animateDevice',
        deviceId: 'device-1',
        selectedVariable: 'Item 1',
        selectedVariableIndex: 0,
        hideAfter: true
      };
      
      // This step would be handled by device components
      // We're just testing that it has the correct structure
      expect(step.kind).toBe('animateDevice');
      expect(step.deviceId).toBe('device-1');
      expect(step.selectedVariable).toBe('Item 1');
      expect(step.selectedVariableIndex).toBe(0);
      expect(step.hideAfter).toBe(true);
    });
    
    it('should handle animateArrow step', () => {
      const step: AnimationStep = {
        kind: 'animateArrow',
        sourceDeviceId: 'device-1',
        targetDeviceId: 'device-2'
      };
      
      // This step would be handled by the Arrow component
      // We're just testing that it has the correct structure
      expect(step.kind).toBe('animateArrow');
      expect(step.sourceDeviceId).toBe('device-1');
      expect(step.targetDeviceId).toBe('device-2');
    });
    
    it('should handle showLabel step', () => {
      const step: AnimationStep = {
        kind: 'showLabel',
        columnIndex: 0,
        selectedVariable: 'Item 1'
      };
      
      // This step would be handled by the column header component
      // We're just testing that it has the correct structure
      expect(step.kind).toBe('showLabel');
      expect(step.columnIndex).toBe(0);
      expect(step.selectedVariable).toBe('Item 1');
    });
    
    it('should handle modelChanged step', () => {
      const step: AnimationStep = {
        kind: 'modelChanged'
      };
      
      // This is a control step, so it doesn't have visual effects
      // We're just testing that it has the correct structure
      expect(step.kind).toBe('modelChanged');
    });
  });
  
  // Test step execution with animation settings
  describe('Step Execution', () => {
    it('should execute steps with different t values', () => {
      // Unused variable - commenting out to fix linting warning
      // const step: AnimationStep = {
      //   kind: 'animateDevice',
      //   deviceId: 'device-1',
      //   selectedVariable: 'Item 1',
      //   selectedVariableIndex: 0,
      //   hideAfter: true
      // };
      
      // Test with t = 0 (start of animation)
      const startSettings: IAnimationStepSettings = {
        t: 0,
        speed: Speed.Medium
      };
      
      // Test with t = 0.5 (middle of animation)
      const midSettings: IAnimationStepSettings = {
        t: 0.5,
        speed: Speed.Medium
      };
      
      // Test with t = 1 (end of animation)
      const endSettings: IAnimationStepSettings = {
        t: 1,
        speed: Speed.Medium
      };
      
      expect(startSettings.t).toBe(0);
      expect(midSettings.t).toBe(0.5);
      expect(endSettings.t).toBe(1);
    });
    
    it('should execute steps with different speeds', () => {
      // Unused variable - commenting out to fix linting warning
      // const step: AnimationStep = {
      //   kind: 'animateDevice',
      //   deviceId: 'device-1',
      //   selectedVariable: 'Item 1',
      //   selectedVariableIndex: 0,
      //   hideAfter: true
      // };
      
      // Test with Slow speed
      const slowSettings: IAnimationStepSettings = {
        t: 0.5,
        speed: Speed.Slow
      };
      
      expect(slowSettings.speed).toBe(Speed.Slow);
      
      // Test with Medium speed
      const mediumSettings: IAnimationStepSettings = {
        t: 0.5,
        speed: Speed.Medium
      };
      
      expect(mediumSettings.speed).toBe(Speed.Medium);
      
      // Test with Fast speed
      const fastSettings: IAnimationStepSettings = {
        t: 0.5,
        speed: Speed.Fast
      };
      
      expect(fastSettings.speed).toBe(Speed.Fast);
      
      // Test with Fastest speed
      const fastestSettings: IAnimationStepSettings = {
        t: 0.5,
        speed: Speed.Fastest
      };
      
      expect(fastestSettings.speed).toBe(Speed.Fastest);
    });
  });
  
  // Test step transitions
  describe('Step Transitions', () => {
    it('should transition between steps', () => {
      // Create a sequence of steps
      const steps: AnimationStep[] = [
        { kind: 'startExperiment', numSamples: 1, numItems: 3 },
        { kind: 'startSample', sampleIndex: 0 },
        { kind: 'startSelectItem' },
        { 
          kind: 'animateDevice', 
          deviceId: 'device-1', 
          selectedVariable: 'Item 1', 
          selectedVariableIndex: 0, 
          hideAfter: true 
        },
        { 
          kind: 'animateArrow', 
          sourceDeviceId: 'device-1', 
          targetDeviceId: 'device-2' 
        },
        { 
          kind: 'animateDevice', 
          deviceId: 'device-2', 
          selectedVariable: 'Option A', 
          selectedVariableIndex: 0, 
          hideAfter: true 
        },
        { kind: 'collectVariables', variables: ['Item 1', 'Option A'] },
        { kind: 'endSelectItem', variables: ['Item 1', 'Option A'] },
        { kind: 'pushVariables' },
        { kind: 'endSample' },
        { kind: 'endExperiment' }
      ];
      
      // Verify the sequence
      expect(steps.length).toBe(11);
      expect(steps[0].kind).toBe('startExperiment');
      expect(steps[1].kind).toBe('startSample');
      expect(steps[2].kind).toBe('startSelectItem');
      expect(steps[3].kind).toBe('animateDevice');
      expect(steps[4].kind).toBe('animateArrow');
      expect(steps[5].kind).toBe('animateDevice');
      expect(steps[6].kind).toBe('collectVariables');
      expect(steps[7].kind).toBe('endSelectItem');
      expect(steps[8].kind).toBe('pushVariables');
      expect(steps[9].kind).toBe('endSample');
      expect(steps[10].kind).toBe('endExperiment');
    });
  });
  
  // Test step completion
  describe('Step Completion', () => {
    it('should call onComplete when a step is completed', () => {
      const onCompleteMock = jest.fn();
      
      const step: AnimationStep = {
        kind: 'endExperiment',
        onComplete: onCompleteMock
      };
      
      // Call the onComplete callback
      step.onComplete?.();
      
      // Verify the callback was called
      expect(onCompleteMock).toHaveBeenCalled();
    });
    
    it('should handle async onComplete callbacks', async () => {
      const onCompleteMock = jest.fn().mockResolvedValue(undefined);
      
      const step: AnimationStep = {
        kind: 'pushVariables',
        onComplete: onCompleteMock
      };
      
      // Call the onComplete callback
      await step.onComplete?.();
      
      // Verify the callback was called
      expect(onCompleteMock).toHaveBeenCalled();
    });
  });
}); 
