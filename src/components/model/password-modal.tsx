import React, { useState } from 'react';
import { useGlobalStateContext } from '../../hooks/useGlobalState';
import { hashPassword, validatePassword } from '../../utils/password-utils';
import './password-modal.scss';

/**
 * PasswordModal component
 * 
 * This component provides a modal for setting, entering, or changing the model password.
 * It handles password validation and updates the global state accordingly.
 */
export const PasswordModal: React.FC = () => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { passwordModalMode, modelPassword } = globalState;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleClose = () => {
    setGlobalState(draft => {
      draft.showPasswordModal = false;
    });
    // Reset form state
    setPassword('');
    setConfirmPassword('');
    setError('');
  };
  
  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    
    const hashedPassword = await hashPassword(password);
    
    setGlobalState(draft => {
      draft.modelPassword = hashedPassword;
      draft.modelLocked = true;
      draft.showPasswordModal = false;
    });
    
    // Reset form state
    setPassword('');
    setConfirmPassword('');
    setError('');
  };
  
  const handleUnlock = async () => {
    const isValid = await validatePassword(password, modelPassword);
    
    if (isValid) {
      setGlobalState(draft => {
        draft.modelLocked = false;
        draft.showPasswordModal = false;
      });
      
      // Reset form state
      setPassword('');
      setError('');
    } else {
      setError('Incorrect password');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordModalMode === 'set') {
      handleSetPassword();
    } else if (passwordModalMode === 'enter') {
      handleUnlock();
    }
  };
  
  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <div className="password-modal-header">
          <h2>{passwordModalMode === 'set' ? 'Set Password' : 'Enter Password'}</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          
          {passwordModalMode === 'set' && (
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="button-group">
            <button type="button" onClick={handleClose}>Cancel</button>
            <button type="submit">
              {passwordModalMode === 'set' ? 'Set Password' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
