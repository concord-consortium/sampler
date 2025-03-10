import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Spinner } from "./spinner";
import { GlobalStateContext } from "../../../../hooks/useGlobalState";
import { AnimationContext } from "../../../../hooks/useAnimation";
import { IDevice, ViewType } from "../../../../types";

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

// Mock the Spinner component to add testids
jest.mock("./spinner", () => {
  const OriginalSpinner = jest.requireActual("./spinner").Spinner;
  
  return {
    Spinner: (props: any) => {
      // Wrap the original component with testids
      return (
        <div data-testid="spinner-component">
          <OriginalSpinner {...props} />
        </div>
      );
    }
  };
});

// Mock the Wedge component to add testids
jest.mock("./wedge", () => {
  return {
    Wedge: (props: any) => {
      return (
        <div data-testid={`wedge-${props.variableName}`}>
          <path data-testid={`wedge-path-${props.variableName}`} onClick={props.onClick} />
          <text data-testid={`wedge-text-${props.variableName}`}>{props.variableName}</text>
          {props.selectedWedge === props.variableName && (
            <>
              <text data-testid={`wedge-percentage-${props.variableName}`}>{`${Math.round(props.percent * 100)}%`}</text>
              <rect data-testid={`wedge-delete-${props.variableName}`} onClick={(e) => props.handleDeleteWedge(e, props.variableName)} />
            </>
          )}
        </div>
      );
    }
  };
});

