import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { Mixer } from "./device-views/mixer";
import { Spinner } from "./device-views/spinner/spinner";
import { Collector } from "./device-views/collector";
import { NameLabelInput } from "./name-label-input";
import { PctLabelInput } from "./percent-label-input";
import { DeviceFooter } from "./device-footer";
import { kMixerContainerHeight, kMixerContainerWidth, kSpinnerContainerHeight, kSpinnerContainerWidth, kSpinnerX, kSpinnerY } from "./device-views/shared/constants";
import { kDataContextName } from "../../contants";
import { getAllItems, getListOfDataContexts } from "@concord-consortium/codap-plugin-api";
import { createNewVarArray, getNextVariable, getPercentOfVar } from "../helpers";
import { calculateWedgePercentage } from "./device-views/shared/helpers";
import { SetVariableSeriesModal } from "./variable-setting-modal";
import DeleteIcon from "../../assets/delete-icon.svg";
import VisibleIcon from "../../assets/visibility-on-icon.svg";
import { parseSpecifier } from "../../utils/utils";
import { IDevice, IDataContext, ClippingDef, ViewType, IItems, IItem, IVariables } from "../../types";
import { removeDeviceFromFormulas } from "../../helpers/model-helpers";

import "./device.scss";

interface IProps {
  device: IDevice;
  columnIndex: number;
}

