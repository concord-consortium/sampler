import React, { useCallback, useEffect, useRef, useState } from "react";
import { ClippingDef, IDataContext, IDevice, IItem, IItems } from "../../models/device-model";
import { Id } from "../../utils/id";
import { IModel, getNumDevices, getSiblingDevices, getTargetDevices } from "../../models/model-model";
import { Mixer } from "./device-views/mixer/mixer";
import { Spinner } from "./device-views/spinner/spinner";
import { Collector } from "./device-views/collector";
import { NameLabelInput } from "./name-label-input";
import { PctLabelInput } from "./percent-label-input";
import { DeviceFooter } from "./device-footer";
import { kMixerContainerHeight, kMixerContainerWidth, kSpinnerContainerHeight, kSpinnerContainerWidth, kSpinnerX, kSpinnerY } from "./device-views/shared/constants";
import { getAllItems, getListOfDataContexts } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "../../utils/codap-helpers";
import { getNextVariable, getPercentOfVar } from "../helpers";
import { calculateWedgePercentage } from "./device-views/shared/helpers";
import DeleteIcon from "../../assets/delete-icon.svg";
import VisibleIcon from "../../assets/visibility-on-icon.svg";

import "./device.scss";

interface IProps {
  model: IModel;
  device: IDevice;
  selectedDeviceId?: Id;
  multipleColumns: boolean;
  addDevice: (parentDevice: IDevice) => void;
  mergeDevices: (device: IDevice) => void;
  deleteDevice?: (device: IDevice) => void;
  setSelectedDeviceId: (id: Id) => void;
  handleNameChange: (deviceId: string, newName: string) => void;
  handleUpdateCollectorVariables: (collectorVariables: IDevice["collectorVariables"]) => void;
  handleAddVariable: () => void;
  handleDeleteVariable: (e: React.MouseEvent, selectedVariable?: string) => void;
  handleUpdateViewType: (viewType: IDevice["viewType"]) => void;
  handleEditVariable: (oldVariableIdx: number, newVariableName: string) => void;
  handleEditVarPct: (variableIdx: number, pctStr: string, updateNext?: boolean) => void
}

