/**
 * This test file targets specific lines in codap-helpers.tsx for coverage
 * Lines targeted: 63-68, 79, 110-111, 117-156, 205, 236, 500
 */

import { 
  addMeasure,
  getNewExperimentInfo,
  renameAttribute
} from './codap-helpers';
import codapInterface from '../lib/codap-interface';

// Mock the codapInterface
jest.mock('../lib/codap-interface', () => ({
  __esModule: true,
  default: {
    sendRequest: jest.fn()
  }
}));

// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('codap-helpers targeted coverage tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for line 205 - addMeasure with existing attribute update
  describe('addMeasure function', () => {
    it('should update an existing attribute when measureName is provided', async () => {
      // Mock implementation
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        if (request.resource && request.resource.includes('collectionList')) {
          return Promise.resolve({
            success: true,
            values: ['samples']
          });
        } else if (request.resource && request.resource.includes('attributeList')) {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'existingMeasure' },
              { name: 'otherAttr' }
            ]
          });
        } else if (request.action === 'update' && 
                  request.resource && 
                  request.resource.includes('existingMeasure')) {
          return Promise.resolve({
            success: true
          });
        }
        return Promise.resolve({ success: true });
      });

      // Call the function
      await addMeasure('Mean', 'mean()', 'existingMeasure');
      
      // Verify the update request was made
      const calls = (codapInterface.sendRequest as jest.Mock).mock.calls;
      const updateCall = calls.find(call => 
        call[0].action === 'update' && 
        call[0].resource.includes('existingMeasure') &&
        call[0].values.formula === 'mean()'
      );
      
      expect(updateCall).toBeDefined();
    });
  });

  // Test for line 236 - getNewExperimentInfo error handling
  describe('getNewExperimentInfo function', () => {
    it('should throw an error when data context is not found', async () => {
      // Mock implementation
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        if (request.resource && request.resource.includes('allItems')) {
          return Promise.resolve({
            success: false
          });
        }
        return Promise.resolve({ success: true });
      });

      // Call the function and expect it to throw
      await expect(getNewExperimentInfo('hash123')).rejects.toThrow('Sorry, the data context was not found!');
    });
  });

  // Test for line 500 - renameAttribute with attribute without formula
  describe('renameAttribute function', () => {
    it('should handle attributes without formulas', async () => {
      // Mock implementation
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        if (request.resource && request.resource.includes('collectionList')) {
          return Promise.resolve({
            success: true,
            values: ['samples']
          });
        } else if (request.resource && request.resource.includes('attributeList')) {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'oldAttr' },
              { name: 'otherAttr', formula: null } // Attribute without formula
            ]
          });
        } else if (request.resource && request.resource.includes('allCases')) {
          return Promise.resolve({
            success: true,
            values: {
              cases: [
                { id: 1, values: { oldAttr: 'value1' } },
                { id: 2, values: { oldAttr: 'value2' } }
              ]
            }
          });
        } else if (request.resource === 'componentList') {
          return Promise.resolve({
            success: true,
            values: []
          });
        }
        
        return Promise.resolve({ success: true });
      });

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log');
      
      // Call the function
      await renameAttribute('Sampler', 'samples', 'oldAttr', 'newAttr');
      
      // Verify console.log was called for attribute without formula
      expect(consoleSpy).toHaveBeenCalledWith('Attribute otherAttr does not have a formula');
    });
  });
}); 