import React, { useEffect, useMemo, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { addMeasure, hasSamplesCollection } from "../../helpers/codap-helpers";

import "./measures.scss";

type Measure = "default" | "conditional_count" | "sum" | "mean" | "median" | "conditional_percentage";

const getFormula = (measure: Measure, left: string, op: string, right: string) => {
  switch (measure) {
    case "sum":
    case "mean":
    case "median":
      return `${measure}(\`${left}\`)`;
    case "conditional_count":
      return `count(\`${left}\`${op}'${right}')`;
    case "conditional_percentage":
      return `100 * count(\`${left}\`${op} '${right}')/count()`;
    default:
      return "";
  }
};

export const MeasuresTab = () => {
  const { globalState: { model: { columns } } } = useGlobalStateContext();
  const [selectedMeasure, setSelectedMeasure] = useState<Measure>("default");
  const [measureName, setMeasureName] = useState("");
  const [lValue, setLValue] = useState("");
  const [opValue, setOpValue] = useState("=");
  const [rValue, setRValue] = useState("");
  const [hasSamples, setHasSamples] = useState(false);

  useEffect(() => {
    const checkForSamples = async () => {
      const result = await hasSamplesCollection();
      setHasSamples(result);
    };
    checkForSamples();
  }, []);

  const disableAddButton = useMemo(() => {
    let disable = selectedMeasure === "default" || lValue.length === 0;  // measureName is optional
    if (!disable) {
      switch (selectedMeasure) {
        case "conditional_count":
        case "conditional_percentage":
          disable = rValue.length === 0;
          break;
      }
    }
    return disable;
  }, [selectedMeasure, lValue, rValue]);

  const uniqueVariables = useMemo(() => {
    const set = new Set<string>();
    columns.forEach((column) => {
      column.devices.forEach((device) => {
        device.variables.forEach((variable) => {
          set.add(variable);
        });
      });
    });
    const array = Array.from(set);
    array.sort();
    return array;
  }, [columns]);

  const handleSelectMeasureChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMeasure(e.target.value as Measure);
  const handleChangeMeasureName = (e:  React.ChangeEvent<HTMLInputElement>) => setMeasureName(e.target.value);
  const handleChangeLValue = (e: React.ChangeEvent<HTMLSelectElement>) => setLValue(e.target.value);
  const handleChangeOpValue = (e: React.ChangeEvent<HTMLSelectElement>) => setOpValue(e.target.value);
  const handleChangeRValue = (e: React.ChangeEvent<HTMLSelectElement>) => setRValue(e.target.value);

  const handleAddMeasure = () => {
    const formula = getFormula(selectedMeasure, lValue, opValue, rValue);
    addMeasure(measureName, selectedMeasure, formula);
  };

  const renderAttributes = () => {
    return (
      <>
        <option value="">Select an attribute!</option>
        {columns.map(column => <option key={column.id} value={column.name}>{column.name}</option>)}
      </>
    );
  };

  const renderVariables = () => {
    return (
      <>
        <option value="">Select a value!</option>
        {uniqueVariables.map(variable => <option key={variable} value={variable}>{variable}</option>)}
      </>
    );
  };

  const renderLValue = () => {
    return (
      <div className="formula-dropdown">
        <select onChange={handleChangeLValue} value={lValue}>
          {renderAttributes()}
        </select>
      </div>
    );
  };

  const renderOpValue = () => {
    return (
      <div className="formula-operator-dropdown">
        <select onChange={handleChangeOpValue} value={opValue}>
          <option value="=">=</option>
          <option value="≠">≠</option>
        </select>
      </div>
    );
  };

  const renderRValue = () => {
    return (
      <div className="formula-dropdown">
        <select onChange={handleChangeRValue} value={rValue}>
        {renderVariables()}
        </select>
      </div>
    );
  };

  const renderFormulaInput = () => {
    switch (selectedMeasure) {
      case "sum":
      case "mean":
      case "median":
        return (
          <>
            <span>{selectedMeasure}</span>
            <span className="formula-paren">
              ( {renderLValue()} )
            </span>
          </>
        );
      case "conditional_count":
        return (
          <>
            <span>count</span>
            <span className="formula-paren">
              (
                {renderLValue()}
                {renderOpValue()}
                {renderRValue()}
              )
            </span>
          </>
        );
      case "conditional_percentage":
        return (
          <>
            100 * count
            <span className="formula-paren">
              (
                {renderLValue()}
                {renderOpValue()}
                {renderRValue()}
              )
            </span> / count( )
          </>
        );
    }
    return null;
  };

  if (!hasSamples) {
    return (
      <div className="measures-tab">
        <div id="measures-instructions">
          Please run at least one experiment first.
        </div>
      </div>
    );
  }

  return (
    <div className="measures-tab">
      <div id="measures-instructions">
        Add common measures using formulas for each sample using the form below.
      </div>
      <div id="select-measure-container">
        <label htmlFor="select-measure" id="select-measure-label">
          Select formula:
        </label>
        <div className="select-measure-dropdown">
          <select id="select-measure" onChange={handleSelectMeasureChange} value={selectedMeasure}>
            <option value="default">Select a formula</option>
            <option value="conditional_count">Count</option>
            <option value="sum">Sum</option>
            <option value="mean">Mean</option>
            <option value="median">Median</option>
            <option value="conditional_percentage">Conditional percentage</option>
          </select>
        </div>
      </div>
      {selectedMeasure !== "default" && (
        <div id="define-measure-container">
          <label id="define-measure-label">
            Customize formula:
          </label>
          <div id="measure-formulas">
            <div className="formula">
              {renderFormulaInput()}
            </div>
          </div>
        </div>
      )}
      <div id="measure-name-container">
        <label htmlFor="measure-name" id="measure-name-label">Name the measure: </label>
        <input type="text" id="measure-name" placeholder="Enter measure name here (optional)" value={measureName} onChange={handleChangeMeasureName} />
      </div>

      <div id="measures-bottom">
        <button id="add-measure" onClick={handleAddMeasure} disabled={disableAddButton} className={disableAddButton ? "disabled" : ""}>
          Add Measure
        </button>
      </div>
    </div>
  );
};
