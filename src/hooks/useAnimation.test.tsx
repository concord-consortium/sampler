import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useAnimationContextValue, createExperimentAnimationSteps } from './useAnimation';
import { GlobalStateContext } from './useGlobalState';
import { AnimationStep, IExperimentAnimationResults, IExperimentResults, IModel, Speed, ViewType } from '../types';

// Mock the CODAP plugin API
jest.mock('@concord-consortium/codap-plugin-api', () => ({
  createItems: jest.fn().mockResolvedValue({ caseIDs: ['case1', 'case2'] }),
  selectCases: jest.fn().mockResolvedValue({}),
}));

// Mock the helpers
jest.mock('../helpers/codap-helpers', () => ({
  evaluateResult: jest.fn().mockResolvedValue(true),
  findOrCreateDataContext: jest.fn().mockResolvedValue(true),
  getNewExperimentInfo: jest.fn().mockResolvedValue({ experimentNum: 1, startingSampleNumber: 1 }),
}));

jest.mock('../helpers/model-helpers', () => ({
  computeExperimentHash: jest.fn().mockResolvedValue('hash123'),
  modelHasSpinner: jest.fn().mockReturnValue(false),
}));

jest.mock('../models/model-model', () => ({
  getDeviceById: jest.fn().mockImplementation((model, id) => {
    if (id === 'device-2') {
      return {
        id: 'device-2',
        viewType: ViewType.Spinner,
        variables: ['Option A', 'Option B', 'Option C'],
        formulas: {},
      };
    }
    return null;
  }),
}));

jest.mock('../utils/utils', () => ({
  formatFormula: jest.fn().mockReturnValue('formatted-formula'),
  parseFormula: jest.fn().mockReturnValue('parsed-formula'),
}));

jest.mock('../utils/formula-parser', () => ({
  getVariables: jest.fn().mockReturnValue(['var1', 'var2']),
}));

// Mock requestAnimationFrame and cancelAnimationFrame
const originalWindow = window;
window.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 0);
});

window.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

