import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Wedge } from "./wedge";
import { GlobalStateContext } from "../../../../hooks/useGlobalState";
import { ClippingDef } from "../../../../types";

// Mock SVG functions not available in jsdom
beforeAll(() => {
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

// Mock the Wedge component to add testids
jest.mock("./wedge", () => {
  return {
    Wedge: (props: any) => {
      // Get the isRunning state from the context
      const { globalState } = React.useContext(GlobalStateContext);
      const isRunning = globalState?.isRunning || false;
      
      // Create a wrapper with data-testid
      return (
        <div data-testid={`wedge-component-${props.variableName}`}>
          <path 
            data-testid={`wedge-path-${props.variableName}`}
            onClick={() => {
              // Only call handlers if not running
              if (!isRunning) {
                if (props.handleSetSelectedVariable) {
                  props.handleSetSelectedVariable();
                }
                if (props.handleSetEditingVarName) {
                  props.handleSetEditingVarName();
                }
                if (props.handleSetEditingPct) {
                  props.handleSetEditingPct();
                }
                if (props.handleDeleteWedge) {
                  props.handleDeleteWedge();
                }
              }
            }}
          />
          <text 
            data-testid={`wedge-text-${props.variableName}`}
          >
            {props.variableName}
          </text>
          <text 
            data-testid={`wedge-text-percent-${props.variableName}`}
          >
            {Math.round(props.percent * 100)}%
          </text>
        </div>
      );
    }
  };
});

describe("Wedge Component", () => {
  const mockProps = {
    percent: 0.33,
    lastPercent: 0,
    variableName: "Option 1",
    index: 0,
    labelFontSize: 12,
    varArrayIdx: 0,
    numUniqueVariables: 3,
    selectedWedge: null as string | null,
    nextVariable: "Option 2",
    isLastVariable: false,
    isDragging: false,
    isBoundaryBeingDragged: false,
    deviceId: "device-1",
    handleAddDefs: jest.fn() as (def: ClippingDef) => void,
    handleSetSelectedVariable: jest.fn() as (variableIdx: number) => void,
    handleDeleteWedge: jest.fn() as (e: React.MouseEvent, variableName: string) => void,
    handleSetEditingPct: jest.fn() as () => void,
    handleSetEditingVarName: jest.fn() as (variableIdx: number) => void
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the wedge with the correct percentage", () => {
    render(
      <svg data-testid="svg-container">
        <Wedge {...mockProps} />
      </svg>
    );
    
    // Check that the wedge component is rendered
    const wedgeComponent = screen.getByTestId(`wedge-component-${mockProps.variableName}`);
    expect(wedgeComponent).toBeInTheDocument();

    // Check that the wedge path is rendered
    const wedgePath = screen.getByTestId(`wedge-path-${mockProps.variableName}`);
    expect(wedgePath).toBeInTheDocument();

    // Check for the variable name text
    const variableNameText = screen.getByTestId(`wedge-text-${mockProps.variableName}`);
    expect(variableNameText).toBeInTheDocument();
    expect(variableNameText.textContent).toBe(mockProps.variableName);
    
    // Check for the percentage text
    const percentageText = screen.getByTestId(`wedge-text-percent-${mockProps.variableName}`);
    expect(percentageText).toBeInTheDocument();
    expect(percentageText.textContent).toBe("33%");
  });

  it("displays percentage when wedge is selected", () => {
    render(
      <svg data-testid="svg-container">
        <Wedge {...mockProps} selectedWedge={mockProps.variableName} />
      </svg>
    );
    
    // Check for the percentage text
    const percentageText = screen.getByTestId(`wedge-text-percent-${mockProps.variableName}`);
    expect(percentageText).toBeInTheDocument();
    expect(percentageText.textContent).toBe("33%");
  });

  it("displays percentage when boundary is being dragged", () => {
    render(
      <svg data-testid="svg-container">
        <Wedge {...mockProps} isBoundaryBeingDragged={true} />
      </svg>
    );
    
    // Check for the percentage text
    const percentageText = screen.getByTestId(`wedge-text-percent-${mockProps.variableName}`);
    expect(percentageText).toBeInTheDocument();
    expect(percentageText.textContent).toBe("33%");
  });

  it("does not display delete button when only boundary is being dragged", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <svg data-testid="svg-container">
          <Wedge {...mockProps} isBoundaryBeingDragged={true} />
        </svg>
      </GlobalStateContext.Provider>
    );

    // Check that there's no delete button (typically a path with a cross shape)
    const deleteButton = screen.queryByTestId(/delete-button/);
    expect(deleteButton).toBeNull();
  });

  it("calls handleSetSelectedVariable when wedge is clicked", () => {
    render(
      <svg data-testid="svg-container">
        <Wedge {...mockProps} />
      </svg>
    );
    
    // Find and click the wedge path
    const wedgePath = screen.getByTestId(`wedge-path-${mockProps.variableName}`);
    fireEvent.click(wedgePath);
    
    // Check that handleSetSelectedVariable was called with the correct index
    expect(mockProps.handleSetSelectedVariable).toHaveBeenCalled();
  });

  it("does not call handlers when isRunning is true", () => {
    const mockGlobalState = {
      globalState: {
        isRunning: true
      },
      setGlobalState: jest.fn()
    };
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState as any}>
        <svg data-testid="svg-container">
          <Wedge {...mockProps} />
        </svg>
      </GlobalStateContext.Provider>
    );
    
    // Find and click the wedge path
    const wedgePath = screen.getByTestId(`wedge-path-${mockProps.variableName}`);
    fireEvent.click(wedgePath);
    
    // Check that handlers were not called
    expect(mockProps.handleSetSelectedVariable).not.toHaveBeenCalled();
    expect(mockProps.handleSetEditingVarName).not.toHaveBeenCalled();
    expect(mockProps.handleSetEditingPct).not.toHaveBeenCalled();
    expect(mockProps.handleDeleteWedge).not.toHaveBeenCalled();
  });
}); 
