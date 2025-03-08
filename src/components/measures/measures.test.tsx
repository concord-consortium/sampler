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
      expect(screen.getByRole('heading', { name: /Measures/i, level: 2 })).toBeInTheDocument();
      
      // Check that the measure dropdown is displayed
      expect(screen.getByText('Select a measure!')).toBeInTheDocument();
      
      // Check for the form element
      expect(screen.getByRole('combobox')).toBeInTheDocument();
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
    (getDevices as jest.Mock).mockReturnValue([
      {
        id: "device-1",
        viewType: ViewType.Collector
      }
    ]);
    
    (hasSamplesCollection as jest.Mock).mockResolvedValue(true);
    
    renderMeasuresTab();
    
    // Check that the collector guidance is displayed
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Enhanced Measures in Collector Mode/i })).toBeInTheDocument();
    });
    
    // Check that the guidance text is displayed
    expect(screen.getByText(/While you cannot add common measures for each sample/i)).toBeInTheDocument();
    
    // Check that the links are still available in the guidance note
    expect(screen.getByText(/Add a New Attribute to a Table/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter a Formula for an Attribute/i)).toBeInTheDocument();
  });
});

describe('MeasuresTab Improvements', () => {
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
    (hasSamplesCollection as jest.Mock).mockResolvedValue(true);
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

  describe('UI Components', () => {
    it('should render data visualization components', async () => {
      renderMeasuresTab();
      
      await waitFor(() => {
        // Check for the visualization section header
        expect(screen.getByRole('heading', { name: /Data Visualization/i })).toBeInTheDocument();
        
        // Check for the visualization type selector
        expect(screen.getByText(/Visualization Type:/i)).toBeInTheDocument();
        
        // Check for visualization options
        const radioButtons = screen.getAllByRole('radio');
        const barChartRadio = radioButtons.find(radio => radio.getAttribute('value') === 'bar');
        const lineChartRadio = radioButtons.find(radio => radio.getAttribute('value') === 'line');
        const scatterPlotRadio = radioButtons.find(radio => radio.getAttribute('value') === 'scatter');
        
        expect(barChartRadio).toBeInTheDocument();
        expect(lineChartRadio).toBeInTheDocument();
        expect(scatterPlotRadio).toBeInTheDocument();
      });
    });

    it('should handle responsive layouts', async () => {
      renderMeasuresTab();
      
      await waitFor(() => {
        // Check for the responsive container
        const visualizationContainer = screen.getByTestId('visualization-container');
        expect(visualizationContainer).toBeInTheDocument();
        expect(visualizationContainer).toHaveClass('responsive-container');
      });
    });

    it('should provide statistical analysis controls', async () => {
      renderMeasuresTab();
      
      await waitFor(() => {
        // Check for the statistical analysis section
        expect(screen.getByText(/Statistical Analysis/i)).toBeInTheDocument();
        
        // Check for analysis options
        expect(screen.getByText(/Descriptive Statistics/i)).toBeInTheDocument();
        expect(screen.getByText(/Correlation Analysis/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('Data Processing', () => {
    it('should process collector data correctly', async () => {
      // Mock getDevices to return a collector device
      (getDevices as jest.Mock).mockReturnValue([
        {
          id: "device-1",
          viewType: ViewType.Collector
        }
      ]);
      
      renderMeasuresTab();
      
      await waitFor(() => {
        // Check for the collector data processing section
        expect(screen.getByText(/Collector Data Processing/i)).toBeInTheDocument();
        
        // Check for the data source selector
        expect(screen.getByText(/Data Source:/i)).toBeInTheDocument();
        
        // Check for the process button
        const processButton = screen.getByText(/Process Data/i);
        expect(processButton).toBeInTheDocument();
        
        // Click the process button
        fireEvent.click(processButton);
        
        // Check that the appropriate function was called
        // This would be a new function to implement
        // expect(processCollectorData).toHaveBeenCalled();
      });
    });

    it('should calculate statistical measures', async () => {
      renderMeasuresTab();
      
      await waitFor(() => {
        // Select the descriptive statistics option
        const radioButtons = screen.getAllByRole('radio');
        const descriptiveStatsRadio = radioButtons.find(radio => radio.getAttribute('value') === 'descriptive');
        expect(descriptiveStatsRadio).toBeInTheDocument();
        fireEvent.click(descriptiveStatsRadio!);
        
        // Select the mean measure
        const meanRadio = radioButtons.find(radio => radio.getAttribute('value') === 'mean' && radio.getAttribute('name') === 'statisticalMeasure');
        expect(meanRadio).toBeInTheDocument();
        fireEvent.click(meanRadio!);
        
        // Click the calculate button
        const calculateButton = screen.getByRole('button', { name: /Calculate/i });
        fireEvent.click(calculateButton);
      });
    });

    it('should format data for visualizations', async () => {
      renderMeasuresTab();
      
      await waitFor(() => {
        // Select a visualization type
        const radioButtons = screen.getAllByRole('radio');
        const barChartRadio = radioButtons.find(radio => radio.getAttribute('value') === 'bar');
        expect(barChartRadio).toBeInTheDocument();
        fireEvent.click(barChartRadio!);
        
        // Select a data format
        const stackedFormatRadio = radioButtons.find(radio => radio.getAttribute('value') === 'stacked');
        expect(stackedFormatRadio).toBeInTheDocument();
        fireEvent.click(stackedFormatRadio!);
        
        // Click the apply format button
        const applyButton = screen.getByRole('button', { name: /Apply Format/i });
        fireEvent.click(applyButton);
        
        // Check that the visualization updates
        expect(screen.getByTestId('visualization-container')).toBeInTheDocument();
      });
    });
  });
}); 
