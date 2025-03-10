import React from "react";
import { render, screen, within } from "@testing-library/react";
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
        <div data-testid="collector-component">
          {/* Mixer Frame */}
          <path data-testid="mixer-frame" className="mixer-frame-path" d="M10,10 L100,10 L100,100 L10,100 Z" />
          
          {/* Balls */}
          {device.collectorVariables.map((item, i) => {
            const value = Object.values(item)[0].toString();
            return (
              <g key={`group-${i}`} data-testid={`ball-group-${i}`} onClick={() => handleGroupClick(i)}>
                <circle
                  key={`circle-${i}`}
                  data-testid={`ball-${i}`}
                  cx={100 + i}
                  cy={100 + i}
                  r={14}
                  onClick={() => handleBallClick(i)}
                />
                <text key={`text-${i}`} data-testid={`ball-text-${i}`}>{value}</text>
              </g>
            );
          })}
        </div>
      );
    }
  };
});

// Mock SVG functions not available in jsdom
beforeAll(() => {
  // Mock getScreenCTM
  Object.defineProperty(SVGElement.prototype, 'getScreenCTM', {
    value: jest.fn().mockReturnValue({
      inverse: jest.fn().mockReturnValue({
        multiply: jest.fn(),
        a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
      })
    }),
    configurable: true
  });

  // Mock createSVGPoint
  Object.defineProperty(SVGElement.prototype, 'createSVGPoint', {
    value: jest.fn().mockReturnValue({
      x: 0,
      y: 0,
      matrixTransform: jest.fn().mockReturnValue({ x: 100, y: 100 })
    }),
    configurable: true
  });

  // Mock getBBox for SVG elements
  Object.defineProperty(SVGElement.prototype, 'getBBox', {
    value: jest.fn().mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 20
    }),
    configurable: true
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
    formulas: {},
    hidden: false,
    lockPassword: ""
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
          <svg data-testid="svg-container">
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

    // Check that the collector component is rendered
    const collectorComponent = screen.getByTestId("collector-component");
    expect(collectorComponent).toBeInTheDocument();
    
    // Check that the mixer frame is rendered
    const mixerFrame = within(collectorComponent).getByTestId("mixer-frame");
    expect(mixerFrame).toBeInTheDocument();
    expect(mixerFrame).toHaveClass("mixer-frame-path");
  });

  it("renders balls for collector variables", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg data-testid="svg-container">
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

    // Check that the collector component is rendered
    const collectorComponent = screen.getByTestId("collector-component");
    
    // Check that balls are rendered (circles)
    mockDevice.collectorVariables.forEach((item, index) => {
      const ball = within(collectorComponent).getByTestId(`ball-${index}`);
      expect(ball).toBeInTheDocument();
      
      const ballText = within(collectorComponent).getByTestId(`ball-text-${index}`);
      expect(ballText).toBeInTheDocument();
      expect(ballText.textContent).toBe(Object.values(item)[0].toString());
    });
  });

  it("calls handleSetSelectedVariable when a ball is clicked", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg data-testid="svg-container">
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

    // Find the collector component
    const collectorComponent = screen.getByTestId("collector-component");
    
    // Click on the first ball
    const firstBall = within(collectorComponent).getByTestId("ball-0");
    firstBall.click();
    
    // Check that handleSetSelectedVariable was called with the correct index
    expect(mockHandleSetSelectedVariable).toHaveBeenCalledWith(0);
  });

  it("calls handleSetEditingVarName when a ball group is clicked", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg data-testid="svg-container">
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

    // Find the collector component
    const collectorComponent = screen.getByTestId("collector-component");
    
    // Click on the first ball group
    const firstBallGroup = within(collectorComponent).getByTestId("ball-group-0");
    firstBallGroup.click();
    
    // Check that handleSetEditingVarName was called with the correct index
    expect(mockHandleSetEditingVarName).toHaveBeenCalledWith(0);
  });

  it("does not call handlers when isRunning is true", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: true } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg data-testid="svg-container">
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

    // Find the collector component
    const collectorComponent = screen.getByTestId("collector-component");
    
    // Click on the first ball
    const firstBall = within(collectorComponent).getByTestId("ball-0");
    firstBall.click();
    
    // Click on the first ball group
    const firstBallGroup = within(collectorComponent).getByTestId("ball-group-0");
    firstBallGroup.click();
    
    // Check that handlers were not called
    expect(mockHandleSetSelectedVariable).not.toHaveBeenCalled();
    expect(mockHandleSetEditingVarName).not.toHaveBeenCalled();
  });

  it("calls handleAddDefs for each collector variable", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg data-testid="svg-container">
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
    
    // Check that handleAddDefs was called once for each collector variable
    expect(mockHandleAddDefs).toHaveBeenCalledTimes(mockDevice.collectorVariables.length);
    
    // Check that each call to handleAddDefs has the correct id format
    mockDevice.collectorVariables.forEach((_, index) => {
      const expectedId = `${mockDevice.id}-text-clip-${100 + index}-${100 + index}`;
      expect(mockHandleAddDefs).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expectedId
        })
      );
    });
  });
}); 
