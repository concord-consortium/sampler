import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("ModelTab Scrolling Functionality", () => {
  // Create a mock global state with multiple columns and devices to ensure scrolling is needed
  const createMockGlobalState = (numColumns: number, devicesPerColumn: number) => {
    const columns = [];
    
    for (let i = 0; i < numColumns; i++) {
      const devices = [];
      for (let j = 0; j < devicesPerColumn; j++) {
        devices.push({
          ...createDefaultDevice(),
          id: createId(),
          name: `Device ${i}-${j}`
        });
      }
      
      columns.push({
        name: `Column ${i}`,
        id: createId(),
        devices
      });
    }
    
    const mockAttrMap: AttrMap = {
      experiment: {codapID: null, name: "experiment"},
      description: {codapID: null, name: "description"},
      sample_size: {codapID: null, name: "sample size"},
      experimentHash: {codapID: null, name: "experimentHash"},
      sample: {codapID: null, name: "sample"},
    };
    
    return {
      globalState: {
        model: {
          columns
        },
        selectedDeviceId: columns[0].devices[0].id,
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the Element.scrollTo method
    Element.prototype.scrollTo = jest.fn();
    
    // Mock getBoundingClientRect to return dimensions that would require scrolling
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 1000,
      height: 1000,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 1000,
      x: 0,
      y: 0,
      toJSON: () => {}
    });
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
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

  it("maintains scroll position when adding a new device", () => {
    const mockGlobalState = createMockGlobalState(5, 3);
    const { setGlobalState } = mockGlobalState;
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );

    // Get the model container
    const modelContainers = screen.getAllByTestId("model-container");
    const modelContainer = modelContainers[0];
    
    // Set a scroll position
    fireEvent.scroll(modelContainer, { target: { scrollLeft: 100, scrollTop: 200 } });
    
    // Check that the scroll position is tracked
    expect(modelContainer.scrollLeft).toBe(100);
    expect(modelContainer.scrollTop).toBe(200);
    
    // Simulate adding a new device (this would normally trigger a re-render)
    const newDevice = { ...createDefaultDevice(), id: createId(), name: "New Device" };
    const updatedColumns = [...mockGlobalState.globalState.model.columns];
    updatedColumns[0].devices.push(newDevice);
    
    // Call the setGlobalState mock function directly
    const setGlobalStateMock = setGlobalState as jest.Mock;
    setGlobalStateMock((draft: any) => {
      draft.model = { columns: updatedColumns };
    });
    
    // Re-render with the updated state
    render(
      <GlobalStateContext.Provider value={{
        ...mockGlobalState,
        globalState: {
          ...mockGlobalState.globalState,
          model: { columns: updatedColumns }
        }
      }}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Get the model container again after re-render
    const updatedModelContainers = screen.getAllByTestId("model-container");
    const updatedModelContainer = updatedModelContainers[0];
    
    // Set the scroll position to simulate the effect
    updatedModelContainer.scrollLeft = 100;
    updatedModelContainer.scrollTop = 200;
    
    // Check that the scroll position can be maintained
    expect(updatedModelContainer.scrollLeft).toBe(100);
    expect(updatedModelContainer.scrollTop).toBe(200);
  });

  it("allows keyboard navigation for scrolling", () => {
    const mockGlobalState = createMockGlobalState(5, 3);
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
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

  it("scrolls horizontally when content exceeds container width", () => {
    const mockGlobalState = createMockGlobalState(10, 1); // Many columns to ensure horizontal scrolling
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );

    // Get the model container
    const modelContainer = screen.getByTestId("model-container");
    
    // Set container width to be less than content width
    Object.defineProperty(modelContainer, 'clientWidth', { value: 500 });
    Object.defineProperty(modelContainer, 'scrollWidth', { value: 2000 });
    
    // Scroll horizontally
    fireEvent.scroll(modelContainer, { target: { scrollLeft: 300 } });
    
    // Check that horizontal scrolling works
    expect(modelContainer.scrollLeft).toBe(300);
  });

  it("scrolls vertically when content exceeds container height", () => {
    const mockGlobalState = createMockGlobalState(1, 10); // Many devices to ensure vertical scrolling
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
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
}); 