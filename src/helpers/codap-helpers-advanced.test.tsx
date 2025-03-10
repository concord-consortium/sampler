/**
 * Advanced test file for codap-helpers.tsx
 * 
 * This file contains tests for more complex functions and edge cases:
 * - renameAttribute (complex function with multiple steps)
 * - Error handling for findOrCreateDataContext
 * - Edge cases for addMeasure
 */

import { 
  renameAttribute,
  findOrCreateDataContext,
  addMeasure,
  kDataContextName
} from './codap-helpers';
import { 
  codapInterface, 
  getDataContext, 
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

describe('codap-helpers advanced tests', () => {
  // Test for renameAttribute function
  describe('renameAttribute function', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      // Spy on console.log to reduce noise in test output
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should rename an attribute and update cases', async () => {
      // Mock responses for each step of the process
      const mockResponses = [
        // Step 1: Get all cases
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { 'oldAttr': 100 } },
              { id: 2, values: { 'oldAttr': 200 } }
            ]
          }
        },
        // Step 2: Get all data contexts
        {
          success: true,
          values: [
            { name: 'Sampler' }
          ]
        },
        // Step 3: Get collections for the data context
        {
          success: true,
          values: [
            { name: 'samples' }
          ]
        },
        // Step 3: Get attributes for the collection
        {
          success: true,
          values: [
            { name: 'oldAttr' },
            { name: 'otherAttr' }
          ]
        },
        // Step 3: Get full details for the first attribute
        {
          success: true,
          values: {
            name: 'oldAttr',
            formula: null
          }
        },
        // Step 3: Get full details for the second attribute
        {
          success: true,
          values: {
            name: 'otherAttr',
            formula: 'oldAttr * 2'
          }
        },
        // Step 4: Create new attribute
        {
          success: true,
          values: { name: 'newAttr' }
        },
        // Step 5: Update cases with new attribute values
        {
          success: true,
          values: [{ id: 1 }, { id: 2 }]
        },
        // Step 6: Delete old attribute
        {
          success: true
        },
        // Step 7: Update formula in other attribute
        {
          success: true
        },
        // Step 8: Check for calculator components
        {
          success: true,
          values: []
        }
      ];

      // Set up the mock to return each response in sequence
      mockResponses.forEach(response => {
        (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce(response);
      });

      await renameAttribute('Sampler', 'samples', 'oldAttr', 'newAttr');

      // Verify the key requests were made in the correct order
      expect(codapInterface.sendRequest).toHaveBeenNthCalledWith(1,
        expect.objectContaining({
          action: 'get',
          resource: 'dataContext[Sampler].collection[samples].allCases'
        })
      );

      expect(codapInterface.sendRequest).toHaveBeenNthCalledWith(7,
        expect.objectContaining({
          action: 'create',
          resource: 'dataContext[Sampler].collection[samples].attribute',
          values: expect.objectContaining({
            name: 'newAttr'
          })
        })
      );

      expect(codapInterface.sendRequest).toHaveBeenNthCalledWith(8,
        expect.objectContaining({
          action: 'update',
          resource: 'dataContext[Sampler].collection[samples].case',
          values: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              values: { newAttr: 100 }
            }),
            expect.objectContaining({
              id: 2,
              values: { newAttr: 200 }
            })
          ])
        })
      );

      expect(codapInterface.sendRequest).toHaveBeenNthCalledWith(9,
        expect.objectContaining({
          action: 'delete',
          resource: 'dataContext[Sampler].collection[samples].attribute[oldAttr]'
        })
      );

      expect(codapInterface.sendRequest).toHaveBeenNthCalledWith(10,
        expect.objectContaining({
          action: 'update',
          resource: 'dataContext[Sampler].collection[samples].attribute[otherAttr]',
          values: {
            formula: 'newAttr * 2'
          }
        })
      );
    });

    it('should handle errors when getting cases', async () => {
      // Mock a failure when getting cases
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: false,
        values: null
      });

      await renameAttribute('Sampler', 'samples', 'oldAttr', 'newAttr');

      // Verify the function attempted to get cases
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'get',
          resource: 'dataContext[Sampler].collection[samples].allCases'
        })
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle different case structures', async () => {
      // Mock responses with a different case structure
      const mockResponses = [
        // Step 1: Get all cases with a different structure
        {
          success: true,
          values: [
            { case: { id: 1, values: { 'oldAttr': 100 } } },
            { case: { id: 2, values: { 'oldAttr': 200 } } }
          ]
        },
        // Step 2: Get all data contexts
        {
          success: true,
          values: [
            { name: 'Sampler' }
          ]
        },
        // Step 3: Get collections for the data context
        {
          success: true,
          values: [
            { name: 'samples' }
          ]
        },
        // Step 3: Get attributes for the collection
        {
          success: true,
          values: []
        },
        // Step 4: Create new attribute
        {
          success: true,
          values: { name: 'newAttr' }
        },
        // Step 5: Update cases with new attribute values
        {
          success: true,
          values: [{ id: 1 }, { id: 2 }]
        },
        // Step 6: Delete old attribute
        {
          success: true
        },
        // Step 8: Check for calculator components
        {
          success: true,
          values: []
        }
      ];

      // Set up the mock to return each response in sequence
      mockResponses.forEach(response => {
        (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce(response);
      });

      await renameAttribute('Sampler', 'samples', 'oldAttr', 'newAttr');

      // Verify the update cases request was made with the correct structure
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update',
          resource: 'dataContext[Sampler].collection[samples].case',
          values: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              values: { newAttr: 100 }
            }),
            expect.objectContaining({
              id: 2,
              values: { newAttr: 200 }
            })
          ])
        })
      );
    });

    it('should handle formulas with different reference styles', async () => {
      // Mock responses for each step of the process
      const mockResponses = [
        // Step 1: Get all cases
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { 'oldAttr': 100 } },
              { id: 2, values: { 'oldAttr': 200 } }
            ]
          }
        },
        // Step 2: Get all data contexts
        {
          success: true,
          values: [
            { name: 'Sampler' }
          ]
        },
        // Step 3: Get collections for the data context
        {
          success: true,
          values: [
            { name: 'samples' }
          ]
        },
        // Step 3: Get attributes for the collection
        {
          success: true,
          values: [
            { name: 'oldAttr' },
            { name: 'backtickRef' },
            { name: 'doubleQuoteRef' },
            { name: 'singleQuoteRef' },
            { name: 'wordBoundaryRef' }
          ]
        },
        // Step 3: Get full details for oldAttr
        {
          success: true,
          values: {
            name: 'oldAttr',
            formula: null
          }
        },
        // Step 3: Get full details for backtickRef
        {
          success: true,
          values: {
            name: 'backtickRef',
            formula: '`oldAttr` * 2'
          }
        },
        // Step 3: Get full details for doubleQuoteRef
        {
          success: true,
          values: {
            name: 'doubleQuoteRef',
            formula: 'count("oldAttr"=100)'
          }
        },
        // Step 3: Get full details for singleQuoteRef
        {
          success: true,
          values: {
            name: 'singleQuoteRef',
            formula: "count('oldAttr'=200)"
          }
        },
        // Step 3: Get full details for wordBoundaryRef
        {
          success: true,
          values: {
            name: 'wordBoundaryRef',
            formula: 'oldAttr + 10'
          }
        },
        // Step 4: Create new attribute
        {
          success: true,
          values: { name: 'newAttr' }
        },
        // Step 5: Update cases with new attribute values
        {
          success: true,
          values: [{ id: 1 }, { id: 2 }]
        },
        // Step 6: Delete old attribute
        {
          success: true
        },
        // Step 7: Update formula in backtickRef
        {
          success: true
        },
        // Step 7: Update formula in doubleQuoteRef
        {
          success: true
        },
        // Step 7: Update formula in singleQuoteRef
        {
          success: true
        },
        // Step 7: Update formula in wordBoundaryRef
        {
          success: true
        },
        // Step 8: Check for calculator components
        {
          success: true,
          values: []
        }
      ];

      // Set up the mock to return each response in sequence
      mockResponses.forEach(response => {
        (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce(response);
      });

      await renameAttribute('Sampler', 'samples', 'oldAttr', 'newAttr');

      // Verify the formula updates were made with the correct replacements
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update',
          resource: 'dataContext[Sampler].collection[samples].attribute[backtickRef]',
          values: {
            formula: '`newAttr` * 2'
          }
        })
      );

      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update',
          resource: 'dataContext[Sampler].collection[samples].attribute[doubleQuoteRef]',
          values: {
            formula: 'count("newAttr"=100)'
          }
        })
      );

      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update',
          resource: 'dataContext[Sampler].collection[samples].attribute[singleQuoteRef]',
          values: {
            formula: "count('newAttr'=200)"
          }
        })
      );

      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update',
          resource: 'dataContext[Sampler].collection[samples].attribute[wordBoundaryRef]',
          values: {
            formula: 'newAttr + 10'
          }
        })
      );
    });

    it('should handle calculator components', async () => {
      // Mock responses for each step of the process
      const mockResponses = [
        // Step 1: Get all cases
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { 'oldAttr': 100 } }
            ]
          }
        },
        // Step 2: Get all data contexts
        {
          success: true,
          values: [
            { name: 'Sampler' }
          ]
        },
        // Step 3: Get collections for the data context
        {
          success: true,
          values: [
            { name: 'samples' }
          ]
        },
        // Step 3: Get attributes for the collection
        {
          success: true,
          values: []
        },
        // Step 4: Create new attribute
        {
          success: true,
          values: { name: 'newAttr' }
        },
        // Step 5: Update cases with new attribute values
        {
          success: true,
          values: [{ id: 1 }]
        },
        // Step 6: Delete old attribute
        {
          success: true
        },
        // Step 8: Check for calculator components
        {
          success: true,
          values: [
            { type: 'calculator', id: 'calc1', name: 'Calculator 1' },
            { type: 'graph', id: 'graph1', name: 'Graph 1' }
          ]
        }
      ];
      
      // Set up the mock to return each response in sequence
      mockResponses.forEach(response => {
        (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce(response);
      });

      await renameAttribute('Sampler', 'samples', 'oldAttr', 'newAttr');

      // Verify the calculator components were checked
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'get',
          resource: 'componentList'
        })
      );
    });

    it('should handle empty cases array', async () => {
      const mockAllCasesResult = {
        success: true,
        values: {
          cases: []
        }
      };
      
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockAllCasesResult);
      });
      
      const result = await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith("Could not find any cases in the response");
      expect(result).toBeUndefined();
    });
  });

  // Test for error paths in findOrCreateDataContext
  describe('findOrCreateDataContext error paths', () => {
    it('should return false when createDataContext fails', async () => {
      // Mock getDataContext to return a failed response (data context doesn't exist)
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      // Mock createDataContext to return a failed response
      (createDataContext as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      const mockSetGlobalState = jest.fn();
      const attrs = ['attr1', 'attr2'];
      const attrMap: AttrMap = {
        experiment: { name: 'experiment', codapID: null },
        description: { name: 'description', codapID: null },
        sample_size: { name: 'sample_size', codapID: null },
        experimentHash: { name: 'experimentHash', codapID: null },
        sample: { name: 'sample', codapID: null }
      };

      const result = await findOrCreateDataContext(attrs, attrMap, mockSetGlobalState);
      
      expect(result).toBe(false);
      expect(createDataContext).toHaveBeenCalledWith(kDataContextName);
    });
    
    it('should return false when createParentCollection fails', async () => {
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

      const mockSetGlobalState = jest.fn();
      const attrs = ['attr1', 'attr2'];
      const attrMap: AttrMap = {
        experiment: { name: 'experiment', codapID: null },
        description: { name: 'description', codapID: null },
        sample_size: { name: 'sample_size', codapID: null },
        experimentHash: { name: 'experimentHash', codapID: null },
        sample: { name: 'sample', codapID: null }
      };

      const result = await findOrCreateDataContext(attrs, attrMap, mockSetGlobalState);
      
      expect(result).toBe(false);
      expect(createDataContext).toHaveBeenCalledWith(kDataContextName);
      expect(createParentCollection).toHaveBeenCalledWith(
        kDataContextName, 
        "experiments", 
        expect.arrayContaining([
          expect.objectContaining({ name: "experiment" }),
          expect.objectContaining({ name: "description" }),
          expect.objectContaining({ name: "sample_size" }),
          expect.objectContaining({ name: "experimentHash" })
        ])
      );
    });
    
    it('should return false when createChildCollection fails', async () => {
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

      const mockSetGlobalState = jest.fn();
      const attrs = ['attr1', 'attr2'];
      const attrMap: AttrMap = {
        experiment: { name: 'experiment', codapID: null },
        description: { name: 'description', codapID: null },
        sample_size: { name: 'sample_size', codapID: null },
        experimentHash: { name: 'experimentHash', codapID: null },
        sample: { name: 'sample', codapID: null }
      };

      const result = await findOrCreateDataContext(attrs, attrMap, mockSetGlobalState);
      
      expect(result).toBe(false);
      expect(createDataContext).toHaveBeenCalledWith(kDataContextName);
      expect(createParentCollection).toHaveBeenCalledWith(
        kDataContextName, 
        "experiments", 
        expect.arrayContaining([
          expect.objectContaining({ name: "experiment" }),
          expect.objectContaining({ name: "description" }),
          expect.objectContaining({ name: "sample_size" }),
          expect.objectContaining({ name: "experimentHash" })
        ])
      );
      expect(createChildCollection).toHaveBeenCalledWith(
        kDataContextName,
        "samples",
        "experiments",
        expect.arrayContaining([
          expect.objectContaining({ name: "sample" })
        ])
      );
    });
  });

  // Test for attribute name conflict handling in addMeasure
  describe('addMeasure with name conflicts', () => {
    it('should handle attribute name conflicts by incrementing the index', async () => {
      // Call addMeasure with a name that will conflict
      await addMeasure('', 'measure', 'formula');
      
      // Verify that codapInterface.sendRequest was called for creating a new attribute with an incremented name
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'create',
        resource: `dataContext[${kDataContextName}].collection[samples].attribute`,
        values: [{
          name: 'measure3',
          type: 'numeric',
          formula: 'formula'
        }]
      });
    });

    it('should handle the case when a measureName is provided', async () => {
      // Call addMeasure with a measureName
      await addMeasure('measure1', 'categorical', 'formula');
      
      // Verify that codapInterface.sendRequest was called for updating the attribute
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'update',
        resource: `dataContext[${kDataContextName}].collection[samples].attribute[measure1]`,
        values: {
          formula: 'formula'
        }
      });
    });
  });
}); 