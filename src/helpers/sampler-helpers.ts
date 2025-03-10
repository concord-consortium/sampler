import { IGlobalState, IDataContext } from "../types";
import { IMockGlobalState } from "../test-utils/mock-global-state";

/**
 * Helper functions for the Sampler plugin
 */

/**
 * Get the data context name from the global state
 * @param state The global state
 * @returns The data context name
 */
export const getDataContextName = (state: IGlobalState | IMockGlobalState): string => {
  // Check if the state is a mock state with dataContextName property
  if ('dataContextName' in state && state.dataContextName) {
    return state.dataContextName;
  }
  
  // Otherwise, use the sampler context name if available
  if (state.samplerContext) {
    return state.samplerContext.name;
  }
  
  return "Sampler Data";
};

/**
 * Get the instance ID from the global state
 * @param state The global state
 * @returns The instance ID
 */
export const getInstanceId = (state: IGlobalState | IMockGlobalState): string => {
  // Check if the state is a mock state with instanceId property
  if ('instanceId' in state && state.instanceId) {
    return state.instanceId;
  }
  
  return "sampler";
};

/**
 * Find a data context by name
 * @param state The global state
 * @param name The name to search for
 * @returns The data context or undefined if not found
 */
export const findDataContextByName = (state: IGlobalState, name: string): IDataContext | undefined => {
  return state.dataContexts.find(context => context.name === name);
}; 
