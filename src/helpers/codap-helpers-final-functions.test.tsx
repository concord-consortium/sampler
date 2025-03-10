/**
 * Final function coverage tests for codap-helpers.tsx
 * 
 * This file focuses on achieving 100% function coverage by targeting:
 * - updateAttributeIds (indirectly)
 * - isKeyOfAttrMap (indirectly)
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
  createChildCollection: jest.fn()
}));

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('codap-helpers final function coverage tests', () => {
  // Test for updateAttributeIds and isKeyOfAttrMap (indirectly through findOrCreateDataContext)
  describe('updateAttributeIds and isKeyOfAttrMap functions (tested indirectly)', () => {
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

      // Call findOrCreateDataContext which will indirectly call updateAttributeIds
      await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that getAttributeList was called for experiments and samples
      expect(getAttributeList).toHaveBeenCalledWith(kDataContextName, 'experiments');
      expect(getAttributeList).toHaveBeenCalledWith(kDataContextName, 'samples');
      
      // Verify that setGlobalState was called
      expect(mockSetGlobalState).toHaveBeenCalled();
    });

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

      // Mock createChildCollection to return a successful response
      (createChildCollection as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: { id: 'coll2' }
      });

      // Mock getAttributeList to return attributes for the items collection
      (getAttributeList as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { name: 'attr1', id: 'attr1' }
        ]
      });

      // Mock codapInterface.sendRequest for createWideTable
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true
      });

      // Call findOrCreateDataContext
      const result = await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that the function returned true (success)
      expect(result).toBe(true);
      
      // Verify that createDataContext was called with the correct parameters
      expect(createDataContext).toHaveBeenCalledWith(kDataContextName, "Sampler Data");
      
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
          { name: 'Sample', type: 'categorical' },
          { name: 'attr1', type: 'categorical' }
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
  });
}); 