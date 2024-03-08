import React from "react";
import { useGlobalStateContextValue } from "../../hooks/useGlobalState";
import { Speed, speedLabels } from "../../types";

export const SpeedSlider = () => {
  const { globalState, setGlobalState } = useGlobalStateContextValue();
  const { speed } = globalState;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalState(draft => {
      draft.speed = parseInt(event.target.value, 10);
    });
  };

  return (
    <div className="speed-slider">
      <input
        type="range"
        min={Speed.Slow}
        max={Speed.Fastest}
        value={speed}
        onChange={handleChange}
        step={1}
        list="speedSettings"
        className="slider"
      />
      <div className="tick-marks-container">
          {Object.keys(speedLabels).map((label, i) => {
            return (
              <div className="tick-mark" key={`tick-${label}-${i}`}>
                <div className="tick-line"/>
              </div>
            );
          })}
      </div>
      <span id="speed-text" data-text="DG.plugin.Sampler.top-bar.medium-speed">
        {speedLabels[speed]}
      </span>
    </div>
  );
};
