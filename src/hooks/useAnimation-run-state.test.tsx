import { renderHook } from "@testing-library/react";
import { findOrCreateDataContext, getNewExperimentInfo } from "../helpers/codap-helpers";
import { computeExperimentHash } from "../helpers/model-helpers";
import { useAnimationContextValue } from "./useAnimation";
import { Speed } from "../types";

jest.mock("@concord-consortium/codap-plugin-api", () => ({
  createItems: jest.fn().mockResolvedValue({ caseIDs: [] }),
  selectCases: jest.fn().mockResolvedValue({})
}));

jest.mock("../helpers/codap-helpers", () => ({
  findOrCreateDataContext: jest.fn(),
  getNewExperimentInfo: jest.fn(),
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

const mockFindOrCreateDataContext = findOrCreateDataContext as jest.Mock;
const mockGetNewExperimentInfo = getNewExperimentInfo as jest.Mock;
const mockComputeExperimentHash = computeExperimentHash as jest.Mock;

function resetState() {
  state = {
    speed: Speed.Fastest,
    attrMap: {},
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
    mockGetNewExperimentInfo.mockResolvedValue({ experimentNum: 1, startingSampleNumber: 1 });
    mockComputeExperimentHash.mockResolvedValue("hash");
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
