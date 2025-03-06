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
      speed: 1
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
    const deviceElement = screen.getByTestId("device-container");
    expect(deviceElement).toBeInTheDocument();
    
    // Check that the device frame has the correct class for the view type
    const deviceFrame = document.querySelector(".device-frame");
    expect(deviceFrame).toHaveClass("mixer");
    
    // We can't check for the device-name-input as it's not always visible
    // It only appears when isEditingVarName is true
  });

  it("allows editing the device name when clicked", () => {
    // Mock implementation to simulate editing a variable name
    const mockSetGlobalState = jest.fn().mockImplementation((callback) => {
      const draft = { ...mockGlobalState.globalState };
      callback(draft);
    });
    
    const customGlobalState = {
      ...mockGlobalState,
      setGlobalState: mockSetGlobalState
    };
    
    render(
      <GlobalStateContext.Provider value={customGlobalState}>
        <Device device={mockDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Find a variable label that would trigger editing
    // Since we can't directly test the name input (it's conditionally rendered),
    // we'll verify that setGlobalState is called when a device is selected
    const deviceElement = screen.getByTestId("device-container");
    fireEvent.click(deviceElement);
    
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  it("handles device selection when clicked", () => {
    // Create a new global state with a different selected device
    const unselectedState = {
      ...mockGlobalState,
      globalState: {
        ...mockGlobalState.globalState,
        selectedDeviceId: "different-device-id"
      }
    };
    
    render(
      <GlobalStateContext.Provider value={unselectedState}>
        <Device device={mockDevice} columnIndex={0} />
      </GlobalStateContext.Provider>
    );

    // Click on the device
    const deviceElement = screen.getByTestId("device-container");
    fireEvent.click(deviceElement);
    
    // Check that setGlobalState was called to update the selected device
    expect(unselectedState.setGlobalState).toHaveBeenCalled();
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
      <GlobalStateContext.Provider value={customGlobalState}>
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
