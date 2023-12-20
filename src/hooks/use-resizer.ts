import { useEffect } from "react";

export type ResizerListener = () => void;

const listeners: ResizerListener[] = [];

const addListener = (listener: ResizerListener) => listeners.push(listener);
const removeListener = (listener: ResizerListener) => {
  const index = listeners.findIndex(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
};
const callListeners = () => listeners.forEach(l => l());

// listen for resize events
window.addEventListener("resize", callListeners);

// listen for scrollbars showing/hiding
const innerWidthFiller = document.createElement("div");
innerWidthFiller.style.cssText = "position: fixed; left: 0; right: 0";
document.body.appendChild(innerWidthFiller);
const resizeObserver = new ResizeObserver(() => {
  const {clientHeight, scrollHeight} = document.documentElement;
  if (scrollHeight !== clientHeight) {
    callListeners();
  }
});
resizeObserver.observe(innerWidthFiller);

export const useResizer = (listener: ResizerListener) => {
  useEffect(() => {
    addListener(listener);
    return () => removeListener(listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
