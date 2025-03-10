import { 
  getNewExperimentInfo,
  addMeasure,
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

const kDataContextName = 'Sampler';

describe('codap-helpers final uncovered lines tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for line 205
  describe('addMeasure with existing attribute update', () => {
    it('should update an existing attribute when measureName is provided', async () => {
      // Mock the getCollectionList response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.resource.includes('collectionList')) {
          return Promise.resolve({
            success: true,
            values: ['experiments', 'samples', 'items']
          });
        }
        return Promise.resolve({ success: false });
      });

      // Mock the getAttributeList response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.resource.includes('attributeList')) {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'existingMeasure' },
              { name: 'otherAttr' }
            ]
          });
        }
        return Promise.resolve({ success: false });
      });

      // Mock the update request
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.action === 'update' && request.resource.includes('existingMeasure')) {
          return Promise.resolve({
            success: true
          });
        }
        return Promise.resolve({ success: false });
      });

      await addMeasure('Mean', 'mean()', 'existingMeasure');

      // Verify the update request was made
      const calls = (codapInterface.sendRequest as jest.Mock).mock.calls;
      const updateCall = calls.find(
        call => call[0].action === 'update' && 
               call[0].resource.includes('existingMeasure') &&
               call[0].values.formula === 'mean()'
      );
      
      expect(updateCall).toBeTruthy();
    });
  });

  // Test for line 236
  describe('getNewExperimentInfo error handling', () => {
    it('should throw an error when data context is not found', async () => {
      // Mock the getAllItems response - failure
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        if (request.resource.includes('allItems')) {
          return Promise.resolve({
            success: false
          });
        }
        return Promise.resolve({ success: false });
      });

      try {
        await getNewExperimentInfo('hash123');
        // If we get here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error: any) {
        expect(error.message).toBe('Sorry, the data context was not found!');
      }
    }, 10000); // Increase timeout to 10 seconds
  });

  // Test for line 500
  describe('renameAttribute with attribute without formula', () => {
    it('should handle attributes without formulas', async () => {
      // Mock the getCollectionList response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.resource.includes('collectionList')) {
          return Promise.resolve({
            success: true,
            values: ['samples']
          });
        }
        return Promise.resolve({ success: false });
      });

      // Mock the getAttributeList response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.resource.includes('attributeList')) {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'oldAttr' },
              { name: 'otherAttr', formula: null } // Attribute without formula
            ]
          });
        }
        return Promise.resolve({ success: false });
      });

      // Mock the getAllCases response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.resource.includes('allCases')) {
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
        return Promise.resolve({ success: false });
      });

      // Mock the componentList response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.resource === 'componentList') {
          return Promise.resolve({
            success: true,
            values: []
          });
        }
        return Promise.resolve({ success: false });
      });

      // Mock create attribute response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.action === 'create' && request.resource.includes('attribute')) {
          return Promise.resolve({
            success: true,
            values: { name: 'newAttr' }
          });
        }
        return Promise.resolve({ success: false });
      });

      // Mock update values response
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        return Promise.resolve({
          success: true
        });
      });

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log');

      await renameAttribute(kDataContextName, 'samples', 'oldAttr', 'newAttr');

      // Verify console.log was called for attribute without formula
      expect(consoleSpy).toHaveBeenCalledWith('Attribute otherAttr does not have a formula');
      
      consoleSpy.mockRestore();
    }, 10000); // Increase timeout to 10 seconds
  });
}); 