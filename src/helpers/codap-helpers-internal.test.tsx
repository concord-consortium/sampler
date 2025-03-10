/**
 * Test file for internal functions in codap-helpers.tsx
 * 
 * This file contains tests for internal functions that are not directly exported:
 * - getCollectionNames (tested indirectly)
 * - createWideTable (tested indirectly)
 * - updateAttributeIds (tested indirectly)
 */

import { 
  findOrCreateDataContext,
  kDataContextName
} from './codap-helpers';
import { 
  codapInterface, 
  getDataContext, 
  getAttributeList, 
  createDataContext,
  createParentCollection,
  createChildCollection
} from '@concord-consortium/codap-plugin-api';
import { AttrMap } from '../types';
import { Updater } from 'use-immer';

// Mock the codap-plugin-api
jest.mock('@concord-consortium/codap-plugin-api', () => ({
  codapInterface: {
    sendRequest: jest.fn()
  },
  getDataContext: jest.fn(),
  getAttributeList: jest.fn(),
  createDataContext: jest.fn(),
  createParentCollection: jest.fn(),
  createChildCollection: jest.fn(),
  getAllItems: jest.fn(),
  createNewAttribute: jest.fn()
}));

// Mock the getCollectionNames function
jest.mock('./codap-helpers', () => {
  const originalModule = jest.requireActual('./codap-helpers');
  return {
    ...originalModule,
    // This ensures the internal getCollectionNames function works in our tests
    __esModule: true,
    // Mock the addMeasure function to avoid the error with attrs.find
    addMeasure: jest.fn().mockImplementation((measureName, measureType, formula) => {
      if (measureName) {
        // If measureName is provided, update the attribute
        return codapInterface.sendRequest({
          action: 'update',
          resource: `dataContext[${kDataContextName}].collection[samples].attribute[${measureName}]`,
          values: {
            formula
          }
        });
      } else {
        // If no measureName is provided, create a new attribute with an incremented name
        return codapInterface.sendRequest({
          action: 'create',
          resource: `dataContext[${kDataContextName}].collection[samples].attribute`,
          values: [{
            name: `${measureType}3`,
            type: 'numeric',
            formula
          }]
        });
      }
    })
  };
});

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('codap-helpers internal functions tests', () => {
  // Test for getCollectionNames function (indirectly through findOrCreateDataContext)
  describe('getCollectionNames function (indirect testing)', () => {
    it('should correctly identify collection names when data context exists', async () => {
      // Create a mock AttrMap
      const mockAttrMap: AttrMap = {
        experiment: { name: 'Experiment', codapID: null },
        description: { name: 'Description', codapID: null },
        sample: { name: 'Sample', codapID: null },
        sample_size: { name: 'Sample Size', codapID: null },
        experimentHash: { name: 'Experiment Hash', codapID: null }
      };

      // Mock setGlobalState
      const mockSetGlobalState = jest.fn() as jest.MockedFunction<Updater<any>>;
      
      // Mock getDataContext to return a successful response
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          name: kDataContextName,
          collections: [
            { name: 'experiments' },
            { name: 'samples' },
            { name: 'items' }
          ]
        }
      });

      // Mock getAttributeList to return attributes
      (getAttributeList as jest.Mock).mockImplementation((contextName, collectionName) => {
        if (collectionName === 'items') {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'attr1', id: 'attr1' }
            ]
          });
        }
        return Promise.resolve({ success: false });
      });

      // Mock codapInterface.sendRequest for the updateAttributeIds function
      (codapInterface.sendRequest as jest.Mock).mockImplementation((requests, callback) => {
        if (Array.isArray(requests)) {
          // This is the updateAttributeIds call
          const responses = requests.map(req => {
            const attrName = req.resource.split('[').pop()?.split(']')[0];
            if (attrName === 'Experiment') {
              return { success: true, values: { name: 'Experiment', id: 'exp1' } };
            } else if (attrName === 'Description') {
              return { success: true, values: { name: 'Description', id: 'desc1' } };
            } else if (attrName === 'Sample Size') {
              return { success: true, values: { name: 'Sample Size', id: 'size1' } };
            } else if (attrName === 'Experiment Hash') {
              return { success: true, values: { name: 'Experiment Hash', id: 'hash1' } };
            } else if (attrName === 'Sample') {
              return { success: true, values: { name: 'Sample', id: 'sample1' } };
            } else if (attrName === 'attr1') {
              return { success: true, values: { name: 'attr1', id: 'attr1' } };
            }
            return { success: false };
          });
          callback(responses);
          return Promise.resolve({ success: true });
        }
        return Promise.resolve({ success: true });
      });

      // Call findOrCreateDataContext
      const result = await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that the function returned true (success)
      expect(result).toBe(true);

      // Verify that getDataContext was called with the correct context name
      expect(getDataContext).toHaveBeenCalledWith(kDataContextName);
      
      // Verify that getAttributeList was called for the items collection
      expect(getAttributeList).toHaveBeenCalledWith(kDataContextName, 'items');
    });

    it('should handle the case when collections are not found', async () => {
      // Create a mock AttrMap
      const mockAttrMap: AttrMap = {
        experiment: { name: 'Experiment', codapID: null },
        description: { name: 'Description', codapID: null },
        sample: { name: 'Sample', codapID: null },
        sample_size: { name: 'Sample Size', codapID: null },
        experimentHash: { name: 'Experiment Hash', codapID: null }
      };

      // Mock setGlobalState
      const mockSetGlobalState = jest.fn() as jest.MockedFunction<Updater<any>>;
      
      // Mock getDataContext to return a failed response (data context doesn't exist)
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      // Mock createDataContext to return a successful response
      (createDataContext as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: { id: 'dc1' }
      });

      // Mock createParentCollection to return a successful response
      (createParentCollection as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: { id: 'coll1' }
      });

      // Mock createChildCollection to return a successful response for both calls
      (createChildCollection as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          values: { id: 'coll2' }
        })
        .mockResolvedValueOnce({
          success: true,
          values: { id: 'coll3' }
        });

      // Mock getAttributeList to return attributes for the items collection
      (getAttributeList as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { name: 'attr1', id: 'attr1' }
        ]
      });

      // Mock codapInterface.sendRequest for createWideTable and updateAttributeIds
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request, callback) => {
        if (Array.isArray(request)) {
          // This is the updateAttributeIds call
          if (callback) {
            callback([
              { success: true, values: { name: 'Experiment', id: 'exp1' } },
              { success: true, values: { name: 'Description', id: 'desc1' } },
              { success: true, values: { name: 'Sample Size', id: 'size1' } },
              { success: true, values: { name: 'Experiment Hash', id: 'hash1' } },
              { success: true, values: { name: 'Sample', id: 'sample1' } },
              { success: true, values: { name: 'attr1', id: 'attr1' } }
            ]);
          }
          return Promise.resolve({ success: true });
        } else if (request.action === 'create' && request.resource === 'component') {
          // This is the createWideTable call
          return Promise.resolve({ success: true });
        }
        return Promise.resolve({ success: true });
      });

      // Call findOrCreateDataContext
      const result = await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that the function returned true (success)
      expect(result).toBe(true);
      
      // Verify that createDataContext was called
      expect(createDataContext).toHaveBeenCalled();
      
      // Verify that createParentCollection was called with the correct parameters
      expect(createParentCollection).toHaveBeenCalledWith(
        kDataContextName,
        'experiments',
        expect.arrayContaining([
          { name: 'Experiment', type: 'categorical' },
          { name: 'Description', type: 'categorical' },
          { name: 'Sample Size', type: 'categorical' },
          { name: 'Experiment Hash', type: 'categorical', hidden: 'true' }
        ])
      );
      
      // Verify that createChildCollection was called with the correct parameters
      expect(createChildCollection).toHaveBeenCalledWith(
        kDataContextName,
        'samples',
        'experiments',
        expect.arrayContaining([
          { name: 'Sample', type: 'categorical' }
        ])
      );
    });
  });

  // Test for createWideTable function (indirectly through findOrCreateDataContext)
  describe('createWideTable function (indirect testing)', () => {
    it('should create a wide table when creating a new data context', async () => {
      // Create a mock AttrMap
      const mockAttrMap: AttrMap = {
        experiment: { name: 'Experiment', codapID: null },
        description: { name: 'Description', codapID: null },
        sample: { name: 'Sample', codapID: null },
        sample_size: { name: 'Sample Size', codapID: null },
        experimentHash: { name: 'Experiment Hash', codapID: null }
      };

      // Mock setGlobalState
      const mockSetGlobalState = jest.fn() as jest.MockedFunction<Updater<any>>;
      
      // Mock getDataContext to return a failed response (data context doesn't exist)
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      // Mock createDataContext to return a successful response
      (createDataContext as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: { id: 'dc1' }
      });

      // Mock createParentCollection to return a successful response
      (createParentCollection as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: { id: 'coll1' }
      });

      // Mock createChildCollection to return a successful response for both calls
      (createChildCollection as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          values: { id: 'coll2' }
        })
        .mockResolvedValueOnce({
          success: true,
          values: { id: 'coll3' }
        });

      // Mock getAttributeList to return attributes for the items collection
      (getAttributeList as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { name: 'attr1', id: 'attr1' }
        ]
      });

      // Mock codapInterface.sendRequest for createWideTable and updateAttributeIds
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request, callback) => {
        if (Array.isArray(request)) {
          // This is the updateAttributeIds call
          if (callback) {
            callback([
              { success: true, values: { name: 'Experiment', id: 'exp1' } },
              { success: true, values: { name: 'Description', id: 'desc1' } },
              { success: true, values: { name: 'Sample Size', id: 'size1' } },
              { success: true, values: { name: 'Experiment Hash', id: 'hash1' } },
              { success: true, values: { name: 'Sample', id: 'sample1' } },
              { success: true, values: { name: 'attr1', id: 'attr1' } }
            ]);
          }
          return Promise.resolve({ success: true });
        } else if (request.action === 'create' && request.resource === 'component') {
          // This is the createWideTable call
          return Promise.resolve({ success: true });
        }
        return Promise.resolve({ success: true });
      });

      // Call findOrCreateDataContext
      const result = await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that the function returned true (success)
      expect(result).toBe(true);
      
      // Verify that codapInterface.sendRequest was called for createWideTable
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'create',
        resource: 'component',
        values: {
          type: 'caseTable',
          dataContext: kDataContextName,
          title: 'Sampler Data',
          dimensions: {
            width: 1000,
            height: 200
          }
        }
      });
    });

    it('should handle the case when createWideTable fails', async () => {
      // Create a mock AttrMap
      const mockAttrMap: AttrMap = {
        experiment: { name: 'Experiment', codapID: null },
        description: { name: 'Description', codapID: null },
        sample: { name: 'Sample', codapID: null },
        sample_size: { name: 'Sample Size', codapID: null },
        experimentHash: { name: 'Experiment Hash', codapID: null }
      };

      // Mock setGlobalState
      const mockSetGlobalState = jest.fn() as jest.MockedFunction<Updater<any>>;
      
      // Mock getDataContext to return a failed response (data context doesn't exist)
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      // Mock createDataContext to return a successful response
      (createDataContext as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: { id: 'dc1' }
      });

      // Mock createParentCollection to return a successful response
      (createParentCollection as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: { id: 'coll1' }
      });

      // Mock createChildCollection to return a successful response for both calls
      (createChildCollection as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          values: { id: 'coll2' }
        })
        .mockResolvedValueOnce({
          success: true,
          values: { id: 'coll3' }
        });

      // Mock getAttributeList to return attributes for the items collection
      (getAttributeList as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { name: 'attr1', id: 'attr1' }
        ]
      });

      // Mock codapInterface.sendRequest for createWideTable to fail and updateAttributeIds to succeed
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request, callback) => {
        if (Array.isArray(request)) {
          // This is the updateAttributeIds call
          if (callback) {
            callback([
              { success: true, values: { name: 'Experiment', id: 'exp1' } },
              { success: true, values: { name: 'Description', id: 'desc1' } },
              { success: true, values: { name: 'Sample Size', id: 'size1' } },
              { success: true, values: { name: 'Experiment Hash', id: 'hash1' } },
              { success: true, values: { name: 'Sample', id: 'sample1' } },
              { success: true, values: { name: 'attr1', id: 'attr1' } }
            ]);
          }
          return Promise.resolve({ success: true });
        } else if (request.action === 'create' && request.resource === 'component') {
          // This is the createWideTable call that fails
          return Promise.resolve({ success: false });
        }
        return Promise.resolve({ success: true });
      });

      // Call findOrCreateDataContext
      const result = await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that the function returned false (failure) because createWideTable failed
      expect(result).toBe(false);
      
      // Verify that codapInterface.sendRequest was called for createWideTable
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'create',
        resource: 'component',
        values: {
          type: 'caseTable',
          dataContext: kDataContextName,
          title: 'Sampler Data',
          dimensions: {
            width: 1000,
            height: 200
          }
        }
      });
    });
  });

  // Test for updateAttributeIds function (indirectly through findOrCreateDataContext)
  describe('updateAttributeIds function (indirect testing)', () => {
    it('should update attribute IDs when data context exists', async () => {
      // Create a mock AttrMap
      const mockAttrMap: AttrMap = {
        experiment: { name: 'Experiment', codapID: null },
        description: { name: 'Description', codapID: null },
        sample: { name: 'Sample', codapID: null },
        sample_size: { name: 'Sample Size', codapID: null },
        experimentHash: { name: 'Experiment Hash', codapID: null }
      };

      // Mock setGlobalState
      const mockSetGlobalState = jest.fn() as jest.MockedFunction<Updater<any>>;
      
      // Mock getDataContext to return a successful response
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          name: kDataContextName,
          collections: [
            { name: 'experiments' },
            { name: 'samples' },
            { name: 'items' }
          ]
        }
      });

      // Mock getAttributeList to return attributes with matching names
      (getAttributeList as jest.Mock).mockImplementation((contextName, collectionName) => {
        if (collectionName === 'items') {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'attr1', id: 'attr1' }
            ]
          });
        }
        return Promise.resolve({ success: false });
      });

      // Mock codapInterface.sendRequest for the updateAttributeIds function
      (codapInterface.sendRequest as jest.Mock).mockImplementation((requests, callback) => {
        if (Array.isArray(requests)) {
          // This is the updateAttributeIds call
          const responses = requests.map(req => {
            const attrName = req.resource.split('[').pop()?.split(']')[0];
            if (attrName === 'Experiment') {
              return { success: true, values: { name: 'Experiment', id: 'exp1' } };
            } else if (attrName === 'Description') {
              return { success: true, values: { name: 'Description', id: 'desc1' } };
            } else if (attrName === 'Sample Size') {
              return { success: true, values: { name: 'Sample Size', id: 'size1' } };
            } else if (attrName === 'Experiment Hash') {
              return { success: true, values: { name: 'Experiment Hash', id: 'hash1' } };
            } else if (attrName === 'Sample') {
              return { success: true, values: { name: 'Sample', id: 'sample1' } };
            } else if (attrName === 'attr1') {
              return { success: true, values: { name: 'attr1', id: 'attr1' } };
            }
            return { success: false };
          });
          callback(responses);
          return Promise.resolve({ success: true });
        }
        return Promise.resolve({ success: true });
      });

      // Call findOrCreateDataContext
      const result = await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that the function returned true (success)
      expect(result).toBe(true);

      // Verify that setGlobalState was called to update the codapIDs
      expect(mockSetGlobalState).toHaveBeenCalled();
      
      // Verify that codapInterface.sendRequest was called with an array of requests
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            action: 'get',
            resource: expect.stringContaining('dataContext[Sampler].collection')
          })
        ]),
        expect.any(Function)
      );
    });

    it('should handle attribute lookup failures during updateAttributeIds', async () => {
      // Create a mock AttrMap
      const mockAttrMap: AttrMap = {
        experiment: { name: 'Experiment', codapID: null },
        description: { name: 'Description', codapID: null },
        sample: { name: 'Sample', codapID: null },
        sample_size: { name: 'Sample Size', codapID: null },
        experimentHash: { name: 'Experiment Hash', codapID: null }
      };

      // Mock setGlobalState
      const mockSetGlobalState = jest.fn() as jest.MockedFunction<Updater<any>>;
      
      // Mock getDataContext to return a successful response
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          name: kDataContextName,
          collections: [
            { name: 'experiments' },
            { name: 'samples' },
            { name: 'items' }
          ]
        }
      });

      // Mock getAttributeList to return attributes with matching names
      (getAttributeList as jest.Mock).mockImplementation((contextName, collectionName) => {
        if (collectionName === 'items') {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'attr1', id: 'attr1' }
            ]
          });
        }
        return Promise.resolve({ success: false });
      });

      // Mock codapInterface.sendRequest for the updateAttributeIds function with some failures
      (codapInterface.sendRequest as jest.Mock).mockImplementation((requests, callback) => {
        if (Array.isArray(requests)) {
          // This is the updateAttributeIds call with mixed success/failure
          const responses = requests.map(req => {
            const attrName = req.resource.split('[').pop()?.split(']')[0];
            if (attrName === 'Experiment') {
              return { success: true, values: { name: 'Experiment', id: 'exp1' } };
            } else if (attrName === 'Description') {
              return { success: false }; // Failed lookup
            } else if (attrName === 'Sample Size') {
              return { success: true, values: { name: 'Sample Size', id: 'size1' } };
            } else if (attrName === 'Experiment Hash') {
              return { success: true, values: { name: 'Experiment Hash', id: 'hash1' } };
            } else if (attrName === 'Sample') {
              return { success: true, values: { name: 'Sample', id: 'sample1' } };
            } else if (attrName === 'attr1') {
              return { success: false }; // Failed lookup
            }
            return { success: false };
          });
          callback(responses);
          return Promise.resolve({ success: true });
        }
        return Promise.resolve({ success: true });
      });

      // Call findOrCreateDataContext
      const result = await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that the function returned true (success) despite some attribute lookup failures
      expect(result).toBe(true);

      // Verify that setGlobalState was called for successful lookups
      expect(mockSetGlobalState).toHaveBeenCalled();
      
      // Verify that codapInterface.sendRequest was called with an array of requests
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            action: 'get',
            resource: expect.stringContaining('dataContext[Sampler].collection')
          })
        ]),
        expect.any(Function)
      );
    });
  });
}); 