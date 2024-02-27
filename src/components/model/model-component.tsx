import React, { useState } from "react";
import { IModel } from "../../models/model-model";
import { IDevice } from "../../models/device-model";
import { Id } from "../../utils/id";
import { useResizer } from "../../hooks/use-resizer";
import { Column } from "./column";
import { ModelHeader } from "./model-header";

import "./model-component.scss";

interface IProps {
  model: IModel;
  selectedDeviceId?: Id;
  repeat: boolean;
  sampleSize: string;
  numSamples: string;
  enableRunButton: boolean;
  modelHeaderStyle: React.CSSProperties;
  modelIsRunning: boolean;
  setSelectedDeviceId: (id: Id) => void;
  addDevice: (parentDevice: IDevice) => void;
  mergeDevices: (device: IDevice) => void;
  deleteDevice: (device: IDevice) => void;
  handleNameChange: (deviceId: Id, newName: string) => void;
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
  setModelIsRunning: (isRunning: boolean) => void;
}

export const ModelTab = ({ model, selectedDeviceId, repeat, sampleSize, numSamples, enableRunButton, modelHeaderStyle, modelIsRunning,
    addDevice, mergeDevices, deleteDevice, setSelectedDeviceId, handleNameChange,handleStartRun,
    handleUpdateCollectorVariables, handleSampleSizeChange, handleNumSamplesChange, handleSelectRepeat,
    handleSelectReplacement, handleClearData, handleAddVariable, handleDeleteVariable, handleUpdateViewType,
    handleEditVariable, handleEditVarPct, setModelIsRunning}: IProps) => {
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


  return (
    <div className="model-tab">
      <ModelHeader
        modelHeaderStyle={modelHeaderStyle}
        enableRunButton={enableRunButton}
        repeat={repeat}
        sampleSize={sampleSize}
        numSamples={numSamples}
        handleStartRun={handleStartRun}
        handleSampleSizeChange={handleSampleSizeChange}
        handleNumSamplesChange={handleNumSamplesChange}
        handleSelectRepeat={handleSelectRepeat}
        handleSelectReplacement={handleSelectReplacement}
        handleClearData={handleClearData}
        showHelp={showHelp}
        setShowHelp={setShowHelp}
        isWide={isWide}
        setIsWide={setIsWide}
        handleOpenHelp={handleOpenHelp}
      />
      <div className="model-container">
        <div className={`device-outputs-container`}>
            {model.columns.map((column, columnIndex) => {
              return (
                <Column
                  key={`column-${columnIndex}`}
                  column={column}
                  columnIndex={columnIndex}
                  model={model}
                  selectedDeviceId={selectedDeviceId}
                  modelIsRunning={modelIsRunning}
                  numSamples={numSamples} //temporary so we don't run forever
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
                  setModelIsRunning={setModelIsRunning}
                />
              );
            })}
          <div className="outputs">
            <div className="outputs-title">{`sample 1`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
