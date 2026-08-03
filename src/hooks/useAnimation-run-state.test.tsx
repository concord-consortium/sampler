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
    // ever reached the animation these tests are about. The sample attribute carries the
    // translated name the animation itself looks samples up by, so a run whose rows are to reach
    // the create has to use it rather than a name of the test's own choosing.
    attrMap: {
      experiment: { codapID: null, name: "experiment" },
      description: { codapID: null, name: "description" },
      sample_size: { codapID: null, name: "sample size" },
      until_formula: { codapID: null, name: "formula for until" },
      experimentHash: { codapID: null, name: "experimentHash" },
      sample: { codapID: null, name: "sample" }
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

  // The animation steps hold on to the run's end callback, and the request they are waiting on can
  // settle long after the user gave up on that run. Ending it then would hand the controls back
  // over the run that took its place.
  it("does not end the run that replaced one the user stopped", async () => {
    mockFindOrCreateDataContext.mockResolvedValue("Sampler");
    let releaseFirstCreate: (value: unknown) => void = () => undefined;
    mockCreateItems
      .mockImplementationOnce(() => new Promise(resolve => { releaseFirstCreate = resolve; }))
      // the replacement run is still writing its own samples when the first run's create lands
      .mockImplementationOnce(() => new Promise(() => undefined));

    const { result } = renderHook(() => useAnimationContextValue());

    await result.current.handleStartRun();
    await flushRequests();

    await result.current.handleStopRun();
    await result.current.handleStartRun();
    await flushRequests();

    releaseFirstCreate({ success: true });
    await flushRequests();

    expect(state.isRunning).toBe(true);
    expect(state.enableRunButton).toBe(false);
  });

  // Setting up is several requests long, and the answer to Stop cannot wait for the one still in
  // flight: a run stopped anywhere in there has to abandon itself before it animates.
  it("abandons a run stopped after the data context is set up", async () => {
    mockFindOrCreateDataContext.mockResolvedValue("Sampler");
    let releaseExperimentInfo: (value: unknown) => void = () => undefined;
    mockGetNewExperimentInfo.mockImplementation(
      () => new Promise(resolve => { releaseExperimentInfo = resolve; }));

    const { result } = renderHook(() => useAnimationContextValue());

    const run = result.current.handleStartRun();
    await flushRequests();
    await result.current.handleStopRun();

    releaseExperimentInfo({ experimentNum: 1, startingSampleNumber: 1 });
    await run;
    await flushRequests();

    expect(mockCreateItems).not.toHaveBeenCalled();
    expect(state.isRunning).toBe(false);
  });

  // Stopping during the setup has to be answered before the run reports a setup failure of its
  // own: the user is not waiting on a table for a run they abandoned.
  it("does not report a setup failure for a run the user stopped", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);
    let releaseDataContext: (value: string) => void = () => undefined;
    mockFindOrCreateDataContext.mockImplementation(
      () => new Promise<string>(resolve => { releaseDataContext = resolve; }));

    const { result } = renderHook(() => useAnimationContextValue());

    const run = result.current.handleStartRun();
    await result.current.handleStopRun();

    releaseDataContext("");
    await run;

    expect(alertSpy).not.toHaveBeenCalled();
  });

  // Starting again abandons the run being set up for the same reason stopping does: only one run
  // can be under way, and it is the one the user asked for last.
  it("abandons a run superseded by another start", async () => {
    const releaseDataContexts: Array<(value: string) => void> = [];
    mockFindOrCreateDataContext.mockImplementation(
      () => new Promise<string>(resolve => { releaseDataContexts.push(resolve); }));

    const { result } = renderHook(() => useAnimationContextValue());

    const firstRun = result.current.handleStartRun();
    const secondRun = result.current.handleStartRun();

    releaseDataContexts[0]("Sampler");
    await firstRun;
    await flushRequests();

    expect(mockCreateItems).not.toHaveBeenCalled();

    releaseDataContexts[1]("Sampler");
    await secondRun;
    await flushRequests();

    expect(mockCreateItems).toHaveBeenCalledTimes(1);
  });

  // The controls read this to decide whether pause can still act on the run, so it has to follow
  // the run itself: set when the run enters the pass that finishes it, cleared when the run ends.
  it("reports a fastest run as uninterruptible until it ends", async () => {
    mockFindOrCreateDataContext.mockResolvedValue("Sampler");
    let releaseCreate: (value: unknown) => void = () => undefined;
    mockCreateItems.mockImplementationOnce(() => new Promise(resolve => { releaseCreate = resolve; }));

    const { result } = renderHook(() => useAnimationContextValue());
    expect(result.current.isRunUninterruptible()).toBe(false);

    await result.current.handleStartRun();
    await flushRequests();

    expect(result.current.isRunUninterruptible()).toBe(true);

    releaseCreate({ success: true });
    await flushRequests();

    expect(result.current.isRunUninterruptible()).toBe(false);
    expect(state.isRunning).toBe(false);
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

  // Unless the run reaches the fastest speed before it starts animating, where it runs in one pass
  // that no pause can reach. Carrying the pause over there would leave the controls offering to
  // resume a run that never stopped.
  it("drops a pause carried from setup when the run reaches the fastest speed", async () => {
    state.speed = Speed.Slow;
    let releaseDataContext: (value: string) => void = () => undefined;
    mockFindOrCreateDataContext.mockImplementation(
      () => new Promise<string>(resolve => { releaseDataContext = resolve; }));
    // the run is still writing its samples when the pause is asserted on
    mockCreateItems.mockImplementationOnce(() => new Promise(() => undefined));

    const { result, rerender } = renderHook(() => useAnimationContextValue());

    const run = result.current.handleStartRun();
    await result.current.handleTogglePauseRun(true);

    state.speed = Speed.Fastest;
    rerender();

    releaseDataContext("Sampler");
    await run;
    await flushRequests();

    expect(state.isPaused).toBe(false);
    expect(state.isRunning).toBe(true);
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
