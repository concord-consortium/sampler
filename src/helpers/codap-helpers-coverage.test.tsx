import { codapInterface } from '@concord-consortium/codap-plugin-api';
import { renameAttribute } from './codap-helpers';

// Mock the codapInterface
jest.mock('@concord-consortium/codap-plugin-api', () => ({
  codapInterface: {
    sendRequest: jest.fn()
  }
}));

describe('codap-helpers coverage tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to prevent cluttering test output
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });

  // Test for renameAttribute error handling
  describe('renameAttribute error handling', () => {
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
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      expect(consoleSpy).toHaveBeenCalledWith("Could not find any cases in the response");
      expect(result).toBeUndefined();
    });

    it('should handle failed request to get all cases', async () => {
      const mockFailedResult = {
        success: false,
        values: null
      };
      
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockFailedResult);
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      expect(consoleSpy).toHaveBeenCalledWith("Failed to get all cases:", mockFailedResult);
      expect(result).toBeUndefined();
    });

    it('should handle error during execution', async () => {
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      expect(consoleSpy).toHaveBeenCalledWith("Error in renameAttribute:", expect.any(Error));
    });

    it('should handle failed request to create new attribute', async () => {
      // Mock responses for different requests in sequence
      const mockResponses = [
        // First call - get all cases
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { oldName: 'value1' } }
            ]
          }
        },
        // Second call - get data contexts
        {
          success: true,
          values: [{ name: 'Sampler' }]
        },
        // Third call - get collections
        {
          success: true,
          values: [{ name: 'samples' }]
        },
        // Fourth call - get attributes
        {
          success: true,
          values: []
        },
        // Fifth call - create new attribute (fails)
        {
          success: false,
          values: null
        }
      ];
      
      let callIndex = 0;
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockResponses[callIndex++]);
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      expect(consoleSpy).toHaveBeenCalledWith("Failed to create new attribute:", expect.anything());
    });

    it('should handle failed request to update cases', async () => {
      // Mock responses for different requests in sequence
      const mockResponses = [
        // First call - get all cases
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { oldName: 'value1' } }
            ]
          }
        },
        // Second call - get data contexts
        {
          success: true,
          values: [{ name: 'Sampler' }]
        },
        // Third call - get collections
        {
          success: true,
          values: [{ name: 'samples' }]
        },
        // Fourth call - get attributes
        {
          success: true,
          values: []
        },
        // Fifth call - create new attribute
        {
          success: true,
          values: { name: 'newName' }
        },
        // Sixth call - update cases (fails)
        {
          success: false,
          values: null
        },
        // Seventh call - delete old attribute
        {
          success: true,
          values: {}
        },
        // Eighth call - get component list
        {
          success: true,
          values: []
        }
      ];
      
      let callIndex = 0;
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockResponses[callIndex++]);
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      expect(consoleSpy).toHaveBeenCalledWith("Failed to update cases:", expect.anything());
    });

    it('should handle failed request to delete old attribute', async () => {
      // Mock responses for different requests in sequence
      const mockResponses = [
        // First call - get all cases
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { oldName: 'value1' } }
            ]
          }
        },
        // Second call - get data contexts
        {
          success: true,
          values: [{ name: 'Sampler' }]
        },
        // Third call - get collections
        {
          success: true,
          values: [{ name: 'samples' }]
        },
        // Fourth call - get attributes
        {
          success: true,
          values: []
        },
        // Fifth call - create new attribute
        {
          success: true,
          values: { name: 'newName' }
        },
        // Sixth call - update cases
        {
          success: true,
          values: { caseCount: 1 }
        },
        // Seventh call - delete old attribute (fails)
        {
          success: false,
          values: null
        },
        // Eighth call - get component list
        {
          success: true,
          values: []
        }
      ];
      
      let callIndex = 0;
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockResponses[callIndex++]);
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      expect(consoleSpy).toHaveBeenCalledWith("Failed to delete old attribute:", expect.anything());
    });
  });

  describe('renameAttribute successful case updates', () => {
    it('should process cases and update values', async () => {
      // Mock responses for different requests in sequence
      const mockResponses = [
        // First call - get all cases
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { oldName: 'value1' } },
              { id: 2, values: { oldName: 'value2' } }
            ]
          }
        },
        // Second call - get data contexts
        {
          success: true,
          values: [{ name: 'Sampler' }]
        },
        // Third call - get collections
        {
          success: true,
          values: [{ name: 'samples' }]
        },
        // Fourth call - get attributes
        {
          success: true,
          values: []
        },
        // Fifth call - create new attribute
        {
          success: true,
          values: { name: 'newName' }
        },
        // Sixth call - update cases
        {
          success: true,
          values: { caseCount: 2 }
        },
        // Seventh call - delete old attribute
        {
          success: true,
          values: {}
        },
        // Eighth call - get component list
        {
          success: true,
          values: []
        }
      ];
      
      let callIndex = 0;
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockResponses[callIndex++]);
      });
      
      await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      // Verify the correct number of requests were made
      expect(codapInterface.sendRequest).toHaveBeenCalledTimes(8);
      
      // Verify the update cases request was made with the correct values
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        action: 'update',
        resource: 'dataContext[Sampler].collection[samples].case',
        values: [
          { id: 1, values: { newName: 'value1' } },
          { id: 2, values: { newName: 'value2' } }
        ]
      }));
      
      // Verify the delete attribute request was made
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'delete',
        resource: 'dataContext[Sampler].collection[samples].attribute[oldName]'
      });
    });

    it('should handle cases with nested structure', async () => {
      // Mock responses for different requests in sequence
      const mockResponses = [
        // First call - get all cases
        {
          success: true,
          values: {
            cases: [
              { 
                case: { 
                  id: 1, 
                  values: { oldName: 'value1' } 
                } 
              }
            ]
          }
        },
        // Second call - get data contexts
        {
          success: true,
          values: [{ name: 'Sampler' }]
        },
        // Third call - get collections
        {
          success: true,
          values: [{ name: 'samples' }]
        },
        // Fourth call - get attributes
        {
          success: true,
          values: []
        },
        // Fifth call - create new attribute
        {
          success: true,
          values: { name: 'newName' }
        },
        // Sixth call - update cases
        {
          success: true,
          values: { caseCount: 1 }
        },
        // Seventh call - delete old attribute
        {
          success: true,
          values: {}
        },
        // Eighth call - get component list
        {
          success: true,
          values: []
        }
      ];
      
      let callIndex = 0;
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockResponses[callIndex++]);
      });
      
      await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      // Verify the update cases request was made with the correct values
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        action: 'update',
        resource: 'dataContext[Sampler].collection[samples].case',
        values: [
          { id: 1, values: { newName: 'value1' } }
        ]
      }));
    });

    it('should handle cases with array structure', async () => {
      // Mock responses for different requests in sequence
      const mockResponses = [
        // First call - get all cases (as array)
        {
          success: true,
          values: [
            { id: 1, values: { oldName: 'value1' } }
          ]
        },
        // Second call - get data contexts
        {
          success: true,
          values: [{ name: 'Sampler' }]
        },
        // Third call - get collections
        {
          success: true,
          values: [{ name: 'samples' }]
        },
        // Fourth call - get attributes
        {
          success: true,
          values: []
        },
        // Fifth call - create new attribute
        {
          success: true,
          values: { name: 'newName' }
        },
        // Sixth call - update cases
        {
          success: true,
          values: { caseCount: 1 }
        },
        // Seventh call - delete old attribute
        {
          success: true,
          values: {}
        },
        // Eighth call - get component list
        {
          success: true,
          values: []
        }
      ];
      
      let callIndex = 0;
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockResponses[callIndex++]);
      });
      
      await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      // Verify the update cases request was made with the correct values
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        action: 'update',
        resource: 'dataContext[Sampler].collection[samples].case',
        values: [
          { id: 1, values: { newName: 'value1' } }
        ]
      }));
    });

    it('should handle no cases to update', async () => {
      // Mock responses for different requests in sequence
      const mockResponses = [
        // First call - get all cases
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { differentName: 'value1' } } // No oldName property
            ]
          }
        },
        // Second call - get data contexts
        {
          success: true,
          values: [{ name: 'Sampler' }]
        },
        // Third call - get collections
        {
          success: true,
          values: [{ name: 'samples' }]
        },
        // Fourth call - get attributes
        {
          success: true,
          values: []
        },
        // Fifth call - create new attribute
        {
          success: true,
          values: { name: 'newName' }
        },
        // Sixth call - delete old attribute
        {
          success: true,
          values: {}
        },
        // Seventh call - get component list
        {
          success: true,
          values: []
        }
      ];
      
      let callIndex = 0;
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockResponses[callIndex++]);
      });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      expect(consoleSpy).toHaveBeenCalledWith("No cases found with values to update");
      expect(codapInterface.sendRequest).toHaveBeenCalledTimes(7); // One less call because we skip the update
    });
  });

  describe('renameAttribute formula updates', () => {
    it('should update formulas that reference the old attribute name', async () => {
      // Mock responses for different requests in sequence
      const mockResponses = [
        // First call - get all cases
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { oldName: 'value1' } }
            ]
          }
        },
        // Second call - get data contexts
        {
          success: true,
          values: [{ name: 'Sampler' }]
        },
        // Third call - get collections
        {
          success: true,
          values: [{ name: 'samples' }]
        },
        // Fourth call - get attributes
        {
          success: true,
          values: [{ name: 'formula_attr' }]
        },
        // Fifth call - get full attribute details
        {
          success: true,
          values: { name: 'formula_attr', formula: '`oldName` + 1' }
        },
        // Sixth call - create new attribute
        {
          success: true,
          values: { name: 'newName' }
        },
        // Seventh call - update cases
        {
          success: true,
          values: { caseCount: 1 }
        },
        // Eighth call - delete old attribute
        {
          success: true,
          values: {}
        },
        // Ninth call - update formula
        {
          success: true,
          values: { formula: '`newName` + 1' }
        },
        // Tenth call - get component list
        {
          success: true,
          values: []
        }
      ];
      
      let callIndex = 0;
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockResponses[callIndex++]);
      });
      
      await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      // Verify the formula update request was made with the correct values
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        action: 'update',
        resource: 'dataContext[Sampler].collection[samples].attribute[formula_attr]',
        values: { formula: '`newName` + 1' }
      }));
    });

    it('should handle different formula reference patterns', async () => {
      // Mock responses for different requests in sequence
      const mockResponses = [
        // First call - get all cases
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { oldName: 'value1' } }
            ]
          }
        },
        // Second call - get data contexts
        {
          success: true,
          values: [{ name: 'Sampler' }]
        },
        // Third call - get collections
        {
          success: true,
          values: [{ name: 'samples' }]
        },
        // Fourth call - get attributes
        {
          success: true,
          values: [
            { name: 'formula_attr1' },
            { name: 'formula_attr2' },
            { name: 'formula_attr3' },
            { name: 'formula_attr4' }
          ]
        },
        // Fifth call - get full attribute details for formula_attr1
        {
          success: true,
          values: { name: 'formula_attr1', formula: 'oldName + 1' } // Unquoted
        },
        // Sixth call - get full attribute details for formula_attr2
        {
          success: true,
          values: { name: 'formula_attr2', formula: '"oldName" * 2' } // Double quoted
        },
        // Seventh call - get full attribute details for formula_attr3
        {
          success: true,
          values: { name: 'formula_attr3', formula: '\'oldName\' / 3' } // Single quoted
        },
        // Eighth call - get full attribute details for formula_attr4
        {
          success: true,
          values: { name: 'formula_attr4', formula: 'OLDNAME ^ 2' } // Case insensitive
        },
        // Ninth call - create new attribute
        {
          success: true,
          values: { name: 'newName' }
        },
        // Tenth call - update cases
        {
          success: true,
          values: { caseCount: 1 }
        },
        // 11th call - delete old attribute
        {
          success: true,
          values: {}
        },
        // 12th call - update formula for formula_attr1
        {
          success: true,
          values: { formula: 'newName + 1' }
        },
        // 13th call - update formula for formula_attr2
        {
          success: true,
          values: { formula: '"newName" * 2' }
        },
        // 14th call - update formula for formula_attr3
        {
          success: true,
          values: { formula: '\'newName\' / 3' }
        },
        // 15th call - update formula for formula_attr4
        {
          success: true,
          values: { formula: 'newName ^ 2' }
        },
        // 16th call - get component list
        {
          success: true,
          values: []
        }
      ];
      
      let callIndex = 0;
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockResponses[callIndex++]);
      });
      
      await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      // Verify formula updates for different patterns
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        action: 'update',
        resource: 'dataContext[Sampler].collection[samples].attribute[formula_attr1]',
        values: { formula: 'newName + 1' }
      }));
      
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        action: 'update',
        resource: 'dataContext[Sampler].collection[samples].attribute[formula_attr2]',
        values: { formula: '"newName" * 2' }
      }));
      
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        action: 'update',
        resource: 'dataContext[Sampler].collection[samples].attribute[formula_attr3]',
        values: { formula: '\'newName\' / 3' }
      }));
      
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        action: 'update',
        resource: 'dataContext[Sampler].collection[samples].attribute[formula_attr4]',
        values: { formula: 'newName ^ 2' }
      }));
    });

    it('should handle calculator components', async () => {
      // Mock responses for different requests in sequence
      const mockResponses = [
        // First call - get all cases
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { oldName: 'value1' } }
            ]
          }
        },
        // Second call - get data contexts
        {
          success: true,
          values: [{ name: 'Sampler' }]
        },
        // Third call - get collections
        {
          success: true,
          values: [{ name: 'samples' }]
        },
        // Fourth call - get attributes
        {
          success: true,
          values: []
        },
        // Fifth call - create new attribute
        {
          success: true,
          values: { name: 'newName' }
        },
        // Sixth call - update cases
        {
          success: true,
          values: { caseCount: 1 }
        },
        // Seventh call - delete old attribute
        {
          success: true,
          values: {}
        },
        // Eighth call - get component list
        {
          success: true,
          values: [
            { type: 'calculator', name: 'Calculator1' }
          ]
        }
      ];
      
      let callIndex = 0;
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockResponses[callIndex++]);
      });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      // Verify warning about calculator components was logged
      expect(consoleSpy).toHaveBeenCalledWith("WARNING: There are calculator components that might contain formulas referencing the old attribute name.");
    });

    it('should handle failed formula update', async () => {
      // Mock responses for different requests in sequence
      const mockResponses = [
        // First call - get all cases
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { oldName: 'value1' } }
            ]
          }
        },
        // Second call - get data contexts
        {
          success: true,
          values: [{ name: 'Sampler' }]
        },
        // Third call - get collections
        {
          success: true,
          values: [{ name: 'samples' }]
        },
        // Fourth call - get attributes
        {
          success: true,
          values: [{ name: 'formula_attr' }]
        },
        // Fifth call - get full attribute details
        {
          success: true,
          values: { name: 'formula_attr', formula: '`oldName` + 1' }
        },
        // Sixth call - create new attribute
        {
          success: true,
          values: { name: 'newName' }
        },
        // Seventh call - update cases
        {
          success: true,
          values: { caseCount: 1 }
        },
        // Eighth call - delete old attribute
        {
          success: true,
          values: {}
        },
        // Ninth call - update formula (fails)
        {
          success: false,
          values: null
        },
        // Tenth call - get component list
        {
          success: true,
          values: []
        }
      ];
      
      let callIndex = 0;
      (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockResponses[callIndex++]);
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
      
      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith("Failed to update formula for attribute formula_attr:", expect.anything());
    });
  });
}); 