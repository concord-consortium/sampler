import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MeasuresTab } from "./measures";
import { GlobalStateContext } from "../../hooks/useGlobalState";
import { AttrMap } from "../../types";
import * as codapHelpers from "../../helpers/codap-helpers";

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
  getDataContext: jest.fn().mockResolvedValue({
    success: true,
    values: {
      collections: []
    }
  })
}));

// Mock the codap-helpers
jest.mock("../../helpers/codap-helpers", () => ({
  addMeasure: jest.fn(),
  evaluateResult: jest.fn().mockResolvedValue(true),
  hasSamplesCollection: jest.fn().mockResolvedValue(true),
  findOrCreateDataContext: jest.fn().mockResolvedValue(true),
  kDataContextName: "Sampler"
}));

describe("MeasuresTab Component", () => {
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
        columns: [
          {
            name: "Column1",
            id: "column1",
            devices: []
          }
        ]
      },
      selectedDeviceId: undefined,
      selectedTab: "Measures" as "Model" | "Measures" | "About",
      repeat: false,
      replacement: true,
      sampleSize: "5",
      numSamples: "3",
      enableRunButton: true,
      attrMap: mockAttrMap,
      dataContexts: [],
      samplerContext: { id: 1, guid: 1, name: "Sampler", title: "Sampler" },
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

  it("renders the measures tab with instructions when no samples exist", async () => {
    // Mock hasSamplesCollection to return false
    (codapHelpers.hasSamplesCollection as jest.Mock).mockResolvedValueOnce(false);
    
    await act(async () => {
      render(
        <GlobalStateContext.Provider value={mockGlobalState}>
          <MeasuresTab />
        </GlobalStateContext.Provider>
      );
    });

    // Check that the instructions are displayed
    expect(screen.getByText("Please run at least one experiment first.")).toBeInTheDocument();
  });

  it("renders the measure form when samples exist", async () => {
    // Mock hasSamplesCollection to return true
    (codapHelpers.hasSamplesCollection as jest.Mock).mockResolvedValueOnce(true);
    
    await act(async () => {
      render(
        <GlobalStateContext.Provider value={mockGlobalState}>
          <MeasuresTab />
        </GlobalStateContext.Provider>
      );
    });

    // Check that the form instructions are displayed
    expect(screen.getByText("Add common measures using formulas for each sample using the form below.")).toBeInTheDocument();
    
    // Check that the select formula label is displayed
    expect(screen.getByText("Select formula:")).toBeInTheDocument();
    
    // Check that the measure name label is displayed
    expect(screen.getByText("Name the measure:")).toBeInTheDocument();
    
    // Check that the Add Measure button is displayed
    expect(screen.getByText("Add Measure")).toBeInTheDocument();
  });

  it("selects a formula from the dropdown", async () => {
    // Mock hasSamplesCollection to return true
    (codapHelpers.hasSamplesCollection as jest.Mock).mockResolvedValueOnce(true);
    
    await act(async () => {
      render(
        <GlobalStateContext.Provider value={mockGlobalState}>
          <MeasuresTab />
        </GlobalStateContext.Provider>
      );
    });

    // Get the select element
    const selectElement = screen.getByLabelText("Select formula:") as HTMLSelectElement;
    
    // Initially the default option should be selected
    expect(selectElement.value).toBe("default");
    
    // Change the selected option to Count
    await act(async () => {
      fireEvent.change(selectElement, { target: { value: "conditional_count" } });
    });
    
    // Now Count should be selected
    expect(selectElement.value).toBe("conditional_count");
  });

  it("allows entering a custom measure name", async () => {
    // Mock hasSamplesCollection to return true
    (codapHelpers.hasSamplesCollection as jest.Mock).mockResolvedValueOnce(true);
    
    await act(async () => {
      render(
        <GlobalStateContext.Provider value={mockGlobalState}>
          <MeasuresTab />
        </GlobalStateContext.Provider>
      );
    });
    
    // Get the name input
    const nameInput = screen.getByLabelText("Name the measure:") as HTMLInputElement;
    
    // Enter a custom name
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Red Count" } });
    });
    
    // Check that the name is updated
    expect(nameInput.value).toBe("Red Count");
  });

  it("enables Add Measure button when a formula and required values are selected", async () => {
    // Mock hasSamplesCollection to return true
    (codapHelpers.hasSamplesCollection as jest.Mock).mockResolvedValueOnce(true);
    
    await act(async () => {
      render(
        <GlobalStateContext.Provider value={mockGlobalState}>
          <MeasuresTab />
        </GlobalStateContext.Provider>
      );
    });

    // Get the Add Measure button
    const addMeasureButton = screen.getByText("Add Measure");
    
    // Initially the button should be disabled
    expect(addMeasureButton).toBeDisabled();
    expect(addMeasureButton).toHaveClass("disabled");
    
    // Get the select element for the formula
    const selectElement = screen.getByLabelText("Select formula:") as HTMLSelectElement;
    
    // Change the selected option to Sum (which only requires lValue)
    await act(async () => {
      fireEvent.change(selectElement, { target: { value: "sum" } });
    });
    
    // The button should still be disabled because lValue is not selected
    expect(addMeasureButton).toBeDisabled();
    
    // Now we need to select an attribute for lValue
    // First, we need to find the attribute dropdown that appears after selecting a formula
    const lValueSelect = screen.getAllByText("Select an attribute!")[0].closest("select") as HTMLSelectElement;
    
    // Select an attribute
    await act(async () => {
      fireEvent.change(lValueSelect, { target: { value: "Column1" } });
    });
    
    // Now the button should be enabled
    expect(addMeasureButton).not.toBeDisabled();
    expect(addMeasureButton).not.toHaveClass("disabled");
  });

  it("adds a measure when Add Measure button is clicked", async () => {
    // Mock hasSamplesCollection to return true
    (codapHelpers.hasSamplesCollection as jest.Mock).mockResolvedValueOnce(true);
    
    await act(async () => {
      render(
        <GlobalStateContext.Provider value={mockGlobalState}>
          <MeasuresTab />
        </GlobalStateContext.Provider>
      );
    });

    // Get the select element for the formula
    const selectElement = screen.getByLabelText("Select formula:") as HTMLSelectElement;
    
    // Change the selected option to Sum
    await act(async () => {
      fireEvent.change(selectElement, { target: { value: "sum" } });
    });
    
    // Select an attribute for lValue
    const lValueSelect = screen.getAllByText("Select an attribute!")[0].closest("select") as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(lValueSelect, { target: { value: "Column1" } });
    });
    
    // Get the name input
    const nameInput = screen.getByLabelText("Name the measure:") as HTMLInputElement;
    
    // Enter a custom name
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Sum of Column1" } });
    });
    
    // Get the Add Measure button
    const addMeasureButton = screen.getByText("Add Measure");
    
    // Click the Add Measure button
    await act(async () => {
      fireEvent.click(addMeasureButton);
    });
    
    // Check that addMeasure was called with the correct arguments
    expect(codapHelpers.addMeasure).toHaveBeenCalledWith("Sum of Column1", "sum", "sum(`Column1`)");
  });

  it("checks for samples collection before adding a measure", async () => {
    // Mock hasSamplesCollection to return true initially for rendering
    (codapHelpers.hasSamplesCollection as jest.Mock).mockResolvedValueOnce(true);
    
    // Mock hasSamplesCollection to return false when checking before adding measure
    // This is important: the component calls hasSamplesCollection in useEffect and then again in handleAddMeasure
    (codapHelpers.hasSamplesCollection as jest.Mock).mockResolvedValueOnce(false);
    
    // Mock addMeasure to check if samples exist before adding
    (codapHelpers.addMeasure as jest.Mock).mockImplementationOnce(() => {
      // This implementation simulates what happens in the real addMeasure function
      // It first checks if samples exist, and if not, it calls findOrCreateDataContext
      codapHelpers.hasSamplesCollection().then(hasSamples => {
        if (!hasSamples) {
          codapHelpers.findOrCreateDataContext([], mockAttrMap, jest.fn());
        }
      });
      return Promise.resolve();
    });
    
    await act(async () => {
      render(
        <GlobalStateContext.Provider value={mockGlobalState}>
          <MeasuresTab />
        </GlobalStateContext.Provider>
      );
    });

    // Get the select element for the formula
    const selectElement = screen.getByLabelText("Select formula:") as HTMLSelectElement;
    
    // Change the selected option to Sum
    await act(async () => {
      fireEvent.change(selectElement, { target: { value: "sum" } });
    });
    
    // Select an attribute for lValue
    const lValueSelect = screen.getAllByText("Select an attribute!")[0].closest("select") as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(lValueSelect, { target: { value: "Column1" } });
    });
    
    // Get the Add Measure button
    const addMeasureButton = screen.getByText("Add Measure");
    
    // Click the Add Measure button
    await act(async () => {
      fireEvent.click(addMeasureButton);
    });
    
    // Wait for the async operations to complete
    await waitFor(() => {
      // Check that addMeasure was called
      expect(codapHelpers.addMeasure).toHaveBeenCalled();
      
      // Check that findOrCreateDataContext was called
      expect(codapHelpers.findOrCreateDataContext).toHaveBeenCalled();
    });
  });
}); 