export const Device = (props: IProps) => {
  const {model, device, selectedDeviceId, multipleColumns, setSelectedDeviceId, addDevice, mergeDevices,
    deleteDevice, handleUpdateCollectorVariables, handleAddVariable, handleUpdateViewType, handleDeleteVariable,
    handleEditVariable, handleEditVarPct} = props;
  const [dataContexts, setDataContexts] = useState<IDataContext[]>([]);
  const [selectedDataContext, setSelectedDataContext] = useState<string>("");
  const [selectedVariableIdx, setSelectedVariableIdx] = useState<number|null>(null);
  const [isEditingVarName, setIsEditingVarName] = useState<boolean>(false);
  const [isEditingVarPct, setIsEditingVarPct] = useState<boolean>(false);
  const [viewBox, setViewBox] = useState<string>(`0 0 ${kMixerContainerWidth} ${kMixerContainerHeight}`);
  const [clippingDefs, setClippingDefs] = useState<ClippingDef[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOrigin, setDragOrigin] = useState<{x: number, y: number}>({x: 0, y: 0});
  const { viewType, variables } = device;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fetchDataContexts = async () => {
      const res = await getListOfDataContexts();
      return res.values;
    };

    if (viewType === "collector") {
      fetchDataContexts().then((contexts: Array<IDataContext>) => {
        const filteredCtxs = contexts.filter((context) => context.name !== kDataContextName);
        setDataContexts(filteredCtxs);
      });
    }

    if (viewType === "spinner") {
      setViewBox(`0 0 ${kSpinnerContainerWidth + 10} ${kSpinnerContainerHeight}`);
    } else {
      setViewBox(`0 0 ${kMixerContainerWidth + 10} ${kMixerContainerHeight}`);
    }
  }, [viewType]);

  useEffect(() => {
    if (selectedDataContext) {
      const fetchItems = async () => {
        const res = await getAllItems(selectedDataContext);
        return res.values;
      };

      fetchItems().then((items: IItems) => {
        const itemValues = items.map((item: IItem) => item.values);
        handleUpdateCollectorVariables(itemValues);
      });
    }
  }, [selectedDataContext, handleUpdateCollectorVariables]);

  const handleSelectDevice = () => setSelectedDeviceId(device.id);
  const handleAddDevice = () => addDevice(device);
  const handleDeleteDevice = () => deleteDevice?.(device);
  const handleMergeDevices = () => mergeDevices(device);
  const handleSelectDataContext = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataContext(e.target.value);
  };

  const handleAddDefs = useCallback((def: { id: string, element: JSX.Element }) => {
    setClippingDefs(prevDefs => {
      const oldDef = prevDefs.find(prevDef => prevDef.id === def.id);
      if (oldDef) {
        const idxOfOldDef = prevDefs.indexOf(oldDef);
        const newDefs = [...prevDefs];
        newDefs.splice(idxOfOldDef, 1, def);
        return newDefs;
      } else {
        return [...prevDefs, def];
      }
    });
  }, []);

  const handleSetSelectedVariable = (variableIdx: number) => {
    setSelectedVariableIdx(variableIdx);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if ((e.target as HTMLElement).id === "svg-elemt") {
      setSelectedVariableIdx(null);
    }
  };

  const handleDeleteWedge = (e: React.MouseEvent, variableName: string) => {
    handleDeleteVariable(e, variableName);
    setSelectedVariableIdx(null);
  };

  const handlePctChange = useCallback((variableIdx: number, newPct: string, updateNext?: boolean) => {
    handleEditVarPct(variableIdx, newPct, updateNext);
  }, [handleEditVarPct]);

  const handleStartDrag = (originPt: {x: number, y: number}) => {
    setDragOrigin(originPt);
    setIsDragging(true);
  };

  const endDrag = () => {
    setIsDragging(false);
    setDragOrigin({x: 0, y: 0});
  };

  const convertDomCoordsToSvg = (x: number, y: number) =>{
    const svgEl = svgRef?.current;
    let svgX = 0;
    let svgY = 0;
    if (svgEl) {
      const svgMatrix = svgEl.getScreenCTM();
      const svgPt = svgEl.createSVGPoint();
      svgPt.x = x;
      svgPt.y = y;
      if (svgMatrix) {
        const svgCoords = svgPt.matrixTransform(svgMatrix.inverse());
        svgX = svgCoords.x;
        svgY = svgCoords.y;
      }
    }
    return {svgX, svgY};
  };

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    if (selectedVariableIdx !== null) {
      const { svgX, svgY } = convertDomCoordsToSvg(e.clientX, e.clientY);
      const args = {
        cx: kSpinnerX,
        cy: kSpinnerY,
        x1: dragOrigin.x,
        y1: dragOrigin.y,
        x2: svgX,
        y2: svgY
      };
      const newPct = calculateWedgePercentage(args);
      const newNicePct = Math.round(newPct);
      const htmlTarget = e.target as HTMLElement;
      const varName = variables[selectedVariableIdx];
      const nextVarName = getNextVariable(selectedVariableIdx, variables);
      const isWithinBounds = htmlTarget.id === `wedge-${varName}` || htmlTarget.id === `wedge-${nextVarName}`;
      if (isWithinBounds && (newNicePct > 1 && newNicePct < 100)) {
        handlePctChange(selectedVariableIdx, newNicePct.toString(), true);
      }
    }
  }, [dragOrigin, isDragging, selectedVariableIdx, variables, handlePctChange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", endDrag);
    } else {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", endDrag);
    }

    return () => {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", endDrag);
    };
  }, [isDragging, handleDrag]);

  const targetDevices = getTargetDevices(model, device);
  const siblingDevices = getSiblingDevices(model, device);
  const addButtonLabel = targetDevices.length === 0 ? "Add Device" : "Add Branch";
  const showCollectorButton = getNumDevices(model) === 1;
  const showMergeButton = siblingDevices.length > 0;
  const isSelectedDevice = device.id === selectedDeviceId;

  return (
    <div className={`device-controls-container ${multipleColumns ? "multiple-columns" : ""}`} onClick={handleSelectDevice}>
      <div className={`device-container ${isSelectedDevice ? "selected" : ""}`} data-device-id={device.id}>
        <div className="device-status-icon">
          {isSelectedDevice && <VisibleIcon />}
        </div>
        <div className="device-svg-container">
          <div className={`device-frame ${viewType}`}>
            <svg
              className="svg"
              ref={svgRef}
              id={`svg-elemt`}
              width="100%"
              height="100%"
              viewBox={viewBox}
              xmlns="http://www.w3.org/2000/svg"
              onClick={handleSvgClick}
            >
              <defs>
                {clippingDefs.length && clippingDefs.map((def) => def.element)}
              </defs>
              {
                viewType === "mixer" ?
                  <Mixer
                    variables={device.variables}
                    handleAddDefs={handleAddDefs}
                    handleSetSelectedVariable={handleSetSelectedVariable}
                    handleSetEditingVarName={() => setIsEditingVarName(true)}
                  /> :
                viewType === "spinner" ?
                  <Spinner
                    variables={device.variables}
                    selectedVariableIdx={selectedVariableIdx}
                    isDragging={isDragging}
                    handleAddDefs={handleAddDefs}
                    handleDeleteWedge={handleDeleteWedge}
                    handleSetSelectedVariable={handleSetSelectedVariable}
                    handleSetEditingVarName={() => setIsEditingVarName(true)}
                    handleSetEditingPct={() => setIsEditingVarPct(true)}
                    handleStartDrag={handleStartDrag}
                  /> :
                  <Collector
                    collectorVariables={device.collectorVariables}
                    handleAddDefs={handleAddDefs}
                    handleSetSelectedVariable={handleSetSelectedVariable}
                    handleSetEditingVarName={() => setIsEditingVarName(true)}
                  />
              }
            </svg>
            {
              isEditingVarName && selectedVariableIdx !== null &&
                <NameLabelInput
                  viewType={viewType}
                  variableIdx={selectedVariableIdx}
                  variableName={variables[selectedVariableIdx]}
                  handleEditVariable={handleEditVariable}
                  onBlur={() => setIsEditingVarName(false)}
                />
            }
            {
              isEditingVarPct && selectedVariableIdx !== null &&
                <PctLabelInput
                  percent={getPercentOfVar(variables[selectedVariableIdx], variables).toString()}
                  variableIdx={selectedVariableIdx}
                  variableName={variables[selectedVariableIdx]}
                  handlePctChange={handlePctChange}
                  onBlur={() => setIsEditingVarPct(false)}
                />
            }
          </div>
        </div>
        {deleteDevice &&
          <div className="device-delete-icon" onClick={handleDeleteDevice}>
            <DeleteIcon />
          </div>
        }
      </div>
      { device.id === selectedDeviceId &&
          <DeviceFooter
            showCollectorButton={showCollectorButton}
            showMergeButton={showMergeButton}
            dataContexts={dataContexts}
            addButtonLabel={addButtonLabel}
            viewType={viewType}
            handleAddVariable={handleAddVariable}
            handleAddDevice={handleAddDevice}
            handleDeleteVariable={handleDeleteVariable}
            handleUpdateViewType={handleUpdateViewType}
            handleSelectDataContext={handleSelectDataContext}
            handleMergeDevices={handleMergeDevices}
          />
      }
    </div>
  );
};
