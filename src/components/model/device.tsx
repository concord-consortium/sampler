import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { Mixer } from "./device-views/mixer";
import { Spinner } from "./device-views/spinner/spinner";
import { Collector } from "./device-views/collector";
import { NameLabelInput } from "./name-label-input";
import { PctLabelInput } from "./percent-label-input";
import { DeviceFooter } from "./device-footer";
import { kMixerContainerHeight, kMixerContainerWidth, kSpinnerContainerHeight, kSpinnerContainerWidth, kSpinnerX, kSpinnerY } from "./device-views/shared/constants";
import { codapInterface, createNewAttribute, getAllItems, getDataContext, getListOfDataContexts } from "@concord-consortium/codap-plugin-api";
import { createNewVarArray, getNextVariable, getPercentOfVar } from "../helpers";
import { calculateWedgePercentage } from "./device-views/shared/helpers";
import { SetVariableSeriesModal } from "./variable-setting-modal";
import DeleteIcon from "../../assets/delete-icon.svg";
import { parseSpecifier } from "../../utils/utils";
import { IDevice, IDataContext, ClippingDef, ViewType, IItem, IVariables } from "../../types";
import { removeDeviceFromFormulas } from "../../helpers/model-helpers";
import { DeviceVisibility } from "./device-visibility";
import { getCollectorAttrs, getCollectorItemValues } from "../../utils/collector";
import { deleteItemAttrs, getCollectionNames, getItemAttrs } from "../../helpers/codap-helpers";
import { getModelAttrs } from "../../utils/model";

import "./device.scss";

interface IProps {
  device: IDevice;
  columnIndex: number;
}

