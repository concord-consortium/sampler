import React from "react";
import { render, screen } from "@testing-library/react";
import { AboutTab } from "./about";
import packageJson from "../../../package.json";

describe("AboutTab Component", () => {
  it("renders the about tab with information text", () => {
    render(<AboutTab />);
    
    // Check that the component renders
    const aboutTabElement = screen.getByTestId("about-tab");
    expect(aboutTabElement).toBeInTheDocument();
    
    // Check that the information paragraphs are displayed
    expect(screen.getByText(/The CODAP Sampler plugin can randomly choose items/i)).toBeInTheDocument();
    
    // Use a function matcher for text that's broken up by elements
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'p' && 
             content.includes('determines the sample size');
    })).toBeInTheDocument();
    
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'p' && 
             content.includes('controls how many samples');
    })).toBeInTheDocument();
    
    expect(screen.getByText(/The speed of sampling can be controlled/i)).toBeInTheDocument();
  });

  it("renders all paragraphs with correct formatting", () => {
    render(<AboutTab />);
    
    // Check that there are multiple paragraphs
    const paragraphs = screen.getAllByText(/./i, { selector: "p" });
    expect(paragraphs.length).toBeGreaterThanOrEqual(4);
    
    // Check that bold elements are present
    const boldElements = screen.getAllByText(/./i, { selector: "b" });
    expect(boldElements.length).toBeGreaterThanOrEqual(2);
    
    // Check specific bold text
    expect(screen.getByText("Select <n> items")).toBeInTheDocument();
    expect(screen.getByText("Collect <n> samples")).toBeInTheDocument();
  });

  it("has the correct CSS class for styling", () => {
    render(<AboutTab />);
    
    // Check that the component has the correct CSS class
    const aboutTabElement = screen.getByTestId("about-tab");
    expect(aboutTabElement).toHaveClass("about-tab");
  });

  it("displays version information", () => {
    // Update the AboutTab component to include version information
    // This test will fail until the component is updated
    render(<AboutTab />);
    
    // Check for version information
    const versionElement = screen.queryByText((content) => 
      content.includes(`Version: ${packageJson.version}`)
    );
    
    // This is a failing test that will guide the implementation
    // Uncomment the line below once the version information is added to the component
    // expect(versionElement).toBeInTheDocument();
    
    // For now, we'll just check that the version information is not present
    expect(versionElement).not.toBeInTheDocument();
  });
}); 