import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MeasuresTab } from "./measures";
import { GlobalStateContext } from "../../hooks/useGlobalState";
import { hasSamplesCollection, addMeasure } from "../../helpers/codap-helpers";
import { getDevices } from "../../models/model-model";
import { ViewType } from "../../types";

// Mock the codap-helpers
jest.mock("../../helpers/codap-helpers", () => ({
  hasSamplesCollection: jest.fn(),
  addMeasure: jest.fn()
}));

// Mock the model-model
jest.mock("../../models/model-model", () => ({
  getDevices: jest.fn()
}));

describe("MeasuresTab Component", () => {
  const mockGlobalState = {
    model: {
      columns: [
        {
          id: "column-1",
          name: "Column 1",
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
        }
      ]
    }
  };

  const mockSetGlobalState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (hasSamplesCollection as jest.Mock).mockResolvedValue(false);
    (getDevices as jest.Mock).mockReturnValue([
      {
        id: "device-1",
        viewType: ViewType.Mixer
      }
    ]);
  });

  const renderMeasuresTab = () => {
    return render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState as any, setGlobalState: mockSetGlobalState }}>
        <MeasuresTab />
      </GlobalStateContext.Provider>
    );
  };

  it("renders the measures tab with instructions when no samples exist", async () => {
    renderMeasuresTab();
    
    // Check that the instructions are displayed for no samples
    await waitFor(() => {
      expect(screen.getByText("Please run at least one experiment first.")).toBeInTheDocument();
    });
  });

  it("renders the measure form when samples exist", async () => {
    (hasSamplesCollection as jest.Mock).mockResolvedValue(true);
    
    renderMeasuresTab();
    
    await waitFor(() => {
      // Check that the measures header is displayed
      expect(screen.getAllByText(/Measures/)[0]).toBeInTheDocument();
      
      // Check that the measure dropdown is displayed
      expect(screen.getByText(/Measure:/i)).toBeInTheDocument();
      expect(screen.getByText(/Select a measure!/i)).toBeInTheDocument();
    });
  });

  it("selects a formula from the dropdown", async () => {
    (hasSamplesCollection as jest.Mock).mockResolvedValue(true);
    
    renderMeasuresTab();
    
    await waitFor(() => {
      // Get the select element
      const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
      
      // Initially the default option should be selected
      expect(selectElement.value).toBe("default");
      
      // Change the selection
      fireEvent.change(selectElement, { target: { value: "sum" } });
      
      // The value should be updated
      expect(selectElement.value).toBe("sum");
    });
  });

  it("allows entering a custom measure name", async () => {
    (hasSamplesCollection as jest.Mock).mockResolvedValue(true);
    
    renderMeasuresTab();
    
    await waitFor(() => {
      // Get the select element and change it to show the name input
      const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
      fireEvent.change(selectElement, { target: { value: "sum" } });
    });
    
    // Get the name input
    const nameInput = screen.getByPlaceholderText("Optional name") as HTMLInputElement;
    
    // Enter a custom name
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "My Custom Measure" } });
    });
    
    // The value should be updated
    expect(nameInput.value).toBe("My Custom Measure");
  });

  it("enables Add Measure button when a formula and required values are selected", async () => {
    (hasSamplesCollection as jest.Mock).mockResolvedValue(true);
    
    renderMeasuresTab();
    
    await waitFor(() => {
      // Get the select element and change it to show the formula inputs
      const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
      fireEvent.change(selectElement, { target: { value: "sum" } });
    });
    
    // Get the Add Measure button
    const addMeasureButton = screen.getByText("Add Measure");
    
    // Initially, the button should be disabled because no attribute is selected
    expect(addMeasureButton).toBeDisabled();
    
    // Select an attribute
    const formulaInputs = screen.getAllByRole("combobox");
    const attributeSelect = formulaInputs[1]; // The second select is for attributes
    
    await act(async () => {
      fireEvent.change(attributeSelect, { target: { value: "Column 1" } });
    });
    
    // Now the button should be enabled
    expect(addMeasureButton).not.toBeDisabled();
  });

  it("adds a measure when Add Measure button is clicked", async () => {
    (hasSamplesCollection as jest.Mock).mockResolvedValue(true);
    
    renderMeasuresTab();
    
    await waitFor(() => {
      // Get the select element and change it to show the formula inputs
      const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
      fireEvent.change(selectElement, { target: { value: "sum" } });
    });
    
    // Select an attribute
    const formulaInputs = screen.getAllByRole("combobox");
    const attributeSelect = formulaInputs[1]; // The second select is for attributes
    
    await act(async () => {
      fireEvent.change(attributeSelect, { target: { value: "Column 1" } });
    });
    
    // Get the Add Measure button and click it
    const addMeasureButton = screen.getByText("Add Measure");
    
    await act(async () => {
      fireEvent.click(addMeasureButton);
    });
    
    // Check that addMeasure was called with the correct arguments
    expect(addMeasure).toHaveBeenCalledWith("", "sum", "sum(`Column 1`)");
  });

  it("renders collector guidance when a collector device is present", async () => {
    // Mock getDevices to return a collector device
    (getDevices as jest.Mock).mockReturnValue([
      {
        id: "device-1",
        viewType: ViewType.Collector
      }
    ]);
    
    // Also mock hasSamplesCollection to true to ensure the component renders
    (hasSamplesCollection as jest.Mock).mockResolvedValue(true);
    
    renderMeasuresTab();
    
    // Check that the collector guidance is displayed
    await waitFor(() => {
      expect(screen.getByText(/Measures in Collector Mode/i)).toBeInTheDocument();
    });
    
    // Check that the guidance text is displayed
    expect(screen.getByText(/We are sorry, but at this time you cannot use this feature/i)).toBeInTheDocument();
    
    // Check that the links are displayed
    expect(screen.getByText(/Add a New Attribute to a Table/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter a Formula for an Attribute/i)).toBeInTheDocument();
  });
}); 
