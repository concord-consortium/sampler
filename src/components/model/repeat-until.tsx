import React, { useState } from 'react';
import { useGlobalStateContext } from '../../hooks/useGlobalState';
import './repeat-until.scss';

/**
 * RepeatUntil component allows users to specify a condition for stopping the repeat process
 * Only displayed when repeat is enabled
 */
export const RepeatUntil: React.FC = () => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { repeat, repeatUntilCondition, modelLocked } = globalState;
  const [showHelp, setShowHelp] = useState(false);

  // If repeat is not enabled, don't render the component
  if (!repeat) {
    return null;
  }

  /**
   * Handle changes to the repeat until condition input
   * @param e - The change event from the input
   */
  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCondition = e.target.value;
    setGlobalState(draft => {
      draft.repeatUntilCondition = newCondition;
    });
  };

  /**
   * Toggle the help modal
   */
  const toggleHelpModal = () => {
    setShowHelp(!showHelp);
  };

  return (
    <div className="repeat-until-container" role="group" aria-labelledby="repeat-until-label">
      <label id="repeat-until-label" htmlFor="repeat-until-condition">Repeat Until:</label>
      <input
        id="repeat-until-condition"
        type="text"
        value={repeatUntilCondition || ''}
        onChange={handleConditionChange}
        placeholder="Enter condition (e.g. =count(output='a') > 3 or heads,tails,heads)"
        disabled={modelLocked}
        aria-describedby="repeat-until-description"
      />
      <span id="repeat-until-description" className="sr-only">
        Enter a condition to stop the repeat process. Use a formula starting with = or a pattern like heads,tails,heads.
      </span>
      <button 
        className="help-button" 
        aria-label="Help with repeat until conditions"
        onClick={toggleHelpModal}
        disabled={modelLocked}
      >
        ?
      </button>
      
      {showHelp && <ConditionHelpModal onClose={toggleHelpModal} />}
    </div>
  );
};

/**
 * Help modal for condition syntax
 */
export const ConditionHelpModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
  // Reference to the modal content for focus management
  const modalRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus the modal content when it mounts
  React.useEffect(() => {
    // Save the previously focused element to restore focus when modal closes
    const previouslyFocusedElement = document.activeElement as HTMLElement;
    
    // Focus the close button when the modal opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
    
    // Handle keyboard events for focus trapping
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close on escape key
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      
      // Trap focus within the modal
      if (event.key === 'Tab') {
        // Get all focusable elements in the modal
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) || [];
        
        // If there are no focusable elements, do nothing
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        // If shift+tab on first element, move to last element
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } 
        // If tab on last element, move to first element
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    // Add event listener for keyboard events
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function to remove event listener and restore focus
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [onClose]);

  return (
    <div 
      className="modal-overlay" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      <div 
        className="modal-content" 
        ref={modalRef}
        tabIndex={-1} // Makes the div focusable but not in the tab order
      >
        <h2 id="modal-title">Condition Syntax Help</h2>
        
        <h3>Formula Conditions</h3>
        <p>Start with an equals sign (=) followed by a CODAP formula that evaluates to true/false:</p>
        <ul>
          <li><code>=count(output=&apos;a&apos;) &gt; 3</code> - Stop when more than 3 &quot;a&quot; values are selected</li>
          <li><code>=mean(Age) &gt; 30</code> - Stop when the mean age exceeds 30</li>
          <li><code>=sum(Score) &gt;= 100</code> - Stop when the sum of scores reaches 100</li>
        </ul>
        
        <h3>Pattern Matching</h3>
        <p>Enter a comma-separated list of values to match in sequence:</p>
        <ul>
          <li><code>heads,heads,heads</code> - Stop when three heads occur in sequence</li>
          <li><code>a,b,a</code> - Stop when the pattern a,b,a occurs</li>
        </ul>
        
        <button 
          onClick={onClose} 
          ref={closeButtonRef}
          aria-label="Close help modal"
        >
          Close
        </button>
      </div>
    </div>
  );
};

