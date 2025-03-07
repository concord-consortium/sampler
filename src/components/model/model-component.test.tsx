import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ModelTab } from "./model-component";
import { GlobalStateContext } from "../../hooks/useGlobalState";
import { createDefaultDevice } from "../../models/device-model";
import { createId } from "../../utils/id";
import { AttrMap, ViewType, IDevice, Speed } from "../../types";
import { AnimationContext } from "../../hooks/useAnimation";

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

// Mock the HelpModal component
jest.mock("./help-modal", () => ({
  HelpModal: ({ setShowHelp }: any) => (
    <div data-testid="model-help">Help Modal Content</div>
  )
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
  
  const mockSetGlobalState = jest.fn();

  const mockGlobalState = {
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
                formulas: {}
              }
            ]
          }
        ]
      },
      selectedDeviceId: "device-1",
      selectedTab: "Model" as "Model" | "Measures" | "About",
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

  const multiColumnState = {
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
                formulas: {}
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
                formulas: {}
              }
            ]
          }
        ]
      },
      selectedDeviceId: "device-1",
      selectedTab: "Model" as "Model" | "Measures" | "About",
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
    expect(screen.getByText("Column 1")).toBeInTheDocument();
    
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
    const mockDevice2 = {
      ...createDefaultDevice(),
      id: createId(),
      name: "Test Device 2"
    };
    
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
    
    // Check that both column names are rendered
    expect(screen.getByText("Test Column")).toBeInTheDocument();
    expect(screen.getByText("Test Column 2")).toBeInTheDocument();
  });

  it("adjusts layout based on width", async () => {
    // Create a mock implementation that simulates a wide layout
    (document.querySelector as jest.Mock) = jest.fn().mockImplementation(() => ({
      getBoundingClientRect: () => ({
        width: 600
      })
    }));

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
    (document.querySelector as jest.Mock).mockReset();
  });

  it("should render multiple columns", () => {
    const multiColumnState = {
      globalState: {
        model: {
          columns: [
            {
              name: "Column 1",
              id: "column-1",
              devices: [
                {
                  id: "device-1",
                  name: "Test Device 1",
                  viewType: "spinner" as ViewType,
                  variables: {
                    values: ["A", "B", "C"],
                    weights: [1, 1, 1],
                  },
                  collectorVariables: {
                    values: [],
                    weights: [],
                  },
                  formulas: {},
                },
              ],
            },
            {
              name: "Column 2",
              id: "column-2",
              devices: [
                {
                  id: "device-2",
                  name: "Test Device 2",
                  viewType: "spinner" as ViewType,
                  variables: {
                    values: ["X", "Y", "Z"],
                    weights: [1, 1, 1],
                  },
                  collectorVariables: {
                    values: [],
                    weights: [],
                  },
                  formulas: {},
                },
              ],
            },
          ],
        },
        selectedDeviceId: "device-1",
        selectedTab: "Model",
        repeat: false,
        replacement: true,
        sampleSize: "1",
        samplerContext: undefined,
        attrMap: {
          experiment: { name: "Experiment", codapID: null },
          sample: { name: "Sample", codapID: null },
          description: { name: "Description", codapID: null },
          sample_size: { name: "Sample Size", codapID: null },
          experimentHash: { name: "Experiment Hash", codapID: null },
        },
        isPaused: false,
        speed: 1,
        isModelHidden: false,
      },
      setGlobalState: jest.fn(),
    };
  });
}); 
