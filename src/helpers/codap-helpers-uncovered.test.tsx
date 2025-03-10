import { 
  findOrCreateDataContext, 
  getNewExperimentInfo,
  addMeasure,
  renameAttribute
} from './codap-helpers';
import codapInterface from '../lib/codap-interface';
import { AttrMap, IAttrForMap } from '../types';

// Mock the codapInterface
jest.mock('../lib/codap-interface', () => ({
  __esModule: true,
  default: {
    sendRequest: jest.fn()
  }
}));

const kDataContextName = 'Sampler';

// Create a mock AttrMap for testing
const mockAttrMap: AttrMap = {
  experiment: { name: 'Experiment', codapID: null },
  description: { name: 'Description', codapID: null },
  sample: { name: 'Sample', codapID: null },
  sample_size: { name: 'Sample Size', codapID: null },
  experimentHash: { name: 'Experiment Hash', codapID: null }
};

// Create a mock setState function
const setGlobalState = jest.fn();

describe('codap-helpers uncovered lines tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for lines 63-68, 79
  describe('findOrCreateDataContext with attribute ID updates', () => {
    it('should update attribute IDs when matching attributes are found', async () => {
      // Mock the getDataContext response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any, callback: any) => {
        if (request.resource === `dataContext[${kDataContextName}]`) {
          callback({
            success: true,
            values: { name: kDataContextName }
          });
        }
      });

      // Mock the getCollectionList response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any, callback: any) => {
        if (request.resource.includes('collectionList')) {
          callback({
            success: true,
            values: ['experiments', 'samples', 'items']
          });
        }
      });

      // Mock the getAttributeList response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any, callback: any) => {
        if (request.resource.includes('attributeList')) {
          callback({
            success: true,
            values: [{ name: 'attr1' }, { name: 'attr2' }]
          });
        }
      });

      // Mock the batch request for attribute IDs
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((requests: any, callback: any) => {
        // This is the key part that tests lines 63-68
        callback([
          { 
            success: true, 
            values: { 
              name: 'Experiment',
              id: 'exp-id-123'
            } 
          },
          { 
            success: true, 
            values: { 
              name: 'Sample',
              id: 'sample-id-456'
            } 
          }
        ]);
      });

      await findOrCreateDataContext(['attr1', 'attr2'], setGlobalState, mockAttrMap);

      // Verify setGlobalState was called to update the attribute IDs
      expect(setGlobalState).toHaveBeenCalled();
    });
  });

  // Test for lines 110-111, 117-156
  describe('findOrCreateDataContext with data context creation', () => {
    it('should create a new data context when one does not exist', async () => {
      // Mock the getDataContext response - data context doesn't exist
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any, callback: any) => {
        if (request.resource === `dataContext[${kDataContextName}]`) {
          callback({
            success: false
          });
        }
      });

      // Mock the createDataContext response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.action === 'create' && request.resource === 'dataContext') {
          return Promise.resolve({
            success: true,
            values: { name: kDataContextName }
          });
        }
      });

      // Mock the createParentCollection response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.action === 'create' && request.resource.includes('collection')) {
          return Promise.resolve({
            success: true
          });
        }
      });

      // Mock the first createChildCollection response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.action === 'create' && request.resource.includes('collection')) {
          return Promise.resolve({
            success: true
          });
        }
      });

      // Mock the second createChildCollection response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.action === 'create' && request.resource.includes('collection')) {
          return Promise.resolve({
            success: true
          });
        }
      });

      // Mock the component creation response (for createWideTable)
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.action === 'create' && request.resource === 'component') {
          return Promise.resolve({
            success: true
          });
        }
      });

      // Mock the batch request for attribute IDs
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((requests: any, callback: any) => {
        callback([
          { success: true, values: { name: 'attr1', id: 'attr1-id' } },
          { success: true, values: { name: 'attr2', id: 'attr2-id' } }
        ]);
      });

      const result = await findOrCreateDataContext(['attr1', 'attr2'], setGlobalState, mockAttrMap);
      
      expect(result).toBe(true);
      expect(setGlobalState).toHaveBeenCalled();
    });

    it('should handle failure in createDataContext', async () => {
      // Mock the getDataContext response - data context doesn't exist
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any, callback: any) => {
        if (request.resource === `dataContext[${kDataContextName}]`) {
          callback({
            success: false
          });
        }
      });

      // Mock the createDataContext response - failure
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.action === 'create' && request.resource === 'dataContext') {
          return Promise.resolve({
            success: false
          });
        }
      });

      const result = await findOrCreateDataContext(['attr1', 'attr2'], setGlobalState, mockAttrMap);
      
      expect(result).toBe(false);
    });

    it('should handle failure in createParentCollection', async () => {
      // Mock the getDataContext response - data context doesn't exist
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any, callback: any) => {
        if (request.resource === `dataContext[${kDataContextName}]`) {
          callback({
            success: false
          });
        }
      });

      // Mock the createDataContext response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.action === 'create' && request.resource === 'dataContext') {
          return Promise.resolve({
            success: true,
            values: { name: kDataContextName }
          });
        }
      });

      // Mock the createParentCollection response - failure
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.action === 'create' && request.resource.includes('collection')) {
          return Promise.resolve({
            success: false
          });
        }
      });

      const result = await findOrCreateDataContext(['attr1', 'attr2'], setGlobalState, mockAttrMap);
      
      expect(result).toBe(false);
    });
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
      });

      await addMeasure('Mean', 'mean()', 'existingMeasure');

      // Verify the update request was made
      const updateCall = (codapInterface.sendRequest as jest.Mock).mock.calls.find(
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
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.resource.includes('allItems')) {
          return Promise.resolve({
            success: false
          });
        }
      });

      await expect(getNewExperimentInfo('hash123')).rejects.toThrow('Sorry, the data context was not found!');
    });
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
      });

      // Mock the componentList response
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((request: any) => {
        if (request.resource === 'componentList') {
          return Promise.resolve({
            success: true,
            values: []
          });
        }
      });

      // Mock other necessary responses
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
    });
  });
}); 