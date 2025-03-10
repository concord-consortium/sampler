import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SpeedSlider } from './model-speed-slider';
import { Speed, speedLabels } from '../../types';
import { useGlobalStateContext } from '../../hooks/useGlobalState';

// Mock the useGlobalStateContext hook
jest.mock('../../hooks/useGlobalState', () => ({
  useGlobalStateContext: jest.fn()
}));

describe('SpeedSlider Component', () => {
  const mockSetGlobalState = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { speed: Speed.Medium },
      setGlobalState: mockSetGlobalState
    });
  });

  it('renders with the correct initial speed value', () => {
    render(<SpeedSlider />);
    
    // Check that the slider has the correct value
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue(Speed.Medium.toString());
    
    // Check that the speed text is displayed - use a more specific selector
    expect(screen.getByText(speedLabels[Speed.Medium], { selector: '#speed-text' })).toBeInTheDocument();
  });

  it('updates global state when slider value changes', () => {
    render(<SpeedSlider />);
    
    const slider = screen.getByRole('slider');
    
    // Change the slider value
    fireEvent.change(slider, { target: { value: Speed.Fast } });
    
    // Check that setGlobalState was called with the correct value
    expect(mockSetGlobalState).toHaveBeenCalled();
    const setStateFn = mockSetGlobalState.mock.calls[0][0];
    const draftState = { speed: Speed.Medium };
    setStateFn(draftState);
    expect(draftState.speed).toBe(Speed.Fast);
  });

  it('renders tick marks for each speed option', () => {
    render(<SpeedSlider />);
    
    // Check that there are tick marks for each speed option
    const sliderContainer = screen.getByTestId('speed-slider-container');
    const tickMarks = within(sliderContainer).getAllByTestId('tick-mark');
    expect(tickMarks.length).toBe(Object.keys(speedLabels).length);
  });

  // Tests for new functionality

  it('updates speed when a tick mark is clicked', () => {
    render(<SpeedSlider />);
    
    // Find all tick marks
    const tickMarks = screen.getAllByTestId('tick-mark');
    
    // Click on the Fast tick mark (index 2)
    fireEvent.click(tickMarks[2]);
    
    // Check that setGlobalState was called with the correct value
    expect(mockSetGlobalState).toHaveBeenCalled();
    const setStateFn = mockSetGlobalState.mock.calls[0][0];
    const draftState = { speed: Speed.Medium };
    setStateFn(draftState);
    expect(draftState.speed).toBe(Speed.Fast);
  });

  it('increases speed when right arrow key is pressed', () => {
    render(<SpeedSlider />);
    
    const slider = screen.getByRole('slider');
    
    // Press the right arrow key
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    
    // Check that setGlobalState was called with the correct value
    expect(mockSetGlobalState).toHaveBeenCalled();
    const setStateFn = mockSetGlobalState.mock.calls[0][0];
    const draftState = { speed: Speed.Medium };
    setStateFn(draftState);
    expect(draftState.speed).toBe(Speed.Fast);
  });

  it('decreases speed when left arrow key is pressed', () => {
    render(<SpeedSlider />);
    
    const slider = screen.getByRole('slider');
    
    // Press the left arrow key
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    
    // Check that setGlobalState was called with the correct value
    expect(mockSetGlobalState).toHaveBeenCalled();
    const setStateFn = mockSetGlobalState.mock.calls[0][0];
    const draftState = { speed: Speed.Medium };
    setStateFn(draftState);
    expect(draftState.speed).toBe(Speed.Slow);
  });

  it('sets speed to minimum when Home key is pressed', () => {
    render(<SpeedSlider />);
    
    const slider = screen.getByRole('slider');
    
    // Press the Home key
    fireEvent.keyDown(slider, { key: 'Home' });
    
    // Check that setGlobalState was called with the correct value
    expect(mockSetGlobalState).toHaveBeenCalled();
    const setStateFn = mockSetGlobalState.mock.calls[0][0];
    const draftState = { speed: Speed.Medium };
    setStateFn(draftState);
    expect(draftState.speed).toBe(Speed.Slow);
  });

  it('sets speed to maximum when End key is pressed', () => {
    render(<SpeedSlider />);
    
    const slider = screen.getByRole('slider');
    
    // Press the End key
    fireEvent.keyDown(slider, { key: 'End' });
    
    // Check that setGlobalState was called with the correct value
    expect(mockSetGlobalState).toHaveBeenCalled();
    const setStateFn = mockSetGlobalState.mock.calls[0][0];
    const draftState = { speed: Speed.Medium };
    setStateFn(draftState);
    expect(draftState.speed).toBe(Speed.Fastest);
  });

  it('does not change speed when at minimum and left arrow is pressed', () => {
    // Set the initial speed to Slow
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { speed: Speed.Slow },
      setGlobalState: mockSetGlobalState
    });
    
    render(<SpeedSlider />);
    
    const slider = screen.getByRole('slider');
    
    // Press the left arrow key
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    
    // Check that setGlobalState was not called
    expect(mockSetGlobalState).not.toHaveBeenCalled();
  });

  it('does not change speed when at maximum and right arrow is pressed', () => {
    // Set the initial speed to Fastest
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { speed: Speed.Fastest },
      setGlobalState: mockSetGlobalState
    });
    
    render(<SpeedSlider />);
    
    const slider = screen.getByRole('slider');
    
    // Press the right arrow key
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    
    // Check that setGlobalState was not called
    expect(mockSetGlobalState).not.toHaveBeenCalled();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<SpeedSlider />);
    
    const slider = screen.getByRole('slider');
    
    // Check ARIA attributes
    expect(slider).toHaveAttribute('aria-label', 'Animation Speed');
    expect(slider).toHaveAttribute('aria-valuemin', Speed.Slow.toString());
    expect(slider).toHaveAttribute('aria-valuemax', Speed.Fastest.toString());
    expect(slider).toHaveAttribute('aria-valuenow', Speed.Medium.toString());
    expect(slider).toHaveAttribute('aria-valuetext', speedLabels[Speed.Medium]);
  });
});
