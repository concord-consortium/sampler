import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LockModelButton } from './lock-model-button';
import { GlobalStateContext } from '../../hooks/useGlobalState';
import { Speed } from '../../types';

describe('LockModelButton', () => {
  const mockSetGlobalState = jest.fn();
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
      showPasswordModal: false,
      passwordModalMode: 'set' as const,
      repeatUntilCondition: '',
      reduceMotion: false,
      ...overrides
    },
    setGlobalState: mockSetGlobalState
  });

  beforeEach(() => {
    mockSetGlobalState.mockClear();
  });

  it('renders the lock button when model is unlocked', () => {
    render(
      <GlobalStateContext.Provider value={createMockGlobalState()}>
        <LockModelButton />
      </GlobalStateContext.Provider>
    );
    
    const lockButton = screen.getByRole('button', { name: /lock model/i });
    expect(lockButton).toBeInTheDocument();
    expect(screen.getByText('🔓')).toBeInTheDocument();
    expect(screen.getByText('Lock Model')).toBeInTheDocument();
  });

  it('renders the unlock button when model is locked', () => {
    render(
      <GlobalStateContext.Provider value={createMockGlobalState({
        modelLocked: true
      })}>
        <LockModelButton />
      </GlobalStateContext.Provider>
    );
    
    const unlockButton = screen.getByRole('button', { name: /unlock model/i });
    expect(unlockButton).toBeInTheDocument();
    expect(screen.getByText('🔒')).toBeInTheDocument();
    expect(screen.getByText('Unlock Model')).toBeInTheDocument();
  });

  it('opens password modal when lock button is clicked and no password is set', () => {
    render(
      <GlobalStateContext.Provider value={createMockGlobalState()}>
        <LockModelButton />
      </GlobalStateContext.Provider>
    );
    
    const lockButton = screen.getByRole('button', { name: /lock model/i });
    fireEvent.click(lockButton);
    
    expect(mockSetGlobalState).toHaveBeenCalledWith(expect.any(Function));
    
    // Test the draft function directly
    const draftFn = mockSetGlobalState.mock.calls[0][0];
    const mockDraft = { showPasswordModal: false, passwordModalMode: 'set' };
    draftFn(mockDraft);
    
    expect(mockDraft.showPasswordModal).toBe(true);
    expect(mockDraft.passwordModalMode).toBe('set');
  });

  it('opens password modal when unlock button is clicked', () => {
    render(
      <GlobalStateContext.Provider value={createMockGlobalState({
        modelLocked: true,
        modelPassword: 'hashedPassword'
      })}>
        <LockModelButton />
      </GlobalStateContext.Provider>
    );
    
    const unlockButton = screen.getByRole('button', { name: /unlock model/i });
    fireEvent.click(unlockButton);
    
    expect(mockSetGlobalState).toHaveBeenCalledWith(expect.any(Function));
    
    // Test the draft function directly
    const draftFn = mockSetGlobalState.mock.calls[0][0];
    const mockDraft = { showPasswordModal: false, passwordModalMode: 'set' };
    draftFn(mockDraft);
    
    expect(mockDraft.showPasswordModal).toBe(true);
    expect(mockDraft.passwordModalMode).toBe('enter');
  });

  it('sets passwordModalMode to "set" when button is clicked with no password', () => {
    render(
      <GlobalStateContext.Provider value={createMockGlobalState({
        modelPassword: '',
        modelLocked: false
      })}>
        <LockModelButton />
      </GlobalStateContext.Provider>
    );
    
    const lockButton = screen.getByRole('button', { name: /lock model/i });
    fireEvent.click(lockButton);
    
    // Test the draft function directly
    const draftFn = mockSetGlobalState.mock.calls[0][0];
    const mockDraft = { showPasswordModal: false, passwordModalMode: 'enter' };
    draftFn(mockDraft);
    
    expect(mockDraft.showPasswordModal).toBe(true);
    expect(mockDraft.passwordModalMode).toBe('set');
  });

  it('has correct accessibility attributes', () => {
    // Test unlocked state
    const { rerender } = render(
      <GlobalStateContext.Provider value={createMockGlobalState({
        modelLocked: false
      })}>
        <LockModelButton />
      </GlobalStateContext.Provider>
    );
    
    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Lock model');
    expect(button).toHaveAttribute('title', 'Lock model');
    expect(button).toHaveClass('lock-model-button');
    expect(button).toHaveClass('unlocked');
    
    // Test locked state
    rerender(
      <GlobalStateContext.Provider value={createMockGlobalState({
        modelLocked: true
      })}>
        <LockModelButton />
      </GlobalStateContext.Provider>
    );
    
    button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Unlock model');
    expect(button).toHaveAttribute('title', 'Unlock model');
    expect(button).toHaveClass('lock-model-button');
    expect(button).toHaveClass('locked');
  });
}); 
