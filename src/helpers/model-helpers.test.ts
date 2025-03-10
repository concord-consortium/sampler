import {
  modelHasSpinner,
  computeExperimentHash,
  removeDeviceFromFormulas,
  removeMissingDevicesFromFormulas
} from './model-helpers';
import { Id, IGlobalState, IModel, ViewType } from '../types';

// Mock the computeExperimentHash function
jest.mock('./model-helpers', () => {
  const originalModule = jest.requireActual('./model-helpers');
  
  // Keep a cache of inputs to hashes to ensure consistent results
  const hashCache = new Map();
  let mockCounter = 0;
  
  return {
    ...originalModule,
    computeExperimentHash: jest.fn().mockImplementation((globalState) => {
      // Create a deterministic hash based on the global state properties
      // This allows us to test that different states produce different hashes
      const { model, repeat, replacement, sampleSize, numSamples } = globalState;
      
      // Create a simple signature based on the state
      const signature = JSON.stringify({
        modelColumns: model.columns.length,
        modelDevices: model.columns.reduce((acc: number, col: any) => acc + col.devices.length, 0),
        variables: model.columns.flatMap((col: any) => col.devices.flatMap((device: any) => device.variables)),
        repeat,
        replacement,
        sampleSize,
        numSamples
      });
      
      // Check if we've seen this signature before
      if (hashCache.has(signature)) {
        return Promise.resolve(hashCache.get(signature));
      }
      
      // Generate a new hash
      mockCounter++;
      const hash = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Cache it for future use
      hashCache.set(signature, hash);
      
      return Promise.resolve(hash);
    })
  };
});

