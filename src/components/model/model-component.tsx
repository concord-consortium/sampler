import React, { useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { useResizer } from "../../hooks/use-resizer";
import { Column } from "./column";
import { ModelHeader } from "./model-header";

import "./model-component.scss";

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

  return (
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
          <div className="outputs">
            <div className="outputs-title">{`sample 1`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
