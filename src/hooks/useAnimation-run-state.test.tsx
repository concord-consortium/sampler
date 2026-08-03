import { renderHook } from "@testing-library/react";
import { createItems } from "@concord-consortium/codap-plugin-api";
import { findOrCreateDataContext, getNewExperimentInfo } from "../helpers/codap-helpers";
import { computeExperimentHash } from "../helpers/model-helpers";
import { useAnimationContextValue } from "./useAnimation";
import { AnimationStep, Speed } from "../types";

jest.mock("@concord-consortium/codap-plugin-api", () => ({
  createItems: jest.fn().mockResolvedValue({ success: true }),
  selectCases: jest.fn().mockResolvedValue({ success: true }),
  getCaseCount: jest.fn().mockResolvedValue({ success: true, values: 1 }),
  getCaseByIndex: jest.fn().mockResolvedValue({ success: true, values: { case: { id: 1 } } })
}));

jest.mock("../helpers/codap-helpers", () => ({
  findOrCreateDataContext: jest.fn(),
  getNewExperimentInfo: jest.fn(),
  getCollectionNames: jest.fn(() => ({ experiments: "experiments", samples: "samples", items: "items" })),
  evaluateResult: jest.fn(() => true)
}));

jest.mock("../helpers/model-helpers", () => ({
  computeExperimentHash: jest.fn(),
  getExperimentDescription: jest.fn(() => "description"),
  isSingleDeviceReplacement: jest.fn(() => true)
}));

// The hook reads global state through this context; a plain mutable object plus an immer-style
// recipe runner is enough to observe the state transitions we care about.
let state: any;
const mockSetGlobalState = jest.fn((recipe: (draft: any) => void) => recipe(state));

jest.mock("./useGlobalState", () => ({
  useGlobalStateContext: () => ({ globalState: state, setGlobalState: mockSetGlobalState })
}));

const mockCreateItems = createItems as jest.Mock;
const mockFindOrCreateDataContext = findOrCreateDataContext as jest.Mock;
const mockGetNewExperimentInfo = getNewExperimentInfo as jest.Mock;
const mockComputeExperimentHash = computeExperimentHash as jest.Mock;

// Lets the pending CODAP requests of an abandoned or animating run settle before asserting on what
// they did, since the run that issued them is no longer awaited.
const flushRequests = () => new Promise(resolve => setTimeout(resolve, 0));

function resetState() {
  state = {
    speed: Speed.Fastest,
    // The samples are named after these attributes, so an empty map would fail the run before it
    // ever reached the animation these tests are about.
    attrMap: {
      experiment: { codapID: null, name: "Experiment" },
      description: { codapID: null, name: "Description" },
      sample_size: { codapID: null, name: "Sample Size" },
      until_formula: { codapID: null, name: "Until" },
      experimentHash: { codapID: null, name: "experimentHash" },
      sample: { codapID: null, name: "Sample" }
    },
    model: { columns: [{ id: "c1", name: "Deck1", devices: [{ id: "d1", viewType: "mixer", variables: ["a"], replacement: true, formulas: {} }] }] },
    numSamples: "1",
    sampleSize: "1",
    dataContextName: "Sampler",
    repeat: false,
    untilFormula: "",
    repeatCondition: "",
    repeatNumUniqueValues: 1,
    instance: 1,
    isRunning: false,
    isPaused: false,
    enableRunButton: true
  };
}

describe("handleStartRun run-state feedback", () => {
  beforeEach(() => {
    resetState();
    mockSetGlobalState.mockClear();
    mockCreateItems.mockClear();
    mockGetNewExperimentInfo.mockResolvedValue({ experimentNum: 1, startingSampleNumber: 1 });
    mockComputeExperimentHash.mockResolvedValue("hash");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Collecting the samples requires many round-trips to CODAP, so the run can be under way for
  // several seconds before any data appears. The controls must reflect that the run has started
  // as soon as it is requested, not once the work lands.
  it("marks the run as running before awaiting any CODAP request", async () => {
    let releaseDataContext: (value: string) => void = () => undefined;
    mockFindOrCreateDataContext.mockImplementation(
      () => new Promise<string>(resolve => { releaseDataContext = resolve; }));

    const { result } = renderHook(() => useAnimationContextValue());

    const run = result.current.handleStartRun();

    // the first CODAP request has not resolved yet
    expect(state.isRunning).toBe(true);
    expect(state.isPaused).toBe(false);
    expect(state.enableRunButton).toBe(false);

    releaseDataContext("Sampler");
    await run;
    await flushRequests();
  });

  // Stopping a run that is still being set up has no animation to cancel, so the run has to
  // abandon itself rather than start and write an experiment the user asked not to have.
  it("abandons a run that is stopped while it is being set up", async () => {
    let releaseDataContext: (value: string) => void = () => undefined;
    mockFindOrCreateDataContext.mockImplementation(
      () => new Promise<string>(resolve => { releaseDataContext = resolve; }));

    const { result } = renderHook(() => useAnimationContextValue());

    const run = result.current.handleStartRun();
    await result.current.handleStopRun();

    releaseDataContext("Sampler");
    await run;
    await flushRequests();

    expect(mockCreateItems).not.toHaveBeenCalled();
    expect(state.isRunning).toBe(false);
    expect(state.enableRunButton).toBe(true);
  });

  // Pausing during the setup pauses an animation that is about to be replaced by the one the run
  // is still building, so the run has to carry the pause over to it.
  it("starts the animation paused when the run was paused while being set up", async () => {
    state.speed = Speed.Slow;
    const frames: FrameRequestCallback[] = [];
    jest.spyOn(window, "requestAnimationFrame")
      .mockImplementation(callback => frames.push(callback));

    let releaseDataContext: (value: string) => void = () => undefined;
    mockFindOrCreateDataContext.mockImplementation(
      () => new Promise<string>(resolve => { releaseDataContext = resolve; }));

    const { result } = renderHook(() => useAnimationContextValue());
    const animatedSteps: AnimationStep[] = [];
    result.current.registerAnimationCallback(step => { animatedSteps.push(step); });

    const run = result.current.handleStartRun();
    await result.current.handleTogglePauseRun(true);

    releaseDataContext("Sampler");
    await run;

    expect(frames).not.toHaveLength(0);
    frames[frames.length - 1](0);

    expect(animatedSteps.map(step => step.kind)).not.toContain("startExperiment");
    expect(state.isPaused).toBe(true);
  });

  it("re-enables the run button when the data context cannot be set up", async () => {
    jest.spyOn(window, "alert").mockImplementation(() => undefined);
    mockFindOrCreateDataContext.mockResolvedValue("");

    const { result } = renderHook(() => useAnimationContextValue());
    await result.current.handleStartRun();

    expect(state.isRunning).toBe(false);
    expect(state.enableRunButton).toBe(true);
  });

  it("re-enables the run button when starting the run throws", async () => {
    jest.spyOn(window, "alert").mockImplementation(() => undefined);
    mockFindOrCreateDataContext.mockRejectedValue(new Error("nope"));

    const { result } = renderHook(() => useAnimationContextValue());
    await result.current.handleStartRun();

    expect(state.isRunning).toBe(false);
    expect(state.enableRunButton).toBe(true);
  });
});
