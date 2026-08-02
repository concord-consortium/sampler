import { codapInterface } from "@concord-consortium/codap-plugin-api";
import { addMeasure } from "./codap-helpers";

jest.mock("@concord-consortium/codap-plugin-api", () => ({
  ...jest.requireActual("@concord-consortium/codap-plugin-api"),
  codapInterface: { sendRequest: jest.fn() }
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

/** Runs addMeasure and lets its requests settle, whatever shape it returns. */
async function runAddMeasure(...args: Parameters<typeof addMeasure>) {
  await addMeasure(...args);
  await new Promise(resolve => setTimeout(resolve, 0));
}

describe("addMeasure", () => {
  beforeEach(() => {
    mockSendRequest.mockReset();
    mockSendRequest.mockResolvedValue({ success: true });
  });

  it("creates an attribute named for the measure when that name is free", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList(["something else"]));

    await runAddMeasure("ctx", "My Measure", "count", "count()");

    expect(mockSendRequest).toHaveBeenCalledTimes(2);
    expect(secondRequest().action).toBe("create");
    expect(secondRequest().values[0]).toEqual({ name: "My Measure", type: "numeric", formula: "count()" });
  });

  it("names the attribute for the measure type when no name is given", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList([]));

    await runAddMeasure("ctx", "", "count", "count()");

    expect(secondRequest().action).toBe("create");
    expect(secondRequest().values[0].name).toBe("count");
  });

  // A named measure reuses its attribute, so adding it again edits the formula in place rather
  // than accumulating duplicates.
  it("updates the existing attribute when a named measure is added again", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList(["My Measure"]));

    await runAddMeasure("ctx", "My Measure", "count", "count()");

    expect(mockSendRequest).toHaveBeenCalledTimes(2);
    expect(secondRequest().action).toBe("update");
    expect(secondRequest().resource).toContain("attribute[My Measure]");
    expect(secondRequest().values).toEqual({ formula: "count()" });
  });

  // An unnamed measure can be added repeatedly with different formulas, so each one needs its own
  // attribute: the type name, then the lowest unused numeric suffix.
  it("gives an unnamed measure the first suffix when only the base name is taken", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList(["count"]));

    await runAddMeasure("ctx", "", "count", "count()");

    expect(secondRequest().action).toBe("create");
    expect(secondRequest().values[0].name).toBe("count1");
  });

  it("gives an unnamed measure the next suffix after the highest one taken", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList(["count", "count1"]));

    await runAddMeasure("ctx", "", "count", "count()");

    expect(secondRequest().values[0].name).toBe("count2");
  });

  it("reuses a gap in the suffixes rather than always taking the next one", async () => {
    mockSendRequest.mockResolvedValueOnce(attributeList(["count", "count2"]));

    await runAddMeasure("ctx", "", "count", "count()");

    expect(secondRequest().values[0].name).toBe("count1");
  });

  // Nothing awaits addMeasure, so a rejection here would have nothing attached to observe it.
  it("reports a failed request rather than letting it escape", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    mockSendRequest.mockRejectedValue(new Error("CODAP request timed out"));

    await expect(addMeasure("ctx", "My Measure", "count", "count()")).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("reports a failure from the create rather than letting it escape", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    mockSendRequest
      .mockResolvedValueOnce(attributeList([]))
      .mockRejectedValueOnce(new Error("CODAP request timed out"));

    await expect(addMeasure("ctx", "My Measure", "count", "count()")).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
