import React from "react";
import { App } from "./App";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as codapPluginAPI from "@concord-consortium/codap-plugin-api";

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

// Mock the measures component to avoid issues with CODAP API calls
jest.mock("../components/measures/measures", () => ({
  MeasuresTab: () => <div className="measures-tab">Measures Tab Content</div>
}));

// Mock the model component
jest.mock("../components/model/model-component", () => ({
  ModelTab: () => <div className="model-tab">Model Tab Content</div>
}));

// Mock the about component
jest.mock("../components/about/about", () => ({
  AboutTab: () => <div className="about-tab">About Tab Content</div>
}));

describe("App Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing and shows all tabs", () => {
    render(<App/>);
    expect(screen.getByText("Model")).toBeInTheDocument();
    expect(screen.getByText("Measures")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("initializes with Model tab selected by default", () => {
    render(<App/>);
    const modelTab = screen.getByText("Model");
    expect(modelTab).toHaveClass("selected");
    
    // Verify the ModelTab component is rendered
    expect(screen.getByText("Model Tab Content")).toBeInTheDocument();
  });

  it("changes tab when a tab is clicked", () => {
    render(<App/>);
    
    // Initially Model tab should be selected
    const modelTab = screen.getByText("Model");
    expect(modelTab).toHaveClass("selected");
    
    // Click on Measures tab
    const measuresTab = screen.getByText("Measures");
    fireEvent.click(measuresTab);
    
    // Now Measures tab should be selected
    expect(measuresTab).toHaveClass("selected");
    expect(modelTab).not.toHaveClass("selected");
    
    // Verify the MeasuresTab component is rendered
    expect(screen.getByText("Measures Tab Content")).toBeInTheDocument();
    
    // Click on About tab
    const aboutTab = screen.getByText("About");
    fireEvent.click(aboutTab);
    
    // Now About tab should be selected
    expect(aboutTab).toHaveClass("selected");
    expect(measuresTab).not.toHaveClass("selected");
    
    // Verify the AboutTab component is rendered
    expect(screen.getByText("About Tab Content")).toBeInTheDocument();
  });

  it("initializes CODAP plugin on mount", async () => {
    render(<App/>);
    
    // Verify that initializePlugin was called
    await waitFor(() => {
      expect(codapPluginAPI.initializePlugin).toHaveBeenCalled();
    });
  });

  it("updates interactive state when global state changes", async () => {
    render(<App/>);
    
    // Change tab to trigger a state update
    fireEvent.click(screen.getByText("Measures"));
    
    // Verify that updateInteractiveState was called
    await waitFor(() => {
      expect(codapPluginAPI.codapInterface.updateInteractiveState).toHaveBeenCalled();
    });
  });
});
