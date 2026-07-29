import React from "react";
import { render, screen } from "@testing-library/react";
import { ModelHeader } from "./model-header";
import { Speed } from "../../types";

// Identity translation so the controls can be located by their (stable) tooltip keys; the
// start/pause toggle's accessible name changes with run state, its tooltip key does not.
jest.mock("../../utils/localeManager", () => ({
  tr: (key: string) => key
}));

let state: any;

jest.mock("../../hooks/useGlobalState", () => ({
  useGlobalStateContext: () => ({ globalState: state, setGlobalState: jest.fn() })
}));

jest.mock("../../hooks/useAnimation", () => ({
  useAnimationContext: () => ({
    handleStartRun: jest.fn(),
    handleTogglePauseRun: jest.fn(),
    handleStopRun: jest.fn()
  })
}));

function setState(overrides: Record<string, any> = {}) {
  state = {
    repeat: false,
    sampleSize: "5",
    numSamples: "100",
    enableRunButton: true,
    isRunning: false,
    isPaused: false,
    model: { columns: [{ id: "c1", name: "Deck1", devices: [{ id: "d1", viewType: "mixer", variables: ["a"], replacement: true, formulas: {} }] }] },
    dataContextName: "Sampler",
    untilFormula: "",
    attrMap: {},
    repeatCondition: "",
    repeatNumUniqueValues: 1,
    speed: Speed.Slow,
    ...overrides
  };
}

function renderHeader() {
  render(<ModelHeader showRepeatUntil={false} isWide={false} setShowRepeatUntil={jest.fn()} />);
  return {
    startToggle: screen.getByTitle(/tooltip\.(start|pause)-sampling/) as HTMLButtonElement,
    stopButton: screen.getByTitle("DG.Plugin.Sampler.tooltip.stop-sampling") as HTMLButtonElement
  };
}

describe("ModelHeader start/pause control", () => {
  it("is enabled before a run when the model is runnable", () => {
    setState({ isRunning: false, enableRunButton: true });
    expect(renderHeader().startToggle.disabled).toBe(false);
  });

  it("is enabled while running at a speed that animates", () => {
    setState({ isRunning: true, speed: Speed.Slow });
    expect(renderHeader().startToggle.disabled).toBe(false);
  });

  // At the fastest speed the run completes in one uninterruptible pass, so pause has nothing to
  // act on; leaving it enabled would relabel the control to Start while the run continued.
  it("is disabled while running at the fastest speed", () => {
    setState({ isRunning: true, speed: Speed.Fastest });
    expect(renderHeader().startToggle.disabled).toBe(true);
  });

  it("leaves stop enabled while running at the fastest speed", () => {
    setState({ isRunning: true, speed: Speed.Fastest });
    expect(renderHeader().stopButton.disabled).toBe(false);
  });

  it("is enabled again at the fastest speed once the run ends", () => {
    setState({ isRunning: false, enableRunButton: true, speed: Speed.Fastest });
    expect(renderHeader().startToggle.disabled).toBe(false);
  });
});
