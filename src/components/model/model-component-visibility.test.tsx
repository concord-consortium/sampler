import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ModelTab } from "./model-component";
import { GlobalStateContext , getDefaultState } from "../../hooks/useGlobalState";
import { AnimationContext } from "../../hooks/useAnimation";
import { IGlobalState, IGlobalStateContext } from "../../types";

// Mock the animation context
const mockAnimationContext = {
  handleStartRun: jest.fn(),
  handleTogglePauseRun: jest.fn(),
  handleStopRun: jest.fn(),
  registerAnimationCallback: jest.fn()
};

describe("ModelTab with Hide Functionality", () => {
  let mockGlobalState: IGlobalState;
  let mockSetGlobalState: jest.Mock;
  let mockGlobalStateContext: IGlobalStateContext;

  beforeEach(() => {
    mockGlobalState = getDefaultState();
    mockSetGlobalState = jest.fn((updater) => {
      if (typeof updater === "function") {
        // Simulate immer's behavior for testing
        const nextState = { ...mockGlobalState };
        updater(nextState);
        mockGlobalState = nextState;
      } else {
        mockGlobalState = updater;
      }
    });

    mockGlobalStateContext = {
      globalState: mockGlobalState,
      setGlobalState: mockSetGlobalState
    };
  });

  const renderModelTab = () => {
    return render(
      <GlobalStateContext.Provider value={mockGlobalStateContext}>
        <AnimationContext.Provider value={mockAnimationContext}>
          <ModelTab />
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );
  };

  it("renders the visibility toggle button", () => {
    renderModelTab();
    
    const toggleButton = screen.getByRole("button", { name: /toggle model visibility/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it("shows model content when not hidden", () => {
    mockGlobalState.isModelHidden = false;
    renderModelTab();
    
    // Check for model container
    const modelContainer = screen.getByTestId("model-container");
    expect(modelContainer).toBeInTheDocument();
    expect(modelContainer).toBeVisible();
    
    // Check for outputs container
    expect(within(modelContainer).getAllByRole('generic').length).toBeGreaterThan(0);
    expect(within(modelContainer).getAllByRole('generic')[0]).toBeVisible();
  });

  it("hides model content when isModelHidden is true", () => {
    mockGlobalState.isModelHidden = true;
    renderModelTab();
    
    // Model columns should not exist in the DOM
    expect(screen.queryByTestId("model-columns")).not.toBeInTheDocument();
    
    // Should show a message indicating the model is hidden
    const hiddenMessage = screen.getByText(/model is currently hidden/i);
    expect(hiddenMessage).toBeInTheDocument();
  });

  it("toggles model visibility when the toggle button is clicked", () => {
    mockGlobalState.isModelHidden = false;
    renderModelTab();
    
    const toggleButton = screen.getByRole("button", { name: /toggle model visibility/i });
    fireEvent.click(toggleButton);
    
    // Check that the state was updated correctly
    expect(mockSetGlobalState).toHaveBeenCalled();
    
    // Verify that the correct action was dispatched
    expect(mockSetGlobalState).toHaveBeenCalledWith(expect.any(Function));
    
    // Manually test the updater function
    const updaterFn = mockSetGlobalState.mock.calls[0][0];
    const testState = { isModelHidden: false };
    updaterFn(testState);
    expect(testState.isModelHidden).toBe(true);
  });

  it("keeps simulation controls visible when model is hidden", () => {
    mockGlobalState.isModelHidden = true;
    renderModelTab();
    
    // Simulation controls should still be visible
    const startButton = screen.getByText("START");
    const stopButton = screen.getByText("STOP");
    const clearDataButton = screen.getByText("CLEAR DATA");
    
    expect(startButton).toBeInTheDocument();
    expect(stopButton).toBeInTheDocument();
    expect(clearDataButton).toBeInTheDocument();
  });
}); 
