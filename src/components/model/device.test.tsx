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

// Mock SVG functions that aren't available in jsdom
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.SVGElement.prototype.getScreenCTM = jest.fn().mockReturnValue({
  inverse: jest.fn().mockReturnValue({
    a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
  })
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.SVGElement.prototype.createSVGPoint = jest.fn().mockReturnValue({
  x: 0,
  y: 0,
  matrixTransform: jest.fn().mockReturnValue({ x: 0, y: 0 })
});

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
    experimentHash: { name: 'experimentHash', codapID: null }
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
}); 
