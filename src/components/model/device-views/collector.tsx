import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Balls } from "./shared/balls";
import { IDevice, ClippingDef, IDataContext, IItem } from "../../../types";
import { useGlobalStateContext } from "../../../hooks/useGlobalState";
import { getAllItems, getListOfDataContexts } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "../../../contants";

// Force reload
import "./collector.scss";

interface IProps {
  device: IDevice;
  handleAddDefs: (def: ClippingDef) => void
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
}

export const Collector = ({device, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IProps) => {
  console.log("Collector component rendering with device:", device);
  
  const { globalState, setGlobalState } = useGlobalStateContext();
  const [ballsArray, setBallsArray] = useState<Array<string>>([]);
  const [dataContexts, setDataContexts] = useState<IDataContext[]>([]);
  const [selectedDataContext, setSelectedDataContext] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { collectorVariables, id: deviceId } = device;
  const { collectorContext } = globalState;
  const hasFetchedRef = useRef<boolean>(false);
  const dataContextsRef = useRef<IDataContext[]>([]);
  
  // Keep the ref in sync with the state
  useEffect(() => {
    dataContextsRef.current = dataContexts;
  }, [dataContexts]);
  
  console.log("Current state:", {
    dataContexts,
    selectedDataContext,
    isLoading,
    collectorVariables,
    collectorContext
  });

  // Fetch dataset items for a given context
  const fetchDatasetItems = useCallback(async (contextName: string) => {
    console.log("fetchDatasetItems called with contextName:", contextName);
    
    try {
      console.log("Fetching items for context:", contextName);
      const res = await getAllItems(contextName);
      console.log("getAllItems response:", res);
      
      if (!res || !res.values) {
        console.log("No items found or invalid response:", res);
        return;
      }
      
      const items = Array.isArray(res.values) ? res.values : [];
      console.log("Items fetched:", items);
      
      // Process the items to get the values
      const processedItems = items.map((item: IItem) => item.values);
      console.log("Processed items:", processedItems);
      
      // Update the global state with the items
      setGlobalState(draft => {
        console.log("Updating global state with items");
        
        // Find the device to update
        const deviceToUpdate = draft.model.columns.flatMap(col => col.devices).find(d => d.id === deviceId);
        
        if (deviceToUpdate) {
          // Store the full item objects with all their properties
          deviceToUpdate.collectorVariables = processedItems;
          console.log("Updated device collector variables:", deviceToUpdate.collectorVariables);
          
          // Also update the collectorContext in the global state
          if (dataContexts.length > 0) {
            const selectedContext = dataContexts.find(ctx => ctx.name === contextName);
            if (selectedContext) {
              draft.collectorContext = selectedContext;
              console.log("Updated global state with collector context:", selectedContext);
            }
          }
          
          // Instead of clearing the variables array, populate it with the first attribute values
          // This ensures the data is sent to the output table
          if (processedItems.length > 0) {
            const firstKey = Object.keys(processedItems[0])[0];
            const variableValues = processedItems.map(item => {
              if (item && typeof item === 'object' && firstKey in item) {
                return item[firstKey].toString();
              }
              return '';
            }).filter(Boolean);
            
            deviceToUpdate.variables = variableValues;
            console.log("Updated device variables with first attribute values:", variableValues);
          }
        } else {
          console.log("Device not found for update");
        }
      });
      
      // Set loading to false after updating
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching dataset items:", error);
      setIsLoading(false);
    }
  }, [deviceId, setGlobalState, dataContexts]);

  // Fetch available data contexts
  useEffect(() => {
    console.log("Collector useEffect for fetching data contexts running");
    
    // Skip fetching if we've already fetched data contexts and have a selected context
    if (hasFetchedRef.current && dataContextsRef.current.length > 0 && selectedDataContext) {
      console.log("Already fetched data contexts, skipping fetch");
      return;
    }
    
    const fetchDataContexts = async () => {
      console.log("fetchDataContexts function called");
      setIsLoading(true);
      try {
        console.log("Fetching data contexts");
        const res = await getListOfDataContexts();
        console.log("getListOfDataContexts response:", res);
        
        if (!res || !res.values) {
          console.log("No data contexts found or invalid response:", res);
          setDataContexts([]);
          setIsLoading(false);
          return;
        }
        
        // Filter out the Sampler Data context
        const values = Array.isArray(res.values) ? res.values : [];
        const filteredContexts = values.filter((context: IDataContext) => 
          context && context.name !== kDataContextName
        );
        console.log("Filtered contexts:", filteredContexts);
        
        // Check if the contexts have changed before updating state
        const contextsChanged = !arraysEqual(
          dataContextsRef.current.map(c => c.name || ""), 
          filteredContexts.map(c => c.name || "")
        );
        
        if (contextsChanged || dataContextsRef.current.length === 0) {
          console.log("Data contexts have changed or are empty, updating state");
          setDataContexts(filteredContexts);
          console.log("Data contexts set to:", filteredContexts);
          
          // Auto-select if there's only one dataset
          if (filteredContexts.length === 1) {
            console.log("Only one context available, auto-selecting");
            const context = filteredContexts[0];
            setSelectedDataContext(context.name || "");
            console.log("Selected data context set to:", context.name);
            
            setGlobalState(draft => {
              console.log("Updating global state with selected context");
              draft.collectorContext = context;
            });
            
            fetchDatasetItems(context.name);
          }
        }
        
        // Mark as fetched even if no contexts changed
        hasFetchedRef.current = true;
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data contexts:", error);
        setIsLoading(false);
      }
    };
    
    // Helper function to compare arrays
    function arraysEqual(a: any[], b: any[]) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
    
    fetchDataContexts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, fetchDatasetItems, selectedDataContext, setGlobalState]);

  // Update balls array when collector variables change
  useEffect(() => {
    console.log("Collector useEffect for updating balls array running");
    console.log("Current collector variables:", collectorVariables);
    
    if (collectorVariables && collectorVariables.length > 0) {
      console.log("Collector variables exist, processing");
      
      // Get the first key (attribute) from the first item
      const firstKey = Object.keys(collectorVariables[0])[0];
      console.log("First key:", firstKey);
      
      // Extract values for the first attribute from each item
      const onlyFirstKeyValues = collectorVariables.map((item) => {
        if (item && typeof item === 'object' && firstKey in item) {
          return item[firstKey].toString();
        }
        console.log("Invalid item in collector variables:", item);
        return '';
      }).filter(Boolean);
      
      console.log("Processed values:", onlyFirstKeyValues);
      setBallsArray(onlyFirstKeyValues);
      
      // Update the global state to ensure the output table is updated
      setGlobalState(draft => {
        // Make sure the device has the correct collector variables
        const deviceToUpdate = draft.model.columns.flatMap(col => col.devices).find(d => d.id === deviceId);
        if (deviceToUpdate) {
          if (!deviceToUpdate.collectorVariables || deviceToUpdate.collectorVariables.length === 0) {
            deviceToUpdate.collectorVariables = collectorVariables;
            console.log("Updated device collector variables in global state");
          }
          
          // Also update the variables array to ensure data is sent to the output table
          deviceToUpdate.variables = onlyFirstKeyValues;
          console.log("Updated device variables with first attribute values:", onlyFirstKeyValues);
        }
      });
    } else {
      console.log("No collector variables, setting empty balls array");
      setBallsArray([]);
    }
  }, [collectorVariables, deviceId, setGlobalState]);

  console.log("Rendering collector component with:", {
    isLoading,
    dataContexts,
    selectedDataContext,
    ballsArray
  });

  // Render a simplified version first to debug
  if (isLoading) {
    console.log("Rendering loading state");
    return <div className="collector-container">Loading datasets...</div>;
  }

  // If no data contexts are available, show a message
  if (!Array.isArray(dataContexts) || dataContexts.length === 0) {
    console.log("Rendering no datasets available message");
    console.log("dataContexts:", dataContexts);
    console.log("dataContexts is array:", Array.isArray(dataContexts));
    console.log("dataContexts length:", dataContexts.length);
    return (
      <div className="collector-container">
        <div className="dataset-selector">
          <p>No datasets available. Please create a dataset in CODAP first.</p>
        </div>
      </div>
    );
  }

  // Log the exact structure of dataContexts before rendering
  console.log("About to render with dataContexts:", JSON.stringify(dataContexts));
  console.log("selectedDataContext:", selectedDataContext);

  // Render the full component with buttons instead of select
  return (
    <div className="collector-container">
      <div className="dataset-selector" style={{ marginBottom: '10px' }}>
        <div className="dataset-label" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Select Dataset:</div>
        <div className="dataset-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {dataContexts.map((context) => {
            if (!context) {
              console.log("Found null or undefined context in dataContexts");
              return null;
            }
            const contextId = context.id || context.guid || Math.random().toString();
            const contextName = context.name || "";
            const displayName = context.title || context.name || "Unnamed dataset";
            const isSelected = contextName === selectedDataContext;
            
            console.log(`Rendering button: id=${contextId}, name=${contextName}, display=${displayName}, selected=${isSelected}`);
            return (
              <button
                key={contextId}
                style={{
                  padding: '5px 10px',
                  border: isSelected ? '2px solid #4a90e2' : '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: isSelected ? '#e6f2ff' : '#f8f8f8',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isSelected ? 'bold' : 'normal'
                }}
                onClick={() => {
                  console.log("Dataset button clicked:", contextName);
                  if (contextName) {
                    setSelectedDataContext(contextName);
                    
                    // Update the global state with the selected context
                    setGlobalState(draft => {
                      console.log("Updating global state with selected context");
                      draft.collectorContext = context;
                    });
                    
                    // Fetch the dataset items for the selected context
                    fetchDatasetItems(contextName);
                  }
                }}
                disabled={globalState.isRunning}
              >
                {displayName}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="collector-view">
        {Array.isArray(ballsArray) && ballsArray.length > 0 ? (
        <>
          <Balls
            ballsArray={ballsArray}
            deviceId={deviceId}
            handleAddDefs={handleAddDefs}
            handleSetSelectedVariable={handleSetSelectedVariable}
            handleSetEditingVarName={handleSetEditingVarName}
          />
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            {`Loaded ${ballsArray.length} items from dataset. Click Start to sample.`}
          </div>
        </>
        ) : (
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            No items loaded from dataset.
          </div>
        )}
      </div>
    </div>
  );
};
