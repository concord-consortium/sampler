import React, { useState } from "react";

import "./measures.scss";

export const MeasuresTab = () => {
  const [selectedMeasure, setSelectedMeasure] = useState("default");
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMeasure(event.target.value);
  };

  console.log("selectedMeasure", selectedMeasure);
  return (
    <div className="measures-tab">
      <div id="measures-instructions" data-text="DG.plugin.Sampler.measures-instructions">
        Compute common measures for each sample using the template below.
      </div>
      <div id="select-measure-container">
        <label htmlFor="select-measure" id="select-measure-label" data-text="DG.plugin.Sampler.select-measure">
          Select a measure:
        </label>
        <select id="select-measure" onChange={handleSelectChange}>
          <option id="default" value="default">Select a formula</option>
          <option id="conditional_count" value="conditional_count" data-text="DG.plugin.Sampler.conditional_count">Count</option>
          <option id="sum" value="sum" data-text="DG.plugin.Sampler.sum">Sum</option>
          <option id="mean" value="mean" data-text="DG.plugin.Sampler.mean">Mean</option>
          <option id="median" value="median" data-text="DG.plugin.Sampler.median">Median</option>
          {/* <option id="conditional_sum" value="conditional_sum" data-text="DG.plugin.Sampler.conditional_sum"></option> */}
          <option id="conditional_percentage" value="conditional_percentage" data-text="DG.plugin.Sampler.conditional_percentage">Conditional percentage</option>
          {/* <option id="conditional_mean" value="conditional_mean" data-text="DG.plugin.Sampler.conditional_mean"></option> */}
          {/* <option id="conditional_median" value="conditional_median" data-text="DG.plugin.Sampler.conditional_median"></option> */}
          {/* <option id="difference_of_means" value="difference_of_means" data-text="DG.plugin.Sampler.difference_of_means"></option> */}
          {/* <option id="difference_of_medians" value="difference_of_medians" data-text="DG.plugin.Sampler.difference_of_medians"></option> */}
        </select>
      </div>
      <div id="measure-name-container">
          <label htmlFor="measure-name" id="measure-name-label" data-text="DG.plugin.Sampler.measure-name-label">Name the measure: </label>
          <input type="text" id="measure-name" />
      </div>
      <div id="measure-formulas">
        <div id="sum-formula-container" className={`formula ${selectedMeasure === "sum" ? "" : "hidden"}`}>
          <span id="sum-formula" data-text="DG.plugin.Sampler.sum-formula">sum</span>
          <span className="formula-paren">
            (<select id="sum-select-attribute" />)
          </span>
        </div>
        <div id="mean-formula-container" className={`formula ${selectedMeasure === "mean" ? "" : "hidden" }`}>
          <span id="mean-formula" data-text="DG.plugin.Sampler.mean-formula">mean</span>
          <span className="formula-paren">
            (<select id="mean-select-attribute" />)
          </span>
        </div>
        <div id="median-formula-container" className={`formula ${selectedMeasure === "median" ? "" : "hidden"}`}>
          <span id="median-formula" data-text="DG.plugin.Sampler.median-formula">median</span>
          <span className="formula-paren">
            (<select id="median-select-attribute" />)
          </span>
        </div>
        <div id="conditional_count-formula-container" className={`formula ${selectedMeasure === "conditional_count" ? "" : "hidden"}`}>
          <span id="conditional_count-formula" data-text="DG.plugin.Sampler.conditional_count-formula">count</span>
          <span className="formula-paren">
            ( <select id="conditional_count-select-attribute" />
              <select id="conditional_count-select-operator" />
              <select id="conditional_count-select-value" />
            )
          </span>
        </div>
        <div id="conditional_sum-formula-container" className={`formula ${selectedMeasure === "conditional_sum" ? "" : "hidden"}`}>
          <span id="conditional_sum-formula" data-text="DG.plugin.Sampler.conditional_sum-formula">sum</span>
          <span className="formula-paren">
            (
              <select id="conditional_sum-select-attribute" /> ,
              <select id="conditional_sum-select-attribute-2" />
              <select id="conditional_sum-select-operator" />
              <select id="conditional_sum-select-value" />
            )
          </span>
        </div>
        <div id="conditional_percentage-formula-container" className={`formula ${selectedMeasure === "conditional_percentage" ? "" : "hidden"}`}>
          <span id="conditional_percentage-formula" data-text="DG.plugin.Sampler.conditional_percentage-formula-pt-1">100 * count</span>
          <span className="formula-paren">
            ( <select id="conditional_percentage-select-attribute" />
              <select id="conditional_percentage-select-operator" />
              <select id="conditional_percentage-select-value" />
            )
          </span>
          <span id="conditional_percentage-formula" data-text="DG.plugin.Sampler.conditional_percentage-formula-pt-2"> / count( )</span>
        </div>
        <div id="conditional_mean-formula-container" className={`formula ${selectedMeasure === "conditional_mean" ? "" : "hidden"}`}>
          <span id="conditional_mean-formula" data-text="DG.plugin.Sampler.conditional_mean-formula">mean</span>
          <span className="formula-paren">
            ( <select id="conditional_mean-select-attribute" /> ,
              <select id="conditional_mean-select-attribute-2" />
              <select id="conditional_mean-select-operator" />
              <select id="conditional_mean-select-value" />
            )
          </span>
        </div>
        <div id="conditional_median-formula-container" className={`formula ${selectedMeasure === "conditional_median" ? "" : "hidden"}`}>
          <span id="conditional_median-formula" data-text="DG.plugin.Sampler.conditional_median-formula">median</span>
          <span className="formula-paren">
            ( <select id="conditional_median-select-attribute" /> ,
              <select id="conditional_median-select-attribute-2" />
              <select id="conditional_median-select-operator" />
              <select id="conditional_median-select-value" />
            )
          </span>
        </div>
        <div id="difference_of_means-formula-container" className={`formula ${selectedMeasure === "difference_of_means" ? "" : "hidden"}`}>
          <span id="difference_of_means-formula-pt-1" data-text="DG.plugin.Sampler.difference_of_means-formula-pt-1">mean</span>
          <span className="formula-paren">
            (
            <select id="difference_of_means-select-attribute-pt-1" /> ,
            <select id="difference_of_means-select-attribute-pt-1-2" />
            <select id="difference_of_means-select-operator-pt-1" />
            <select id="difference_of_means-select-value-pt-1" />
            )
          </span>
          <span id="difference_of_means-formula-pt-2" data-text="DG.plugin.Sampler.difference_of_means-formula-pt-2">– mean</span>
          <span className="formula-paren">
            ( <select id="difference_of_means-select-attribute-pt-2" /> ,
              <select id="difference_of_means-select-attribute-pt-2-2" />
              <select id="difference_of_means-select-operator-pt-2" />
              <select id="difference_of_means-select-value-pt-2" />
            )
          </span>
        </div>
        <div id="difference_of_medians-formula-container" className={`formula ${selectedMeasure === "difference_of_medians" ? "" : "hidden"}`}>
          <span id="difference_of_medians-formula-pt-1" data-text="DG.plugin.Sampler.difference_of_medians-formula-pt-1">median</span>
          <span className="formula-paren">
            ( <select id="difference_of_medians-select-attribute-pt-1" /> ,
              <select id="difference_of_medians-select-attribute-pt-1-2" />
              <select id="difference_of_medians-select-operator-pt-1" />
              <select id="difference_of_medians-select-value-pt-1" />
            )
          </span>
          <span id="difference_of_means-formula-pt-2" data-text="DG.plugin.Sampler.difference_of_medians-formula-pt-2"> - median</span>
          <span className="formula-paren">
            ( <select id="difference_of_medians-select-attribute-pt-2" /> ,
              <select id="difference_of_medians-select-attribute-pt-2-2" />
              <select id="difference_of_medians-select-operator-pt-2" />
              <select id="difference_of_medians-select-value-pt-2" />
            )
          </span>
        </div>
      </div>
      <div id="measures-bottom">
        <button id="add-measure" data-text="DG.plugin.Sampler.add-measure" className="disabled">
          Add Measure
        </button>
      </div>
    </div>
  );
};
