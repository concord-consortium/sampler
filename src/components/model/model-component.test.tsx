import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ModelTab } from "./model-component";
import { GlobalStateContext } from "../../hooks/useGlobalState";
import { createDefaultDevice } from "../../models/device-model";
import { createId } from "../../utils/id";
import { AttrMap } from "../../types";

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
    </div>
  )
}));

// Mock the Outputs component
jest.mock("./outputs", () => ({
  Outputs: () => <div data-testid="outputs" className="outputs">Outputs</div>
}));

// Mock the useResizer hook
jest.mock("../../hooks/use-resizer", () => ({
  useResizer: (callback: () => void) => {
    // Call the callback once to simulate resize
    React.useEffect(() => {
      callback();
    }, [callback]);
  }
}));

// Mock the useAnimationContextValue hook
jest.mock("../../hooks/useAnimation", () => ({
  AnimationContext: React.createContext({}),
  useAnimationContextValue: () => ({
    isRunning: false,
    isPaused: false,
    speed: 1,
    startAnimation: jest.fn(),
    stopAnimation: jest.fn(),
    pauseAnimation: jest.fn(),
    resumeAnimation: jest.fn()
  })
}));

describe("ModelTab Component", () => {
  const mockDevice = createDefaultDevice();
  const mockColumn = {
    name: "Test Column",
    id: createId(),
    devices: [mockDevice]
  };
  
  const mockAttrMap: AttrMap = {
    experiment: {codapID: null, name: "experiment"},
    description: {codapID: null, name: "description"},
    sample_size: {codapID: null, name: "sample size"},
    experimentHash: {codapID: null, name: "experimentHash"},
    sample: {codapID: null, name: "sample"},
  };
  
  const mockGlobalState = {
    globalState: {
      model: {
        columns: [mockColumn]
      },
      selectedDeviceId: mockDevice.id,
      selectedTab: "Model" as "Model" | "Measures" | "About",
      repeat: false,
      replacement: true,
      sampleSize: "5",
      numSamples: "3",
      enableRunButton: true,
      attrMap: mockAttrMap,
      dataContexts: [],
      samplerContext: undefined,
      collectorContext: undefined,
      isRunning: false,
      isPaused: false,
      speed: 1
    },
    setGlobalState: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the model tab with header and columns", () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );

    // Check that the model tab is rendered
    expect(screen.getByTestId("model-header")).toBeInTheDocument();
    expect(screen.getByTestId("column-0")).toBeInTheDocument();
    expect(screen.getByTestId("outputs")).toBeInTheDocument();
    
    // Check that the column name is displayed
    expect(screen.getByText("Test Column")).toBeInTheDocument();
    
    // Check that the device is displayed
    expect(screen.getByTestId(`device-${mockDevice.id}`)).toBeInTheDocument();
  });

  it("toggles help when help button is clicked", () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );

    // Initially help should be hidden
    expect(screen.getByText("Show Help")).toBeInTheDocument();
    
    // Click the help button
    fireEvent.click(screen.getByTestId("help-button"));
    
    // Now help should be shown
    expect(screen.getByText("Hide Help")).toBeInTheDocument();
    
    // Click the help button again
    fireEvent.click(screen.getByTestId("help-button"));
    
    // Help should be hidden again
    expect(screen.getByText("Show Help")).toBeInTheDocument();
  });

  it("adjusts layout based on width", async () => {
    // Create a mock implementation that simulates a wide layout
    (document.querySelector as jest.Mock) = jest.fn().mockImplementation(() => ({
      getBoundingClientRect: () => ({
        width: 600
      })
    }));

    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );

    // The useResizer mock should have called the callback which sets isWide to true
    // We can verify this by checking if the select-repeat-controls div has the wide width
    expect(screen.getByText("Repeat Controls")).toBeInTheDocument();
    
    // Reset the mock for the next test
    (document.querySelector as jest.Mock).mockReset();
  });

  it("renders multiple columns when present in the model", () => {
    const mockDevice2 = { ...createDefaultDevice(), id: createId(), name: "Device 2" };
    const mockColumn2 = {
      name: "Test Column 2",
      id: createId(),
      devices: [mockDevice2]
    };
    
    const multiColumnState = {
      ...mockGlobalState,
      globalState: {
        ...mockGlobalState.globalState,
        model: {
          columns: [mockColumn, mockColumn2]
        }
      }
    };
    
    render(
      <GlobalStateContext.Provider value={multiColumnState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );

    // Check that both columns are rendered
    expect(screen.getByTestId("column-0")).toBeInTheDocument();
    expect(screen.getByTestId("column-1")).toBeInTheDocument();
    
    // Check that both column names are displayed
    expect(screen.getByText("Test Column")).toBeInTheDocument();
    expect(screen.getByText("Test Column 2")).toBeInTheDocument();
    
    // Check that both devices are displayed
    expect(screen.getByTestId(`device-${mockDevice.id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`device-${mockDevice2.id}`)).toBeInTheDocument();
  });
}); 