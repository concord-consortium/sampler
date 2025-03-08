import { Updater } from "use-immer";
import { IGlobalState, IDevice, ViewType } from "../../types";
import { FormulaReferenceTracker } from "./FormulaReferenceTracker";

/**
 * Singleton instance of the FormulaReferenceTracker
 */
const formulaTracker = new FormulaReferenceTracker();

/**
 * Initialize the formula tracker with the current state
 * 
 * @param state - The global state
 */
export const initializeFormulaTracker = (state: IGlobalState): void => {
  // Clear any existing tracking
  clearFormulaTracker();
  
  // Track all formulas in the state
  state.model.columns.forEach(column => {
    column.devices.forEach(device => {
      Object.entries(device.formulas).forEach(([targetId, formula]) => {
        const formulaId = `${device.id}-${targetId}`;
        formulaTracker.trackFormula(formulaId, formula);
      });
    });
  });
};

/**
 * Clear all tracked formulas
 */
export const clearFormulaTracker = (): void => {
  // Re-create the tracker (simplest way to clear everything)
  // This is a bit of a hack, but it works for now
  Object.getOwnPropertyNames(formulaTracker).forEach(prop => {
    if (prop !== 'constructor') {
      // Using type assertion with unknown first
      (formulaTracker as unknown as Record<string, Map<string, string>>)[prop] = new Map();
    }
  });
};

/**
 * Handle variable renaming in the global state
 * 
 * @param deviceId - The ID of the device containing the variable
 * @param oldName - The current variable name
 * @param newName - The new variable name
 * @param setGlobalState - The global state updater function
 * @returns An array of affected formula IDs
 */
export const handleVariableRename = (
  deviceId: string,
  oldName: string,
  newName: string,
  setGlobalState: Updater<IGlobalState>
): string[] => {
  // Update the variable name in the tracker
  const affectedReferences = formulaTracker.updateVariableName(oldName, newName);
  
  // Extract unique formula IDs
  const affectedFormulaIds = [...new Set(affectedReferences.map(ref => ref.formulaId))];
  
  // Update the global state
  setGlobalState(draft => {
    // Find all devices with formulas
    draft.model.columns.forEach(column => {
      column.devices.forEach(device => {
        // For each target device
        Object.keys(device.formulas).forEach(targetId => {
          const formulaId = `${device.id}-${targetId}`;
          
          // If this formula was affected
          if (affectedFormulaIds.includes(formulaId)) {
            // Get the updated formula
            const updatedFormula = formulaTracker.getUpdatedFormula(formulaId);
            
            // Update the formula in the state
            if (updatedFormula !== null) {
              device.formulas[targetId] = updatedFormula;
            }
          }
        });
      });
    });
    
    // Update the variable name in the device
    updateVariableNameInDevice(draft, deviceId, oldName, newName);
  });
  
  return affectedFormulaIds;
};

/**
 * Track a formula when it's added or updated
 * 
 * @param sourceId - The ID of the source device
 * @param targetId - The ID of the target device
 * @param formula - The formula string
 */
export const trackFormula = (sourceId: string, targetId: string, formula: string): void => {
  const formulaId = `${sourceId}-${targetId}`;
  formulaTracker.trackFormula(formulaId, formula);
};

/**
 * Remove a formula from tracking when it's deleted
 * 
 * @param sourceId - The ID of the source device
 * @param targetId - The ID of the target device
 */
export const removeFormula = (sourceId: string, targetId: string): void => {
  const formulaId = `${sourceId}-${targetId}`;
  formulaTracker.removeFormula(formulaId);
};

/**
 * Get all formulas that reference a variable
 * 
 * @param variableName - The variable name
 * @returns An array of formula IDs
 */
export const getFormulasReferencingVariable = (variableName: string): string[] => {
  return formulaTracker.getFormulasReferencingVariable(variableName);
};

/**
 * Update a variable name in a device
 * 
 * @param draft - The draft global state
 * @param deviceId - The ID of the device
 * @param oldName - The current variable name
 * @param newName - The new variable name
 */
const updateVariableNameInDevice = (
  draft: IGlobalState,
  deviceId: string,
  oldName: string,
  newName: string
): void => {
  // Find the device
  let device: IDevice | undefined;
  
  for (const column of draft.model.columns) {
    device = column.devices.find(d => d.id === deviceId);
    if (device) break;
  }
  
  if (!device) return;
  
  // Declare variables outside the switch statement
  let variableIndex: number;
  let spinnerVariableIndex: number;
  
  // Update the variable name based on the device type
  switch (device.viewType) {
    case ViewType.Mixer:
      // For Mixer devices, update the variable name in the variables array
      variableIndex = device.variables.indexOf(oldName);
      if (variableIndex >= 0) {
        device.variables[variableIndex] = newName;
      }
      break;
    
    case ViewType.Spinner:
      // For Spinner devices, update the variable name in the variables array
      spinnerVariableIndex = device.variables.indexOf(oldName);
      if (spinnerVariableIndex >= 0) {
        device.variables[spinnerVariableIndex] = newName;
      }
      break;
    
    case ViewType.Collector:
      // For Collector devices, update the attribute name in collector variables
      if (device.collectorVariables && device.collectorVariables.length > 0) {
        // Update attribute names in all collector items
        device.collectorVariables.forEach(item => {
          if (oldName in item) {
            const value = item[oldName];
            delete item[oldName];
            item[newName] = value;
          }
        });
      }
      break;
  }
}; 