export const Device = (props: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { model, selectedDeviceId, collectorContextName, attrMap, repeat } = globalState;
  const { device, columnIndex } = props;
  const [dataContexts, setDataContexts] = useState<IDataContext[]>([]);
  //const [selectedDataContext, setSelectedDataContext] = useState<string>("");
  const [selectedVariableIdx, setSelectedVariableIdx] = useState<number|null>(null);
  const [isEditingVarName, setIsEditingVarName] = useState<boolean>(false);
  const [isEditingVarPct, setIsEditingVarPct] = useState<boolean>(false);
  const [viewBox, setViewBox] = useState<string>(`0 0 ${kMixerContainerWidth} ${kMixerContainerHeight}`);
  const [clippingDefs, setClippingDefs] = useState<ClippingDef[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOrigin, setDragOrigin] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [showVariableEditor, setShowVariableEditor] = useState<boolean>(false);
  const [dataContextCountChangedAt, setDataContextCountChangedAt] = useState<number>(0);
  const { viewType, variables } = device;
  const svgRef = useRef<SVGSVGElement>(null);
  const multipleColumns = model.columns.length > 1;
  const [maybeUpdateItemAttrsSignal, setMaybeUpdateItemAttrsSignal] = useState<number>(0);
  const lastUpdateItemAttrsSignalAt = useRef<number>(0);
  const [fixedVariables, setFixedVariables] = useState<IVariables>([]);

  const clearFixedVariables = () => setFixedVariables([]);
  const deletedFixedVariable = (variable: string) => setFixedVariables(fixedVariables.filter(v => v !== variable));

  const triggerMaybeUpdateItemAttrsSignal = () => setMaybeUpdateItemAttrsSignal(Date.now());

  const changeDataContext = useCallback(async (dataContextName: string) => {
    try {
      // ignore if we are not viewing the collector device
      if (viewType !== ViewType.Collector) {
        return;
      }

      // ignore picking the placeholder option
      if (dataContextName.length === 0) {
        return;
      }

      // ignore data contexts that might have disappeared
      const getDataContextResult = await getDataContext(dataContextName);
      if (!getDataContextResult.success) {
        return;
      }

      if (getDataContextResult.values.collections.length === 0) {
        throw new Error("No collections found in data context");
      }
      if (getDataContextResult.values.collections[0].attrs.length === 0) {
        throw new Error("No attributes found in the first collection of the data context");
      }

      const itemValues = await getCollectorItemValues(dataContextName);

      setGlobalState(draft => {
        draft.enableRunButton = true;
        draft.collectorContextName = dataContextName;
        draft.model.columns[0].devices[0].collectorVariables = itemValues;
      });

      // wait until the global state updates to trigger the maybe update item attrs signal
      setTimeout(() => {
        triggerMaybeUpdateItemAttrsSignal();
      }, 0);

    } catch (err) {
      alert(err);
    }
  }, [setGlobalState, viewType]);

  useEffect(() => {
    codapInterface.on('notify', 'documentChangeNotice', (message) => {
      if (message.values?.operation === "dataContextCountChanged") {
        setDataContextCountChangedAt(Date.now());
      }
    });
  }, []);

  // This effect is a little hacky, but it's the best way to ensure that the item attrs are updated
  // without causing an infinite loop of updates.  It uses a signal (which is just a timestamp)
  // to trigger the update.  When the signal is set the item attributes are checked and updated if
  // necessary based on these rules:
  //
  // * When the user switches from **Mixer** or **Spinner** to the **Collector**, if there are no data values
  //   belonging to the *output* attribute, the *output* attribute is deleted, replaced by the set of
  //   attributes belonging to the source dataset (from which cases will be collected). If there is no source dataset,
  //   then the *output* attribute is *not* deleted because otherwise there would be no attribute at the items level.
  // * When the user switches from the **Collector** to the **Mixer** or **Spinner**, if there are no data
  //   values belonging to the source dataset attributes, these attributes are deleted. The attribute(s)
  //   associated with the **Mixer** or **Spinner** device(s) are added at the **items** level.
  // * Note that attributes that have data values are *not* automatically deleted during these transitions.
  //   It's up to the user to decide to delete them either by pressing **Clear Data** or by manually deleting
  //   them in the case table.
  useEffect(() => {
    // ignore the starting value and only update when the signal changes
    if (maybeUpdateItemAttrsSignal === lastUpdateItemAttrsSignalAt.current) {
      return;
    }
    lastUpdateItemAttrsSignalAt.current = maybeUpdateItemAttrsSignal;

    // if we have more than one device in the model we don't need to automatically update the item attrs
    // as we could not be switching between collector and non-collector devices
    if (model.columns.length > 1) {
      return;
    }

    const maybeUpdate = async () => {
      const allItems = await getAllItems(globalState.dataContextName);
      if (!allItems.success) {
        return;
      }

      const isCollector = viewType === ViewType.Collector;

      const existingAttrs = await getItemAttrs(globalState.dataContextName);

      const collectorAttrs = getCollectorAttrs(model);
      const modelAttrs = getModelAttrs(model);
      const viewAttrs = isCollector ?  collectorAttrs : modelAttrs;
      const otherViewAttrs = isCollector ? modelAttrs : collectorAttrs;

      const attrsToAdd = viewAttrs.filter(attr => !existingAttrs.includes(attr));
      const maybeAttrsToDelete = existingAttrs.filter(attr => otherViewAttrs.includes(attr));

      const attrsToKeep = new Set<string>();
      allItems.values.forEach((item: IItem) => {
        maybeAttrsToDelete.forEach((attr: string) => {
          if (String(item.values[attr] ?? "").length > 0) {
            // keep the attribute if it has data values
            attrsToKeep.add(attr);
          }
        });
      });
      const attrsToDelete = maybeAttrsToDelete.filter(attr => !attrsToKeep.has(attr));

      attrsToAdd.forEach(async (attr) => {
        await createNewAttribute(globalState.dataContextName, getCollectionNames().items, attr);
      });
      await deleteItemAttrs(globalState.dataContextName, attrsToDelete);
    };
    maybeUpdate();
  }, [attrMap, globalState.dataContextName, maybeUpdateItemAttrsSignal, model, repeat, setGlobalState, viewType]);

  const maybeUpdateCollectorDataContext = useCallback(() => {
    const fetchDataContexts = async () => {
      const res = await getListOfDataContexts();
      return res.values;
    };

    fetchDataContexts().then((contexts: Array<IDataContext>) => {
      const filteredCtxs = contexts.filter((context) => context.name !== globalState.dataContextName);
      setDataContexts(filteredCtxs);

      let autoSelectedDataContext = filteredCtxs.find((context) => context.name === globalState.collectorContextName);
      if (!autoSelectedDataContext && filteredCtxs.length === 1) {
        autoSelectedDataContext = filteredCtxs[0];
      }

      if (autoSelectedDataContext) {
        changeDataContext(autoSelectedDataContext.name);
      }
    });
  }, [changeDataContext, globalState.collectorContextName, globalState.dataContextName]);

  useEffect(() => {
    maybeUpdateCollectorDataContext();
  }, [maybeUpdateCollectorDataContext]);

  useEffect(() => {
    if (viewType === ViewType.Collector) {
      maybeUpdateCollectorDataContext();
    } else {
      // when switching to a non-collector device, maybe update the item attrs
      triggerMaybeUpdateItemAttrsSignal();
    }

    if (viewType === ViewType.Spinner) {
      setViewBox(`0 0 ${kSpinnerContainerWidth + 10} ${kSpinnerContainerHeight}`);
    } else {
      setViewBox(`0 0 ${kMixerContainerWidth + 10} ${kMixerContainerHeight}`);
    }
  }, [viewType, globalState.dataContextName, globalState.collectorContextName, dataContextCountChangedAt, changeDataContext, maybeUpdateCollectorDataContext]);

  useEffect(() => {
    if (collectorContextName) {
      const fetchItems = async () => await getCollectorItemValues(collectorContextName);

      fetchItems().then((itemValues) => {
        setGlobalState(draft => {
          const deviceToUpdate = draft.model.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
          if (deviceToUpdate) {
            deviceToUpdate.collectorVariables = itemValues;
          }
        });
      });
    }
  }, [collectorContextName, selectedDeviceId, setGlobalState, columnIndex]);

  useEffect(() => {
    // when the viewtype changes deselect the selected variable
    setSelectedVariableIdx(null);
  }, [viewType]);

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
          const removedColumns = draft.model.columns.splice(columnIndex, draft.model.columns.length - columnIndex);

          // and remove all the attrMap entries for the removed columns
          removedColumns.forEach(removedColumn => {
            delete draft.attrMap[removedColumn.id];
          });
        }
        else {
          draft.model.columns[columnIndex].devices = devices;
        }
      }
    });
  };

  const handleSelectDataContext = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    changeDataContext(e.target.value);
  }, [changeDataContext]);

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
        clearFixedVariables();
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
        deletedFixedVariable(selectedVariable);
      } else {
        const lastVariable = variables[variables.length - 1];
        newVariables.push(...variables.filter((v) => v !== lastVariable));
        deletedFixedVariable(lastVariable);
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
    const newVariables = createNewVarArray(selectedVar, variables, fixedVariables, setFixedVariables, Number(newPct), updateNext);
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
        const newVariables = createNewVarArray(selectedVar, variables, fixedVariables, setFixedVariables, Number(newNicePct), true);
        handleUpdateVariables(newVariables);
      }
    }
  }, [isDragging, selectedVariableIdx, dragOrigin.x, dragOrigin.y, variables, device.id, fixedVariables, handleUpdateVariables]);

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
      <div className={`device-container ${isSelectedDevice ? "selected" : ""}`} data-device-id={device.id}>
        <DeviceVisibility device={device} columnIndex={columnIndex} />
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
            <div className="device-delete-icon" onClick={handleDeleteDevice}>
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
            clearFixedVariables={clearFixedVariables}
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

