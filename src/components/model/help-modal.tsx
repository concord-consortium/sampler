import React, { useEffect, useRef, useCallback } from "react";

interface IProps {
  setShowHelp: (show: boolean) => void;
}

export const HelpModal = ({setShowHelp}: IProps) => {
  // Reference to the close button for focus management
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  const handleCloseModal = useCallback(() => {
    setShowHelp(false);
  }, [setShowHelp]);
  
  // Focus the close button when the modal opens
  useEffect(() => {
    // Save the previously focused element to restore focus when modal closes
    const previouslyFocusedElement = document.activeElement as HTMLElement;
    
    // Focus the close button when the modal opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
    
    // Handle keyboard events for the modal
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close on escape key
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };
    
    // Add event listener for keyboard events
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function to remove event listener and restore focus
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [handleCloseModal]);
  
  /**
   * Handle keyboard events for the close button
   * @param e - The keyboard event
   */
  const handleCloseKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Close modal on Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent scrolling on space
      handleCloseModal();
    }
  };
  
  return (
    <div className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
      <div className="modal-header" id="help-modal-title">
        Help: Repeat Until Condition
      </div>
      <div className="modal-body">
        <p className="help-section-title">
          Specify a Condition to Repeat Until
        </p>
        <p className="help-section-body">
          Repeat Until allows the model to continue drawing samples until a desired outcome -- the Condition specified -- occurs.
          You can specify conditions in two ways: using a formula or a pattern.
        </p>
        <p className="help-section-title">
          Using a Formula
        </p>
        <p className="help-section-body">
          Formulas start with an equals sign (=) followed by a logical expression.
          <br />
          <strong>Examples:</strong>
          <br />
          <code>=x &gt; 5</code> - Stops when x is greater than 5
          <br />
          <code>=count &gt; 10</code> - Stops when count exceeds 10
          <br />
          <code>=result === &quot;success&quot;</code> - Stops when result equals &quot;success&quot;
        </p>
        <p className="help-section-title">
          Using a Pattern
        </p>
        <p className="help-section-body">
          Patterns are comma-separated values that the system will look for in the sample data.
          <br />
          <strong>Examples:</strong>
          <br />
          <code>apple,banana,orange</code> - Stops when any of these fruits appear
          <br />
          <code>heads,heads,heads</code> - Stops when three heads in a row appear
          <br />
          <code>7</code> - Stops when the number 7 appears
        </p>
      </div>
      <div className="modal-footer">
        <button 
          className="modal-button" 
          onClick={handleCloseModal}
          onKeyDown={handleCloseKeyDown}
          ref={closeButtonRef}
          aria-label="Close help modal"
        >
          Close
        </button>
      </div>
    </div>
  );
};
