import React, { useState, useRef, useEffect } from "react";
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
  const [showHelp, setShowHelp] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const [scrollPosition, setScrollPosition] = useState({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollTop } = event.currentTarget;
    setScrollPosition({ left: scrollLeft, top: scrollTop });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const scrollAmount = 50;
    
    switch (event.key) {
      case "ArrowLeft":
        containerRef.current.scrollLeft -= scrollAmount;
        event.preventDefault();
        break;
      case "ArrowRight":
        containerRef.current.scrollLeft += scrollAmount;
        event.preventDefault();
        break;
      case "ArrowUp":
        containerRef.current.scrollTop -= scrollAmount;
        event.preventDefault();
        break;
      case "ArrowDown":
        containerRef.current.scrollTop += scrollAmount;
        event.preventDefault();
        break;
    }
  };

  // Restore scroll position after updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollPosition.left;
      containerRef.current.scrollTop = scrollPosition.top;
    }
  }, [model.columns.length, scrollPosition]);

  const animationContextValue = useAnimationContextValue();

  return (
    <AnimationContext.Provider value={animationContextValue}>
      <div className="model-tab">
        <ModelHeader
          showHelp={showHelp}
          setShowHelp={setShowHelp}
          isWide={isWide}
          handleOpenHelp={handleOpenHelp}
        />
        <div 
          className="model-container"
          ref={containerRef}
          onScroll={handleScroll}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          data-testid="model-container"
        >
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
