import { codapInterface, getAttributeList, getDataContext } from "@concord-consortium/codap-plugin-api";
import { addMeasure, findOrCreateDataContext } from "./codap-helpers";

jest.mock("@concord-consortium/codap-plugin-api", () => ({
  ...jest.requireActual("@concord-consortium/codap-plugin-api"),
  codapInterface: { sendRequest: jest.fn() },
  getDataContext: jest.fn(),
  getAttributeList: jest.fn(),
  createNewAttribute: jest.fn()
}));

// Identity translation, so the collection name in a resource string is the key it came from.
jest.mock("../utils/localeManager", () => ({
  tr: (key: string) => key
}));

const mockSendRequest = codapInterface.sendRequest as jest.Mock;

/** What CODAP answers an attributeList request with. */
const attributeList = (names: string[]) => ({ success: true, values: names.map(name => ({ name })) });

/** The request issued after the attributeList lookup — the create or update under test. */
const secondRequest = () => mockSendRequest.mock.calls[1][0];

describe("addMeasure", () => {
  beforeEach(() => {
    mockSendRequest.mockReset();
    mockSendRequest.mockResolvedValue({ success: true });
  });

  it("creates an attribute named for the measure when that name is free", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList(["something else"]));

    await addMeasure("ctx", "My Measure", "count", "count()");

    expect(mockSendRequest).toHaveBeenCalledTimes(2);
    expect(secondRequest().action).toBe("create");
    expect(secondRequest().values[0]).toEqual({ name: "My Measure", type: "numeric", formula: "count()" });
  });

  it("names the attribute for the measure type when no name is given", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList([]));

    await addMeasure("ctx", "", "count", "count()");

    expect(secondRequest().action).toBe("create");
    expect(secondRequest().values[0].name).toBe("count");
  });

  // A named measure reuses its attribute, so adding it again edits the formula in place rather
  // than accumulating duplicates.
  it("updates the existing attribute when a named measure is added again", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList(["My Measure"]));

    await addMeasure("ctx", "My Measure", "count", "count()");

    expect(mockSendRequest).toHaveBeenCalledTimes(2);
    expect(secondRequest().action).toBe("update");
    expect(secondRequest().resource).toContain("attribute[My Measure]");
    expect(secondRequest().values).toEqual({ formula: "count()" });
  });

  // An unnamed measure can be added repeatedly with different formulas, so each one needs its own
  // attribute: the type name, then the lowest unused numeric suffix.
  it("gives an unnamed measure the first suffix when only the base name is taken", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList(["count"]));

    await addMeasure("ctx", "", "count", "count()");

    expect(secondRequest().action).toBe("create");
    expect(secondRequest().values[0].name).toBe("count1");
  });

  it("gives an unnamed measure the next suffix after the highest one taken", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList(["count", "count1"]));

    await addMeasure("ctx", "", "count", "count()");

    expect(secondRequest().values[0].name).toBe("count2");
  });

  it("reuses a gap in the suffixes rather than always taking the next one", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList(["count", "count2"]));

    await addMeasure("ctx", "", "count", "count()");

    expect(secondRequest().values[0].name).toBe("count1");
  });

  // The caller tells the user the measure was added, so it has to hear about a measure that was
  // not: a request CODAP never answers rejects, and one it refuses answers with success false.
  it("reports success when the measure is created", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList([]));

    await expect(addMeasure("ctx", "My Measure", "count", "count()")).resolves.toBe(true);
  });

  it("reports success when an existing named measure is updated", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList(["My Measure"]));

    await expect(addMeasure("ctx", "My Measure", "count", "count()")).resolves.toBe(true);
  });

  it("reports a failed request rather than letting it escape", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    mockSendRequest.mockRejectedValue(new Error("CODAP request timed out"));

    await expect(addMeasure("ctx", "My Measure", "count", "count()")).resolves.toBe(false);

    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("reports a failure from the create rather than letting it escape", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    mockSendRequest
      .mockResolvedValueOnce(attributeList([]))
      .mockRejectedValueOnce(new Error("CODAP request timed out"));

    await expect(addMeasure("ctx", "My Measure", "count", "count()")).resolves.toBe(false);

    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("reports a create CODAP refused", async () => {
    mockSendRequest
      .mockResolvedValueOnce(attributeList([]))
      .mockResolvedValueOnce({ success: false, values: { error: "duplicate attribute name" } });

    await expect(addMeasure("ctx", "My Measure", "count", "count()")).resolves.toBe(false);
  });

  it("reports an update CODAP refused", async () => {
    mockSendRequest
      .mockResolvedValueOnce(attributeList(["My Measure"]))
      .mockResolvedValueOnce({ success: false, values: { error: "no such attribute" } });

    await expect(addMeasure("ctx", "My Measure", "count", "count()")).resolves.toBe(false);
  });

  it("does not create anything when the attribute list cannot be read", async () => {
    mockSendRequest.mockResolvedValueOnce({ success: false, values: { error: "no such collection" } });

    await expect(addMeasure("ctx", "My Measure", "count", "count()")).resolves.toBe(false);

    expect(mockSendRequest).toHaveBeenCalledTimes(1);
  });
});

