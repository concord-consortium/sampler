import { getDefaultAttrCounts, renameBuiltInVariables, maybeRenameCollectorItem } from "./collector";

describe("collector utils", () => {

  describe("getDefaultAttrCounts", () => {
    it("should return default attribute counts", () => {
      const attrCount = getDefaultAttrCounts();
      expect(attrCount).toEqual({
        description: 1,
        experiment: 1,
        experimentHash: 1,
        sample: 1,
        sample_size: 1,
        until_formula: 1,
      });
    });
  });

  describe("renameBuiltInVariables", () => {
    it("should rename built-in variables correctly", () => {
      const attrs = ["description", "experiment", "experimentHash", "sample", "sample_size", "until_formula"];
      const renamedAttrs = renameBuiltInVariables(attrs);
      expect(renamedAttrs).toEqual(["description2", "experiment2", "experimentHash2", "sample2", "sample_size2", "until_formula2"]);
    });

    it("should not rename non-built-in variables", () => {
      const attrs = ["x", "y", "z"];
      const renamedAttrs = renameBuiltInVariables(attrs);
      expect(renamedAttrs).toEqual(attrs);
    });

    it("should handle mixed variables correctly", () => {
      const attrs = ["description", "x", "experiment", "y", "sample_size"];
      const renamedAttrs = renameBuiltInVariables(attrs);
      expect(renamedAttrs).toEqual(["description2", "x", "experiment2", "y", "sample_size2"]);
    });

    it("should handle empty array", () => {
      const attrs: string[] = [];
      const renamedAttrs = renameBuiltInVariables(attrs);
      expect(renamedAttrs).toEqual([]);
    });
  });

  describe("maybeRenameCollectorItem", () => {
    it("should rename collector item attributes correctly", () => {
      const collectorItem = {
        description: "test",
        experiment: "exp1",
        sample_size: 10,
        until_formula: "a > b",
      };
      const renamedItem = maybeRenameCollectorItem(collectorItem);
      expect(renamedItem).toEqual({
        description2: "test",
        experiment2: "exp1",
        sample_size2: 10,
        until_formula2: "a > b",
      });
    });

    it("should not rename non-built-in attributes", () => {
      const collectorItem = {
        customAttr: "customValue",
      };
      const renamedItem = maybeRenameCollectorItem(collectorItem);
      expect(renamedItem).toEqual(collectorItem);
    });

    it("should rename mixed attributes correctly", () => {
      const collectorItem = {
        description: "test",
        customAttr: "customValue",
        sample_size: 10,
        until_formula: "a > b",
      };
      const renamedItem = maybeRenameCollectorItem(collectorItem);
      expect(renamedItem).toEqual({
        description2: "test",
        customAttr: "customValue",
        sample_size2: 10,
        until_formula2: "a > b",
      });
    });
  });
});
