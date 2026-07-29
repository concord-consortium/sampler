import { createItems, selectCases } from "@concord-consortium/codap-plugin-api";
import { createExperimentAnimationSteps } from "./useAnimation";
import { Speed } from "../types";

jest.mock("@concord-consortium/codap-plugin-api", () => ({
  createItems: jest.fn(),
  selectCases: jest.fn()
}));

jest.mock("../utils/localeManager", () => ({
  tr: () => "sample"
}));

const mockCreateItems = createItems as jest.Mock;
const mockSelectCases = selectCases as jest.Mock;

// Two samples, one item each, from a single device. In Fastest mode the animation defers item
// creation to the end of the experiment, where the LAST sample is popped off and created by a
// second call — so two samples is the minimum that exercises both createItems calls.
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
    mockSelectCases.mockResolvedValue({});
  });

  it("creates the remaining samples, then the last sample, and completes", async () => {
    mockCreateItems.mockResolvedValue({ caseIDs: ["c1"] });
    const onComplete = jest.fn();

    await runExperiment(onComplete);

    expect(mockCreateItems).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // A request that outlives the plugin API's deadline rejects even though CODAP may still be
  // processing it successfully. That must not cost us the last sample, and must not strand the
  // UI: the experiment has to finish either way.
  it("still creates the last sample when the bulk create rejects", async () => {
    mockCreateItems
      .mockRejectedValueOnce("CODAP request timed out")
      .mockResolvedValueOnce({ caseIDs: ["c1"] });
    const onComplete = jest.fn();

    await runExperiment(onComplete);

    expect(mockCreateItems).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("completes when the last-sample create rejects", async () => {
    mockCreateItems
      .mockResolvedValueOnce({ caseIDs: ["c1"] })
      .mockRejectedValueOnce("CODAP request timed out");
    const onComplete = jest.fn();

    await runExperiment(onComplete);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("completes when selecting the new cases rejects", async () => {
    mockCreateItems.mockResolvedValue({ caseIDs: ["c1"] });
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
