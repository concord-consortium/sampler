import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { VisibilityToggle } from "./visibility-toggle";

describe("VisibilityToggle", () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it("renders with visible state by default", () => {
    render(
      <VisibilityToggle 
        isHidden={false} 
        onToggle={mockOnToggle} 
        ariaLabel="Toggle model visibility" 
      />
    );

    const button = screen.getByRole("button", { name: /toggle model visibility/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
    
    // Should show the visible eye icon
    const visibleIcon = screen.getByTestId("eye-icon");
    expect(visibleIcon).toBeInTheDocument();
  });

  it("renders with hidden state when isHidden is true", () => {
    render(
      <VisibilityToggle 
        isHidden={true} 
        onToggle={mockOnToggle} 
        ariaLabel="Toggle model visibility" 
      />
    );

    const button = screen.getByRole("button", { name: /toggle model visibility/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "true");
    
    // Should show the hidden eye icon
    const hiddenIcon = screen.getByTestId("eye-slash-icon");
    expect(hiddenIcon).toBeInTheDocument();
  });

  it("calls onToggle when clicked", () => {
    render(
      <VisibilityToggle 
        isHidden={false} 
        onToggle={mockOnToggle} 
        ariaLabel="Toggle model visibility" 
      />
    );

    const button = screen.getByRole("button", { name: /toggle model visibility/i });
    fireEvent.click(button);
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it("shows the correct tooltip based on state", () => {
    const { rerender } = render(
      <VisibilityToggle 
        isHidden={false} 
        onToggle={mockOnToggle} 
        ariaLabel="Toggle model visibility" 
      />
    );

    // When visible, tooltip should say "Hide model"
    const tooltip = screen.getByText("Hide model");
    expect(tooltip).toBeInTheDocument();

    // Rerender with hidden state
    rerender(
      <VisibilityToggle 
        isHidden={true} 
        onToggle={mockOnToggle} 
        ariaLabel="Toggle model visibility" 
      />
    );

    // When hidden, tooltip should say "Show model"
    const updatedTooltip = screen.getByText("Show model");
    expect(updatedTooltip).toBeInTheDocument();
  });

  it("is keyboard accessible", () => {
    render(
      <VisibilityToggle 
        isHidden={false} 
        onToggle={mockOnToggle} 
        ariaLabel="Toggle model visibility" 
      />
    );

    const button = screen.getByRole("button", { name: /toggle model visibility/i });
    
    // Focus the button
    button.focus();
    expect(document.activeElement).toBe(button);
    
    // Press Enter key
    fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    
    mockOnToggle.mockClear();
    
    // Press Space key
    fireEvent.keyDown(button, { key: " ", code: "Space" });
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });
}); 
