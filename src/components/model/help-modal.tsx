import React from "react";

interface IProps {
  setShowHelp: (show: boolean) => void;
}

export const HelpModal = ({setShowHelp}: IProps) => {
  const handleCloseModal = () => {
    setShowHelp(false);
  };
  return (
    <div className="help-modal">
      <div className="modal-header">
        Help: Repeat Until Condition
      </div>
      <div className="modal-body">
        <p className="help-section-title">
          Specify a Condition to Repeat Until
        </p>
        <p className="help-section-body">
          Repeat Until allows the model to continue drawing samples until a desired outcome -- the Condition specified -- occurs.
          You can specify conditions in two ways: using a formula or a pattern.
        </p>
        <p className="help-section-title">
          Using a Formula
        </p>
        <p className="help-section-body">
          Formulas start with an equals sign (=) followed by a logical expression.
          <br />
          <strong>Examples:</strong>
          <br />
          <code>=x &gt; 5</code> - Stops when x is greater than 5
          <br />
          <code>=count &gt; 10</code> - Stops when count exceeds 10
          <br />
          <code>=result === &quot;success&quot;</code> - Stops when result equals &quot;success&quot;
        </p>
        <p className="help-section-title">
          Using a Pattern
        </p>
        <p className="help-section-body">
          Patterns are comma-separated values that the system will look for in the sample data.
          <br />
          <strong>Examples:</strong>
          <br />
          <code>apple,banana,orange</code> - Stops when any of these fruits appear
          <br />
          <code>heads,heads,heads</code> - Stops when three heads in a row appear
          <br />
          <code>7</code> - Stops when the number 7 appears
        </p>
      </div>
      <div className="modal-footer">
        <button className="modal-button" onClick={handleCloseModal}>Close</button>
      </div>
    </div>
  );
};
