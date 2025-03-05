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
  addDataContextChangeListener: jest.fn()
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
    expect(modelTab.closest(".tab")).toHaveClass("selected");
    
    // Verify the ModelTab component is rendered
    expect(document.querySelector(".model-tab")).toBeInTheDocument();
  });

  it("changes tab when a tab is clicked", () => {
    render(<App/>);
    
    // Initially Model tab should be selected
    expect(screen.getByText("Model").closest(".tab")).toHaveClass("selected");
    
    // Click on Measures tab
    fireEvent.click(screen.getByText("Measures"));
    
    // Now Measures tab should be selected
    expect(screen.getByText("Measures").closest(".tab")).toHaveClass("selected");
    expect(screen.getByText("Model").closest(".tab")).not.toHaveClass("selected");
    
    // Verify the MeasuresTab component is rendered
    expect(document.querySelector(".measures-tab")).toBeInTheDocument();
    
    // Click on About tab
    fireEvent.click(screen.getByText("About"));
    
    // Now About tab should be selected
    expect(screen.getByText("About").closest(".tab")).toHaveClass("selected");
    expect(screen.getByText("Measures").closest(".tab")).not.toHaveClass("selected");
    
    // Verify the AboutTab component is rendered
    expect(document.querySelector(".about-tab")).toBeInTheDocument();
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
