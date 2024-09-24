import React, { useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { AnimationContext, useAnimationContextValue } from "../../hooks/useAnimation";
import { useResizer } from "../../hooks/use-resizer";
import { Column } from "./column";
import { ModelHeader } from "./model-header";

import "./model-component.scss";
import { Outputs } from "./outputs";

const kMinColumnWidth = 220; // device + gap width
const kSelectedSamplesDivWidth = 65; //includes margin-right

export const ModelTab = () => {
  const { globalState } = useGlobalStateContext();
  const { model } = globalState;
  const [showHelp, setShowHelp] = useState(false);
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

  const handleOpenHelp = () => {
    setShowHelp(!showHelp);
  };

  const modelHeaderStyle = {width: (model.columns.length * kMinColumnWidth) + kSelectedSamplesDivWidth};
  const animationContextValue = useAnimationContextValue();

  return (
    <AnimationContext.Provider value={animationContextValue}>
      <div className="model-tab">
        <ModelHeader
          modelHeaderStyle={modelHeaderStyle}
          showHelp={showHelp}
          setShowHelp={setShowHelp}
          isWide={isWide}
          handleOpenHelp={handleOpenHelp}
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