describe("Spinner Component", () => {
  const mockDevice: IDevice = {
    id: "device-1",
    viewType: ViewType.Spinner,
    variables: ["Option 1", "Option 2", "Option 3"],
    collectorVariables: [],
    formulas: {},
    hidden: false,
    lockPassword: ""
  };

  const mockHandleAddDefs = jest.fn();
  const mockHandleSetSelectedVariable = jest.fn();
  const mockHandleSetEditingVarName = jest.fn();
  const mockHandleDeleteWedge = jest.fn();
  const mockHandleSetEditingPct = jest.fn();
  const mockHandleStartDrag = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the spinner with wedges", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg data-testid="svg-container">
            <Spinner
              device={mockDevice}
              selectedVariableIdx={null}
              isDragging={false}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
              handleDeleteWedge={mockHandleDeleteWedge}
              handleSetEditingPct={mockHandleSetEditingPct}
              handleStartDrag={mockHandleStartDrag}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Check that the spinner component is rendered
    const spinnerComponent = screen.getByTestId("spinner-component");
    expect(spinnerComponent).toBeInTheDocument();

    // Check that wedges are rendered for each variable
    mockDevice.variables.forEach(variable => {
      const wedge = screen.getByTestId(`wedge-${variable}`);
      expect(wedge).toBeInTheDocument();
      
      const wedgeText = screen.getByTestId(`wedge-text-${variable}`);
      expect(wedgeText).toBeInTheDocument();
      expect(wedgeText.textContent).toBe(variable);
    });
  });

  it("calls handleSetSelectedVariable when a wedge is clicked", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg data-testid="svg-container">
            <Spinner
              device={mockDevice}
              selectedVariableIdx={null}
              isDragging={false}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
              handleDeleteWedge={mockHandleDeleteWedge}
              handleSetEditingPct={mockHandleSetEditingPct}
              handleStartDrag={mockHandleStartDrag}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Find and click the first wedge path
    const wedgePath = screen.getByTestId(`wedge-path-${mockDevice.variables[0]}`);
    fireEvent.click(wedgePath);
    
    // Check that handleSetSelectedVariable was called
    expect(mockHandleSetSelectedVariable).toHaveBeenCalled();
  });

  it("renders a selected wedge differently", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg data-testid="svg-container">
            <Spinner
              device={mockDevice}
              selectedVariableIdx={0}
              isDragging={false}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
              handleDeleteWedge={mockHandleDeleteWedge}
              handleSetEditingPct={mockHandleSetEditingPct}
              handleStartDrag={mockHandleStartDrag}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Check that the selected wedge has a percentage text
    const percentageText = screen.getByTestId(`wedge-percentage-${mockDevice.variables[0]}`);
    expect(percentageText).toBeInTheDocument();
    expect(percentageText.textContent).toContain("%");
  });

  it("calls handleDeleteWedge when delete button is clicked", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg data-testid="svg-container">
            <Spinner
              device={mockDevice}
              selectedVariableIdx={0}
              isDragging={false}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
              handleDeleteWedge={mockHandleDeleteWedge}
              handleSetEditingPct={mockHandleSetEditingPct}
              handleStartDrag={mockHandleStartDrag}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Find and click the delete button for the selected wedge
    const deleteButton = screen.getByTestId(`wedge-delete-${mockDevice.variables[0]}`);
    fireEvent.click(deleteButton);
    
    // Check that handleDeleteWedge was called
    expect(mockHandleDeleteWedge).toHaveBeenCalled();
  });

  it("calls handleSetEditingPct when percentage label is clicked", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg data-testid="svg-container">
            <Spinner
              device={mockDevice}
              selectedVariableIdx={0}
              isDragging={false}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
              handleDeleteWedge={mockHandleDeleteWedge}
              handleSetEditingPct={mockHandleSetEditingPct}
              handleStartDrag={mockHandleStartDrag}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Find and click the percentage text for the selected wedge
    const percentageText = screen.getByTestId(`wedge-percentage-${mockDevice.variables[0]}`);
    fireEvent.click(percentageText);
    
    // Check that handleSetEditingPct was called
    expect(mockHandleSetEditingPct).toHaveBeenCalled();
  });

  it("calls handleSetEditingVarName when variable name is clicked", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg data-testid="svg-container">
            <Spinner
              device={mockDevice}
              selectedVariableIdx={0}
              isDragging={false}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
              handleDeleteWedge={mockHandleDeleteWedge}
              handleSetEditingPct={mockHandleSetEditingPct}
              handleStartDrag={mockHandleStartDrag}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Find and click the variable name text for the selected wedge
    const variableText = screen.getByTestId(`wedge-text-${mockDevice.variables[0]}`);
    fireEvent.click(variableText);
    
    // Check that handleSetEditingVarName was called
    expect(mockHandleSetEditingVarName).toHaveBeenCalled();
  });

  it("does not call handlers when isRunning is true", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: true } as any, setGlobalState: jest.fn() }}>
        <AnimationContext.Provider value={{ registerAnimationCallback: jest.fn() } as any}>
          <svg data-testid="svg-container">
            <Spinner
              device={mockDevice}
              selectedVariableIdx={0}
              isDragging={false}
              handleAddDefs={mockHandleAddDefs}
              handleSetSelectedVariable={mockHandleSetSelectedVariable}
              handleSetEditingVarName={mockHandleSetEditingVarName}
              handleDeleteWedge={mockHandleDeleteWedge}
              handleSetEditingPct={mockHandleSetEditingPct}
              handleStartDrag={mockHandleStartDrag}
            />
          </svg>
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Find and click various elements
    const wedgePath = screen.getByTestId(`wedge-path-${mockDevice.variables[0]}`);
    fireEvent.click(wedgePath);
    
    const variableText = screen.getByTestId(`wedge-text-${mockDevice.variables[0]}`);
    fireEvent.click(variableText);
    
    const percentageText = screen.getByTestId(`wedge-percentage-${mockDevice.variables[0]}`);
    fireEvent.click(percentageText);
    
    const deleteButton = screen.getByTestId(`wedge-delete-${mockDevice.variables[0]}`);
    fireEvent.click(deleteButton);
    
    // Check that none of the handlers were called
    expect(mockHandleSetSelectedVariable).not.toHaveBeenCalled();
    expect(mockHandleSetEditingVarName).not.toHaveBeenCalled();
    expect(mockHandleSetEditingPct).not.toHaveBeenCalled();
    expect(mockHandleDeleteWedge).not.toHaveBeenCalled();
  });
}); 
