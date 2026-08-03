import { createItems, getCaseByIndex, getCaseCount, selectCases } from "@concord-consortium/codap-plugin-api";
import { createExperimentAnimationSteps } from "./useAnimation";
import { Speed } from "../types";

jest.mock("@concord-consortium/codap-plugin-api", () => ({
  createItems: jest.fn(),
  selectCases: jest.fn(),
  getCaseCount: jest.fn(),
  getCaseByIndex: jest.fn()
}));

// Distinct names per key: which collection the last case is read from is the point of these
// tests, and a mock that answered every key alike could not tell the three collections apart.
jest.mock("../utils/localeManager", () => ({
  tr: (key: string) => ({
    "DG.Plugin.Sampler.dataset.attr-sample": "sample",
    "DG.Plugin.Sampler.dataset.experiment-collection-name": "experiments",
    "DG.Plugin.Sampler.dataset.sample-collection-name": "samples",
    "DG.Plugin.Sampler.dataset.item-collection-name": "items"
  } as Record<string, string>)[key] ?? key
}));

const mockCreateItems = createItems as jest.Mock;
const mockSelectCases = selectCases as jest.Mock;
const mockGetCaseCount = getCaseCount as jest.Mock;
const mockGetCaseByIndex = getCaseByIndex as jest.Mock;

// Two samples, one item each, from a single device. In Fastest mode the animation defers item
// creation to the end of the experiment, so two samples is enough to distinguish "created every
// sample together" from "created them one at a time".
const model = {
  columns: [{ id: "c1", name: "Deck1", devices: [{ id: "d1", replacement: true }] }]
} as any;

const animationResults = [
  [{ sampleNumber: 1, results: { d1: "a" }, resultsVariableIndex: { d1: 0 } }],
  [{ sampleNumber: 2, results: { d1: "b" }, resultsVariableIndex: { d1: 0 } }]
] as any;

const results = [
  { sample: 1, Deck1: "a" },
  { sample: 2, Deck1: "b" }
] as any;

/**
 * Builds the steps, runs the per-sample `pushVariables` handlers at the given speed, then runs the
 * `endExperiment` handler. At Fastest the samples are queued for end-of-experiment creation; at
 * any other speed each sample is created as it is collected.
 */
async function runExperiment(onComplete: () => void, speed: Speed = Speed.Fastest) {
  const steps = createExperimentAnimationSteps(model, "Sampler", animationResults, results, onComplete);

  for (const step of steps) {
    if (step.kind === "pushVariables") {
      await (step as any).onComplete({ speed });
    }
  }

  const endStep = steps.find(step => step.kind === "endExperiment") as any;
  await endStep.onComplete();
}

