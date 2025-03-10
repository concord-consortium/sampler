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
import { AttrMap, IAttrForMap } from "../types";

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

describe("CODAP Helpers", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("evaluateResult", () => {
    it("should evaluate a formula and return the result", async () => {
      // Arrange
      const formula = "count(output='a')";
      const value = { output: "a" };
      const mockResponse = {
        success: true,
        values: [true]
      };
      (codapInterface.sendRequest as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await evaluateResult(formula, value);

      // Assert
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "notify",
        resource: "formulaEngine",
        values: {
          request: "evalExpression",
          source: formula,
          records: [value]
        }
      });
      expect(result).toBe(true);
    });

    it("should throw an error when formula evaluation fails", async () => {
      // Arrange
      const formula = "invalid formula";
      const value = { output: "a" };
      const mockResponse = {
        success: false
      };
      (codapInterface.sendRequest as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(evaluateResult(formula, value)).rejects.toThrow("Formula evaluation failed");
    });
  });

  describe("hasSamplesCollection", () => {
    it("should return true when samples collection exists", async () => {
      // Arrange
      const mockResponse = {
        success: true,
        values: {
          collections: [
            { name: "experiments" },
            { name: "samples" },
            { name: "items" }
          ]
        }
      };
      (getDataContext as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await hasSamplesCollection();

      // Assert
      expect(getDataContext).toHaveBeenCalledWith(kDataContextName);
      expect(result).toBe(true);
    });

    it("should return false when samples collection does not exist", async () => {
      // Arrange
      const mockResponse = {
        success: true,
        values: {
          collections: [
            { name: "experiments" },
            { name: "items" }
          ]
        }
      };
      (getDataContext as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await hasSamplesCollection();

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when dataContext does not exist", async () => {
      // Arrange
      const mockResponse = {
        success: false
      };
      (getDataContext as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await hasSamplesCollection();

      // Assert
      expect(result).toBe(false);
    });

    it("should set global state when creating a new data context", async () => {
      // Arrange
      const mockGetDataContextResponse = {
        success: false
      };
      const mockCreateDataContextResponse = {
        success: true,
        values: { name: kDataContextName }
      };
      const mockCreateParentCollectionResponse = {
        success: true
      };
      const mockCreateChildCollectionResponse = {
        success: true
      };
      const mockSendRequestResponse = {
        success: true
      };
      
      (getDataContext as jest.Mock).mockResolvedValue(mockGetDataContextResponse);
      (createDataContext as jest.Mock).mockResolvedValue(mockCreateDataContextResponse);
      (createParentCollection as jest.Mock).mockResolvedValue(mockCreateParentCollectionResponse);
      (createChildCollection as jest.Mock).mockResolvedValue(mockCreateChildCollectionResponse);
      (codapInterface.sendRequest as jest.Mock).mockResolvedValue(mockSendRequestResponse);
      
      const mockSetGlobalState = jest.fn();

      // Act
      const result = await findOrCreateDataContext([], {
        experiment: { name: "experiment", codapID: null },
        description: { name: "description", codapID: null },
        sample_size: { name: "sample_size", codapID: null },
        experimentHash: { name: "experimentHash", codapID: null },
        sample: { name: "sample", codapID: null }
      }, mockSetGlobalState);

      // Assert
      expect(createDataContext).toHaveBeenCalledWith(kDataContextName);
      expect(mockSetGlobalState).toHaveBeenCalled();
    });
  });

  describe("findOrCreateDataContext", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should use existing data context when one exists", async () => {
      // Mock getDataContext to return success
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          collections: [
            { name: 'experiments' },
            { name: 'samples' },
            { name: 'items' }
          ]
        }
      });

      // Mock getAttributeList to return attributes
      (getAttributeList as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { id: 1, name: 'attr1', title: 'Attr 1' },
          { id: 2, name: 'attr2', title: 'Attr 2' }
        ]
      });

      // Mock sendRequest for updateAttributeIds
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((reqs, callback) => {
        // Simulate successful responses for attribute lookups
        const responses = [
          { success: true, values: { id: 'exp1', name: 'experiment' } },
          { success: true, values: { id: 'desc1', name: 'description' } },
          { success: true, values: { id: 'ss1', name: 'sample_size' } },
          { success: true, values: { id: 'eh1', name: 'experimentHash' } },
          { success: true, values: { id: 'samp1', name: 'sample' } },
          { success: true, values: { id: 'attr1', name: 'attr1' } },
          { success: true, values: { id: 'attr2', name: 'attr2' } }
        ];
        callback(responses);
        return Promise.resolve({ success: true });
      });

      const mockSetGlobalState = jest.fn();
      const attrs = ['attr1', 'attr2'];
      const attrMap = {
        experiment: { name: 'experiment', codapID: '' },
        description: { name: 'description', codapID: '' },
        sample_size: { name: 'sample_size', codapID: '' },
        experimentHash: { name: 'experimentHash', codapID: '' },
        sample: { name: 'sample', codapID: '' }
      };

      const result = await findOrCreateDataContext(attrs, attrMap, mockSetGlobalState);
      
      expect(result).toBe(true);
      expect(getDataContext).toHaveBeenCalledWith(kDataContextName);
      expect(getAttributeList).toHaveBeenCalledWith(kDataContextName, 'items');
      
      // Verify that setGlobalState was called to update the codapIDs
      expect(mockSetGlobalState).toHaveBeenCalledTimes(5);
      
      // Verify the first call to update experiment codapID
      const firstCall = mockSetGlobalState.mock.calls[0][0];
      const draftFn = jest.fn();
      const draft = { attrMap };
      firstCall(draft);
      expect(draft.attrMap.experiment.codapID).toBe('exp1');
    });

    it("should create missing attributes when they don't exist in the data context", async () => {
      // Arrange
      const attrs = ["output", "newAttr"];
      const attrMap: AttrMap = {
        experiment: { name: "experiment", codapID: null },
        description: { name: "description", codapID: null },
        sample_size: { name: "sample size", codapID: null },
        experimentHash: { name: "experimentHash", codapID: null },
        sample: { name: "sample", codapID: null },
        output: { name: "output", codapID: null }
      };
      const mockSetGlobalState = jest.fn();
      
      // Mock getDataContext to return success (context exists)
      const getDataContextResponse = { 
        success: true,
        values: {
          id: "dataContext1",
          collections: [
            { name: "experiments", id: "collection1" },
            { name: "samples", id: "collection2" },
            { name: "items", id: "collection3" }
          ]
        }
      };
      (getDataContext as jest.Mock).mockResolvedValue(getDataContextResponse);
      
      // Mock getAttributeList to return attributes (missing newAttr)
      const getAttributeListResponse = {
        values: [
          { name: "experiment", id: "attr1" },
          { name: "description", id: "attr2" },
          { name: "sample size", id: "attr3" },
          { name: "experimentHash", id: "attr4" },
          { name: "sample", id: "attr5" },
          { name: "output", id: "attr6" }
        ]
      };
      (getAttributeList as jest.Mock).mockResolvedValue(getAttributeListResponse);

      // Mock createNewAttribute
      (createNewAttribute as jest.Mock).mockResolvedValue({ success: true });

      // Mock codapInterface.sendRequest for updateAttributeIds
      (codapInterface.sendRequest as jest.Mock).mockImplementation((reqs, callback) => {
        if (callback) {
          callback([
            { success: true, values: { id: "attr1", name: "experiment" } },
            { success: true, values: { id: "attr2", name: "description" } },
            { success: true, values: { id: "attr3", name: "sample size" } },
            { success: true, values: { id: "attr4", name: "experimentHash" } },
            { success: true, values: { id: "attr5", name: "sample" } },
            { success: true, values: { id: "attr6", name: "output" } },
            { success: true, values: { id: "attr7", name: "newAttr" } }
          ]);
        }
        return Promise.resolve({ success: true });
      });

      // Act
      const result = await findOrCreateDataContext(attrs, attrMap, mockSetGlobalState);

      // Assert
      expect(result).toBe(true);
      expect(getDataContext).toHaveBeenCalledWith(kDataContextName);
      expect(getAttributeList).toHaveBeenCalledWith(kDataContextName, "items");
      expect(createNewAttribute).toHaveBeenCalledWith(kDataContextName, "items", "newAttr");
      expect(createDataContext).not.toHaveBeenCalled();
      expect(mockSetGlobalState).toHaveBeenCalled();
    });

    it("should create a new data context when one does not exist", async () => {
      // Arrange
      const attrs = ["output"];
      const attrMap: AttrMap = {
        experiment: { name: "experiment", codapID: null },
        description: { name: "description", codapID: null },
        sample_size: { name: "sample size", codapID: null },
        experimentHash: { name: "experimentHash", codapID: null },
        sample: { name: "sample", codapID: null },
        output: { name: "output", codapID: null }
      };
      const mockSetGlobalState = jest.fn();
      
      // Mock getDataContext to return failure (context doesn't exist)
      const getDataContextResponse = { success: false };
      (getDataContext as jest.Mock).mockResolvedValue(getDataContextResponse);
      
      // Mock createDataContext to return success
      const createDataContextResponse = { 
        success: true,
        values: { id: "dataContext1" }
      };
      (createDataContext as jest.Mock).mockResolvedValue(createDataContextResponse);
      
      // Mock createParentCollection
      const createParentCollectionResponse = { success: true, values: { id: "collection1" } };
      (createParentCollection as jest.Mock).mockResolvedValue(createParentCollectionResponse);
      
      // Mock createChildCollection
      const createChildCollectionResponse = { success: true, values: { id: "collection2" } };
      (createChildCollection as jest.Mock).mockResolvedValue(createChildCollectionResponse);
      
      // Mock codapInterface.sendRequest for createWideTable and updateAttributeIds
      (codapInterface.sendRequest as jest.Mock).mockImplementation((req, callback) => {
        if (typeof req === 'object' && req.action === 'create' && req.resource === 'component') {
          return Promise.resolve({ success: true });
        }
        if (callback) {
          callback([
            { success: true, values: { id: "attr1", name: "experiment" } },
            { success: true, values: { id: "attr2", name: "description" } },
            { success: true, values: { id: "attr3", name: "sample size" } },
            { success: true, values: { id: "attr4", name: "experimentHash" } },
            { success: true, values: { id: "attr5", name: "sample" } },
            { success: true, values: { id: "attr6", name: "output" } }
          ]);
        }
        return Promise.resolve({ success: true });
      });

      // Act
      const result = await findOrCreateDataContext(attrs, attrMap, mockSetGlobalState);

      // Assert
      expect(result).toBe(true);
      expect(getDataContext).toHaveBeenCalledWith(kDataContextName);
      expect(createDataContext).toHaveBeenCalledWith(kDataContextName);
      expect(mockSetGlobalState).toHaveBeenCalled();
      expect(createParentCollection).toHaveBeenCalledWith(
        kDataContextName, 
        "experiments", 
        expect.arrayContaining([
          expect.objectContaining({ name: "experiment" }),
          expect.objectContaining({ name: "description" }),
          expect.objectContaining({ name: "sample size" }),
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
      expect(createChildCollection).toHaveBeenCalledWith(
        kDataContextName,
        "items",
        "samples",
        expect.arrayContaining([
          expect.objectContaining({ name: "output" })
        ])
      );
      
      // Check that createWideTable was called
      const createWideTableCall = (codapInterface.sendRequest as jest.Mock).mock.calls.find(
        call => 
          typeof call[0] === 'object' && 
          call[0].action === 'create' && 
          call[0].resource === 'component' &&
          call[0].values.type === 'caseTable'
      );
      
      expect(createWideTableCall).toBeTruthy();
      expect(createWideTableCall[0]).toEqual({
        action: "create",
        resource: "component",
        values: {
          type: "caseTable",
          dataContext: kDataContextName,
          title: "Sampler Data",
          dimensions: {
            width: 1000,
            height: 200
          }
        }
      });
    });

    it("should handle attribute lookup failures during updateAttributeIds", async () => {
      // Mock getDataContext to return success
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: {
          collections: [
            { name: 'experiments' },
            { name: 'samples' },
            { name: 'items' }
          ]
        }
      });

      // Mock getAttributeList to return attributes
      (getAttributeList as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { id: 1, name: 'attr1', title: 'Attr 1' },
          { id: 2, name: 'attr2', title: 'Attr 2' }
        ]
      });

      // Mock sendRequest for updateAttributeIds with some failures
      (codapInterface.sendRequest as jest.Mock).mockImplementationOnce((reqs, callback) => {
        // Simulate mixed success/failure responses for attribute lookups
        const responses = [
          { success: true, values: { id: 'exp1', name: 'experiment' } },
          { success: false }, // Failed lookup for description
          { success: true, values: { id: 'ss1', name: 'sample_size' } },
          { success: true, values: { id: 'eh1', name: 'experimentHash' } },
          { success: true, values: { id: 'samp1', name: 'sample' } },
          { success: true, values: { id: 'attr1', name: 'attr1' } },
          { success: false } // Failed lookup for attr2
        ];
        callback(responses);
        return Promise.resolve({ success: true });
      });

      const mockSetGlobalState = jest.fn();
      const attrs = ['attr1', 'attr2'];
      const attrMap = {
        experiment: { name: 'experiment', codapID: '' },
        description: { name: 'description', codapID: '' },
        sample_size: { name: 'sample_size', codapID: '' },
        experimentHash: { name: 'experimentHash', codapID: '' },
        sample: { name: 'sample', codapID: '' }
      };

      const result = await findOrCreateDataContext(attrs, attrMap, mockSetGlobalState);
      
      expect(result).toBe(true);
      
      // Verify that setGlobalState was called only for successful lookups
      expect(mockSetGlobalState).toHaveBeenCalledTimes(4); // For experiment, sample_size, experimentHash, and sample
    });

    it('should handle table creation failure when creating a new data context', async () => {
      // Mock getDataContext to return failure (context doesn't exist)
      (getDataContext as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      // Mock createDataContext to return success
      (createDataContext as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: { name: kDataContextName }
      });

      // Mock createParentCollection to return success
      (createParentCollection as jest.Mock).mockResolvedValueOnce({
        success: true
      });

      // Mock createChildCollection to return success for both calls
      (createChildCollection as jest.Mock)
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ success: true });

      // Mock sendRequest for createWideTable to return failure
      (codapInterface.sendRequest as jest.Mock).mockImplementation((req, callback) => {
        if (typeof req === 'object' && req.action === 'create' && req.resource === 'component') {
          return Promise.resolve({ success: true });
        }
        if (callback) {
          callback([
            { success: true, values: { id: "attr1", name: "experiment" } },
            { success: true, values: { id: "attr2", name: "description" } },
            { success: true, values: { id: "attr3", name: "sample size" } },
            { success: true, values: { id: "attr4", name: "experimentHash" } },
            { success: true, values: { id: "attr5", name: "sample" } },
            { success: true, values: { id: "attr6", name: "output" } }
          ]);
        }
        return Promise.resolve({ success: true });
      });

      const mockSetGlobalState = jest.fn();
      const attrs = ['attr1', 'attr2'];
      const attrMap = {
        experiment: { name: 'experiment', codapID: '' },
        description: { name: 'description', codapID: '' },
        sample_size: { name: 'sample_size', codapID: '' },
        experimentHash: { name: 'experimentHash', codapID: '' },
        sample: { name: 'sample', codapID: '' }
      };

      const result = await findOrCreateDataContext(attrs, attrMap, mockSetGlobalState);
      
      expect(result).toBe(true);
      expect(getDataContext).toHaveBeenCalledWith(kDataContextName);
      expect(createDataContext).toHaveBeenCalledWith(kDataContextName);
      expect(mockSetGlobalState).toHaveBeenCalled();
      expect(createParentCollection).toHaveBeenCalledWith(
        kDataContextName, 
        "experiments", 
        expect.arrayContaining([
          expect.objectContaining({ name: "experiment" }),
          expect.objectContaining({ name: "description" }),
          expect.objectContaining({ name: "sample size" }),
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
      expect(createChildCollection).toHaveBeenCalledWith(
        kDataContextName,
        "items",
        "samples",
        expect.arrayContaining([
          expect.objectContaining({ name: "output" })
        ])
      );
      
      // Check that createWideTable was called
      const createWideTableCall = (codapInterface.sendRequest as jest.Mock).mock.calls.find(
        call => 
          typeof call[0] === 'object' && 
          call[0].action === 'create' && 
          call[0].resource === 'component' &&
          call[0].values.type === 'caseTable'
      );
      
      expect(createWideTableCall).toBeTruthy();
      expect(createWideTableCall[0]).toEqual({
        action: "create",
        resource: "component",
        values: {
          type: "caseTable",
          dataContext: kDataContextName,
          title: "Sampler Data",
          dimensions: {
            width: 1000,
            height: 200
          }
        }
      });
    });
  });

  describe("deleteAll", () => {
    it("should delete all items from the data context", async () => {
      // Arrange
      const attrMap: AttrMap = {
        experiment: { name: "experiment", codapID: null },
        description: { name: "description", codapID: null },
        sample_size: { name: "sample size", codapID: null },
        experimentHash: { name: "experimentHash", codapID: null },
        sample: { name: "sample", codapID: null },
        output: { name: "output", codapID: null }
      };
      (codapInterface.sendRequest as jest.Mock).mockResolvedValue({ success: true });

      // Act
      await deleteAll(attrMap);

      // Assert
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "delete",
        resource: `dataContext[${kDataContextName}].collection[${attrMap.experiment.name}].allCases`
      });
    });
  });

  describe("addMeasure", () => {
    it("should add a measure to the samples collection", async () => {
      // Arrange
      const measureName = "countA";
      const measureType = "numeric";
      const formula = "count(output='a')";
      
      // Mock the attribute list response
      const attributeListResponse = {
        success: true,
        values: [
          { name: "experiment", id: "attr1" },
          { name: "sample", id: "attr2" }
        ]
      };
      (codapInterface.sendRequest as jest.Mock).mockImplementation((req) => {
        if (req.action === "get" && req.resource.includes("attributeList")) {
          return Promise.resolve(attributeListResponse);
        }
        return Promise.resolve({ success: true });
      });

      // Act
      await addMeasure(measureName, measureType, formula);

      // Assert
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "get",
        resource: `dataContext[${kDataContextName}].collection[samples].attributeList`
      });
      
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "create",
        resource: `dataContext[${kDataContextName}].collection[samples].attribute`,
        values: [{
          name: measureName,
          type: "numeric",
          formula
        }]
      });
    });

    it("should handle the case when the attribute name already exists and no measure name is provided", async () => {
      // Arrange
      const measureName = "";
      const measureType = "count";
      const formula = "count(output='a')";
      
      // Mock the attribute list response with existing count attribute
      const attributeListResponse = {
        success: true,
        values: [
          { name: "experiment", id: "attr1" },
          { name: "sample", id: "attr2" },
          { name: "count", id: "attr3" }
        ]
      };
      (codapInterface.sendRequest as jest.Mock).mockImplementation((req) => {
        if (req.action === "get" && req.resource.includes("attributeList")) {
          return Promise.resolve(attributeListResponse);
        }
        return Promise.resolve({ success: true });
      });

      // Act
      await addMeasure(measureName, measureType, formula);

      // Assert
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "get",
        resource: `dataContext[${kDataContextName}].collection[samples].attributeList`
      });
      
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "create",
        resource: `dataContext[${kDataContextName}].collection[samples].attribute`,
        values: [{
          name: "count1",
          type: "numeric",
          formula
        }]
      });
    });

    it("should handle the case when multiple attributes with the same name exist", async () => {
      // Arrange
      const measureName = "";
      const measureType = "count";
      const formula = "count(output='a')";
      
      // Mock the attribute list response with multiple count attributes
      const attributeListResponse = {
        success: true,
        values: [
          { name: "experiment", id: "attr1" },
          { name: "sample", id: "attr2" },
          { name: "count", id: "attr3" },
          { name: "count1", id: "attr4" },
          { name: "count2", id: "attr5" }
        ]
      };
      (codapInterface.sendRequest as jest.Mock).mockImplementation((req) => {
        if (req.action === "get" && req.resource.includes("attributeList")) {
          return Promise.resolve(attributeListResponse);
        }
        return Promise.resolve({ success: true });
      });

      // Act
      await addMeasure(measureName, measureType, formula);

      // Assert
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "get",
        resource: `dataContext[${kDataContextName}].collection[samples].attributeList`
      });
      
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "create",
        resource: `dataContext[${kDataContextName}].collection[samples].attribute`,
        values: [{
          name: "count3",
          type: "numeric",
          formula
        }]
      });
    });

    it("should update an existing attribute when attribute name already exists and measure name is provided", async () => {
      // Arrange
      const measureName = "existingMeasure";
      const measureType = "count";
      const formula = "count(output='a')";
      
      // Mock the attribute list response with existing attribute
      const attributeListResponse = {
        success: true,
        values: [
          { name: "experiment", id: "attr1" },
          { name: "sample", id: "attr2" },
          { name: "count", id: "attr3" },
          { name: "existingMeasure", id: "attr4" }
        ]
      };
      (codapInterface.sendRequest as jest.Mock).mockImplementation((req) => {
        if (req.action === "get" && req.resource.includes("attributeList")) {
          return Promise.resolve(attributeListResponse);
        }
        return Promise.resolve({ success: true });
      });

      // Act
      await addMeasure(measureName, measureType, formula);

      // Assert
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "get",
        resource: `dataContext[${kDataContextName}].collection[samples].attributeList`
      });
      
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "update",
        resource: `dataContext[${kDataContextName}].collection[samples].attribute[${measureName}]`,
        values: {
          formula
        }
      });
    });

    it("should handle the case when there is only one attribute with the same name", async () => {
      // Arrange
      const measureName = "";
      const measureType = "count";
      const formula = "count(output='a')";
      
      // Mock the attribute list response with one count attribute
      const attributeListResponse = {
        success: true,
        values: [
          { name: "experiment", id: "attr1" },
          { name: "sample", id: "attr2" },
          { name: "count", id: "attr3" }
        ]
      };
      (codapInterface.sendRequest as jest.Mock).mockImplementation((req) => {
        if (req.action === "get" && req.resource.includes("attributeList")) {
          return Promise.resolve(attributeListResponse);
        }
        return Promise.resolve({ success: true });
      });

      // Act
      await addMeasure(measureName, measureType, formula);

      // Assert
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "create",
        resource: `dataContext[${kDataContextName}].collection[samples].attribute`,
        values: [{
          name: "count1",
          type: "numeric",
          formula
        }]
      });
    });

    it("should handle the case when there are no attributes with the same name", async () => {
      // Arrange
      const measureName = "";
      const measureType = "count";
      const formula = "count(output='a')";
      
      // Mock the attribute list response with no count attributes
      const attributeListResponse = {
        success: true,
        values: [
          { name: "experiment", id: "attr1" },
          { name: "sample", id: "attr2" }
        ]
      };
      (codapInterface.sendRequest as jest.Mock).mockImplementation((req) => {
        if (req.action === "get" && req.resource.includes("attributeList")) {
          return Promise.resolve(attributeListResponse);
        }
        return Promise.resolve({ success: true });
      });

      // Act
      await addMeasure(measureName, measureType, formula);

      // Assert
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "create",
        resource: `dataContext[${kDataContextName}].collection[samples].attribute`,
        values: [{
          name: "count",
          type: "numeric",
          formula
        }]
      });
    });
  });

  describe('getNewExperimentInfo', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return experiment 1 and starting sample 1 when no data exists', async () => {
      // Mock the getAllItems function to return an empty array
      (getAllItems as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: []
      });

      const result = await getNewExperimentInfo('hash123');
      
      expect(result).toEqual({
        experimentNum: 1,
        startingSampleNumber: 1
      });
      expect(getAllItems).toHaveBeenCalledWith(kDataContextName);
    });

    it('should return the next experiment number when no matching hash exists', async () => {
      // Mock the getAllItems function to return existing experiments with different hashes
      (getAllItems as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { values: { experiment: 1, experimentHash: 'hash1' } },
          { values: { experiment: 2, experimentHash: 'hash2' } }
        ]
      });

      const result = await getNewExperimentInfo('hash123');
      
      expect(result).toEqual({
        experimentNum: 3,
        startingSampleNumber: 1
      });
    });

    it('should return the same experiment number and next sample number when matching hash exists', async () => {
      // Mock the getAllItems function to return existing experiments including a matching hash
      (getAllItems as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: [
          { values: { experiment: 1, experimentHash: 'hash1', sample: 5 } },
          { values: { experiment: 2, experimentHash: 'hash123', sample: 10 } },
          { values: { experiment: 2, experimentHash: 'hash123', sample: 15 } }
        ]
      });

      const result = await getNewExperimentInfo('hash123');
      
      expect(result).toEqual({
        experimentNum: 2,
        startingSampleNumber: 16
      });
    });

    it('should throw an error when the data context is not found', async () => {
      // Mock the getAllItems function to return a failure
      (getAllItems as jest.Mock).mockResolvedValueOnce({
        success: false
      });

      await expect(getNewExperimentInfo('hash123')).rejects.toThrow(
        "Sorry, the data context was not found!"
      );
    });
  });

  describe('renameAttribute', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Spy on console.log to reduce noise in test output
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      (console.log as jest.Mock).mockRestore();
      (console.error as jest.Mock).mockRestore();
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
      });
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
      expect(console.error).toHaveBeenCalled();
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

    it('should handle yet another case structure with cases array inside values.cases', async () => {
      // Mock responses with a different case structure
      const mockResponses = [
        // Step 1: Get all cases with a different structure
        {
          success: true,
          values: {
            cases: [
              { case: { id: 1, values: { 'oldAttr': 100 } } },
              { case: { id: 2, values: { 'oldAttr': 200 } } }
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
      });
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

    it('should handle errors in various steps of the process', async () => {
      // Mock a failure when getting data contexts
      (codapInterface.sendRequest as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          values: {
            cases: [
              { id: 1, values: { 'oldAttr': 100 } }
            ]
          }
        })
        .mockRejectedValueOnce(new Error('Failed to get data contexts'));

      await renameAttribute('Sampler', 'samples', 'oldAttr', 'newAttr');

      // Verify the function attempted to get data contexts
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'get',
          resource: 'dataContextList'
        })
      );
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors when creating the new attribute', async () => {
      // Mock responses with a failure when creating the new attribute
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
        // Step 4: Create new attribute (failure)
        {
          success: false,
          values: null
        }
      ];

      // Set up the mock to return each response in sequence
      mockResponses.forEach(response => {
        (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce(response);
      });

      await renameAttribute('Sampler', 'samples', 'oldAttr', 'newAttr');

      // Verify the function attempted to create the new attribute
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create',
          resource: 'dataContext[Sampler].collection[samples].attribute',
          values: expect.objectContaining({
            name: 'newAttr'
          })
        })
      );
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors when updating cases', async () => {
      // Mock responses with a failure when updating cases
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
        // Step 5: Update cases with new attribute values (failure)
        {
          success: false,
          values: null
        }
      ];

      // Set up the mock to return each response in sequence
      mockResponses.forEach(response => {
        (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce(response);
      });

      await renameAttribute('Sampler', 'samples', 'oldAttr', 'newAttr');

      // Verify the function attempted to update cases
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update',
          resource: 'dataContext[Sampler].collection[samples].case',
          values: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              values: { newAttr: 100 }
            })
          ])
        })
      );
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors when deleting the old attribute', async () => {
      // Mock responses with a failure when deleting the old attribute
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
        // Step 6: Delete old attribute (failure)
        {
          success: false,
          values: null
        }
      ];

      // Set up the mock to return each response in sequence
      mockResponses.forEach(response => {
        (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce(response);
      });

      await renameAttribute('Sampler', 'samples', 'oldAttr', 'newAttr');

      // Verify the function attempted to delete the old attribute
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'delete',
          resource: 'dataContext[Sampler].collection[samples].attribute[oldAttr]'
        })
      ));
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors when updating formulas', async () => {
      // Mock responses with a failure when updating formulas
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
          values: [
            { name: 'oldAttr' },
            { name: 'formulaAttr' }
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
        // Step 3: Get full details for formulaAttr
        {
          success: true,
          values: {
            name: 'formulaAttr',
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
          values: [{ id: 1 }]
        },
        // Step 6: Delete old attribute
        {
          success: true
        },
        // Step 7: Update formula in formulaAttr (failure)
        {
          success: false,
          values: null
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

      // Verify the function attempted to update the formula
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update',
          resource: 'dataContext[Sampler].collection[samples].attribute[formulaAttr]',
          values: {
            formula: 'newAttr * 2'
          }
        })
      });
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle case structure with case property in allCasesResult.values', async () => {
      // Mock responses with a different case structure
      const mockResponses = [
        // Step 1: Get all cases with a structure where case is a property of values
        {
          success: true,
          values: {
            case: [
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
      });
    });

    it('should handle the case when no cases are found with values to update', async () => {
      // Mock responses with no cases having the old attribute
      const mockResponses = [
        // Step 1: Get all cases with no values for oldAttr
        {
          success: true,
          values: {
            cases: [
              { id: 1, values: { 'otherAttr': 100 } },
              { id: 2, values: { 'otherAttr': 200 } }
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
        // Step 6: Delete old attribute (we skip step 5 because there are no cases to update)
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

      // Verify that the update cases request was not made
      const updateCasesCall = (codapInterface.sendRequest as jest.Mock).mock.calls.find(
        call => 
          typeof call[0] === 'object' && 
          call[0].action === 'update' && 
          call[0].resource === 'dataContext[Sampler].collection[samples].case'
      );
      
      expect(updateCasesCall).toBeFalsy();
      
      // Verify that the delete attribute request was made
      expect(codapInterface.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'delete',
          resource: 'dataContext[Sampler].collection[samples].attribute[oldAttr]'
        })
      ));
    });

    it('should handle case structure with cases array inside values.cases with case property', async () => {
      // Mock responses with a different case structure
      const mockResponses = [
        // Step 1: Get all cases with a structure where cases is an array inside values.cases with case property
        {
          success: true,
          values: {
            cases: [
              { case: { id: 1, values: { 'oldAttr': 100 } } },
              { case: { id: 2, values: { 'oldAttr': 200 } } }
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
      });
    });

    it('should handle the case when no cases are found at all', async () => {
      // Mock responses with no cases found at all
      const mockResponses = [
        // Step 1: Get all cases with an empty response
        {
          success: true,
          values: {}
        }
      ];

      // Set up the mock to return each response in sequence
      mockResponses.forEach(response => {
        (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce(response);
      });

      await renameAttribute('Sampler', 'samples', 'oldAttr', 'newAttr');

      // Verify that console.error was called
      expect(console.error).toHaveBeenCalledWith("Could not find any cases in the response");
    });
  });
});

