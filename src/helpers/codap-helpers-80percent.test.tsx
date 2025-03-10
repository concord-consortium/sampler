/**
 * Tests to achieve 80% function coverage for codap-helpers.tsx
 * 
 * This file focuses on achieving 80% function coverage by targeting:
 * - updateAttributeIds (lines 63-68, 79)
 * - isKeyOfAttrMap (used within updateAttributeIds)
 * - findOrCreateDataContext (lines 110-111, 117-156)
 * - addMeasure (line 205)
 * - getNewExperimentInfo (line 236)
 */

import { 
  findOrCreateDataContext, 
  addMeasure, 
  getNewExperimentInfo,
  kDataContextName
} from './codap-helpers';
import { 
  codapInterface, 
  getDataContext, 
  getAttributeList, 
  createDataContext,
  createParentCollection,
  createChildCollection,
  getAllItems,
  createNewAttribute
} from '@concord-consortium/codap-plugin-api';
import { AttrMap, IGlobalState } from '../types';
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

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('codap-helpers 80% function coverage tests', () => {
  // Test for updateAttributeIds and isKeyOfAttrMap
  describe('updateAttributeIds and isKeyOfAttrMap functions', () => {
    it('should update attribute IDs when matching attributes are found', async () => {
      // Create a mock AttrMap
      const mockAttrMap: AttrMap = {
        experiment: { name: 'Experiment', codapID: null },
        description: { name: 'Description', codapID: null },
        sample: { name: 'Sample', codapID: null },
        sample_size: { name: 'Sample Size', codapID: null },
        experimentHash: { name: 'Experiment Hash', codapID: null }
      };

      // Mock setGlobalState
      const mockSetGlobalState = jest.fn() as jest.MockedFunction<Updater<IGlobalState>>;
      
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
        if (collectionName === 'experiments') {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'Experiment', id: 'exp1' },
              { name: 'Description', id: 'desc1' },
              { name: 'Sample Size', id: 'size1' },
              { name: 'Experiment Hash', id: 'hash1' }
            ]
          });
        } else if (collectionName === 'samples') {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'Sample', id: 'sample1' }
            ]
          });
        } else if (collectionName === 'items') {
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

      // Call findOrCreateDataContext which will indirectly call updateAttributeIds
      await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that setGlobalState was called
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

  // Test for findOrCreateDataContext (remaining branches)
  describe('findOrCreateDataContext function (remaining branches)', () => {
    it('should create a data context when it does not exist', async () => {
      // Create a mock AttrMap
      const mockAttrMap: AttrMap = {
        experiment: { name: 'Experiment', codapID: null },
        description: { name: 'Description', codapID: null },
        sample: { name: 'Sample', codapID: null },
        sample_size: { name: 'Sample Size', codapID: null },
        experimentHash: { name: 'Experiment Hash', codapID: null }
      };

      // Mock setGlobalState
      const mockSetGlobalState = jest.fn() as jest.MockedFunction<Updater<IGlobalState>>;
      
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
      
      // Verify that createDataContext was called with the correct parameters
      expect(createDataContext).toHaveBeenCalledWith(kDataContextName);
      
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

    it('should handle missing attributes in an existing data context', async () => {
      // Create a mock AttrMap
      const mockAttrMap: AttrMap = {
        experiment: { name: 'Experiment', codapID: null },
        description: { name: 'Description', codapID: null },
        sample: { name: 'Sample', codapID: null },
        sample_size: { name: 'Sample Size', codapID: null },
        experimentHash: { name: 'Experiment Hash', codapID: null }
      };

      // Mock setGlobalState
      const mockSetGlobalState = jest.fn() as jest.MockedFunction<Updater<IGlobalState>>;
      
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

      // Mock getAttributeList to return attributes without 'attr1'
      (getAttributeList as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { name: 'attr2', id: 'attr2' }
        ]
      });

      // Mock codapInterface.sendRequest for updateAttributeIds
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
        }
        return Promise.resolve({ success: true });
      });

      // Call findOrCreateDataContext
      const result = await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that the function returned true (success)
      expect(result).toBe(true);
      
      // Verify that codapInterface.sendRequest was called for updateAttributeIds
      expect(codapInterface.sendRequest).toHaveBeenCalled();
    });
  });

  // Test for addMeasure (remaining parts)
  describe('addMeasure function (remaining parts)', () => {
    it('should handle the case when an attribute with the same name already exists and measureName is provided', async () => {
      // Mock codapInterface.sendRequest for getting attributes
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request) => {
        if (request.action === 'get' && request.resource.includes('attributeList')) {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'Measure1', id: 'measure1' }
            ]
          });
        }
        return Promise.resolve({ success: true });
      });

      // Call addMeasure with a measureName that already exists
      await addMeasure('Measure1', 'categorical', 'formula');

      // Verify that codapInterface.sendRequest was called for updating the attribute
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'update',
        resource: `dataContext[${kDataContextName}].collection[samples].attribute[Measure1]`,
        values: {
          formula: 'formula'
        }
      });
    });

    it('should handle the case when an attribute with the same name already exists and no measureName is provided', async () => {
      // Mock codapInterface.sendRequest for getting attributes
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request) => {
        if (request.action === 'get' && request.resource.includes('attributeList')) {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'categorical', id: 'measure1' },
              { name: 'categorical1', id: 'measure2' }
            ]
          });
        }
        return Promise.resolve({ success: true });
      });

      // Call addMeasure without a measureName
      await addMeasure('', 'categorical', 'formula');

      // Verify that codapInterface.sendRequest was called for creating a new attribute
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'create',
        resource: `dataContext[${kDataContextName}].collection[samples].attribute`,
        values: [{
          name: 'categorical2',
          type: 'numeric',
          formula: 'formula'
        }]
      });
    });

    it('should handle the case when an attribute with the same name already exists and there are gaps in the indexes', async () => {
      // Mock codapInterface.sendRequest for getting attributes
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request) => {
        if (request.action === 'get' && request.resource.includes('attributeList')) {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'categorical', id: 'measure1' },
              { name: 'categorical1', id: 'measure2' },
              { name: 'categorical3', id: 'measure3' }
            ]
          });
        }
        return Promise.resolve({ success: true });
      });

      // Call addMeasure without a measureName
      await addMeasure('', 'categorical', 'formula');

      // Verify that codapInterface.sendRequest was called for creating a new attribute
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'create',
        resource: `dataContext[${kDataContextName}].collection[samples].attribute`,
        values: [{
          name: 'categorical2',
          type: 'numeric',
          formula: 'formula'
        }]
      });
    });
  });

  // Test for getNewExperimentInfo (remaining parts)
  describe('getNewExperimentInfo function (remaining parts)', () => {
    it('should handle the case when the data context is not found', async () => {
      // Mock getAllItems to return a failed response
      (getAllItems as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      // Call getNewExperimentInfo and expect it to throw
      await expect(getNewExperimentInfo('hash123')).rejects.toThrow('Sorry, the data context was not found!');
    });

    it('should handle the case when matching experiments are found', async () => {
      // Mock getAllItems to return matching experiments
      (getAllItems as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { values: { experiment: 1, sample: 5, experimentHash: 'hash123' } },
          { values: { experiment: 1, sample: 3, experimentHash: 'hash123' } }
        ]
      });

      // Call getNewExperimentInfo
      const result = await getNewExperimentInfo('hash123');

      // Verify that the function returned the correct values
      expect(result).toEqual({
        experimentNum: 1,
        startingSampleNumber: 6
      });
    });
  });
}); 