describe("createExperimentAnimationSteps endExperiment (Fastest mode)", () => {
  beforeEach(() => {
    mockCreateItems.mockReset();
    mockSelectCases.mockReset();
    mockGetCaseCount.mockReset();
    mockGetCaseByIndex.mockReset();
    mockSelectCases.mockResolvedValue({});
    mockGetCaseCount.mockResolvedValue({ values: 2 });
    mockGetCaseByIndex.mockResolvedValue({ values: { case: { id: 77 } } });
  });

  // Every sample goes to CODAP in one request: a create costs a pass over the whole dataset, so
  // each additional request roughly doubles the most expensive part of collecting an experiment.
  it("creates every sample in a single request", async () => {
    mockCreateItems.mockResolvedValue({ success: true });
    const onComplete = jest.fn();

    await runExperiment(onComplete);

    expect(mockCreateItems).toHaveBeenCalledTimes(1);
    expect(mockCreateItems).toHaveBeenCalledWith("Sampler", [
      { sample: 1, Deck1: "a" },
      { sample: 2, Deck1: "b" }
    ]);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // The sample collection's last case is the one just collected. Selecting that case (rather than
  // its items) is what makes the case table scroll to it and cascade to its children, because
  // CODAP resolves the ids it is given against each collection's rows.
  it("selects the last case in the sample collection", async () => {
    mockCreateItems.mockResolvedValue({ success: true });
    const onComplete = jest.fn();

    await runExperiment(onComplete);

    expect(mockGetCaseCount).toHaveBeenCalledWith("Sampler", "samples");
    expect(mockGetCaseByIndex).toHaveBeenCalledWith("Sampler", "samples", 1);
    expect(mockSelectCases).toHaveBeenCalledWith("Sampler", [77]);
  });

  it("does not select anything when the sample collection is empty", async () => {
    mockCreateItems.mockResolvedValue({ success: true });
    mockGetCaseCount.mockResolvedValue({ values: 0 });
    const onComplete = jest.fn();

    await runExperiment(onComplete);

    expect(mockGetCaseByIndex).not.toHaveBeenCalled();
    expect(mockSelectCases).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("completes when the last case cannot be looked up", async () => {
    mockCreateItems.mockResolvedValue({ success: true });
    mockGetCaseByIndex.mockRejectedValue("CODAP request timed out");
    const onComplete = jest.fn();

    await runExperiment(onComplete);

    expect(mockSelectCases).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // A request that outlives the plugin API's deadline rejects even though CODAP may still be
  // processing it successfully. That must not strand the UI: the experiment has to finish.
  it("completes when the create rejects", async () => {
    mockCreateItems.mockRejectedValue("CODAP request timed out");
    const onComplete = jest.fn();

    await runExperiment(onComplete);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // Without a create that landed, the sample collection's last case may belong to an earlier
  // experiment, and selecting it would claim it is the sample just collected.
  it("selects nothing when the create rejects", async () => {
    mockCreateItems.mockRejectedValue("CODAP request timed out");
    const onComplete = jest.fn();

    await runExperiment(onComplete);

    expect(mockGetCaseCount).not.toHaveBeenCalled();
    expect(mockGetCaseByIndex).not.toHaveBeenCalled();
    expect(mockSelectCases).not.toHaveBeenCalled();
  });

  // CODAP answers a create it refuses rather than failing to answer, so a response is not by
  // itself evidence that the samples landed.
  it("selects nothing when the create is refused", async () => {
    mockCreateItems.mockResolvedValue({ success: false, values: { error: "no such collection" } });
    const onComplete = jest.fn();

    await runExperiment(onComplete);

    expect(mockGetCaseCount).not.toHaveBeenCalled();
    expect(mockGetCaseByIndex).not.toHaveBeenCalled();
    expect(mockSelectCases).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("completes when selecting the new cases rejects", async () => {
    mockCreateItems.mockResolvedValue({ success: true });
    mockSelectCases.mockRejectedValue("CODAP request timed out");
    const onComplete = jest.fn();

    await runExperiment(onComplete);

    expect(mockSelectCases).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not reject out of endExperiment when every request fails", async () => {
    mockCreateItems.mockRejectedValue("CODAP request timed out");
    const onComplete = jest.fn();

    await expect(runExperiment(onComplete)).resolves.toBeUndefined();

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe("createExperimentAnimationSteps pushVariables (per-sample creation)", () => {
  beforeEach(() => {
    mockCreateItems.mockReset();
    mockSelectCases.mockReset();
    mockSelectCases.mockResolvedValue({});
  });

  it("creates each sample as it is collected", async () => {
    mockCreateItems.mockResolvedValue({ caseIDs: ["c1"] });
    const onComplete = jest.fn();

    await runExperiment(onComplete, Speed.Slow);

    expect(mockCreateItems).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // A sample whose create outlives the deadline must not abort the run — the samples that follow
  // still need collecting, and the experiment still needs to finish.
  it("keeps collecting later samples when one sample's create rejects", async () => {
    mockCreateItems
      .mockRejectedValueOnce("CODAP request timed out")
      .mockResolvedValueOnce({ caseIDs: ["c1"] });
    const onComplete = jest.fn();

    await expect(runExperiment(onComplete, Speed.Slow)).resolves.toBeUndefined();

    expect(mockCreateItems).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("keeps collecting later samples when selecting a sample's cases rejects", async () => {
    mockCreateItems.mockResolvedValue({ caseIDs: ["c1"] });
    mockSelectCases.mockRejectedValue("CODAP request timed out");
    const onComplete = jest.fn();

    await expect(runExperiment(onComplete, Speed.Slow)).resolves.toBeUndefined();

    expect(mockCreateItems).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
