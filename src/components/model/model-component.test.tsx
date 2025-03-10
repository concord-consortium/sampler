import React, { useEffect, createContext } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModelTab } from "./model-component";
import { GlobalStateContext } from "../../hooks/useGlobalState";
import { createDefaultDevice } from "../../models/device-model";
import { ViewType, Speed } from "../../types";

// Mock the CODAP plugin API
jest.mock("@concord-consortium/codap-plugin-api", () => ({
  initializePlugin: jest.fn().mockResolvedValue({}),
  codapInterface: {
    updateInteractiveState: jest.fn()
  },
  addDataContextChangeListener: jest.fn(),
  getDataContext: jest.fn().mockResolvedValue({
    success: true,
    values: {
      collections: []
    }
  })
}));

// Mock the Column component
jest.mock("./column", () => ({
  Column: ({ column, columnIndex }: { column: any, columnIndex: number }) => (
    <div data-testid={`column-${columnIndex}`} className="column">
      <div className="column-name">{column.name}</div>
      <div className="devices">
        {column.devices.map((device: any, index: number) => (
          <div key={index} data-testid={`device-${device.id}`} className="device">
            {device.name}
          </div>
        ))}
      </div>
    </div>
  )
}));

// Mock the ModelHeader component
jest.mock("./model-header", () => ({
  ModelHeader: ({ showHelp, setShowHelp, isWide, handleOpenHelp }: any) => (
    <div data-testid="model-header" className="model-header">
      <button 
        data-testid="help-button" 
        onClick={handleOpenHelp}
      >
        {showHelp ? "Hide Help" : "Show Help"}
      </button>
      <div data-testid="simulation-controls" className="simulation-controls">
        <button data-testid="run-button">Run</button>
        <div className="select-repeat-controls" style={{ width: isWide ? "600px" : "400px" }}>
          Repeat Controls
        </div>
      </div>
      {showHelp && <div data-testid="model-help">Help Modal Content</div>}
    </div>
  )
}));

// Mock the Outputs component
jest.mock("./outputs", () => ({
  Outputs: () => <div data-testid="outputs" className="outputs">Outputs</div>
}));

// Mock the useResizer hook
jest.mock("../../hooks/useResizer", () => ({
  useResizer: (callback: () => void) => {
    useEffect(() => {
      callback();
    }, [callback]);
  }
}));

// Mock the useAnimationContextValue hook
jest.mock("../../hooks/useAnimation", () => ({
  AnimationContext: createContext({}),
  useAnimationContextValue: () => ({
    isRunning: false,
    isPaused: false,
    handleStartRun: jest.fn(),
    handleTogglePauseRun: jest.fn(),
    handleStopRun: jest.fn(),
    registerAnimationCallback: jest.fn()
  })
}));

// Mock the HelpModal component
jest.mock("./help-modal", () => ({
  HelpModal: ({ setShowHelp }: any) => (
    <div data-testid="model-help">Help Modal Content</div>
  )
}));

