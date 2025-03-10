import React, { useRef } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { Speed, speedLabels } from "../../types";

interface SpeedSliderProps {
  'aria-labelledby'?: string;
}

export const SpeedSlider = (props: SpeedSliderProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { speed } = globalState;
  const sliderRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(event.target.value, 10);
    setGlobalState(draft => {
      draft.speed = newSpeed;
    });
  };

  // Handle click on tick marks or labels
  const handleTickClick = (speedValue: Speed) => {
    setGlobalState(draft => {
      draft.speed = speedValue;
    });
    // Focus the slider after clicking a tick
    if (sliderRef.current) {
      sliderRef.current.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        if (speed < Speed.Fastest) {
          setGlobalState(draft => {
            draft.speed = speed + 1;
          });
        }
        event.preventDefault();
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        if (speed > Speed.Slow) {
          setGlobalState(draft => {
            draft.speed = speed - 1;
          });
        }
        event.preventDefault();
        break;
      case 'Home':
        setGlobalState(draft => {
          draft.speed = Speed.Slow;
        });
        event.preventDefault();
        break;
      case 'End':
        setGlobalState(draft => {
          draft.speed = Speed.Fastest;
        });
        event.preventDefault();
        break;
    }
  };

  // Generate tick marks for each speed option
  const renderTickMarks = () => {
    return Object.values(Speed)
      .filter(value => !isNaN(parseInt(value.toString(), 10)))
      .map(speedValue => {
        const isActive = parseInt(speedValue.toString(), 10) === speed;
        const speedName = speedLabels[speedValue as Speed];
        return (
          <div 
            className={`tick-mark ${isActive ? 'active' : ''}`} 
            key={`tick-${speedValue}`}
            onClick={() => handleTickClick(speedValue as Speed)}
            role="button"
            tabIndex={0}
            aria-label={`Set speed to ${speedName}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTickClick(speedValue as Speed);
              }
            }}
          >
            <div className="tick-line"/>
            <span className="tick-label">{speedName}</span>
          </div>
        );
      });
  };

  return (
    <div className="speed-slider">
      <input
        ref={sliderRef}
        type="range"
        min={Speed.Slow}
        max={Speed.Fastest}
        value={speed}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        step={1}
        list="speedSettings"
        className="slider"
        id="speed-slider"
        aria-label={props['aria-labelledby'] ? undefined : "Animation Speed"}
        aria-labelledby={props['aria-labelledby']}
        aria-valuemin={Speed.Slow}
        aria-valuemax={Speed.Fastest}
        aria-valuenow={speed}
        aria-valuetext={speedLabels[speed]}
      />
      <div className="tick-marks-container" role="group" aria-label="Speed options">
        {renderTickMarks()}
      </div>
      <span 
        id="speed-text" 
        data-text={`DG.plugin.Sampler.top-bar.${speedLabels[speed].toLowerCase()}-speed`}
        aria-hidden="true"
      >
        {speedLabels[speed]}
      </span>
      <div className="sr-only">
        Current speed: {speedLabels[speed]}
      </div>
    </div>
  );
};