export const Device = (props: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { model, selectedDeviceId } = globalState;
  const { device, columnIndex } = props;
  const [dataContexts, setDataContexts] = useState<IDataContext[]>([]);
  const [selectedDataContext, setSelectedDataContext] = useState<string>("");
  const [selectedVariableIdx, setSelectedVariableIdx] = useState<number|null>(null);
  const [isEditingVarName, setIsEditingVarName] = useState<boolean>(false);
  const [isEditingVarPct, setIsEditingVarPct] = useState<boolean>(false);
  const [viewBox, setViewBox] = useState<string>(`0 0 ${kMixerContainerWidth} ${kMixerContainerHeight}`);
  const [clippingDefs, setClippingDefs] = useState<ClippingDef[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOrigin, setDragOrigin] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [showVariableEditor, setShowVariableEditor] = useState<boolean>(false);
  const { viewType, variables } = device;
  const svgRef = useRef<SVGSVGElement>(null);
  const multipleColumns = model.columns.length > 1;

  useEffect(() => {
    const fetchDataContexts = async () => {
      const res = await getListOfDataContexts();
      return res.values;
    };

    if (viewType === ViewType.Collector) {
      fetchDataContexts().then((contexts: Array<IDataContext>) => {
        const filteredCtxs = contexts.filter((context) => context.name !== kDataContextName);
        setDataContexts(filteredCtxs);
      });
    }

    if (viewType === ViewType.Spinner) {
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
        setGlobalState(draft => {
          const deviceToUpdate = draft.model.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
          if (deviceToUpdate) {
            deviceToUpdate.collectorVariables = itemValues;
          }
        });
      });
    }
  }, [selectedDataContext, selectedDeviceId, setGlobalState, columnIndex]);


  const handleSelectDevice = () => {
    setGlobalState(draft => {
      draft.selectedDeviceId = device.id;
    });
  };

  const handleDeleteDevice = () => {
    setGlobalState(draft => {
      const devices = draft.model.columns[columnIndex].devices.filter(dev => dev.id !== device.id);
      const noMoreDevicesInThisColumn = devices.length === 0;
      const hasColumnsToTheRight = draft.model.columns.length > columnIndex + 1;
      const question = noMoreDevicesInThisColumn && hasColumnsToTheRight ? "Delete this device and all the devices to the right of it?" : "Delete this device?";
      if (confirm(question)) {
        removeDeviceFromFormulas(draft.model, device.id);

        if (noMoreDevicesInThisColumn) {
          // when last device in a column is deleted delete this column and all the devices to the right if they exist
          draft.model.columns.splice(columnIndex, draft.model.columns.length - columnIndex);
        }
        else {
          draft.model.columns[columnIndex].devices = devices;
        }
      }
    });
  };

  const handleSelectDataContext = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataContext(e.target.value);
  };

  const handleSpecifyVariables = () => {
    setShowVariableEditor(true);
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

  const handleUpdateVariables = useCallback((newVariables: IVariables) => {
    setGlobalState(draft => {
      const deviceToUpdate = draft.model.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
      if (deviceToUpdate) {
        deviceToUpdate.variables = newVariables;
      }
    });
  }, [selectedDeviceId, setGlobalState, columnIndex]);

  const handleUpdateVariablesToSeries = (series: string) => {
    if (series) {
      const sequence = parseSpecifier(series, "to");
      if (sequence) {
        // swap contents of sequence into variables without updating variables reference
        handleUpdateVariables(sequence);
      }
      else { alert("parse error in sequence"); }
    }
  };

  const handleDeleteVariable = (e: React.MouseEvent, selectedVariable?: string) => {
    if (selectedDeviceId !== device.id) return;
    if (viewType === ViewType.Mixer && variables.length === 1) return;
    if (viewType === ViewType.Spinner && [...new Set(variables)].length === 1) return;

    let newVariables: IVariables = [];
    if (viewType === ViewType.Mixer) {
      newVariables.push(...variables.slice(0, variables.length - 1));
    } else {
      if (selectedVariable) {
        newVariables.push(...variables.filter((v) => v !== selectedVariable));
      } else {
        const lastVariable = variables[variables.length - 1];
        newVariables.push(...variables.filter((v) => v !== lastVariable));
      }
    }
    handleUpdateVariables(newVariables);
  };

  const handleDeleteWedge = (e: React.MouseEvent, variableName: string) => {
    handleDeleteVariable(e, variableName);
    setSelectedVariableIdx(null);
  };

  const handlePctChange = (variableIdx: number, newPct: string, updateNext?: boolean) => {
    const selectedVar = variables[variableIdx];
    const newVariables = createNewVarArray(selectedVar, variables, Number(newPct), updateNext);
    handleUpdateVariables(newVariables);
  };

  const handleEditVariable = (oldVariableIdx: number, newVariableName: string) => {
    const newVariables: IVariables = [];
    if (viewType === ViewType.Mixer || viewType === ViewType.Collector) {
      newVariables.push(...variables);
      newVariables[oldVariableIdx] = newVariableName;
    } else {
      const oldVariableName = variables[oldVariableIdx];
      newVariables.push(...variables.map((v) => v === oldVariableName ? newVariableName : v));
    }
    handleUpdateVariables(newVariables);
  };

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
      const isWithinBounds = htmlTarget.id === `${device.id}-wedge-${varName}` || htmlTarget.id === `${device.id}-wedge-${nextVarName}`;
      if (isWithinBounds && (newNicePct > 1 && newNicePct < 100)) {
        const selectedVar = variables[selectedVariableIdx];
        const newVariables = createNewVarArray(selectedVar, variables, Number(newNicePct), true);
        handleUpdateVariables(newVariables);
      }
    }
  }, [dragOrigin, isDragging, selectedVariableIdx, variables, device.id, handleUpdateVariables]);

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

  const isSelectedDevice = device.id === selectedDeviceId;

  return (
    <div className={`device-controls-container ${multipleColumns ? "multiple-columns" : ""}`} onClick={handleSelectDevice}>
      <div className={`device-container ${isSelectedDevice ? "selected" : ""}`} data-device-id={device.id} data-testid="device-container">
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
                viewType === ViewType.Mixer ?
                  <Mixer
                    device={device}
                    handleAddDefs={handleAddDefs}
                    handleSetSelectedVariable={handleSetSelectedVariable}
                    handleSetEditingVarName={() => setIsEditingVarName(true)}
                  /> :
                viewType === ViewType.Spinner ?
                  <Spinner
                    device={device}
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
                    device={device}
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
                  deviceId={device.id}
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
                  deviceId={device.id}
                  variableIdx={selectedVariableIdx}
                  variableName={variables[selectedVariableIdx]}
                  handlePctChange={handlePctChange}
                  onBlur={() => setIsEditingVarPct(false)}
                />
            }
          </div>
        </div>
        { columnIndex !== 0 && isSelectedDevice &&
            <div className="device-delete-icon" onClick={handleDeleteDevice} data-testid="delete-device-button">
              <DeleteIcon />
            </div>
        }
      </div>
      { device.id === selectedDeviceId &&
          <DeviceFooter
            device={device}
            columnIndex={columnIndex}
            dataContexts={dataContexts}
            handleUpdateVariables={handleUpdateVariables}
            handleDeleteVariable={handleDeleteVariable}
            handleSelectDataContext={handleSelectDataContext}
            handleSpecifyVariables={handleSpecifyVariables}
          />
      }
      {showVariableEditor &&
        <SetVariableSeriesModal
          setShowVariableEditor={setShowVariableEditor}
          handleUpdateVariablesToSeries={handleUpdateVariablesToSeries}
        />}
    </div>
  );
};
