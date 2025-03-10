/**
 * This test file focuses on improving function coverage for codap-helpers.tsx
 * Targeting functions: deleteAll, evaluateResult, getCollectionNames, createWideTable
 */

import { deleteAll, evaluateResult, kDataContextName, hasSamplesCollection } from './codap-helpers';
import { codapInterface, getDataContext } from '@concord-consortium/codap-plugin-api';
import { AttrMap } from '../types';

// Mock the codap-plugin-api
jest.mock('@concord-consortium/codap-plugin-api', () => ({
  codapInterface: {
    sendRequest: jest.fn()
  },
  getDataContext: jest.fn()
}));

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('codap-helpers function coverage tests', () => {
  // Test for deleteAll function
  describe('deleteAll function', () => {
    it('should send a delete request for all cases in the experiment collection', async () => {
      // Create a mock AttrMap
      const mockAttrMap: AttrMap = {
        experiment: { name: 'Experiment', codapID: 'exp1' },
        description: { name: 'Description', codapID: 'desc1' },
        sample: { name: 'Sample', codapID: 'sample1' },
        sample_size: { name: 'Sample Size', codapID: 'size1' },
        experimentHash: { name: 'Experiment Hash', codapID: 'hash1' }
      };

      // Mock the sendRequest to resolve successfully
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({ success: true });

      // Call the function
      await deleteAll(mockAttrMap);

      // Verify the delete request was sent
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'delete',
        resource: `dataContext[${kDataContextName}].collection[${mockAttrMap.experiment.name}].allCases`
      });
    });
  });

  // Test for evaluateResult function
  describe('evaluateResult function', () => {
    it('should evaluate a formula and return the result', async () => {
      // Mock the sendRequest response for formula evaluation
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [42] // Mocking a successful formula evaluation result
      });

      // Call the function
      const result = await evaluateResult('a > 5', { a: '10' });

      // Verify the request was sent correctly
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'notify',
        resource: 'formulaEngine',
        values: {
          request: 'evalExpression',
          source: 'a > 5',
          records: [{ a: '10' }]
        }
      });

      // Verify the result
      expect(result).toBe(42);
    }, 15000); // Increase timeout to 15 seconds

    it('should throw an error when formula evaluation fails', async () => {
      // Mock the sendRequest response for a failed formula evaluation
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      // Call the function and expect it to throw
      await expect(evaluateResult('a > 5', { a: '10' })).rejects.toThrow('Formula evaluation failed');

      // Verify the request was sent correctly
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'notify',
        resource: 'formulaEngine',
        values: {
          request: 'evalExpression',
          source: 'a > 5',
          records: [{ a: '10' }]
        }
      });
    }, 15000); // Increase timeout to 15 seconds
  });

  // Test for hasSamplesCollection function (which uses getCollectionNames internally)
  describe('hasSamplesCollection function (tests getCollectionNames indirectly)', () => {
    it('should return true when samples collection exists', async () => {
      // Mock getDataContext to return a successful response with collections
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          collections: [
            { name: 'experiments' },
            { name: 'samples' },
            { name: 'items' }
          ]
        }
      });

      // Call the function
      const result = await hasSamplesCollection();

      // Verify the result
      expect(result).toBe(true);
      
      // Verify getDataContext was called with the correct context name
      expect(getDataContext).toHaveBeenCalledWith(kDataContextName);
    });

    it('should return false when samples collection does not exist', async () => {
      // Mock getDataContext to return a successful response without samples collection
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          collections: [
            { name: 'experiments' },
            { name: 'items' }
          ]
        }
      });

      // Call the function
      const result = await hasSamplesCollection();

      // Verify the result
      expect(result).toBe(false);
      
      // Verify getDataContext was called with the correct context name
      expect(getDataContext).toHaveBeenCalledWith(kDataContextName);
    });

    it('should return false when getDataContext fails', async () => {
      // Mock getDataContext to return a failed response
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      // Call the function
      const result = await hasSamplesCollection();

      // Verify the result
      expect(result).toBe(false);
      
      // Verify getDataContext was called with the correct context name
      expect(getDataContext).toHaveBeenCalledWith(kDataContextName);
    });
  });
}); 