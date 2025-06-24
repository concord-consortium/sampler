import React, { useEffect, useMemo, useState } from "react";
import { tr } from "../../utils/localeManager";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { addMeasure, hasSamplesCollection } from "../../helpers/codap-helpers";
import { getCollectorAttrNames, getCollectorFirstNameVariables, isCollectorOnlyModel } from "../../utils/collector";

import "./measures.scss";

type Measure = "default" | "conditional_count" | "sum" | "mean" | "median" | "conditional_percentage" | "count_items";
type MeasureOption = {
  value: Measure;
  label: string;
};

const measureLabels: Record<Measure, string> = {
  default: tr("DG.Plugin.Sampler.measures.select-measure"),
  conditional_count: "Count",
  sum: "Sum",
  mean: "Mean",
  median: "Median",
  conditional_percentage: "Percentage",
  count_items: "Count items"
};

const measureOptions: MeasureOption[] = [
  { value: "default", label: measureLabels.default },
  { value: "conditional_count", label: measureLabels.conditional_count },
  { value: "sum", label: measureLabels.sum },
  { value: "mean", label: measureLabels.mean },
  { value: "median", label: measureLabels.median },
  { value: "conditional_percentage", label: measureLabels.conditional_percentage },
  { value: "count_items", label: measureLabels.count_items }
];

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
    case "count_items":
      return `count()`;
    default:
      return "";
  }
};

export const MeasuresTab = () => {
  const { globalState: { model, dataContextName } } = useGlobalStateContext();
  const { columns } = model;
  const [selectedMeasure, setSelectedMeasure] = useState<Measure>("default");
  const [measureName, setMeasureName] = useState("");
  const [lValue, setLValue] = useState("");
  const [opValue, setOpValue] = useState("=");
  const [rValue, setRValue] = useState("");
  const [hasSamples, setHasSamples] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkForSamples = async () => {
      const result = await hasSamplesCollection(dataContextName);
      setHasSamples(result);
    };
    checkForSamples();
  }, [dataContextName]);

  const isCollector = useMemo(() => isCollectorOnlyModel(model), [model]);

  const disableAddButton = useMemo(() => {
    let disable = selectedMeasure === "default" || (lValue.length === 0 && selectedMeasure !== "count_items");  // measureName is optional
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
        const vars = isCollector ? getCollectorFirstNameVariables(device.collectorVariables) : device.variables;
        vars.forEach((variable) => {
          set.add(variable);
        });
      });
    });
    const array = Array.from(set);
    array.sort();
    return array;
  }, [columns, isCollector]);

  const handleSelectMeasureChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMeasure(e.target.value as Measure);
  const handleChangeMeasureName = (e:  React.ChangeEvent<HTMLInputElement>) => setMeasureName(e.target.value);
  const handleChangeLValue = (e: React.ChangeEvent<HTMLSelectElement>) => setLValue(e.target.value);
  const handleChangeOpValue = (e: React.ChangeEvent<HTMLSelectElement>) => setOpValue(e.target.value);
  const handleChangeRValue = (e: React.ChangeEvent<HTMLSelectElement>) => setRValue(e.target.value);

  const handleAddMeasure = () => {
    const formula = getFormula(selectedMeasure, lValue, opValue, rValue);
    addMeasure(dataContextName, measureName, selectedMeasure, formula);
    setMessage(`${measureLabels[selectedMeasure]} measure added.`);
    setSelectedMeasure("default");
    setMeasureName("");
    setLValue("");
    setOpValue("=");
    setRValue("");
    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  const renderAttributes = () => {
    const attrs = isCollector ? getCollectorAttrNames(model) : columns.map(column => column.name);
    return (
      <>
        <option value="">Select an attribute!</option>
        {attrs.map(attr => <option key={attr} value={attr}>{attr}</option>)}
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
        {tr("DG.Plugin.Sampler.measures.instructions")}
      </div>
      <div id="select-measure-container">
        <label htmlFor="select-measure" id="select-measure-label">
          {tr("DG.Plugin.Sampler.measures.select-prompt")}
        </label>
        <div className="select-measure-dropdown">
          <select id="select-measure" onChange={handleSelectMeasureChange} value={selectedMeasure}>
            {measureOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {!["default", "count_items"].includes(selectedMeasure) && (
        <div id="define-measure-container">
          <label id="define-measure-label">
            {tr("DG.Plugin.Sampler.measures.customize")}
          </label>
          <div id="measure-formulas">
            <div className="formula">
              {renderFormulaInput()}
            </div>
          </div>
        </div>
      )}
      <div id="measure-name-container">
        <label htmlFor="measure-name" id="measure-name-label">{tr("DG.Plugin.Sampler.measures.name-prompt")}</label>
        <input type="text" id="measure-name" placeholder={tr("DG.Plugin.Sampler.measures.name-hint")}
               value={measureName} onChange={handleChangeMeasureName} />
      </div>

      <div id="measures-bottom">
        <button id="add-measure" onClick={handleAddMeasure} disabled={disableAddButton} className={disableAddButton ? "disabled" : ""}>
          {tr("DG.Plugin.Sampler.measures.add-measure")}
        </button>
      </div>

      <div id="measures-message">
        {message}
      </div>
    </div>
  );
};
