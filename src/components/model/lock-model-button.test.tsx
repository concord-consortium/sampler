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
  });
}); 