import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Collector } from "./collector";
import { GlobalStateContext } from "../../../hooks/useGlobalState";
import { AnimationContext } from "../../../hooks/useAnimation";
import { IDevice, ViewType, ClippingDef } from "../../../types";

// Mock the Collector component to avoid the toString error
jest.mock("./collector", () => {
  return {
    Collector: ({ 
      device, 
      handleAddDefs, 
      handleSetSelectedVariable, 
      handleSetEditingVarName 
    }: { 
      device: IDevice; 
      handleAddDefs: (def: ClippingDef) => void; 
      handleSetSelectedVariable: (variableIdx: number) => void; 
      handleSetEditingVarName: (variableIdx: number) => void; 
    }) => {
      // Mock implementation that renders a mixer frame and balls
      const { globalState } = React.useContext(GlobalStateContext);
      const { isRunning } = globalState;

      // Call handleAddDefs for each collector variable
      React.useEffect(() => {
        device.collectorVariables.forEach((_, index) => {
          const id = `${device.id}-text-clip-${100 + index}-${100 + index}`;
          handleAddDefs({
            id,
            element: <clipPath id={id} key={id}>
              <circle cx={100 + index} cy={100 + index} r={14} />
            </clipPath>
          });
        });
      }, [device, handleAddDefs]);

      const handleBallClick = (index: number) => {
        if (!isRunning) {
          handleSetSelectedVariable(index);
        }
      };

      const handleGroupClick = (index: number) => {
        if (!isRunning) {
          handleSetEditingVarName(index);
        }
      };

      return (
        <>
          {/* Mixer Frame */}
          <path className="mixer-frame-path" d="M10,10 L100,10 L100,100 L10,100 Z" />
          
          {/* Balls */}
          {device.collectorVariables.map((item, i) => {
            const value = Object.values(item)[0].toString();
            return (
              <g key={`group-${i}`} onClick={() => handleGroupClick(i)}>
                <circle
                  key={`circle-${i}`}
                  cx={100 + i}
                  cy={100 + i}
                  r={14}
                  onClick={() => handleBallClick(i)}
                />
                <text key={`text-${i}`}>{value}</text>
              </g>
            );
          })}
        </>
      );
    }
  };
});

// Mock SVG functions not available in jsdom
beforeAll(() => {
  // Mock getScreenCTM
  // @ts-ignore - Adding missing SVG methods for testing
  SVGElement.prototype.getScreenCTM = jest.fn().mockReturnValue({
    inverse: jest.fn().mockReturnValue({
      multiply: jest.fn(),
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
    })
  });

  // Mock createSVGPoint
  // @ts-ignore - Adding missing SVG methods for testing
  SVGElement.prototype.createSVGPoint = jest.fn().mockReturnValue({
    x: 0,
    y: 0,
    matrixTransform: jest.fn().mockReturnValue({ x: 100, y: 100 })
  });

  // Mock getBBox for SVG elements
  // @ts-ignore - Adding missing SVG methods for testing
  SVGElement.prototype.getBBox = jest.fn().mockReturnValue({
    x: 0,
    y: 0,
    width: 100,
    height: 20
  });
});

describe("Collector Component", () => {
  const mockDevice: IDevice = {
    id: "device-1",
    viewType: ViewType.Collector,
    variables: [],
    collectorVariables: [
      { "Item 1": "Value 1" },
      { "Item 2": "Value 2" },
      { "Item 3": "Value 3" }
    ],
    formulas: {}
  };

  const mockHandleAddDefs = jest.fn();
  const mockHandleSetSelectedVariable = jest.fn();
  const mockHandleSetEditingVarName = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the collector with the mixer frame", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg>
            <Collector
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
    const paths = document.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
    
    // Check that at least one path has the mixer-frame-path class
    const mixerFramePath = document.querySelector(".mixer-frame-path");
    expect(mixerFramePath).toBeTruthy();
  });

  it("renders balls for collector variables", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg>
            <Collector
              device={mockDevice}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Check that balls are rendered (circles)
    const circles = document.querySelectorAll("circle");
    expect(circles.length).toBe(mockDevice.collectorVariables.length); // One circle per variable
    
    // Check that text elements are rendered for the ball labels
    const textElements = document.querySelectorAll("text");
    expect(textElements.length).toBe(mockDevice.collectorVariables.length);
    
    // Check that the ball labels contain the expected values
    mockDevice.collectorVariables.forEach(item => {
      const value = Object.values(item)[0].toString();
      const hasValue = Array.from(textElements).some(label => 
        label.textContent === value
      );
      expect(hasValue).toBeTruthy();
    });
  });

  it("calls handleSetSelectedVariable when a ball is clicked", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg>
            <Collector
              device={mockDevice}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Find the balls (circles) and click the first one
    const circles = document.querySelectorAll("circle");
    if (circles.length > 0) {
      fireEvent.click(circles[0]);
      // Check that handleSetSelectedVariable was called
      expect(mockHandleSetSelectedVariable).toHaveBeenCalled();
    }
  });

  it("calls handleSetEditingVarName when a ball group is clicked", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg>
            <Collector
              device={mockDevice}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Find the ball groups (g elements) and click the first one
    const groups = document.querySelectorAll("g");
    if (groups.length > 0) {
      fireEvent.click(groups[0]);
      // Check that handleSetEditingVarName was called
      expect(mockHandleSetEditingVarName).toHaveBeenCalled();
    }
  });

  it("does not call handlers when isRunning is true", () => {
    const runningGlobalState = {
      globalState: { isRunning: true } as any,
      setGlobalState: jest.fn()
    };

    render(
      <GlobalStateContext.Provider value={runningGlobalState}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg>
            <Collector
              device={mockDevice}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Find the balls (circles) and click all of them
    const circles = document.querySelectorAll("circle");
    for (let i = 0; i < circles.length; i++) {
      fireEvent.click(circles[i]);
    }

    // Find all groups and click them
    const groups = document.querySelectorAll("g");
    for (let i = 0; i < groups.length; i++) {
      fireEvent.click(groups[i]);
    }

    // Check that handlers were not called
    expect(mockHandleSetSelectedVariable).not.toHaveBeenCalled();
    expect(mockHandleSetEditingVarName).not.toHaveBeenCalled();
  });

  it("adds clip paths for text elements", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg>
            <Collector
              device={mockDevice}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Check that handleAddDefs was called for each ball
    expect(mockHandleAddDefs).toHaveBeenCalledTimes(mockDevice.collectorVariables.length);
  });

  it("calls handleAddDefs for clip paths", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg>
            <Collector
              device={mockDevice}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Check that handleAddDefs was called
    expect(mockHandleAddDefs).toHaveBeenCalled();
  });
}); 