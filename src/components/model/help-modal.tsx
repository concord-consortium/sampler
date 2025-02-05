import React, { useRef, useState } from "react";

import ExpanderIcon from "../../assets/expander.svg";

interface IProps {
  setShowHelp: (show: boolean) => void;
}

export const HelpModal = ({ setShowHelp }: IProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ width: 268, height: 300 });
  const [position, setPosition] = useState({ x: 25, y: 100 });

  const handleCloseModal = () => {
    setShowHelp(false);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    const startX = event.clientX - position.x;
    const startY = event.clientY - position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleResizeMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    const startWidth = size.width;
    const startHeight = size.height;
    const startX = event.clientX;
    const startY = event.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setSize({
        width: Math.max(200, startWidth + (moveEvent.clientX - startX)),
        height: Math.max(150, startHeight + (moveEvent.clientY - startY)),
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // NOTE: once we get real content, we can replace this with a markdown file so we can easily update
  // the help text without needing to update the code.  Bill agreed to this approach.

  return (
    <div
      ref={modalRef}
      className="help-modal"
      style={{
        width: size.width,
        height: size.height,
        left: position.x,
        top: position.y,
      }}
    >
      <div ref={headerRef} className="modal-header" onMouseDown={handleMouseDown}>
        Help: Repeat Until Condition
      </div>
      <div className="modal-body">
        <p className="help-section-title">Specify a Condition to Repeat Until</p>
        <p className="help-section-body">
          Repeat Until allows the model to continue drawing samples until a desired outcome -- the Condition specified -- occurs.
        </p>
        <p className="help-section-title">
          Using a Formula
        </p>
        <p className="help-section-body">
          {`Example: sex = "male" AND height > 5`}
        </p>
        <p className="help-section-title">
          Using a Pattern
        </p>
        <p className="help-section-body">
          {`Example: a,b,a`}
        </p>
      </div>
      <div className="modal-footer">
        <button className="modal-button" onClick={handleCloseModal}>Close</button>
      </div>
      <div ref={resizeRef} className="resize-handle" onMouseDown={handleResizeMouseDown}>
        <ExpanderIcon />
      </div>
    </div>
  );
};
