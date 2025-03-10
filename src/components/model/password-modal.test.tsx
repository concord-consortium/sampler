import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordModal } from './password-modal';
import { GlobalStateContext } from '../../hooks/useGlobalState';
import { hashPassword } from '../../utils/password-utils';
import { Speed } from '../../types';

jest.mock('../../utils/password-utils', () => ({
  hashPassword: jest.fn().mockImplementation((password) => `hashed_${password}`),
  validatePassword: jest.fn().mockImplementation((password, storedHash) => 
    storedHash === `hashed_${password}`)
}));

jest.mock('../../utils/secure-storage', () => ({
  storePasswordHash: jest.fn().mockImplementation(() => Promise.resolve()),
  clearPasswordHash: jest.fn().mockImplementation(() => Promise.resolve()),
  retrievePasswordHash: jest.fn().mockImplementation(() => Promise.resolve(null))
}));

import { storePasswordHash, clearPasswordHash } from '../../utils/secure-storage';

describe('PasswordModal', () => {
  const mockSetGlobalState = jest.fn();
  
  // Create a minimal mock of the global state
  const createMockGlobalState = (overrides = {}) => ({
    globalState: {
      model: { columns: [] },
      selectedDeviceId: undefined,
      selectedTab: 'Model' as const,
      repeat: false,
      replacement: true,
      sampleSize: '1',
      numSamples: '5',
      enableRunButton: true,
      attrMap: {
        experiment: { name: 'experiment', codapID: null },
        description: { name: 'description', codapID: null },
        sample_size: { name: 'sample_size', codapID: null },
        experimentHash: { name: 'experimentHash', codapID: null },
        sample: { name: 'sample', codapID: null },
        item: { name: 'item', codapID: null }
      },
      dataContexts: [],
      collectorContext: undefined,
      samplerContext: undefined,
      isRunning: false,
      isPaused: false,
      speed: Speed.Medium,
      isModelHidden: false,
      modelLocked: false,
      modelPassword: '',
      showPasswordModal: true,
      passwordModalMode: 'set' as const,
      repeatUntilCondition: '',
      ...overrides
    },
    setGlobalState: mockSetGlobalState
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the set password form when in set mode', () => {
    render(
      <GlobalStateContext.Provider value={createMockGlobalState()}>
        <PasswordModal />
      </GlobalStateContext.Provider>
    );
    
    expect(screen.getByRole('heading', { name: /set password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /set password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders the enter password form when in enter mode', () => {
    render(
      <GlobalStateContext.Provider value={createMockGlobalState({
        passwordModalMode: 'enter' as const,
        modelPassword: 'hashed_password'
      })}>
        <PasswordModal />
      </GlobalStateContext.Provider>
    );
    
    expect(screen.getByRole('heading', { name: /enter password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unlock/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    // No reset password button in the simplified version
    expect(screen.queryByRole('button', { name: /reset password/i })).not.toBeInTheDocument();
  });

  it('validates passwords match when setting a password', async () => {
    render(
      <GlobalStateContext.Provider value={createMockGlobalState()}>
        <PasswordModal />
      </GlobalStateContext.Provider>
    );
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /set password/i });
    
    // Enter mismatched passwords
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password456' } });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockSetGlobalState).not.toHaveBeenCalled();
    expect(storePasswordHash).not.toHaveBeenCalled();
  });

  it('sets the password and stores it securely when passwords match', async () => {
    render(
      <GlobalStateContext.Provider value={createMockGlobalState()}>
        <PasswordModal />
      </GlobalStateContext.Provider>
    );
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /set password/i });
    
    // Enter matching passwords
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(hashPassword).toHaveBeenCalledWith('password123');
    expect(storePasswordHash).toHaveBeenCalledWith('hashed_password123');
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  it('validates the entered password and clears it when unlocking', async () => {
    render(
      <GlobalStateContext.Provider value={createMockGlobalState({
        passwordModalMode: 'enter' as const,
        modelPassword: 'hashed_password123'
      })}>
        <PasswordModal />
      </GlobalStateContext.Provider>
    );
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const unlockButton = screen.getByRole('button', { name: /unlock/i });
    
    // Enter incorrect password
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(unlockButton);
    
    expect(await screen.findByText(/incorrect password/i)).toBeInTheDocument();
    expect(mockSetGlobalState).not.toHaveBeenCalled();
    expect(clearPasswordHash).not.toHaveBeenCalled();
    
    // Enter correct password
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(unlockButton);
    
    expect(clearPasswordHash).toHaveBeenCalled();
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  it('closes the modal when cancel is clicked', () => {
    render(
      <GlobalStateContext.Provider value={createMockGlobalState()}>
        <PasswordModal />
      </GlobalStateContext.Provider>
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  it('handles errors when storing the password fails', async () => {
    // Mock storePasswordHash to reject
    (storePasswordHash as jest.Mock).mockRejectedValueOnce(new Error('Storage failed'));
    
    render(
      <GlobalStateContext.Provider value={createMockGlobalState()}>
        <PasswordModal />
      </GlobalStateContext.Provider>
    );
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /set password/i });
    
    // Enter matching passwords
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/failed to store password/i)).toBeInTheDocument();
    expect(mockSetGlobalState).not.toHaveBeenCalled();
  });

  it('handles errors when clearing the password fails during unlock', async () => {
    // Mock clearPasswordHash to reject
    (clearPasswordHash as jest.Mock).mockRejectedValueOnce(new Error('Clear failed'));
    
    render(
      <GlobalStateContext.Provider value={createMockGlobalState({
        passwordModalMode: 'enter' as const,
        modelPassword: 'hashed_password123'
      })}>
        <PasswordModal />
      </GlobalStateContext.Provider>
    );
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const unlockButton = screen.getByRole('button', { name: /unlock/i });
    
    // Enter correct password
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(unlockButton);
    
    expect(await screen.findByText(/failed to unlock model/i)).toBeInTheDocument();
    expect(mockSetGlobalState).not.toHaveBeenCalled();
  });
}); 
