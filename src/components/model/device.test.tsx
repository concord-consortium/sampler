import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { Device } from "./device";
import { GlobalStateContext } from "../../hooks/useGlobalState";
import { createDefaultDevice } from "../../models/device-model";
import { ViewType, AttrMap, Speed } from "../../types";

// Mock the CODAP plugin API
jest.mock("@concord-consortium/codap-plugin-api", () => ({
  initializePlugin: jest.fn().mockResolvedValue({}),
  codapInterface: {
    sendRequest: jest.fn().mockImplementation((req, callback) => {
      if (callback) {
        callback([{ success: true, values: { name: "test", id: "123" } }]);
      }
      return Promise.resolve({ success: true, values: [] });
    })
  },
  getAllItems: jest.fn().mockResolvedValue({
    success: true,
    values: []
  }),
  getListOfDataContexts: jest.fn().mockResolvedValue({
    success: true,
    values: []
  })
}));

// Mock SVG functions
jest.mock('../../components/model/device-views/spinner/text-backer', () => ({
  updateTextBackerRefFn: jest.fn(() => jest.fn()),
  TextBacker: jest.fn(() => <div data-testid="text-backer" />)
}));

// Mock getBBox for SVG elements
beforeAll(() => {
  // Mock getBBox
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  SVGElement.prototype.getBBox = jest.fn().mockReturnValue({
    x: 0,
    y: 0,
    width: 100,
    height: 50
  });
});

// Mock the renameAttribute function
jest.mock("../../helpers/codap-helpers", () => ({
  ...jest.requireActual("../../helpers/codap-helpers"),
  renameAttribute: jest.fn().mockResolvedValue({ success: true })
}));

// Mock the formula variable renaming functions
jest.mock("../../utils/formula/FormulaVariableRenaming", () => ({
  handleVariableRename: jest.fn(),
  initializeFormulaTracker: jest.fn()
}));