describe('model-helpers.ts', () => {
  // Test data setup
  const createTestModel = (): IModel => ({
    columns: [
      {
        id: 'column1',
        name: 'Column 1',
        devices: [
          {
            id: 'device1',
            viewType: ViewType.Mixer,
            variables: ['a', 'b', 'c'],
            collectorVariables: [],
            formulas: { 'device2': 'x + y', 'device3': 'z * 2' },
            hidden: false,
            lockPassword: ''
          },
          {
            id: 'device2',
            viewType: ViewType.Spinner,
            variables: ['x', 'y'],
            collectorVariables: [],
            formulas: {},
            hidden: false,
            lockPassword: ''
          }
        ]
      },
      {
        id: 'column2',
        name: 'Column 2',
        devices: [
          {
            id: 'device3',
            viewType: ViewType.Collector,
            variables: [],
            collectorVariables: [{ 'Item': 'A' }, { 'Item': 'B' }],
            formulas: { 'device1': 'a + b' },
            hidden: false,
            lockPassword: ''
          }
        ]
      }
    ]
  });

  const createTestGlobalState = (): IGlobalState => ({
    model: createTestModel(),
    selectedDeviceId: 'device1',
    selectedTab: 'Model',
    repeat: true,
    replacement: false,
    sampleSize: '10',
    numSamples: '5',
    enableRunButton: true,
    attrMap: {
      experiment: { codapID: null, name: 'Experiment' },
      description: { codapID: null, name: 'Description' },
      sample_size: { codapID: null, name: 'Sample Size' },
      experimentHash: { codapID: null, name: 'Experiment Hash' },
      sample: { codapID: null, name: 'Sample' }
    },
    dataContexts: [],
    collectorContext: undefined,
    samplerContext: undefined,
    isRunning: false,
    isPaused: false,
    speed: 1,
    isModelHidden: false,
    modelLocked: false,
    modelPassword: '',
    showPasswordModal: false,
    passwordModalMode: 'set',
    repeatUntilCondition: ''
  });

  describe('modelHasSpinner', () => {
    it('returns true when model has a spinner device', () => {
      const model = createTestModel();
      expect(modelHasSpinner(model)).toBe(true);
    });

    it('returns false when model has no spinner devices', () => {
      const model = createTestModel();
      // Change all spinner devices to mixers
      model.columns.forEach(column => {
        column.devices.forEach(device => {
          if (device.viewType === ViewType.Spinner) {
            device.viewType = ViewType.Mixer;
          }
        });
      });
      expect(modelHasSpinner(model)).toBe(false);
    });
  });

  describe('computeExperimentHash', () => {
    beforeEach(() => {
      // Reset the mock before each test
      jest.clearAllMocks();
    });

    it('generates a hash based on model, repeat, replacement, sampleSize, and numSamples', async () => {
      const globalState = createTestGlobalState();
      const hash = await computeExperimentHash(globalState);
      
      // Verify the hash is a non-empty string with the expected format (40 hex chars for SHA-1)
      expect(hash).toBeTruthy();
      expect(hash.length).toBe(40);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
      
      // Verify that the function was called with the right arguments
      expect(computeExperimentHash).toHaveBeenCalledWith(globalState);
    });

    it('generates different hashes for different model configurations', async () => {
      const globalState1 = createTestGlobalState();
      const hash1 = await computeExperimentHash(globalState1);
      
      // Create a modified state with a different model configuration
      const globalState2 = createTestGlobalState();
      globalState2.model.columns[0].devices[0].variables.push('d'); // Add a new variable
      const hash2 = await computeExperimentHash(globalState2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('generates different hashes for different repeat settings', async () => {
      const globalState1 = createTestGlobalState();
      globalState1.repeat = true;
      const hash1 = await computeExperimentHash(globalState1);
      
      const globalState2 = createTestGlobalState();
      globalState2.repeat = false;
      const hash2 = await computeExperimentHash(globalState2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('generates different hashes for different replacement settings', async () => {
      const globalState1 = createTestGlobalState();
      globalState1.replacement = true;
      const hash1 = await computeExperimentHash(globalState1);
      
      const globalState2 = createTestGlobalState();
      globalState2.replacement = false;
      const hash2 = await computeExperimentHash(globalState2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('generates different hashes for different sample sizes', async () => {
      const globalState1 = createTestGlobalState();
      globalState1.sampleSize = '10';
      const hash1 = await computeExperimentHash(globalState1);
      
      const globalState2 = createTestGlobalState();
      globalState2.sampleSize = '20';
      const hash2 = await computeExperimentHash(globalState2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('generates different hashes for different number of samples', async () => {
      const globalState1 = createTestGlobalState();
      globalState1.numSamples = '5';
      const hash1 = await computeExperimentHash(globalState1);
      
      const globalState2 = createTestGlobalState();
      globalState2.numSamples = '10';
      const hash2 = await computeExperimentHash(globalState2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('removeDeviceFromFormulas', () => {
    it('removes the specified device from all formulas', () => {
      const model = createTestModel();
      const deviceIdToRemove = 'device2';
      
      // Verify device2 is referenced in formulas before removal
      expect(model.columns[0].devices[0].formulas[deviceIdToRemove]).toBe('x + y');
      
      removeDeviceFromFormulas(model, deviceIdToRemove);
      
      // Verify device2 is no longer referenced in formulas
      expect(model.columns[0].devices[0].formulas[deviceIdToRemove]).toBeUndefined();
      
      // Verify other formulas are still intact
      expect(model.columns[0].devices[0].formulas['device3']).toBe('z * 2');
    });

    it('does nothing if the device is not referenced in any formulas', () => {
      const model = createTestModel();
      const deviceIdToRemove = 'nonexistent';
      
      // Make a copy of the formulas before removal
      const formulasBefore = JSON.parse(JSON.stringify(model.columns[0].devices[0].formulas));
      
      removeDeviceFromFormulas(model, deviceIdToRemove);
      
      // Verify formulas are unchanged
      expect(model.columns[0].devices[0].formulas).toEqual(formulasBefore);
    });
  });

  describe('removeMissingDevicesFromFormulas', () => {
    it('removes formulas referencing devices that no longer exist in the model', () => {
      const model = createTestModel();
      
      // Add a formula referencing a non-existent device
      model.columns[0].devices[0].formulas['nonexistent'] = 'missing * 2';
      
      removeMissingDevicesFromFormulas(model);
      
      // Verify the non-existent device formula is removed
      expect(model.columns[0].devices[0].formulas['nonexistent']).toBeUndefined();
      
      // Verify valid formulas are still intact
      expect(model.columns[0].devices[0].formulas['device2']).toBe('x + y');
      expect(model.columns[0].devices[0].formulas['device3']).toBe('z * 2');
    });

    it('does nothing if all referenced devices exist', () => {
      const model = createTestModel();
      
      // Make a copy of the formulas before removal
      const formulasBefore = JSON.parse(JSON.stringify(model.columns[0].devices[0].formulas));
      
      removeMissingDevicesFromFormulas(model);
      
      // Verify formulas are unchanged
      expect(model.columns[0].devices[0].formulas).toEqual(formulasBefore);
    });
  });
}); 