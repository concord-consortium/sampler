import { CSSProperties, useMemo, useRef, useState } from "react";

type ClientPosition = { clientX: number; clientY: number };

interface UseDragModalSettings {
  modalRef: React.RefObject<HTMLDivElement>
  startPosition: {x: number; y: number};
}

export const useDragModal = ({modalRef, startPosition}: UseDragModalSettings) => {
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  const [dragged, setDragged] = useState(false);
  const [position, _setPosition] = useState(startPosition);
  const [dragging, setDragging] = useState(false);
  const modalBounds = useRef<DOMRect | null>(null);
  const appBounds = useRef<DOMRect | null>(null);

  const style = useMemo(() => {
    if (!dragged) {
      return undefined;
    }

    const { x, y } = position;

    const maxLeft = (appBounds.current?.width || 0) - (modalBounds.current?.width || 0);
    const maxTop = (appBounds.current?.height || 0) - (modalBounds.current?.height || 0);
    const left = Math.min(Math.max(0, x + delta.x), maxLeft);
    const top = Math.min(Math.max(0, y + delta.y), maxTop);

    return {
      position: "fixed",
      left,
      top,
      zIndex: 1000,
      cursor: dragging ? "grabbing" : "default",
      touchAction: "none",
    } as CSSProperties;
  }, [dragged, position, delta, dragging]);

  const setPosition = ({clientX, clientY}: ClientPosition) => {
    _setPosition(() => ({x: clientX, y: clientY}));
  };

  const startDrag = ({clientX, clientY}: ClientPosition) => {
    setDragged(true);
    setDragging(true);

    modalBounds.current = modalRef.current?.getBoundingClientRect() || null;
    appBounds.current = document.querySelector(".App")?.getBoundingClientRect() || null;

    setDelta({
      x: (modalRef.current?.getBoundingClientRect().left || 0) - clientX,
      y: (modalRef.current?.getBoundingClientRect().top || 0) - clientY,
    });
    setPosition({ clientX, clientY });
  };

  // Mouse events
  const handleMouseDown = (downE: React.MouseEvent<HTMLDivElement>) => {
    startDrag(downE);

    const handleMouseMove = (moveE: MouseEvent) => {
      setPosition(moveE);
    };

    const handleMouseUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Touch events
  const handleTouchStart = (eStart: React.TouchEvent<HTMLDivElement>) => {
    startDrag(eStart.touches[0]);

    const handleTouchMove = (eMove: TouchEvent) => {
      setPosition(eMove.touches[0]);
    };

    const handleTouchEnd = () => {
      setDragging(false);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

  return {
    style,
    handleMouseDown,
    handleTouchStart,
  };
};
