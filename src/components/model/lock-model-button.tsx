import React from 'react';
import { useGlobalStateContext } from '../../hooks/useGlobalState';
import './lock-model-button.scss';

/**
 * LockModelButton component
 * 
 * This component provides a button to lock or unlock the model.
 * When clicked, it opens a password modal to set or enter a password.
 */
export const LockModelButton: React.FC = () => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { modelLocked, modelPassword } = globalState;

  const handleClick = () => {
    setGlobalState(draft => {
      draft.showPasswordModal = true;
      draft.passwordModalMode = modelPassword ? (modelLocked ? 'enter' : 'set') : 'set';
    });
  };

  return (
    <button
      className={`lock-model-button ${modelLocked ? 'locked' : 'unlocked'}`}
      onClick={handleClick}
      aria-label={modelLocked ? 'Unlock model' : 'Lock model'}
      title={modelLocked ? 'Unlock model' : 'Lock model'}
    >
      <span className="lock-icon">
        {modelLocked ? '🔒' : '🔓'}
      </span>
      <span className="button-text">
        {modelLocked ? 'Unlock Model' : 'Lock Model'}
      </span>
    </button>
  );
}; 