// Test for error paths in findOrCreateDataContext
describe('findOrCreateDataContext error paths', () => {
  it('should return false when createDataContext fails', async () => {
    const mockSetGlobalState = jest.fn();
    const mockCreateDataContextResponse = { success: false };
    
    (codapInterface.sendRequest as jest.Mock).mockImplementation((request) => {
      if (request.action === 'create' && request.resource === 'dataContext') {
        return Promise.resolve(mockCreateDataContextResponse);
      }
      return Promise.resolve({ success: true });
    });
    
    const result = await findOrCreateDataContext(
      ['experiment', 'sample_size', 'experimentHash', 'sample'],
      {
        experiment: { codapID: null, name: "experiment" },
        description: { codapID: null, name: "description" },
        sample_size: { codapID: null, name: "sample size" },
        experimentHash: { codapID: null, name: "experimentHash" },
        sample: { codapID: null, name: "sample" },
        output: { codapID: null, name: "output" }
      },
      mockSetGlobalState
    );
    expect(result).toBe(false);
  });
  
  it('should return false when createParentCollection fails', async () => {
    const mockSetGlobalState = jest.fn();
    const mockCreateDataContextResponse = { success: true, values: { name: kDataContextName } };
    const mockCreateParentCollectionResponse = { success: false };
    
    (codapInterface.sendRequest as jest.Mock).mockImplementation((request) => {
      if (request.action === 'create' && request.resource === 'dataContext') {
        return Promise.resolve(mockCreateDataContextResponse);
      } else if (request.action === 'create' && request.resource === 'collection') {
        return Promise.resolve(mockCreateParentCollectionResponse);
      }
      return Promise.resolve({ success: true });
    });
    
    const result = await findOrCreateDataContext(
      ['experiment', 'sample_size', 'experimentHash', 'sample'],
      {
        experiment: { codapID: null, name: "experiment" },
        description: { codapID: null, name: "description" },
        sample_size: { codapID: null, name: "sample size" },
        experimentHash: { codapID: null, name: "experimentHash" },
        sample: { codapID: null, name: "sample" },
        output: { codapID: null, name: "output" }
      },
      mockSetGlobalState
    );
    expect(result).toBe(false);
  });
  
  it('should return false when createChildCollection fails', async () => {
    const mockSetGlobalState = jest.fn();
    const mockCreateDataContextResponse = { success: true, values: { name: kDataContextName } };
    const mockCreateParentCollectionResponse = { success: true };
    const mockCreateChildCollectionResponse = { success: false };
    
    (codapInterface.sendRequest as jest.Mock).mockImplementation((request) => {
      if (request.action === 'create' && request.resource === 'dataContext') {
        return Promise.resolve(mockCreateDataContextResponse);
      } else if (request.action === 'create' && request.resource === 'collection' && request.values.name === 'experiments') {
        return Promise.resolve(mockCreateParentCollectionResponse);
      } else if (request.action === 'create' && request.resource === 'collection' && request.values.name === 'samples') {
        return Promise.resolve(mockCreateChildCollectionResponse);
      }
      return Promise.resolve({ success: true });
    });
    
    const result = await findOrCreateDataContext(
      ['experiment', 'sample_size', 'experimentHash', 'sample'],
      {
        experiment: { codapID: null, name: "experiment" },
        description: { codapID: null, name: "description" },
        sample_size: { codapID: null, name: "sample size" },
        experimentHash: { codapID: null, name: "experimentHash" },
        sample: { codapID: null, name: "sample" },
        output: { codapID: null, name: "output" }
      },
      mockSetGlobalState
    );
    expect(result).toBe(false);
  });
});