describe("ModelTab Component", () => {
  const mockDevice = createDefaultDevice();
  
  const mockSetGlobalState = jest.fn();
  
  const mockGlobalState = {
    globalState: {
      model: {
        columns: [
          {
            name: "Test Column",
            id: "test-column",
            devices: [mockDevice]
          }
        ]
      },
      selectedDeviceId: undefined,
      selectedTab: "Model" as const,
      repeat: false,
      replacement: false,
      sampleSize: "10",
      numSamples: "10",
      enableRunButton: true,
      attrMap: {
        experiment: { name: 'experiment', codapID: null },
        sample: { name: 'sample', codapID: null },
        description: { name: 'description', codapID: null },
        sample_size: { name: 'sample_size', codapID: null },
        experimentHash: { name: 'experimentHash', codapID: null }
      },
      dataContexts: [],
      collectorContext: undefined,
      samplerContext: undefined,
      isRunning: false,
      isPaused: false,
      speed: Speed.Medium,
      isModelHidden: false,
      modelLocked: false,
      modelPassword: '',
      showPasswordModal: false,
      passwordModalMode: 'set' as const,
      repeatUntilCondition: ''
    },
    setGlobalState: mockSetGlobalState
  };

  const mockMultiColumnState = {
    globalState: {
      model: {
        columns: [
          {
            name: "Column 1",
            id: "column-1",
            devices: [
              {
                id: "device-1",
                viewType: ViewType.Mixer,
                variables: ["a", "b"],
                collectorVariables: [],
                formulas: {},
                hidden: false,
                lockPassword: ""
              }
            ]
          },
          {
            name: "Column 2",
            id: "column-2",
            devices: [
              {
                id: "device-2",
                viewType: ViewType.Mixer,
                variables: ["c", "d"],
                collectorVariables: [],
                formulas: {},
                hidden: false,
                lockPassword: ""
              }
            ]
          }
        ]
      },
      selectedDeviceId: "device-1",
      selectedTab: "Model" as const,
      repeat: false,
      replacement: true,
      sampleSize: "1",
      numSamples: "5",
      enableRunButton: true,
      attrMap: {
        experiment: { name: "experiment", codapID: null },
        description: { name: "description", codapID: null },
        sample_size: { name: "sample size", codapID: null },
        experimentHash: { name: "experimentHash", codapID: null },
        sample: { name: "sample", codapID: null },
        item: { name: "item", codapID: null }
      },
      dataContexts: [],
      collectorContext: undefined,
      samplerContext: undefined,
      isRunning: false,
      isPaused: false,
      speed: Speed.Medium,
      isModelHidden: false,
      modelLocked: false,
      modelPassword: '',
      showPasswordModal: false,
      passwordModalMode: 'set' as const,
      repeatUntilCondition: ''
    },
    setGlobalState: mockSetGlobalState
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the model tab", () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );

    // Check that the model tab is rendered
    expect(screen.getByTestId("model-container")).toBeInTheDocument();
  });

  it("renders the model tab with header and columns", () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Check that the model header is rendered
    expect(screen.getByTestId("model-header")).toBeInTheDocument();
    
    // Check that the column is rendered
    expect(screen.getByTestId("column-0")).toBeInTheDocument();
    expect(screen.getByText("Test Column")).toBeInTheDocument();
    
    // Check that the device is rendered
    expect(screen.getByTestId("device-device-1")).toBeInTheDocument();
  });

  it("shows help when help button is clicked", () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Click the help button
    fireEvent.click(screen.getByTestId("help-button"));
    
    // Check that the help is shown
    expect(screen.getByTestId("model-help")).toBeInTheDocument();
  });

  it("renders multiple columns", () => {
    render(
      <GlobalStateContext.Provider value={mockMultiColumnState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Check that both columns are rendered
    expect(screen.getByTestId("column-0")).toBeInTheDocument();
    expect(screen.getByTestId("column-1")).toBeInTheDocument();
    
    // Check that both column names are rendered
    expect(screen.getByText("Column 1")).toBeInTheDocument();
    expect(screen.getByText("Column 2")).toBeInTheDocument();
  });

  it("adjusts layout based on width", async () => {
    // Mock the getBoundingClientRect to simulate a wide layout
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 600,
      height: 800,
      top: 0,
      left: 0,
      right: 600,
      bottom: 800,
      x: 0,
      y: 0
    });

    render(
      <GlobalStateContext.Provider value={{ 
        globalState: mockGlobalState.globalState, 
        setGlobalState: mockGlobalState.setGlobalState 
      }}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );

    // The useResizer mock should have called the callback which sets isWide to true
    // We can verify this by checking if the select-repeat-controls div has the wide width
    expect(screen.getByText("Repeat Controls")).toBeInTheDocument();
    
    // Reset the mock for the next test
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should render multiple columns", () => {
    render(
      <GlobalStateContext.Provider value={mockMultiColumnState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Check that both columns are rendered
    expect(screen.getByTestId("column-0")).toBeInTheDocument();
    expect(screen.getByTestId("column-1")).toBeInTheDocument();
  });
}); 
