import React, { useState } from "react";
import { IModel } from "../../models/model-model";
import { IDevice } from "../../models/device-model";
import { Id } from "../../utils/id";
import { useResizer } from "../../hooks/use-resizer";
import { Column } from "./column";
import InfoIcon from "../../assets/help-icon.svg";

import "./model-component.scss";

const kMinColumnWidth = 220; // device + gap width
const kSelectedSamplesDivWidth = 65; //includes margin-right

interface IProps {
  model: IModel;
  selectedDeviceId?: Id;
  repeat: boolean;
  sampleSize: string;
  numSamples: string;
  enableRunButton: boolean;
  setSelectedDeviceId: (id: Id) => void;
  addDevice: (parentDevice: IDevice) => void;
  mergeDevices: (device: IDevice) => void;
  deleteDevice: (device: IDevice) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
  handleSampleSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNumSamplesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStartRun: () => void;
  handleUpdateCollectorVariables: (collectorVariables: IDevice["collectorVariables"]) => void;
  handleSelectRepeat: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSelectReplacement: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleClearData: () => void;
  handleAddVariable: (selectedVariable?: string) => void;
  handleDeleteVariable: (e: React.MouseEvent, selectedVariable?: string) => void;
  handleUpdateViewType: (viewType: IDevice["viewType"]) => void;
  handleEditVariable: (oldVariableIdx: number, newVariableName: string) => void;
  handleEditVarPct: (variableIdx: number, pctStr: string, updateNext?: boolean) => void;
}


export const ModelTab = ({ model, selectedDeviceId, repeat, sampleSize, numSamples, enableRunButton,
    addDevice, mergeDevices, deleteDevice, setSelectedDeviceId, handleNameChange,handleStartRun,
    handleUpdateCollectorVariables, handleSampleSizeChange, handleNumSamplesChange, handleSelectRepeat,
    handleSelectReplacement, handleClearData, handleAddVariable, handleDeleteVariable, handleUpdateViewType,
    handleEditVariable, handleEditVarPct}: IProps) => {
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
      <div className="model-header" style={modelHeaderStyle}>
        <div className="model-controls">
          <button className={`start-button ${!enableRunButton ? "disabled" : ""}`} onClick={handleStartRun}>START</button>
          <button className={`stop-button ${enableRunButton ? "disabled" : ""}`}>STOP</button>
          <SpeedSlider />
          <button className="clear-data-button" onClick={handleClearData}>CLEAR DATA</button>
        </div>
        <div className="select-repeat-controls">
          <div className="select-repeat-selection">
            <div className="select-repeat-dropdown">
              <select onChange={handleSelectRepeat}>
                <option className={`select-repeat-option`} value="select">Select</option>
                <option className={`select-repeat-option`} value="repeat">Repeat</option>
              </select>
            </div>
            <input type="text" id="sample_size" value={sampleSize} onChange={handleSampleSizeChange}></input>
            <span>{`${repeat ? "selecting" : ""} items`}</span>
            <div className="select-replacement-dropdown">
              <select onChange={handleSelectReplacement}>
                <option value="with">with replacement</option>
                <option value="without">without replacement</option>
              </select>
            </div>
          </div>
          {repeat &&
            <div className={`repeat-until-controls ${isWide ? "wide" : ""}`}>
              <span>until</span>
              <input type="text"></input>
              <InfoIcon onClick={handleOpenHelp}/>
              {showHelp && <HelpModal setShowHelp={setShowHelp}/>}
            </div>
          }
        </div>
        <div className="collect-controls">
          <span>Collect</span>
          <input type="text" id="num_samples" value={numSamples} onChange={handleNumSamplesChange}></input>
          <span>samples</span>
        </div>
      </div>
      <div className="model-container">
        <div className={`device-outputs-container`}>
          {model.columns.map((column, columnIndex) => {
            return (
              <div key={columnIndex} className="device-column">
                {column.devices.map(device => {
                  const sourceDevices = getSourceDevices(model, device);
                  return (
                    <React.Fragment key={device.id}>
                      <Device
                        model={model}
                        device={device}
                        selectedDeviceId={selectedDeviceId}
                        setSelectedDeviceId={setSelectedDeviceId}
                        addDevice={addDevice}
                        mergeDevices={mergeDevices}
                        deleteDevice={columnIndex !== 0 ? deleteDevice : undefined}
                        handleNameChange={handleNameChange}
                        handleUpdateCollectorVariables={handleUpdateCollectorVariables}
                        handleAddVariable={handleAddVariable}
                        handleDeleteVariable={handleDeleteVariable}
                        handleUpdateViewType={handleUpdateViewType}
                        handleEditVariable={handleEditVariable}
                        handleEditVarPct={handleEditVarPct}
                      />
                      {sourceDevices.map(sourceDevice => (
                        <Arrow
                          key={`${sourceDevice.id}-${device.id}`}
                          model={model}
                          selectedDeviceId={selectedDeviceId}
                          source={sourceDevice}
                          target={device}
                        />)
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <Column
                key={`column-${columnIndex}`}
                column={column}
                columnIndex={columnIndex}
                model={model}
                selectedDeviceId={selectedDeviceId}
                setSelectedDeviceId={setSelectedDeviceId}
                addDevice={addDevice}
                mergeDevices={mergeDevices}
                deleteDevice={columnIndex !== 0 ? deleteDevice : undefined}
                handleNameChange={handleNameChange}
                handleInputChange={handleInputChange}
                handleUpdateCollectorVariables={handleUpdateCollectorVariables}
              />
            );
          })}
          <div className="outputs">
            <div className="outputs-title">{`sample 1`}</div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface IHelpModal {
  setShowHelp: (show: boolean) => void;
}

const HelpModal = ({setShowHelp}: IHelpModal) => {
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
          Repeat Until allos the odel to continue drawing samples until a desired outcome -- the Condition specified -- occurs.
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
    </div>
  );
};

const SpeedSlider = () => {
  const [value, setValue] = useState(1);
  const speedValue = ["Slow", "Medium", "Fast", "Fastest"];
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(event.target.value, 10)); // Parse the value as an integer
  };

  return (
    <div className="speed-slider">
      <input
        type="range"
        min={0}
        max={3}
        value={value}
        onChange={handleChange}
        step={1}
        list="speedSettings"
        className="slider"
      />
      <div className="tick-marks-container">
          {speedValue.map((speed, i) => {
            return (
              <div className="tick-mark" key={`tick-${i}`}>
                <div className="tick-line"/>
              </div>
            );
          })}
      </div>
      <span id="speed-text" data-text="DG.plugin.Sampler.top-bar.medium-speed">
        {speedValue[value]}
      </span>
    </div>
  );
};