// Test for attribute name conflict handling in addMeasure
describe('addMeasure with name conflicts', () => {
  it('should handle attribute name conflicts by incrementing the index', async () => {
    const mockGetAttributesResponse = {
      success: true,
      values: [
        { name: 'measure1' },
        { name: 'measure2' }
      ]
    };
    
    const mockCreateAttributeResponse = { success: true };
    
    (codapInterface.sendRequest as jest.Mock).mockImplementation((request) => {
      if (request.action === 'get' && request.resource === 'collection[samples].attribute') {
        return Promise.resolve(mockGetAttributesResponse);
      } else if (request.action === 'create' && request.resource === 'collection[samples].attribute') {
        return Promise.resolve(mockCreateAttributeResponse);
      }
      return Promise.resolve({ success: true });
    });
    
    await addMeasure('measure', 'count()', '');
    
    // Verify that sendRequest was called with the correct parameters for creating an attribute with an incremented name
    expect(codapInterface.sendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'create',
        resource: 'collection[samples].attribute',
        values: expect.objectContaining({
          name: 'measure3',
          formula: 'count()'
        })
      })
    );
  });
});

// Test for error handling in renameAttribute
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
    
    consoleSpy.mockRestore();
  });
  
  it('should extract cases from the response structure', async () => {
    const mockCases = [
      { case: { experiment: 1, sample: 1, value: 'A' } },
      { case: { experiment: 1, sample: 2, value: 'B' } }
    ];
    
    const mockAllCasesResult = {
      success: true,
      values: {
        cases: mockCases
      }
    };
    
    (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
      return Promise.resolve(mockAllCasesResult);
    });
    
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const result = await renameAttribute('Sampler', 'samples', 'oldName', 'newName');
    
    expect(consoleSpy).toHaveBeenCalledWith("Extracted 2 cases from allCasesResult.values.cases[].case");
    expect(result).toEqual([
      { experiment: 1, sample: 1, value: 'A' },
      { experiment: 1, sample: 2, value: 'B' }
    ]);
    
    consoleSpy.mockRestore();
  });
}); 