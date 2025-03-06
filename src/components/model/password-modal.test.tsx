import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PasswordModal } from './password-modal';
import { GlobalStateContext } from '../../hooks/useGlobalState';
import { hashPassword } from '../../utils/password-utils';
import { Speed } from '../../types';

jest.mock('../../utils/password-utils', () => ({
  hashPassword: jest.fn().mockImplementation((password) => `hashed_${password}`),
  validatePassword: jest.fn().mockImplementation((password, storedHash) => 
    storedHash === `hashed_${password}`)
}));

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
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'password456' } });
      fireEvent.click(submitButton);
    });
    
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockSetGlobalState).not.toHaveBeenCalled();
  });

  it('sets the password when passwords match', async () => {
    render(
      <GlobalStateContext.Provider value={createMockGlobalState()}>
        <PasswordModal />
      </GlobalStateContext.Provider>
    );
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /set password/i });
    
    // Enter matching passwords
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });
    
    expect(hashPassword).toHaveBeenCalledWith('password123');
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  it('validates the entered password when unlocking', async () => {
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
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(unlockButton);
    });
    
    expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
    expect(mockSetGlobalState).not.toHaveBeenCalled();
    
    // Enter correct password
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(unlockButton);
    });
    
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
}); 