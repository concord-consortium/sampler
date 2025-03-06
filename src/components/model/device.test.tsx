import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Device } from "./device";
import { GlobalStateContext } from "../../hooks/useGlobalState";
import { createDefaultDevice } from "../../models/device-model";
import { createId } from "../../utils/id";
import { ViewType, AttrMap } from "../../types";
import * as codapPluginAPI from "@concord-consortium/codap-plugin-api";

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
// @ts-ignore - Adding missing SVG methods for testing
window.SVGElement.prototype.getScreenCTM = jest.fn().mockReturnValue({
  inverse: jest.fn().mockReturnValue({
    a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
  })
});

// @ts-ignore - Adding missing SVG methods for testing
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
      speed: 1,
      isModelHidden: false,
    },
    setGlobalState: jest.fn()
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
    const deviceFrame = document.querySelector(".device-frame");
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

  it("allows selecting the device when clicked", async () => {
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
    const mockSetGlobalState = jest.fn().mockImplementation((callback) => {
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
      setGlobalState: mockSetGlobalState
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
    expect(mockSetGlobalState).toHaveBeenCalled();
  });
}); 
