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
    <div className="repeat-until-container">
      <label htmlFor="repeat-until-condition">Repeat Until:</label>
      <input
        id="repeat-until-condition"
        type="text"
        value={repeatUntilCondition || ''}
        onChange={handleConditionChange}
        placeholder="Enter condition (e.g. =count(output='a') > 3 or heads,tails,heads)"
        disabled={modelLocked}
      />
      <button 
        className="help-button" 
        title="Help with conditions"
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
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Condition Syntax Help</h2>
        
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
        
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

