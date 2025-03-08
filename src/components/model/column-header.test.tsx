import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ColumnHeader } from "./column-header";
import { GlobalStateContext } from "../../hooks/useGlobalState";
import { AnimationContext , useAnimationContext } from "../../hooks/useAnimation";
import { IColumn, ViewType, IDataContext, IGlobalState } from "../../types";

// Mock the useGlobalStateContext hook
jest.mock("../../hooks/useGlobalState", () => ({
  useGlobalStateContext: jest.fn()
}));

// Mock the useAnimationContext hook
jest.mock("../../hooks/useAnimation", () => ({
  useAnimationContext: jest.fn(),
  AnimationContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: any }) => children({})
  }
}));

describe("ColumnHeader Component", () => {
  const mockColumn: IColumn = {
    id: "column-1",
    name: "Test Column",
    devices: [
      {
        id: "device-1",
        viewType: ViewType.Mixer,
        variables: ["a", "b", "c"],
        collectorVariables: [],
        formulas: {},
        hidden: false,
        lockPassword: ""
      }
    ]
  };

  const mockCollectorColumn: IColumn = {
    id: "column-2",
    name: "Collector Column",
    devices: [
      {
        id: "device-2",
        viewType: ViewType.Collector,
        variables: [],
        collectorVariables: [
          { "Animal": "Dog", "Color": "Brown" },
          { "Animal": "Cat", "Color": "Black" }
        ],
        formulas: {},
        hidden: false,
        lockPassword: ""
      }
    ]
  };

  const mockDataContext: IDataContext = {
    guid: 1,
    id: 1,
    name: "Dataset1",
    title: "Dataset 1"
  };

  const mockSetGlobalState = jest.fn();
  const mockRegisterAnimationCallback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: {
        model: {
          columns: [mockColumn, mockCollectorColumn]
        },
        isRunning: false,
        samplerContext: null,
        attrMap: {
          "column-1": { name: "Test Column", codapID: null },
          "column-2": { name: "Collector Column", codapID: null }
        }
      },
      setGlobalState: mockSetGlobalState
    });
    (useAnimationContext as jest.Mock).mockReturnValue({
      registerAnimationCallback: mockRegisterAnimationCallback
    });
  });

  it("renders an editable input for regular columns", () => {
    render(<ColumnHeader column={mockColumn} columnIndex={0} />);
    
    const input = screen.getByDisplayValue("Test Column");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("allows editing the column name for regular columns", () => {
    render(<ColumnHeader column={mockColumn} columnIndex={0} />);
    
    const input = screen.getByDisplayValue("Test Column");
    fireEvent.change(input, { target: { value: "New Column Name" } });
    fireEvent.blur(input);
    
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  it("renders a non-editable div for collector columns when a dataset is selected", () => {
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: {
        model: {
          columns: [mockColumn, mockCollectorColumn]
        },
        isRunning: false,
        samplerContext: null,
        collectorContext: mockDataContext,
        attrMap: {
          "column-1": { name: "Test Column", codapID: null },
          "column-2": { name: "Collector Column", codapID: null }
        }
      },
      setGlobalState: mockSetGlobalState
    });
    
    render(<ColumnHeader column={mockCollectorColumn} columnIndex={1} />);
    
    const div = screen.getByText("Dataset 1");
    expect(div).toBeInTheDocument();
    expect(div.tagName).toBe("DIV");
    expect(div).toHaveClass("dataset-name");
  });

  it("renders an editable input for collector columns when no dataset is selected", () => {
    render(<ColumnHeader column={mockCollectorColumn} columnIndex={1} />);
    
    const input = screen.getByDisplayValue("Collector Column");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("registers an animation callback on mount", () => {
    render(<ColumnHeader column={mockColumn} columnIndex={0} />);
    
    expect(mockRegisterAnimationCallback).toHaveBeenCalled();
  });
});

// Add missing imports for the mocks
import { useGlobalStateContext } from "../../hooks/useGlobalState";
 
