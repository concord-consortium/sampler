import {
  evaluateResult,
  hasSamplesCollection,
  findOrCreateDataContext,
  deleteAll,
  addMeasure,
  getNewExperimentInfo,
  renameAttribute,
  kDataContextName
} from "./codap-helpers";
import { 
  codapInterface, 
  getDataContext, 
  getAttributeList, 
  createNewAttribute,
  createDataContext,
  createParentCollection,
  createChildCollection,
  getAllItems
} from "@concord-consortium/codap-plugin-api";
import { AttrMap } from "../types";

// Mock the codap-plugin-api
jest.mock("@concord-consortium/codap-plugin-api", () => ({
  codapInterface: {
    sendRequest: jest.fn()
  },
  createDataContext: jest.fn(),
  createParentCollection: jest.fn(),
  createChildCollection: jest.fn(),
  createNewAttribute: jest.fn(),
  getDataContext: jest.fn(),
  getAttributeList: jest.fn(),
  getAllItems: jest.fn()
}));

describe('codap-helpers final coverage tests', () => {
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

  // Additional tests for addMeasure function
  describe('addMeasure additional tests', () => {
    it('should handle duplicate attribute names by adding a number suffix', async () => {
      // Mock codapInterface.sendRequest for getting attribute list
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        if (request.resource.includes("attributeList")) {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'count' }, // Existing attribute with the same name
              { name: 'other' }
            ]
          });
        } else if (request.action === 'create') {
          return Promise.resolve({
            success: true
          });
        }
        return Promise.resolve({ success: false });
      });

      // Call addMeasure without a specific name (should use measureType as name)
      addMeasure('', 'count', 'count()');

      // Wait for promises to resolve
      await new Promise(process.nextTick);

      // Verify that sendRequest was called with the correct parameters
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create',
          resource: expect.stringContaining('attribute'),
          values: expect.arrayContaining([
            expect.objectContaining({
              name: 'count1', // Should add '1' suffix
              formula: 'count()'
            })
          ])
        })
      );
    });

    it('should handle duplicate attribute names with existing numeric suffixes', async () => {
      // Mock codapInterface.sendRequest for getting attribute list
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        if (request.resource.includes("attributeList")) {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'count' },
              { name: 'count1' }, // Already has suffix 1
              { name: 'count3' }, // Has suffix 3 (skipping 2)
              { name: 'other' }
            ]
          });
        } else if (request.action === 'create') {
          return Promise.resolve({
            success: true
          });
        }
        return Promise.resolve({ success: false });
      });

      // Call addMeasure without a specific name
      addMeasure('', 'count', 'count()');

      // Wait for promises to resolve
      await new Promise(process.nextTick);

      // Verify that sendRequest was called with the correct parameters
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create',
          resource: expect.stringContaining('attribute'),
          values: expect.arrayContaining([
            expect.objectContaining({
              name: 'count2', // Should find the gap and use 'count2'
              formula: 'count()'
            })
          ])
        })
      );
    });

    it('should update an existing attribute when measureName is provided and attribute exists', async () => {
      // Mock codapInterface.sendRequest for getting attribute list
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        if (request.resource.includes("attributeList")) {
          return Promise.resolve({
            success: true,
            values: [
              { name: 'existingMeasure' }, // Existing attribute with the same name
              { name: 'other' }
            ]
          });
        } else if (request.action === 'update') {
          return Promise.resolve({
            success: true
          });
        }
        return Promise.resolve({ success: false });
      });

      // Call addMeasure with a specific name that already exists
      addMeasure('existingMeasure', 'count', 'newFormula()');

      // Wait for promises to resolve
      await new Promise(process.nextTick);

      // Verify that sendRequest was called with the correct parameters
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update',
          resource: expect.stringContaining('existingMeasure'),
          values: expect.objectContaining({
            formula: 'newFormula()'
          })
        })
      );
    });
  });

  // Additional tests for getNewExperimentInfo function
  describe('getNewExperimentInfo additional tests', () => {
    it('should handle case where experiment with matching hash exists', async () => {
      // Mock getAllItems to return existing experiments
      (getAllItems as jest.Mock).mockResolvedValue({
        success: true,
        values: [
          { 
            values: { 
              experiment: 1, 
              experimentHash: 'hash123',
              sample: 5 // Highest sample number
            }
          },
          { 
            values: { 
              experiment: 1, 
              experimentHash: 'hash123',
              sample: 3
            }
          },
          { 
            values: { 
              experiment: 2, 
              experimentHash: 'differentHash',
              sample: 1
            }
          }
        ]
      });

      const result = await getNewExperimentInfo('hash123');

      // Should return the existing experiment number and next sample number
      expect(result).toEqual({ experimentNum: 1, startingSampleNumber: 6 });
    });

    it('should handle case where no experiment with matching hash exists', async () => {
      // Mock getAllItems to return existing experiments but none with matching hash
      (getAllItems as jest.Mock).mockResolvedValue({
        success: true,
        values: [
          { 
            values: { 
              experiment: 3, 
              experimentHash: 'hash456',
              sample: 1
            }
          },
          { 
            values: { 
              experiment: 2, 
              experimentHash: 'hash789',
              sample: 1
            }
          }
        ]
      });

      const result = await getNewExperimentInfo('hash123');

      // Should return a new experiment number (max + 1) and starting sample number 1
      expect(result).toEqual({ experimentNum: 4, startingSampleNumber: 1 });
    });
  });

  // Additional tests for renameAttribute function
  describe('renameAttribute additional tests', () => {
    it('should handle different case structures in the response', async () => {
      // Mock codapInterface.sendRequest with a different case structure
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        if (request.resource.includes("allCases")) {
          return Promise.resolve({
            success: true,
            values: {
              case: [ // Using the 'case' property directly
                { id: 1, values: { oldAttr: 'value1' } },
                { id: 2, values: { oldAttr: 'value2' } }
              ]
            }
          });
        } else {
          return Promise.resolve({
            success: true,
            values: []
          });
        }
      });

      await renameAttribute(kDataContextName, 'samples', 'oldAttr', 'newAttr');

      // Just verify that the function completes without errors
      expect(codapInterface.sendRequest).toHaveBeenCalled();
    });

    it('should handle cases with nested structure', async () => {
      // Mock codapInterface.sendRequest with a nested case structure
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        if (request.resource.includes("allCases")) {
          return Promise.resolve({
            success: true,
            values: {
              cases: [ // Using the 'cases' array with nested 'case' objects
                { case: { id: 1, values: { oldAttr: 'value1' } } },
                { case: { id: 2, values: { oldAttr: 'value2' } } }
              ]
            }
          });
        } else {
          return Promise.resolve({
            success: true,
            values: []
          });
        }
      });

      await renameAttribute(kDataContextName, 'samples', 'oldAttr', 'newAttr');

      // Just verify that the function completes without errors
      expect(codapInterface.sendRequest).toHaveBeenCalled();
    });

    it('should handle calculator components with formulas', async () => {
      // Mock codapInterface.sendRequest to include calculator components
      (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
        if (request.resource.includes("allCases")) {
          return Promise.resolve({
            success: true,
            values: {
              cases: [
                { id: 1, values: { oldAttr: 'value1' } },
                { id: 2, values: { oldAttr: 'value2' } }
              ]
            }
          });
        } else if (request.resource === 'componentList') {
          return Promise.resolve({
            success: true,
            values: [
              { 
                type: 'calculator', 
                id: 'calc1',
                name: 'Calculator 1',
                content: {
                  expression: 'oldAttr * 2'
                }
              }
            ]
          });
        } else {
          return Promise.resolve({
            success: true,
            values: []
          });
        }
      });

      await renameAttribute(kDataContextName, 'samples', 'oldAttr', 'newAttr');

      // Just verify that the function completes without errors
      expect(codapInterface.sendRequest).toHaveBeenCalled();
    });
  });
}); 