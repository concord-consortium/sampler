import React, { useState, useEffect } from 'react';
import { Balls } from "./shared/balls";
import { IDevice, ClippingDef, IDataContext, IItem, ICollectorItem } from "../../../types";
import { useGlobalStateContext } from "../../../hooks/useGlobalState";
import { getAllItems, getListOfDataContexts } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "../../../contants";

// Temporarily commented out to fix build issues
// import "./collector.scss";

interface IProps {
  device: IDevice;
  handleAddDefs: (def: ClippingDef) => void
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
}

export const Collector = ({device, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IProps) => {
  const { setGlobalState } = useGlobalStateContext();
  const [dataContexts, setDataContexts] = useState<IDataContext[]>([]);
  const [selectedDataContext, setSelectedDataContext] = useState<string | null>(null);
  const [ballsArray, setBallsArray] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDataContextsFetched, setHasDataContextsFetched] = useState(false);

  // Fetch data contexts on component mount
  useEffect(() => {
    if (hasDataContextsFetched) {
      return;
    }
    
    setHasDataContextsFetched(true);
    
    // Fetch dataset items when a context is selected
    const fetchDatasetItems = async (contextName: string) => {
      setIsLoading(true);
      
      try {
        const res = await getAllItems(contextName);
        
        if (!res.success || !res.values || !Array.isArray(res.values)) {
          setIsLoading(false);
          return;
        }
        
        const items = res.values;
        
        // Process items to extract the first attribute's values
        const processedItems: ICollectorItem[] = [];
        items.forEach((item: IItem, index: number) => {
          processedItems[index] = item as unknown as ICollectorItem;
        });
        
        // Update the device's collector variables in the global state
        setGlobalState(draft => {
          const deviceIndex = draft.model.columns.findIndex(col => 
            col.devices.some(d => d.id === device.id)
          );
          
          if (deviceIndex !== -1) {
            const deviceToUpdate = draft.model.columns[deviceIndex].devices.find(d => d.id === device.id);
            if (deviceToUpdate) {
              deviceToUpdate.collectorVariables = processedItems;
            }
          }
          
          // Store the selected context in the global state
          const selectedContext = dataContexts.find(ctx => ctx.name === contextName);
          if (selectedContext) {
            draft.collectorContext = selectedContext;
          }
        });
        
        // Extract the first attribute's values for display
        if (items.length > 0 && Object.keys(items[0]).length > 0) {
          const firstKey = Object.keys(items[0])[0];
          const variableValues = items.map(item => String(item[firstKey]));
          
          // Update the device's variables in the global state
          setGlobalState(draft => {
            const deviceIndex = draft.model.columns.findIndex(col => 
              col.devices.some(d => d.id === device.id)
            );
            
            if (deviceIndex !== -1) {
              const deviceToUpdate = draft.model.columns[deviceIndex].devices.find(d => d.id === device.id);
              if (deviceToUpdate) {
                deviceToUpdate.variables = variableValues;
              }
            }
          });
        }
      } catch (error) {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchDataContexts = async () => {
      setIsLoading(true);
      
      try {
        const res = await getListOfDataContexts();
        
        if (!res.success || !res.values || !Array.isArray(res.values)) {
          setIsLoading(false);
          return;
        }
        
        // Filter out the Sampler's own data context
        const filteredContexts = res.values.filter(context => {
          // Skip the Sampler's own data context
          if (context.name === kDataContextName) {
            return false;
          }
          
          // Skip contexts without a name
          return !!context.name;
        });
        
        // Only update state if contexts have changed or if there are no contexts
        if (JSON.stringify(filteredContexts) !== JSON.stringify(dataContexts) || filteredContexts.length === 0) {
          setDataContexts(filteredContexts);
          
          // Auto-select the first context if there's only one
          if (filteredContexts.length === 1) {
            const context = filteredContexts[0];
            setSelectedDataContext(context.name);
            
            // Update global state with the selected context
            setGlobalState(draft => {
              draft.collectorContext = context;
            });
            
            // Fetch items for the selected context
            fetchDatasetItems(context.name);
          }
        }
      } catch (error) {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDataContexts();
  }, [hasDataContextsFetched, dataContexts, setGlobalState, device.id]);
  
  // Update balls array when collector variables change
  useEffect(() => {
    const { collectorVariables } = device;
    
    if (collectorVariables && Object.keys(collectorVariables).length > 0) {
      // Get the first item to determine the first attribute
      const firstItem = collectorVariables[0];
      if (firstItem && Object.keys(firstItem).length > 0) {
        const firstKey = Object.keys(firstItem)[0];
        
        // Extract values for the first attribute
        const onlyFirstKeyValues = Object.values(collectorVariables).map(item => {
          if (!item || typeof item !== 'object') {
            return '';
          }
          return String(item[firstKey] || '');
        });
        
        setBallsArray(onlyFirstKeyValues);
        
        // Update the device's collector variables in the global state
        setGlobalState(draft => {
          const deviceIndex = draft.model.columns.findIndex(col => 
            col.devices.some(d => d.id === device.id)
          );
          
          if (deviceIndex !== -1) {
            const deviceToUpdate = draft.model.columns[deviceIndex].devices.find(d => d.id === device.id);
            if (deviceToUpdate) {
              deviceToUpdate.variables = onlyFirstKeyValues;
            }
          }
        });
      }
    } else {
      // No collector variables, set empty balls array
      setBallsArray([]);
    }
  }, [device, device.collectorVariables, setGlobalState]);
  
  // Handle dataset selection
  const handleDatasetSelect = (contextName: string) => {
    setSelectedDataContext(contextName);
    
    // Fetch items for the selected context
    const fetchItems = async () => {
      setIsLoading(true);
      
      try {
        const res = await getAllItems(contextName);
        
        if (!res.success || !res.values || !Array.isArray(res.values)) {
          setIsLoading(false);
          return;
        }
        
        const items = res.values;
        
        // Process items to extract the first attribute's values
        const processedItems: ICollectorItem[] = [];
        items.forEach((item: IItem, index: number) => {
          processedItems[index] = item as unknown as ICollectorItem;
        });
        
        // Update the device's collector variables in the global state
        setGlobalState(draft => {
          const deviceIndex = draft.model.columns.findIndex(col => 
            col.devices.some(d => d.id === device.id)
          );
          
          if (deviceIndex !== -1) {
            const deviceToUpdate = draft.model.columns[deviceIndex].devices.find(d => d.id === device.id);
            if (deviceToUpdate) {
              deviceToUpdate.collectorVariables = processedItems;
            }
          }
          
          // Store the selected context in the global state
          const selectedContext = dataContexts.find(ctx => ctx.name === contextName);
          if (selectedContext) {
            draft.collectorContext = selectedContext;
          }
        });
        
        // Extract the first attribute's values for display
        if (items.length > 0 && Object.keys(items[0]).length > 0) {
          const firstKey = Object.keys(items[0])[0];
          const variableValues = items.map(item => String(item[firstKey]));
          
          // Update the device's variables in the global state
          setGlobalState(draft => {
            const deviceIndex = draft.model.columns.findIndex(col => 
              col.devices.some(d => d.id === device.id)
            );
            
            if (deviceIndex !== -1) {
              const deviceToUpdate = draft.model.columns[deviceIndex].devices.find(d => d.id === device.id);
              if (deviceToUpdate) {
                deviceToUpdate.variables = variableValues;
              }
            }
          });
        }
      } catch (error) {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItems();
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="collector-container">
        <div className="dataset-selector">
          <span className="loading-message">Loading datasets...</span>
        </div>
      </div>
    );
  }
  
  // Render no datasets available message
  if (!dataContexts || !Array.isArray(dataContexts) || dataContexts.length === 0) {
    return (
      <div className="collector-container">
        <div className="dataset-selector">
          <span className="no-datasets-message">No datasets available</span>
        </div>
      </div>
    );
  }
  
  // Render dataset selector and collector view
  return (
    <div className="collector-container">
      <div className="dataset-selector">
        <label htmlFor="dataset-select">Dataset:</label>
        <select 
          id="dataset-select"
          value={selectedDataContext || ''}
          onChange={(e) => handleDatasetSelect(e.target.value)}
        >
          {dataContexts.map(context => {
            if (!context || !context.name) return null;
            
            const contextId = context.id || context.guid;
            const contextName = context.name;
            const displayName = context.title || contextName;
            
            return (
              <option 
                key={`${contextId}-${contextName}`} 
                value={contextName}
              >
                {displayName}
              </option>
            );
          })}
        </select>
      </div>
      <div className="collector-view">
        <Balls 
          ballsArray={ballsArray}
          deviceId={device.id}
          handleAddDefs={handleAddDefs}
          handleSetSelectedVariable={handleSetSelectedVariable}
          handleSetEditingVarName={handleSetEditingVarName}
        />
      </div>
    </div>
  );
};
