import React from 'react';
import { useGlobalStateContext } from '../../hooks/useGlobalState';
import './repeat-until.scss';

/**
 * RepeatUntil component allows users to specify a condition for stopping the repeat process
 * Only displayed when repeat is enabled
 */
export const RepeatUntil: React.FC = () => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { repeat, repeatUntilCondition } = globalState;

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

  return (
    <div className="repeat-until-container">
      <label htmlFor="repeat-until-condition">Repeat Until:</label>
      <input
        id="repeat-until-condition"
        type="text"
        value={repeatUntilCondition}
        onChange={handleConditionChange}
        placeholder="Enter condition (e.g. =x > 5 or heads,tails,heads)"
        disabled={globalState.modelLocked}
      />
    </div>
  );
};