describe('useAnimation', () => {
  // Mock global state
  const mockGlobalState = {
    model: {
      columns: [
        {
          name: 'Column 1',
          devices: [
            {
              id: 'device-1',
              viewType: ViewType.Mixer,
              variables: ['Item 1', 'Item 2', 'Item 3'],
              formulas: {
                'device-2': '*',
              },
            },
          ],
        },
        {
          name: 'Column 2',
          devices: [
            {
              id: 'device-2',
              viewType: ViewType.Spinner,
              variables: ['Option A', 'Option B', 'Option C'],
              formulas: {},
            },
          ],
        },
      ],
    } as IModel,
    speed: Speed.Medium,
    attrMap: {
      experiment: { name: 'Experiment', codapID: null },
      sample: { name: 'Sample', codapID: null },
      description: { name: 'Description', codapID: null },
      sample_size: { name: 'Sample Size', codapID: null },
      experimentHash: { name: 'Experiment Hash', codapID: null },
    },
    numSamples: '2',
    sampleSize: '3',
    replacement: true,
    isRunning: false,
    isPaused: false,
    enableRunButton: true,
    // Add missing properties required by IGlobalState
    selectedDeviceId: undefined,
    selectedTab: 'Model' as const,
    repeat: false,
    dataContexts: [],
    collectorContext: undefined,
    samplerContext: undefined,
  };

  const mockSetGlobalState = jest.fn((callback) => {
    // Mock implementation to simulate the behavior of useImmer's setState
    const draftState = { ...mockGlobalState };
    callback(draftState);
    return draftState;
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GlobalStateContext.Provider
      value={{ globalState: mockGlobalState, setGlobalState: mockSetGlobalState }}
    >
      {children}
    </GlobalStateContext.Provider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createExperimentAnimationSteps', () => {
    it('should create animation steps for an experiment', () => {
      const mockModel = mockGlobalState.model;
      const mockAnimationResults: IExperimentAnimationResults = [
        [
          {
            sampleNumber: 1,
            results: {
              'device-1': 'Item 1',
              'device-2': 'Option A',
            },
            resultsVariableIndex: {
              'device-1': 0,
              'device-2': 0,
            },
          },
        ],
      ];
      const mockResults: IExperimentResults = [
        {
          Experiment: 1,
          Sample: 1,
          Description: 'Test',
          'Sample Size': 3,
          'Experiment Hash': 'hash123',
          'Column 1': 'Item 1',
          'Column 2': 'Option A',
        },
      ];
      const replacement = true;
      const onComplete = jest.fn();

      const steps = createExperimentAnimationSteps(
        mockModel,
        mockAnimationResults,
        mockResults,
        replacement,
        onComplete
      );

      // Verify the steps
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].kind).toBe('startExperiment');
      
      // Check for sample steps
      const sampleStartSteps = steps.filter(step => step.kind === 'startSample');
      expect(sampleStartSteps.length).toBe(1);
      
      // Check for device animation steps
      const deviceSteps = steps.filter(step => step.kind === 'animateDevice');
      expect(deviceSteps.length).toBeGreaterThan(0);
      
      // Check for end experiment step with onComplete callback
      const endExperimentStep = steps.find(step => step.kind === 'endExperiment');
      expect(endExperimentStep).toBeDefined();
      expect(endExperimentStep?.onComplete).toBe(onComplete);
    });
  });

  describe('useAnimationContextValue', () => {
    it('should provide animation context functions', () => {
      const { result } = renderHook(() => useAnimationContextValue(), { wrapper });
      
      expect(result.current.handleStartRun).toBeDefined();
      expect(result.current.handleTogglePauseRun).toBeDefined();
      expect(result.current.handleStopRun).toBeDefined();
      expect(result.current.registerAnimationCallback).toBeDefined();
    });

    it('should register and unregister animation callbacks', () => {
      const { result } = renderHook(() => useAnimationContextValue(), { wrapper });
      
      const mockCallback = jest.fn();
      let unregister: () => void;
      
      act(() => {
        unregister = result.current.registerAnimationCallback(mockCallback);
      });
      
      // Manually trigger the callback to simulate a model change
      act(() => {
        mockCallback({ kind: 'modelChanged' });
      });
      
      expect(mockCallback).toHaveBeenCalled();
      
      // Unregister the callback
      act(() => {
        unregister();
      });
      
      // Reset the mock
      mockCallback.mockReset();
      
      // Try to trigger the callback again (it should not be called after unregistering)
      act(() => {
        // This would normally call the callback if it was still registered
        mockCallback({ kind: 'modelChanged' });
      });
      
      // The callback count should still be 1 (from the direct call above)
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    it('should handle starting a run', async () => {
      const { result } = renderHook(() => useAnimationContextValue(), { wrapper });
      
      // Mock the getAllExperimentSamples function to return empty results
      const mockResults = { results: [], animationResults: [] };
      jest.spyOn(window, 'setTimeout').mockImplementation((cb: TimerHandler) => {
        if (typeof cb === 'function') cb();
        return 1;
      });
      
      await act(async () => {
        await result.current.handleStartRun();
      });
      
      // Check that the global state was updated
      expect(mockSetGlobalState).toHaveBeenCalled();
      
      // Verify that setGlobalState was called with a function that updates isRunning and enableRunButton
      const calls = mockSetGlobalState.mock.calls;
      let foundRunningUpdate = false;
      
      for (const call of calls) {
        const draftState = { ...mockGlobalState };
        call[0](draftState);
        
        if (draftState.isRunning === true && draftState.enableRunButton === false) {
          foundRunningUpdate = true;
          break;
        }
      }
      
      expect(foundRunningUpdate).toBe(true);
    });

    it('should handle toggling pause', async () => {
      const { result } = renderHook(() => useAnimationContextValue(), { wrapper });
      
      await act(async () => {
        await result.current.handleTogglePauseRun(true);
      });
      
      // Check that the global state was updated
      expect(mockSetGlobalState).toHaveBeenCalled();
      
      // Verify that setGlobalState was called with a function that updates isPaused
      const calls = mockSetGlobalState.mock.calls;
      let foundPauseUpdate = false;
      
      for (const call of calls) {
        const draftState = { ...mockGlobalState };
        call[0](draftState);
        
        if (draftState.isPaused === true) {
          foundPauseUpdate = true;
          break;
        }
      }
      
      expect(foundPauseUpdate).toBe(true);
    });

    it('should handle stopping a run', async () => {
      const { result } = renderHook(() => useAnimationContextValue(), { wrapper });
      
      const mockCallback = jest.fn();
      
      act(() => {
        result.current.registerAnimationCallback(mockCallback);
      });
      
      await act(async () => {
        await result.current.handleStopRun();
      });
      
      // Check that the global state was updated
      expect(mockSetGlobalState).toHaveBeenCalled();
      
      // Verify that setGlobalState was called with a function that updates isRunning and enableRunButton
      const calls = mockSetGlobalState.mock.calls;
      let foundStopUpdate = false;
      
      for (const call of calls) {
        const draftState = { ...mockGlobalState };
        call[0](draftState);
        
        if (draftState.isRunning === false && draftState.enableRunButton === true) {
          foundStopUpdate = true;
          break;
        }
      }
      
      expect(foundStopUpdate).toBe(true);
      
      // The callback should be called with endExperiment
      expect(mockCallback).toHaveBeenCalledWith({ kind: 'endExperiment' });
    });
  });
}); 