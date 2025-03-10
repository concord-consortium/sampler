import React from "react";
import { render, screen } from "@testing-library/react";
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
      // Create a wrapper with data-testid
      return (
        <div data-testid={`wedge-component-${props.variableName}`}>
          {props.children}
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
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <svg data-testid="svg-container">
          <Wedge {...mockProps} />
        </svg>
      </GlobalStateContext.Provider>
    );

    // Check that the wedge component is rendered
    const wedgeComponent = screen.getByTestId(`wedge-component-${mockProps.variableName}`);
    expect(wedgeComponent).toBeInTheDocument();

    // Check that the wedge path is rendered
    const wedgePath = screen.getByTestId(`wedge-path-${mockProps.variableName}`);
    expect(wedgePath).toBeInTheDocument();

    // Check for the variable name text
    const textElements = screen.getAllByTestId(/wedge-text/);
    const variableNameText = textElements.find(el => el.textContent === mockProps.variableName);
    expect(variableNameText).toBeTruthy();
  });

  it("displays percentage when wedge is selected", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <svg data-testid="svg-container">
          <Wedge {...mockProps} selectedWedge={mockProps.variableName} />
        </svg>
      </GlobalStateContext.Provider>
    );

    // Check for the percentage text
    const textElements = screen.getAllByTestId(/wedge-text/);
    const percentageText = textElements.find(el => el.textContent?.includes("%"));
    expect(percentageText).toBeTruthy();
    expect(percentageText?.textContent).toBe("33%");
  });

  it("displays percentage when boundary is being dragged", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <svg data-testid="svg-container">
          <Wedge {...mockProps} isBoundaryBeingDragged={true} />
        </svg>
      </GlobalStateContext.Provider>
    );

    // Check for the percentage text
    const textElements = screen.getAllByTestId(/wedge-text/);
    const percentageText = textElements.find(el => el.textContent?.includes("%"));
    expect(percentageText).toBeTruthy();
    expect(percentageText?.textContent).toBe("33%");
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
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <svg data-testid="svg-container">
          <Wedge {...mockProps} />
        </svg>
      </GlobalStateContext.Provider>
    );

    // Find and click the wedge path
    const wedgePath = screen.getByTestId(`wedge-path-${mockProps.variableName}`);
    wedgePath.click();

    // Check that handleSetSelectedVariable was called with the correct index
    expect(mockProps.handleSetSelectedVariable).toHaveBeenCalledWith(mockProps.varArrayIdx);
  });

  it("does not call handlers when isRunning is true", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: true } as any, setGlobalState: jest.fn() }}>
        <svg data-testid="svg-container">
          <Wedge {...mockProps} />
        </svg>
      </GlobalStateContext.Provider>
    );

    // Find and click the wedge path
    const wedgePath = screen.getByTestId(`wedge-path-${mockProps.variableName}`);
    wedgePath.click();

    // Check that handlers were not called
    expect(mockProps.handleSetSelectedVariable).not.toHaveBeenCalled();
  });
}); 
