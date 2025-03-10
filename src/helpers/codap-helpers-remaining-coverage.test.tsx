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
    sendRequest: jest.fn().mockImplementation(() => Promise.resolve({ success: true }))
  }
}));

const kDataContextName = 'Sampler';

describe('codap-helpers remaining coverage tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for line 205 - addMeasure with existing attribute update
  describe('addMeasure function', () => {
    it('should update an existing attribute when measureName is provided', async () => {
      // Set up a spy to track calls
      const sendRequestSpy = jest.spyOn(codapInterface, 'sendRequest');
      
      // Mock implementation for this specific test
      (codapInterface.sendRequest as jest.Mock)
        // First call - getCollectionList
        .mockImplementationOnce(() => {
          return Promise.resolve({
            success: true,
            values: ['samples']
          });
        })
        // Second call - getAttributeList
        .mockImplementationOnce(() => {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'existingMeasure' },
              { name: 'otherAttr' }
            ]
          });
        })
        // Third call - update attribute
        .mockImplementationOnce(() => {
          return Promise.resolve({
            success: true
          });
        });

      // Call the function
      await addMeasure('Mean', 'mean()', 'existingMeasure');
      
      // Verify the update request was made
      expect(sendRequestSpy).toHaveBeenCalledWith({
        action: 'update',
        resource: expect.stringContaining('existingMeasure'),
        values: {
          formula: 'mean()'
        }
      });
    }, 10000);
  });

  // Test for line 236 - getNewExperimentInfo error handling
  describe('getNewExperimentInfo function', () => {
    it('should throw an error when data context is not found', async () => {
      // Mock implementation for this specific test
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        if (request.resource && request.resource.includes('allItems')) {
          return Promise.resolve({
            success: false
          });
        }
        return Promise.resolve({ success: true });
      });

      // Use try/catch instead of expect().rejects to avoid timeout issues
      try {
        await getNewExperimentInfo('hash123');
        // If we get here, the test should fail
        fail('Expected getNewExperimentInfo to throw an error');
      } catch (error: any) {
        expect(error.message).toBe('Sorry, the data context was not found!');
      }
    }, 10000);
  });

  // Test for line 500 - renameAttribute with attribute without formula
  describe('renameAttribute function', () => {
    it('should handle attributes without formulas', async () => {
      // Mock implementation for this specific test
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        // For getCollectionList
        if (request.resource && request.resource.includes('collectionList')) {
          return Promise.resolve({
            success: true,
            values: ['samples']
          });
        } 
        // For getAttributeList
        else if (request.resource && request.resource.includes('attributeList')) {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'oldAttr' },
              { name: 'otherAttr', formula: null } // Attribute without formula
            ]
          });
        } 
        // For getAllCases
        else if (request.resource && request.resource.includes('allCases')) {
          return Promise.resolve({
            success: true,
            values: {
              cases: [
                { id: 1, values: { oldAttr: 'value1' } },
                { id: 2, values: { oldAttr: 'value2' } }
              ]
            }
          });
        } 
        // For componentList
        else if (request.resource === 'componentList') {
          return Promise.resolve({
            success: true,
            values: []
          });
        }
        // Default response
        return Promise.resolve({ success: true });
      });

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log');

      // Call the function with a short timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test timed out')), 5000);
      });
      
      await Promise.race([
        renameAttribute(kDataContextName, 'samples', 'oldAttr', 'newAttr'),
        timeoutPromise
      ]);
      
      // Verify console.log was called for attribute without formula
      expect(consoleSpy).toHaveBeenCalledWith('Attribute otherAttr does not have a formula');
      
      consoleSpy.mockRestore();
    }, 10000);
  });
}); 