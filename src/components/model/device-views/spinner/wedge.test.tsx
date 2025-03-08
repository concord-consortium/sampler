import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Wedge } from "./wedge";
import { GlobalStateContext } from "../../../../hooks/useGlobalState";
import { ClippingDef } from "../../../../types";

// Mock SVG functions not available in jsdom
beforeAll(() => {
  // Mock getBBox for SVG elements
  // @ts-ignore - Adding missing SVG methods for testing
  SVGElement.prototype.getBBox = jest.fn().mockReturnValue({
    x: 0,
    y: 0,
    width: 100,
    height: 20
  });
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
        <svg>
          <Wedge {...mockProps} />
        </svg>
      </GlobalStateContext.Provider>
    );

    // Check that the wedge path is rendered
    const paths = document.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);

    // Check that the variable name is rendered
    const variableLabels = document.querySelectorAll("text");
    const hasVariable = Array.from(variableLabels).some(label => 
      label.textContent === mockProps.variableName
    );
    expect(hasVariable).toBeTruthy();
  });

  it("displays percentage when wedge is selected", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <svg>
          <Wedge {...mockProps} selectedWedge={mockProps.variableName} />
        </svg>
      </GlobalStateContext.Provider>
    );

    // Check that the percentage label is rendered
    const percentageLabels = Array.from(document.querySelectorAll("text"))
      .filter(text => text.textContent?.includes("%"));
    expect(percentageLabels.length).toBe(1);
    expect(percentageLabels[0].textContent).toBe("33%");
  });

  it("displays percentage when boundary is being dragged", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <svg>
          <Wedge {...mockProps} isBoundaryBeingDragged={true} />
        </svg>
      </GlobalStateContext.Provider>
    );

    // Check that the percentage label is rendered
    const percentageLabels = Array.from(document.querySelectorAll("text"))
      .filter(text => text.textContent?.includes("%"));
    expect(percentageLabels.length).toBe(1);
    expect(percentageLabels[0].textContent).toBe("33%");
  });

  it("does not display delete button when only boundary is being dragged", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <svg>
          <Wedge {...mockProps} isBoundaryBeingDragged={true} />
        </svg>
      </GlobalStateContext.Provider>
    );

    // Check that no delete button is rendered
    // We need to find the delete button specifically, not just any rect
    const deleteButton = Array.from(document.querySelectorAll("g"))
      .find(g => g.getAttribute("style")?.includes("cursor: pointer"));
    expect(deleteButton).toBeUndefined();
  });

  it("displays delete button when wedge is selected", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <svg>
          <Wedge {...mockProps} selectedWedge={mockProps.variableName} />
        </svg>
      </GlobalStateContext.Provider>
    );

    // Check that delete button is rendered
    const deleteButton = Array.from(document.querySelectorAll("g"))
      .find(g => g.getAttribute("style")?.includes("cursor: pointer"));
    expect(deleteButton).toBeDefined();
  });

  it("calls handleSetSelectedVariable when wedge is clicked", () => {
    render(
      <GlobalStateContext.Provider value={{ globalState: { isRunning: false } as any, setGlobalState: jest.fn() }}>
        <svg>
          <Wedge {...mockProps} />
        </svg>
      </GlobalStateContext.Provider>
    );

    // Find the wedge path and click it
    const paths = document.querySelectorAll("path");
    if (paths.length > 0) {
      fireEvent.click(paths[0]);
      // Check that handleSetSelectedVariable was called
      expect(mockProps.handleSetSelectedVariable).toHaveBeenCalled();
    }
  });
}); 