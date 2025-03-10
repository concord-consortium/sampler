import React, { useEffect, useContext } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Mixer } from "./mixer";
import { createDefaultDevice } from "../../../models/device-model";
import { ViewType } from "../../../types";
import { AnimationContext } from "../../../hooks/useAnimation";
import { GlobalStateContext } from "../../../hooks/useGlobalState";

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
      // Destructure props to avoid dependency array issues
      const { x, y, deviceId, handleAddDefs, i, text } = props;
      
      // Call handleAddDefs to simulate the useEffect in the real component
      useEffect(() => {
        const id = `${deviceId}-text-clip-${x}-${y}`;
        handleAddDefs({ 
          id, 
          element: <clipPath id={id} key={id}><circle /></clipPath> 
        });
      }, [x, y, deviceId, handleAddDefs]);

      // Get the isRunning state from the GlobalStateContext
      const { globalState } = useContext(GlobalStateContext);
      const isRunning = globalState.isRunning;

      const handleClick = () => {
        if (!isRunning) {
          props.handleSetEditingVarName(i);
        }
      };

      const handleCircleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isRunning) {
          props.handleSetSelectedVariable(i);
        }
      };

      return (
        <g data-testid={`ball-group-${i}`} onClick={handleClick}>
          <circle 
            data-testid={`ball-circle-${i}`}
            onClick={handleCircleClick}
          />
          <text data-testid={`ball-text-${i}`}>{text}</text>
        </g>
      );
    }
  };
});

// Mock the SVG functions that aren't available in jsdom
beforeAll(() => {
  // Mock getScreenCTM
  Object.defineProperty(window.SVGElement.prototype, 'getScreenCTM', {
    value: jest.fn().mockReturnValue({
      inverse: jest.fn().mockReturnValue({
        a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
      })
    }),
    configurable: true
  });

  // Mock createSVGPoint
  Object.defineProperty(window.SVGElement.prototype, 'createSVGPoint', {
    value: jest.fn().mockReturnValue({
      x: 0,
      y: 0,
      matrixTransform: jest.fn().mockReturnValue({ x: 0, y: 0 })
    }),
    configurable: true
  });
});

// Mock the MixerFrame component to add testids
jest.mock("./shared/mixer-frame", () => {
  return {
    MixerFrame: () => <path data-testid="mixer-frame" className="mixer-frame-path" />
  };
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the mixer with balls for each variable", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={mockAnimationContext as any}>
          <svg data-testid="svg-container">
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
    const mixerFrame = screen.getByTestId("mixer-frame");
    expect(mixerFrame).toBeInTheDocument();

    // Check that balls are rendered for each variable
    mockDevice.variables.forEach((_, index) => {
      const ball = screen.getByTestId(`ball-group-${index}`);
      expect(ball).toBeInTheDocument();
    });
  });

  it("calls handleSetEditingVarName when a ball text is clicked", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={mockAnimationContext as any}>
          <svg data-testid="svg-container">
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

    // Find and click the first ball group (which contains the text)
    const ballGroup = screen.getByTestId("ball-group-0");
    fireEvent.click(ballGroup);

    // Check that handleSetEditingVarName was called with the correct index
    expect(mockHandleSetEditingVarName).toHaveBeenCalledWith(0);
  });

  it("calls handleSetSelectedVariable when a ball circle is clicked", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={mockAnimationContext as any}>
          <svg data-testid="svg-container">
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

    // Find and click the first ball circle
    const ballCircle = screen.getByTestId("ball-circle-0");
    fireEvent.click(ballCircle);

    // Check that handleSetSelectedVariable was called with the correct index
    expect(mockHandleSetSelectedVariable).toHaveBeenCalledWith(0);
  });

  it("does not call handlers when isRunning is true", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: true } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={mockAnimationContext as any}>
          <svg data-testid="svg-container">
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

    // Find and click the first ball group
    const ballGroup = screen.getByTestId("ball-group-0");
    fireEvent.click(ballGroup);

    // Find and click the first ball circle
    const ballCircle = screen.getByTestId("ball-circle-0");
    fireEvent.click(ballCircle);

    // Check that handlers were not called
    expect(mockHandleSetEditingVarName).not.toHaveBeenCalled();
    expect(mockHandleSetSelectedVariable).not.toHaveBeenCalled();
  });

  it("renders balls for each variable", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={mockAnimationContext as any}>
          <svg data-testid="svg-container">
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

    // Check that balls are rendered for each variable
    mockDevice.variables.forEach((variable, index) => {
      const ball = screen.getByTestId(`ball-group-${index}`);
      expect(ball).toBeInTheDocument();
      
      const ballText = screen.getByTestId(`ball-text-${index}`);
      expect(ballText).toBeInTheDocument();
      expect(ballText.textContent).toBe(variable);
    });
  });
}); 
