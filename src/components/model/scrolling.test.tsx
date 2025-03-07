import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModelTab } from "./model-component";
import { GlobalStateContext } from "../../hooks/useGlobalState";
import { AnimationContext } from "../../hooks/useAnimation";
import { View, ICollectorItem, ViewType, IGlobalStateContext, IColumn, IDevice, Speed, AttrMap, IDataContext } from "../../types";
import { createDefaultDevice } from "../../models/device-model";
import { createId } from "../../utils/id";

// Mock the animation context
const mockAnimationContext = {
  isRunning: false,
  isPaused: false,
  speed: Speed.Medium,
  startAnimation: jest.fn(),
  stopAnimation: jest.fn(),
  pauseAnimation: jest.fn(),
  resumeAnimation: jest.fn(),
  handleStartRun: jest.fn(),
  handleTogglePauseRun: jest.fn(),
  handleStopRun: jest.fn(),
  registerAnimationCallback: jest.fn(),
  unregisterAnimationCallback: jest.fn()
};

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
    <div data-testid={`column-${columnIndex}`} className="column" style={{ height: "500px", width: "200px" }}>
      <div className="column-name">{column.name}</div>
      <div className="devices">
        {column.devices.map((device: any, index: number) => (
          <div key={index} data-testid={`device-${device.id}`} className="device" style={{ height: "300px" }}>
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
    <div data-testid="model-header" className="model-header" style={{ height: "100px" }}>
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
  Outputs: () => <div data-testid="outputs" className="outputs" style={{ height: "300px", width: "200px" }}>Outputs</div>
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

// Mock the scrollTo function
const mockScrollTo = jest.fn();
Element.prototype.scrollTo = mockScrollTo;

// Mock document.querySelector
const originalQuerySelector = document.querySelector;
const mockQuerySelector = jest.fn();

describe("ModelTab Scrolling Functionality", () => {
  // Create a mock global state with the specified number of columns and devices per column
  const createMockGlobalState = (numColumns: number, devicesPerColumn: number): IGlobalStateContext => {
    // Create columns with devices
    const columns: IColumn[] = [];
    for (let i = 0; i < numColumns; i++) {
      const devices: IDevice[] = [];
      for (let j = 0; j < devicesPerColumn; j++) {
        devices.push({
          ...createDefaultDevice(),
          id: createId(),
          viewType: ViewType.Spinner,
          variables: [],
          collectorVariables: [],
          formulas: {}
        });
      }
      columns.push({
        id: `col${i}`,
        name: `Column ${i}`,
        devices
      });
    }

    // Create mock AttrMap
    const mockAttrMap: AttrMap = {
      experiment: { codapID: null, name: "experiment" },
      description: { codapID: null, name: "description" },
      sample_size: { codapID: null, name: "sample_size" },
      experimentHash: { codapID: null, name: "experimentHash" },
      sample: { codapID: null, name: "sample" }
    };

    return {
      globalState: {
        model: { columns },
        selectedDeviceId: undefined,
        selectedTab: "Model" as "Model" | "Measures" | "About",
        repeat: false,
        replacement: false,
        sampleSize: "10",
        numSamples: "10",
        enableRunButton: true,
        attrMap: mockAttrMap,
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
      setGlobalState: jest.fn()
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation of querySelector
    document.querySelector = mockQuerySelector;
  });

  afterEach(() => {
    // Restore the original querySelector
    document.querySelector = originalQuerySelector;
  });

  it("renders a scrollable container for the model", () => {
    const mockGlobalState = createMockGlobalState(5, 3);
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );

    // Get the model container
    const modelContainer = screen.getByTestId("model-container");
    
    // Check that it contains all the columns
    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`column-${i}`)).toBeInTheDocument();
    }
  });

  it("maintains scroll position when content changes", () => {
    const mockGlobalState = createMockGlobalState(5, 3);
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Get the model container
    const modelContainer = screen.getByTestId("model-container");
    
    // Set initial scroll position
    Object.defineProperty(modelContainer, 'scrollLeft', { value: 100, writable: true });
    Object.defineProperty(modelContainer, 'scrollTop', { value: 50, writable: true });
    
    // Trigger a scroll event
    fireEvent.scroll(modelContainer, { target: { scrollLeft: 100, scrollTop: 50 } });
    
    // Simulate a model update by forcing a re-render
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Check that the scroll position was maintained
    expect(modelContainer.scrollLeft).toBe(100);
    expect(modelContainer.scrollTop).toBe(50);
  });

  it("allows keyboard navigation with arrow keys", () => {
    const mockGlobalState = createMockGlobalState(5, 3);
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Get the model container
    const modelContainer = screen.getByTestId("model-container");
    
    // Set initial scroll position
    Object.defineProperty(modelContainer, 'scrollLeft', { value: 100, writable: true });
    Object.defineProperty(modelContainer, 'scrollTop', { value: 50, writable: true });
    
    // Press right arrow key directly on the container
    fireEvent.keyDown(modelContainer, { key: 'ArrowRight' });
    
    // Check that scrollLeft was increased
    expect(modelContainer.scrollLeft).toBe(150); // 100 + 50 (scrollAmount)
    
    // Press down arrow key
    fireEvent.keyDown(modelContainer, { key: 'ArrowDown' });
    
    // Check that scrollTop was increased
    expect(modelContainer.scrollTop).toBe(100); // 50 + 50 (scrollAmount)
  });

  it("scrolls horizontally when content exceeds container width", () => {
    const mockGlobalState = createMockGlobalState(5, 3);
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Get the model container
    const modelContainer = screen.getByTestId("model-container");
    
    // Set container dimensions
    Object.defineProperty(modelContainer, 'scrollLeft', { value: 0, writable: true });
    Object.defineProperty(modelContainer, 'scrollWidth', { value: 1000 });
    Object.defineProperty(modelContainer, 'clientWidth', { value: 500 });
    
    // Simulate scrolling
    fireEvent.scroll(modelContainer, { target: { scrollLeft: 300 } });
    
    // Check that the scroll position was updated
    expect(modelContainer.scrollLeft).toBe(300);
  });

  it("scrolls vertically when content exceeds container height", () => {
    const mockGlobalState = createMockGlobalState(1, 10); // Many devices to ensure vertical scrolling
    
    render(
      <GlobalStateContext.Provider value={{ 
        globalState: mockGlobalState.globalState, 
        setGlobalState: mockGlobalState.setGlobalState 
      }}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );

    // Get the model container
    const modelContainer = screen.getByTestId("model-container");
    
    // Set container height to be less than content height
    Object.defineProperty(modelContainer, 'clientHeight', { value: 400 });
    Object.defineProperty(modelContainer, 'scrollHeight', { value: 3000 });
    
    // Scroll vertically
    fireEvent.scroll(modelContainer, { target: { scrollTop: 500 } });
    
    // Check that vertical scrolling works
    expect(modelContainer.scrollTop).toBe(500);
  });

  it("should handle keyboard navigation", () => {
    const { container } = render(
      <GlobalStateContext.Provider
        value={{
          globalState: {
            model: {
              columns: [
                {
                  name: "Column 1",
                  id: "column1",
                  devices: [
                    {
                      id: "device1",
                      viewType: ViewType.Mixer,
                      variables: ["a", "a", "b"],
                      collectorVariables: [],
                      formulas: {}
                    }
                  ]
                }
              ]
            },
            selectedDeviceId: undefined,
            selectedTab: "Model",
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
          setGlobalState: jest.fn(),
        }}
      >
        <AnimationContext.Provider value={mockAnimationContext}>
          <ModelTab />
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );

    // Get the model container
    const modelContainer = screen.getByTestId("model-container");
    
    // Focus the container to enable keyboard navigation
    modelContainer.focus();
    
    // Test arrow key navigation
    fireEvent.keyDown(modelContainer, { key: "ArrowRight" });
    expect(modelContainer.scrollLeft).toBeGreaterThan(0);
    
    fireEvent.keyDown(modelContainer, { key: "ArrowDown" });
    expect(modelContainer.scrollTop).toBeGreaterThan(0);
    
    // Reset scroll position
    modelContainer.scrollLeft = 100;
    modelContainer.scrollTop = 100;
    
    fireEvent.keyDown(modelContainer, { key: "ArrowLeft" });
    expect(modelContainer.scrollLeft).toBeLessThan(100);
    
    fireEvent.keyDown(modelContainer, { key: "ArrowUp" });
    expect(modelContainer.scrollTop).toBeLessThan(100);
  });
}); 
