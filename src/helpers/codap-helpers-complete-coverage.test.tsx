/**
 * Complete coverage tests for codap-helpers.tsx
 * 
 * This file focuses on achieving 100% function coverage by targeting:
 * - updateAttributeIds
 * - findOrCreateDataContext (remaining branches)
 * - createWideTable (indirectly)
 * - Remaining parts of addMeasure, getNewExperimentInfo, and renameAttribute
 */

import { 
  findOrCreateDataContext, 
  addMeasure, 
  getNewExperimentInfo, 
  renameAttribute,
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

describe('codap-helpers complete coverage tests', () => {
  // Test for updateAttributeIds (indirectly through findOrCreateDataContext)
  describe('updateAttributeIds function (tested indirectly)', () => {
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
            { name: 'samples' }
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
        }
        return Promise.resolve({ success: false });
      });

      // Call findOrCreateDataContext which will indirectly call updateAttributeIds
      await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that setGlobalState was called to update the attribute IDs
      expect(mockSetGlobalState).toHaveBeenCalled();
      
      // Extract the update function passed to setGlobalState
      const updateFunction = mockSetGlobalState.mock.calls[0][0];
      
      // Create a draft state to pass to the update function
      const draftState = { 
        attrMap: { ...mockAttrMap }
      } as unknown as IGlobalState;
      
      // Apply the update function to the draft state
      if (typeof updateFunction === 'function') {
        updateFunction(draftState);
        
        // Verify that the attribute IDs were updated in the draft state
        expect(draftState.attrMap.experiment.codapID).toBe('exp1');
        expect(draftState.attrMap.description.codapID).toBe('desc1');
        expect(draftState.attrMap.sample_size.codapID).toBe('size1');
        expect(draftState.attrMap.experimentHash.codapID).toBe('hash1');
        expect(draftState.attrMap.sample.codapID).toBe('sample1');
      }
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

      // Mock createChildCollection to return a successful response
      (createChildCollection as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: { id: 'coll2' }
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

    it('should handle failure to create parent collection', async () => {
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

      // Mock createParentCollection to return a failed response
      (createParentCollection as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      // Call findOrCreateDataContext
      const result = await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that the function returned false (failure)
      expect(result).toBe(false);
    });

    it('should handle failure to create child collection', async () => {
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

      // Mock createChildCollection to return a failed response
      (createChildCollection as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      // Call findOrCreateDataContext
      const result = await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that the function returned false (failure)
      expect(result).toBe(false);
    });

    it('should handle failure to create wide table', async () => {
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

      // Mock codapInterface.sendRequest for createWideTable to return a failed response
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      // Call findOrCreateDataContext
      const result = await findOrCreateDataContext(['attr1'], mockAttrMap, mockSetGlobalState);

      // Verify that the function returned false (failure)
      expect(result).toBe(false);
    });
  });

  // Test for addMeasure (remaining parts)
  describe('addMeasure function (remaining parts)', () => {
    it('should handle the case when an attribute with the same name already exists', async () => {
      // Mock getAttributeList to return an attribute with the same name
      (getAttributeList as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { name: 'Measure1', id: 'measure1' }
        ]
      });

      // Mock createNewAttribute to return a successful response
      (createNewAttribute as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: { id: 'measure2' }
      });

      // Call addMeasure
      await addMeasure('Measure1', 'categorical', 'formula');

      // Verify that createNewAttribute was called with a modified name (Measure1_1)
      expect(createNewAttribute).toHaveBeenCalledWith(
        kDataContextName,
        'samples',
        'Measure1_1',
        'categorical',
        { formula: 'formula' }
      );
    });

    it('should handle the case when multiple attributes with similar names exist', async () => {
      // Mock getAttributeList to return multiple attributes with similar names
      (getAttributeList as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { name: 'Measure1', id: 'measure1' },
          { name: 'Measure1_1', id: 'measure2' }
        ]
      });

      // Mock createNewAttribute to return a successful response
      (createNewAttribute as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: { id: 'measure3' }
      });

      // Call addMeasure
      await addMeasure('Measure1', 'categorical', 'formula');

      // Verify that createNewAttribute was called with a modified name (Measure1_2)
      expect(createNewAttribute).toHaveBeenCalledWith(
        kDataContextName,
        'samples',
        'Measure1_2',
        'categorical',
        { formula: 'formula' }
      );
    });
  });

  // Test for getNewExperimentInfo (remaining parts)
  describe('getNewExperimentInfo function (remaining parts)', () => {
    it('should handle the case when no matching experiments are found', async () => {
      // Mock getAllItems to return an empty array
      (getAllItems as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: []
      });

      // Call getNewExperimentInfo
      const result = await getNewExperimentInfo('hash123');

      // Verify that the function returned the correct values
      expect(result).toEqual({
        experimentNumber: 1,
        startingSampleNumber: 1
      });
    });

    it('should handle the case when matching experiments are found', async () => {
      // Mock getAllItems to return matching experiments
      (getAllItems as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { experimentNumber: 1, sampleNumber: 5 },
          { experimentNumber: 2, sampleNumber: 3 }
        ]
      });

      // Call getNewExperimentInfo
      const result = await getNewExperimentInfo('hash123');

      // Verify that the function returned the correct values
      expect(result).toEqual({
        experimentNumber: 3,
        startingSampleNumber: 1
      });
    });
  });

  // Test for renameAttribute (remaining parts)
  describe('renameAttribute function (remaining parts)', () => {
    it('should handle the case when the data context is not found', async () => {
      // Mock getDataContext to return a failed response
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      // Call renameAttribute with all required parameters
      await renameAttribute(kDataContextName, 'samples', 'oldName', 'newName');

      // Verify that no further requests were made
      expect(codapInterface.sendRequest).not.toHaveBeenCalled();
    });

    it('should handle the case when the attribute is not found', async () => {
      // Mock getDataContext to return a successful response
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          name: kDataContextName,
          collections: [
            { name: 'experiments' },
            { name: 'samples' }
          ]
        }
      });

      // Mock codapInterface.sendRequest for getting attributes to return empty arrays
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request) => {
        if (request.action === 'get' && request.resource.includes('attributes')) {
          return Promise.resolve({
            success: true,
            values: []
          });
        }
        return Promise.resolve({ success: true });
      });

      // Call renameAttribute with all required parameters
      await renameAttribute(kDataContextName, 'samples', 'oldName', 'newName');

      // Verify that no create attribute request was made
      const createAttributeCall = (codapInterface.sendRequest as jest.Mock).mock.calls.find(
        call => call[0].action === 'create' && call[0].resource.includes('attribute')
      );
      expect(createAttributeCall).toBeUndefined();
    });
  });
}); 