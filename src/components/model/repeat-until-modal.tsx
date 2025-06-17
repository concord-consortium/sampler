import React, { useCallback, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { RepeatCondition } from "../../types";
import { isRunButtonEnabled } from "../../helpers/model-helpers";
import { useDragModal } from "../../hooks/use-drag-modal";

interface IProps {
  setShowRepeatUntil: (value: boolean) => void
}

export const RepeatUntilModal = ({ setShowRepeatUntil }: IProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const {style, handleMouseDown, handleTouchStart} = useDragModal({modalRef, startPosition: { x: 25, y: 60 }});

  const { globalState, setGlobalState } = useGlobalStateContext();
  const { untilFormula, repeatCondition, repeatNumUniqueValues } = globalState;
  const [expressionOrPattern, setExpressionOrPattern] = useState(untilFormula);
  const [condition, setCondition] = useState<RepeatCondition>(repeatCondition);
  const [numUniqueValues, setNumUniqueValues] = useState(repeatNumUniqueValues);

  const handleCloseModal = useCallback(() => {
    setShowRepeatUntil(false);
  }, [setShowRepeatUntil]);

  const handleSave = useCallback(() => {
    const newUntilFormula = expressionOrPattern.trim();
    setGlobalState(draft => {
      draft.repeatCondition = condition;
      draft.repeatNumUniqueValues = numUniqueValues;
      draft.untilFormula = newUntilFormula;
      draft.enableRunButton = isRunButtonEnabled(draft);
    });
    handleCloseModal();
  }, [condition, expressionOrPattern, handleCloseModal, numUniqueValues, setGlobalState]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  }, [handleSave]);

  const handleExpressionOrPatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpressionOrPattern(e.target.value);
  };

  const handleNumUniqueValuesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setNumUniqueValues(value);
    } else {
      setNumUniqueValues(1);
    }
  };

  const renderCondition = () => {
    switch (condition) {
      case "expressionOrPattern":
        return (
          <>
            <div className="input">
              <label htmlFor="condition">Enter Expression or Pattern</label>
              <input type="text" value={expressionOrPattern} autoFocus={true} onChange={handleExpressionOrPatternChange} />
            </div>
            <div className="help">
              <div>
                Enter an expression or pattern to continue drawing samples until a desired outcome occurs.
              </div>
              <div className="title">
                Example expression:
              </div>
              <div>
                {`sex = "male" AND height > 5`}
              </div>
              <div className="title">
                Example pattern:
              </div>
              <div>
                {`a,b,a`}
              </div>
            </div>
          </>
        );

      case "uniqueValues":
        return (
          <>
            <div className="input">
              <label htmlFor="condition">Enter Number Of Unique Values</label>
              <input type="number" autoFocus={true} min={1} step={1} value={numUniqueValues} onChange={handleNumUniqueValuesChange} />
            </div>
            <div className="help">
              <div>
                Specify how many unique values within a sample need to be selected in order for the repetition to stop.
              </div>
            </div>
          </>
        );

      default:
        return <div>Unknown condition!</div>;
    }
  };

  return (
    <div
      ref={modalRef}
      className="repeat-until-modal"
      style={style}
    >
      <div className="modal-header" onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
        Condition to End Repetition
      </div>
      <div className="modal-body">
        <div className="modal-body-section">
          <label htmlFor="condition">Choose a Condition</label>
          <div id="condition" className="select">
            <select value={condition} onChange={(e) => setCondition(e.target.value as RepeatCondition)}>
              <option value="expressionOrPattern">Expression or Pattern</option>
              <option value="uniqueValues">Unique Values</option>
            </select>
          </div>
        </div>
        <div className="modal-body-section">
          <form onSubmit={handleSubmit}>
            {renderCondition()}
          </form>
        </div>
      </div>
      <div className="modal-footer">
        <button className="modal-button" onClick={handleSave}>Ok</button>
        <button className="modal-button" onClick={handleCloseModal}>Cancel</button>
      </div>
    </div>
  );
};
