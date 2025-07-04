import React, { useEffect, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { AnimationContext, useAnimationContextValue } from "../../hooks/useAnimation";
import { useResizer } from "../../hooks/use-resizer";
import { Column } from "./column";
import { ModelHeader } from "./model-header";
import { Outputs } from "./outputs";

import "./model-component.scss";

export const ModelTab = () => {
  const { globalState } = useGlobalStateContext();
  const { model } = globalState;
  const [showRepeatUntil, setShowRepeatUntil] = useState(false);
  const [isWide, setIsWide] = useState(false);

  useResizer(()=>{
    const repeatControlWidth = document.querySelector(".select-repeat-controls")
    ?.getBoundingClientRect().width;
    if (repeatControlWidth && repeatControlWidth > 575) {
      setIsWide(true);
    } else {
      setIsWide(false);
    }

  });

  // keep the header the same width as the device outputs
  useEffect(() => {
    const deviceOutputs = document.querySelector('.device-outputs-container') as HTMLDivElement;
    const modelContainer = document.querySelector('.model-header') as HTMLDivElement;

    if (deviceOutputs && modelContainer) {
      // +20 for the output on the right side
      modelContainer.style.setProperty('--device-outputs-width', `${deviceOutputs.offsetWidth + 20}px`);
    }
  }, [model]);

  const handleSetShowRepeatUntil = (value: boolean) => {
    setShowRepeatUntil(value);
  };

  const animationContextValue = useAnimationContextValue();

  return (
    <AnimationContext.Provider value={animationContextValue}>
      <div className="model-tab">
        <ModelHeader
          showRepeatUntil={showRepeatUntil}
          isWide={isWide}
          setShowRepeatUntil={handleSetShowRepeatUntil}
        />
        <div className="model-container">
          <div className={`device-outputs-container`}>
            {model.columns.map((column, columnIndex) => {
              return (
                <Column
                  key={`column-${columnIndex}`}
                  column={column}
                  columnIndex={columnIndex}
                />
              );
            })}
            <Outputs />
          </div>
        </div>
      </div>
    </AnimationContext.Provider>
  );
};
