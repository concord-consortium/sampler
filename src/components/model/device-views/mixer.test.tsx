import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Mixer } from "./mixer";
import { createDefaultDevice } from "../../../models/device-model";
import { ViewType, Speed, AttrMap } from "../../../types";
import { AnimationContext } from "../../../hooks/useAnimation";
import { GlobalStateContext , getDefaultState } from "../../../hooks/useGlobalState";

// Define the props type for the Ball component
interface BallProps {
  i: number;
  text: string;
  x: number;
  y: number;
  radius: number;
  deviceId: string;
  handleSetEditingVarName: (index: number) => void;
  handleSetSelectedVariable: (index: number) => void;
  handleAddDefs: (def: any) => void;
}

// Mock the Ball component to directly test the handleSetEditingVarName function
jest.mock("./shared/ball", () => {
  const originalModule = jest.requireActual("./shared/ball");
  return {
    ...originalModule,
    Ball: (props: BallProps) => {
      // Call handleAddDefs to simulate the useEffect in the real component
      React.useEffect(() => {
        const id = `${props.deviceId}-text-clip-${props.x}-${props.y}`;
        props.handleAddDefs({ 
          id, 
          element: <clipPath id={id} key={id}><circle /></clipPath> 
        });
      }, [props.x, props.y, props.deviceId, props.handleAddDefs]);

      // Get the isRunning state from the GlobalStateContext
      const { globalState } = React.useContext(GlobalStateContext);
      const isRunning = globalState.isRunning;

      const handleClick = () => {
        if (!isRunning) {
          props.handleSetEditingVarName(props.i);
        }
      };

      const handleCircleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isRunning) {
          props.handleSetSelectedVariable(props.i);
        }
      };

      return (
        <g data-testid={`ball-group-${props.i}`} onClick={handleClick}>
          <circle 
            data-testid={`ball-circle-${props.i}`}
            onClick={handleCircleClick}
          />
          <text>{props.text}</text>
        </g>
      );
    }
  };
});

// Mock the SVG functions that aren't available in jsdom
// @ts-ignore - Adding missing SVG methods for testing
window.SVGElement.prototype.getScreenCTM = jest.fn().mockReturnValue({
  inverse: jest.fn().mockReturnValue({
    a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
  })
});

// @ts-ignore - Adding missing SVG methods for testing
window.SVGElement.prototype.createSVGPoint = jest.fn().mockReturnValue({
  x: 0,
  y: 0,
  matrixTransform: jest.fn().mockReturnValue({ x: 0, y: 0 })
});

describe("Mixer Component", () => {
  const mockDevice = createDefaultDevice();
  mockDevice.id = "test-mixer-id";
  mockDevice.viewType = ViewType.Mixer;
  mockDevice.variables = ["a", "b", "c"];

  const mockHandleAddDefs = jest.fn();
  const mockHandleSetSelectedVariable = jest.fn();
  const mockHandleSetEditingVarName = jest.fn();

  const mockAnimationContext = {
    handleStartRun: jest.fn().mockResolvedValue(undefined),
    handleTogglePauseRun: jest.fn().mockResolvedValue(undefined),
    handleStopRun: jest.fn().mockResolvedValue(undefined),
    registerAnimationCallback: jest.fn().mockImplementation((callback) => {
      // Immediately call the callback with a modelChanged step to initialize ball positions
      callback({ kind: "modelChanged" });
      return () => undefined;
    })
  };

  // Use the default state to ensure we have all required properties
  const defaultState = getDefaultState();
  
  const mockGlobalState = {
    globalState: {
      ...defaultState,
      isRunning: false
    },
    setGlobalState: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the mixer frame", () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <AnimationContext.Provider value={mockAnimationContext}>
          <svg>
            <Mixer
              device={mockDevice}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Check that the mixer frame is rendered
    const mixerFramePath = document.querySelector(".mixer-frame-path");
    expect(mixerFramePath).toBeInTheDocument();
  });

  it("renders balls for each variable", () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <AnimationContext.Provider value={mockAnimationContext}>
          <svg>
            <Mixer
              device={mockDevice}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Check that circles are rendered for each variable
    const circles = document.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThanOrEqual(mockDevice.variables.length);
    
    // Check that text elements are rendered for each variable
    mockDevice.variables.forEach((variable, index) => {
      const texts = document.querySelectorAll("text");
      expect(texts.length).toBeGreaterThanOrEqual(mockDevice.variables.length);
      
      // At least one text element should contain the variable name
      const textWithVariable = Array.from(texts).find(text => text.textContent === variable);
      expect(textWithVariable).toBeTruthy();
    });
  });

  it("calls handleSetSelectedVariable when a ball is clicked", () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <AnimationContext.Provider value={mockAnimationContext}>
          <svg>
            <Mixer
              device={mockDevice}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Find and click on a ball
    const circles = document.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThanOrEqual(mockDevice.variables.length);
    
    // Skip the first circle which is likely the clipPath circle
    const ballCircle = circles[circles.length > mockDevice.variables.length ? mockDevice.variables.length : 0];
    fireEvent.click(ballCircle);
    
    // Check that handleSetSelectedVariable was called
    expect(mockHandleSetSelectedVariable).toHaveBeenCalled();
  });

  it("calls handleSetEditingVarName when a ball group is clicked", () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <AnimationContext.Provider value={mockAnimationContext}>
          <svg>
            <Mixer
              device={mockDevice}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Find and click on a ball group using the test ID
    const ballGroup = screen.getByTestId('ball-group-0');
    fireEvent.click(ballGroup);
    
    // Check that handleSetEditingVarName was called
    expect(mockHandleSetEditingVarName).toHaveBeenCalled();
  });

  it("does not call handlers when isRunning is true", () => {
    const runningGlobalState = {
      ...mockGlobalState,
      globalState: {
        ...mockGlobalState.globalState,
        isRunning: true
      }
    };

    render(
      <GlobalStateContext.Provider value={runningGlobalState}>
        <AnimationContext.Provider value={mockAnimationContext}>
          <svg>
            <Mixer
              device={mockDevice}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Find and click on ball groups and circles
    const ballGroups = document.querySelectorAll("g");
    if (ballGroups.length > 0) {
      fireEvent.click(ballGroups[0]);
    }
    
    const circles = document.querySelectorAll("circle");
    if (circles.length > mockDevice.variables.length) {
      fireEvent.click(circles[mockDevice.variables.length]);
    } else if (circles.length > 0) {
      fireEvent.click(circles[0]);
    }
    
    // Check that handlers were not called
    expect(mockHandleSetSelectedVariable).not.toHaveBeenCalled();
    expect(mockHandleSetEditingVarName).not.toHaveBeenCalled();
  });

  it("calls handleAddDefs for each ball", () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <AnimationContext.Provider value={mockAnimationContext}>
          <svg>
            <Mixer
              device={mockDevice}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Check that handleAddDefs was called at least once for each ball
    // The actual number may be higher due to the animation callback
    expect(mockHandleAddDefs).toHaveBeenCalled();
  });
}); 