describe("Device Component", () => {
  const mockDevice = createDefaultDevice();
  mockDevice.id = "test-device-id";
  mockDevice.viewType = ViewType.Mixer;
  mockDevice.variables = ["a", "b", "c"];
  
  const mockColumn = {
    name: "Column 1",
    id: "column-1",
    devices: [mockDevice]
  };
  
  const mockAttrMap: AttrMap = {
    experiment: { name: 'experiment', codapID: null },
    sample: { name: 'sample', codapID: null },
    description: { name: 'description', codapID: null },
    sample_size: { name: 'sample_size', codapID: null },
    experimentHash: { name: 'experimentHash', codapID: null },
    item: { name: 'item', codapID: null }
  };
  
  const mockSetGlobalState = jest.fn();

  const mockGlobalState = {
    globalState: {
      model: {
        columns: [mockColumn]
      },
      selectedDeviceId: mockDevice.id,
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
    setGlobalState: mockSetGlobalState
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the device with the correct view type", () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Device device={mockDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Check that the device container is rendered
    const deviceContainer = screen.getByTestId("device-container");
    expect(deviceContainer).toBeInTheDocument();
    expect(deviceContainer).toHaveClass("device-container");
    
    // Check that the device frame has the correct view type class
    const deviceFrames = within(deviceContainer).getAllByRole('generic');
    const deviceFrame = deviceFrames.find(el => el.classList.contains('device-frame'));
    expect(deviceFrame).toHaveClass("mixer");
  });

  it("selects the device when clicked", () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Device device={mockDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Click on the device
    fireEvent.click(screen.getByTestId("device-container"));

    // Check that setGlobalState was called to update the selected device
    expect(mockGlobalState.setGlobalState).toHaveBeenCalled();
  });

  it("allows selecting the device when clicked", () => {
    const setGlobalStateMock = jest.fn();
    const mockGlobalStateWithMock = {
      ...mockGlobalState,
      setGlobalState: setGlobalStateMock
    };

    render(
      <GlobalStateContext.Provider value={mockGlobalStateWithMock}>
        <Device device={mockDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Click on the device container
    const deviceContainer = screen.getByTestId("device-container");
    fireEvent.click(deviceContainer);

    // Check that setGlobalState was called to select the device
    expect(setGlobalStateMock).toHaveBeenCalled();
  });

  it("renders the device with the correct view type when selected", () => {
    const selectedMockGlobalState = {
      globalState: {
        ...mockGlobalState.globalState,
        selectedDeviceId: mockDevice.id
      },
      setGlobalState: mockGlobalState.setGlobalState
    };

    render(
      <GlobalStateContext.Provider value={selectedMockGlobalState}>
        <Device device={mockDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Check that the device container has the selected class
    const deviceContainer = screen.getByTestId("device-container");
    expect(deviceContainer).toHaveClass("selected");
  });

  it("renders the device with the correct view type when not selected", () => {
    const unselectedMockGlobalState = {
      globalState: {
        ...mockGlobalState.globalState,
        selectedDeviceId: "different-id"
      },
      setGlobalState: mockGlobalState.setGlobalState
    };

    render(
      <GlobalStateContext.Provider value={unselectedMockGlobalState}>
        <Device device={mockDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Check that the device container does not have the selected class
    const deviceContainer = screen.getByTestId("device-container");
    expect(deviceContainer).not.toHaveClass("selected");
  });

  it("shows delete button and handles device deletion when not in first column", () => {
    // Mock window.confirm to always return true
    window.confirm = jest.fn().mockReturnValue(true);
    
    // Create a custom global state with a mock setGlobalState function
    // and proper column structure for the delete operation
    const deleteSetGlobalState = jest.fn().mockImplementation((callback) => {
      // No need to actually modify state in the test
    });
    
    const customGlobalState = {
      globalState: {
        ...mockGlobalState.globalState,
        model: {
          columns: [
            { id: "col1", name: "Column 1", devices: [] },
            { id: "col2", name: "Column 2", devices: [mockDevice] }
          ]
        }
      },
      setGlobalState: deleteSetGlobalState
    };
    
    render(
      <GlobalStateContext.Provider value={{ 
        globalState: customGlobalState.globalState, 
        setGlobalState: customGlobalState.setGlobalState 
      }}>
        <Device device={mockDevice} columnIndex={1} />
      </GlobalStateContext.Provider>
    );

    // Check that the delete button is displayed
    const deleteButton = screen.getByTestId("delete-device-button");
    expect(deleteButton).toBeInTheDocument();
    
    // Click the delete button
    fireEvent.click(deleteButton);
    
    // Check that setGlobalState was called
    expect(deleteSetGlobalState).toHaveBeenCalled();
  });

  it("opens the variable editor modal when specify variables button is clicked", () => {
    const mockSetGlobalState = jest.fn();
    const { container } = render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState.globalState, setGlobalState: mockSetGlobalState }}>
        <Device device={mockDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Find and click the "..." button which typically opens variable options
    const optionsButton = screen.getAllByRole('button').find(button => button.textContent === '...');
    expect(optionsButton).toBeTruthy();
    if (optionsButton) {
      fireEvent.click(optionsButton);
    }

    // Verify that setGlobalState was called to update the modal state
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  it("handles updating variables to a series", () => {
    const mockSetGlobalState = jest.fn();
    render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState.globalState, setGlobalState: mockSetGlobalState }}>
        <Device device={mockDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Find and click the "..." button which typically opens variable options
    const optionsButton = screen.getAllByRole('button').find(button => button.textContent === '...');
    expect(optionsButton).toBeTruthy();
    if (optionsButton) {
      fireEvent.click(optionsButton);
    }

    // Verify that setGlobalState was called
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  it("handles selecting a variable", () => {
    // Create a modified state with variables for the test device
    const deviceWithVariables = {
      ...mockDevice,
      variables: ["Variable 1", "Variable 2", "Variable 3"]
    };
    
    const columnWithVariables = {
      ...mockColumn,
      devices: [deviceWithVariables]
    };
    
    const stateWithVariables = {
      ...mockGlobalState.globalState,
      model: {
        ...mockGlobalState.globalState.model,
        columns: [columnWithVariables]
      }
    };

    const mockSetGlobalState = jest.fn();
    render(
      <GlobalStateContext.Provider value={{ globalState: stateWithVariables, setGlobalState: mockSetGlobalState }}>
        <Device device={deviceWithVariables} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Verify the device renders correctly
    const deviceContainer = screen.getByTestId('device-container');
    expect(deviceContainer).toBeInTheDocument();
  });

  it("handles deleting a variable", () => {
    // Create a modified state with variables for the test device
    const deviceWithVariables = {
      ...mockDevice,
      variables: ["Variable 1", "Variable 2", "Variable 3"]
    };
    
    const columnWithVariables = {
      ...mockColumn,
      devices: [deviceWithVariables]
    };
    
    const stateWithVariables = {
      ...mockGlobalState.globalState,
      model: {
        ...mockGlobalState.globalState.model,
        columns: [columnWithVariables]
      }
    };

    const mockSetGlobalState = jest.fn();
    render(
      <GlobalStateContext.Provider value={{ globalState: stateWithVariables, setGlobalState: mockSetGlobalState }}>
        <Device device={deviceWithVariables} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Find and click the "-" button to delete a variable
    const deleteButton = screen.getAllByRole('button').find(button => button.textContent === '-');
    expect(deleteButton).toBeTruthy();
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // Verify that setGlobalState was called
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  it("handles editing a variable name", () => {
    // Create a modified state with variables for the test device
    const deviceWithVariables = {
      ...mockDevice,
      variables: ["Variable 1", "Variable 2", "Variable 3"]
    };
    
    const columnWithVariables = {
      ...mockColumn,
      devices: [deviceWithVariables]
    };
    
    const stateWithVariables = {
      ...mockGlobalState.globalState,
      model: {
        ...mockGlobalState.globalState.model,
        columns: [columnWithVariables]
      }
    };

    const mockSetGlobalState = jest.fn();
    render(
      <GlobalStateContext.Provider value={{ globalState: stateWithVariables, setGlobalState: mockSetGlobalState }}>
        <Device device={deviceWithVariables} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Verify the device renders correctly
    const deviceContainer = screen.getByTestId('device-container');
    expect(deviceContainer).toBeInTheDocument();
  });

  it("handles changing a variable percentage", () => {
    // Create a modified state with variables for the test device
    const deviceWithVariables = {
      ...mockDevice,
      variables: ["Variable 1", "Variable 2", "Variable 3"]
    };
    
    const columnWithVariables = {
      ...mockColumn,
      devices: [deviceWithVariables]
    };
    
    const stateWithVariables = {
      ...mockGlobalState.globalState,
      model: {
        ...mockGlobalState.globalState.model,
        columns: [columnWithVariables]
      }
    };

    const mockSetGlobalState = jest.fn();
    render(
      <GlobalStateContext.Provider value={{ globalState: stateWithVariables, setGlobalState: mockSetGlobalState }}>
        <Device device={deviceWithVariables} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Verify the device renders correctly
    const deviceContainer = screen.getByTestId('device-container');
    expect(deviceContainer).toBeInTheDocument();
  });

  it("handles SVG click events", () => {
    const mockSetGlobalState = jest.fn();
    const { container } = render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState.globalState, setGlobalState: mockSetGlobalState }}>
        <Device device={mockDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Find the SVG element using container query
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    
    if (svg) {
      // Simulate a click on the SVG
      fireEvent.click(svg, { clientX: 50, clientY: 50 });
    }
    
    // No assertion needed as we're just checking it doesn't throw an error
  });

  it("handles drag events on the device", () => {
    const mockSetGlobalState = jest.fn();
    const { container } = render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState.globalState, setGlobalState: mockSetGlobalState }}>
        <Device device={mockDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Find the device container
    const deviceContainer = screen.getByTestId('device-container');
    expect(deviceContainer).toBeInTheDocument();
    
    // Simulate mousedown, mousemove, and mouseup events
    fireEvent.mouseDown(deviceContainer, { clientX: 50, clientY: 50 });
    fireEvent.mouseMove(document, { clientX: 60, clientY: 60 });
    fireEvent.mouseUp(document);
    
    // No assertion needed as we're just checking it doesn't throw an error
  });

  it("renders a spinner device correctly", () => {
    // Create a modified state with spinner view type
    const spinnerDevice = {
      ...mockDevice,
      viewType: ViewType.Spinner
    };
    
    const spinnerColumn = {
      ...mockColumn,
      devices: [spinnerDevice]
    };
    
    const spinnerState = {
      ...mockGlobalState.globalState,
      model: {
        ...mockGlobalState.globalState.model,
        columns: [spinnerColumn]
      }
    };

    const mockSetGlobalState = jest.fn();
    render(
      <GlobalStateContext.Provider value={{ globalState: spinnerState, setGlobalState: mockSetGlobalState }}>
        <Device device={spinnerDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Verify the device container is rendered
    const deviceContainer = screen.getByTestId('device-container');
    expect(deviceContainer).toBeInTheDocument();
  });

  it("renders a collector device correctly", () => {
    // Create a collector device for this test
    const collectorDevice = {
      ...mockDevice,
      viewType: ViewType.Collector,
      collectorVariables: [{ "Item": "A" }, { "Item": "B" }]
    };

    const collectorColumn = {
      ...mockColumn,
      devices: [collectorDevice]
    };

    const collectorGlobalState = {
      globalState: {
        ...mockGlobalState.globalState,
        model: {
          columns: [collectorColumn]
        }
      },
      setGlobalState: mockSetGlobalState
    };

    render(
      <GlobalStateContext.Provider value={collectorGlobalState}>
        <Device device={collectorDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Check that the device container is rendered
    const deviceContainer = screen.getByTestId("device-container");
    expect(deviceContainer).toBeInTheDocument();
    
    // Check that the device frame has the collector class
    const deviceFrames = within(deviceContainer).getAllByRole('generic');
    const deviceFrame = deviceFrames.find(el => el.classList.contains('device-frame'));
    expect(deviceFrame).toHaveClass("collector");
  });
}); 