const mockGetDataContext = getDataContext as jest.Mock;
const mockGetAttributeList = getAttributeList as jest.Mock;

/** The attribute ids the run holds before the batched get is answered. */
const testAttrMap = () => ({
  experiment: { codapID: null, name: "experiment" },
  description: { codapID: null, name: "description" },
  sample_size: { codapID: null, name: "sample size" },
  until_formula: { codapID: null, name: "formula for until" },
  experimentHash: { codapID: null, name: "experimentHash" },
  sample: { codapID: null, name: "sample" }
});

/**
 * Runs `findOrCreateDataContext` against an existing data context that already has every attribute,
 * so the only request left for it to make is the batched get of the attribute ids, and answers that
 * get with `answer` — the shape under test.
 */
async function runAttributeIdLookup(answer: unknown) {
  const attrMap = testAttrMap();
  const state = { attrMap } as any;
  const setGlobalState = jest.fn((recipe: (draft: any) => void) => recipe(state));

  mockGetDataContext.mockResolvedValue({ success: true, values: {} });
  mockGetAttributeList.mockResolvedValue(
    attributeList(["experiment", "description", "sample size", "experimentHash", "Deck1"]));
  mockSendRequest.mockImplementation((request: unknown, callback?: (result: unknown) => void) => {
    callback?.(answer);
    return Promise.resolve({ success: true });
  });

  const name = await findOrCreateDataContext(
    "Sampler", ["Deck1"], attrMap as any, setGlobalState as any, false, false, 1, false);

  return { name, attrMap: state.attrMap, setGlobalState };
}

// The ids already held are better than a response that carries none, and a run must not be
// abandoned over a lookup that only refreshes them.
describe("findOrCreateDataContext attribute id lookup", () => {
  beforeEach(() => {
    mockSendRequest.mockReset();
    mockGetDataContext.mockReset();
    mockGetAttributeList.mockReset();
  });

  it("leaves the ids alone when the request goes unanswered", async () => {
    const { name, attrMap, setGlobalState } = await runAttributeIdLookup(undefined);

    expect(setGlobalState).not.toHaveBeenCalled();
    expect(attrMap.experiment.codapID).toBeNull();
    expect(name).toBe("Sampler");
  });

  it("leaves the ids alone when the batch is answered with a single error", async () => {
    const { attrMap, setGlobalState } =
      await runAttributeIdLookup({ success: false, values: { error: "no such data context" } });

    expect(setGlobalState).not.toHaveBeenCalled();
    expect(attrMap.experiment.codapID).toBeNull();
  });

  it("writes only the ids the batch answered for", async () => {
    const { attrMap } = await runAttributeIdLookup([
      { success: true, values: { name: "experiment", id: "11" } },
      { success: false, values: { error: "not found" } },
      { success: true, values: { name: "sample", id: "22" } }
    ]);

    expect(attrMap.experiment.codapID).toBe("11");
    expect(attrMap.sample.codapID).toBe("22");
    expect(attrMap.description.codapID).toBeNull();
  });

  // Setting up sends more requests than anything else in a run, so it is the likeliest place for
  // one to outlive the deadline. The ids are a cache; the run is the point.
  it("still returns the data context when the lookup fails outright", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const attrMap = testAttrMap();
    mockGetDataContext.mockResolvedValue({ success: true, values: {} });
    mockGetAttributeList.mockResolvedValue(
      attributeList(["experiment", "description", "sample size", "experimentHash", "Deck1"]));
    mockSendRequest.mockRejectedValue(new Error("CODAP request timed out"));

    const name = await findOrCreateDataContext(
      "Sampler", ["Deck1"], attrMap as any, jest.fn() as any, false, false, 1, false);

    expect(name).toBe("Sampler");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
