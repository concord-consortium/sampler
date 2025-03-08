import {
  IResult,
  codapInterface,
  createChildCollection,
  createDataContext,
  createNewAttribute,
  createParentCollection,
  getAllItems,
  getAttributeList,
  getDataContext,
  getAttribute,
  updateAttribute} from "@concord-consortium/codap-plugin-api";
import { AttrMap, IAttribute, IGlobalState } from "../types";
import { Updater } from "use-immer";

export const kDataContextName = "Sampler";
type TCODAPRequest = { action: string; resource: string; };

export const evaluateResult = async (formula: string, value: Record<string, string>) => {
  const tMsg = {
    "action": "notify",
    "resource": "formulaEngine",
    "values": {
      "request": "evalExpression",
      "source": formula,
      "records": [
        value
      ]
    }
  };
  const formulaRes = await codapInterface.sendRequest(tMsg) as IResult;
  if (formulaRes.success) {
    return formulaRes.values[0]; // boolean
  }
  throw new Error("Formula evaluation failed");
};

const getCollectionNames = () => {
  return {
    experiments: "experiments",
    samples: "samples",
    items: "items"
  };
};

const updateAttributeIds = async (attrs: Array<string>, attrMap: AttrMap, setGlobalState: Updater<IGlobalState>) => {
  const allAttrs = [
    {collection: "experiments", attrName: attrMap.experiment.name},
    {collection: "experiments", attrName: attrMap.description.name},
    {collection: "experiments", attrName: attrMap.sample_size.name},
    {collection: "experiments", attrName: attrMap.experimentHash.name},
    {collection: "samples", attrName: attrMap.sample.name},
  ];
  const isKeyOfAttrMap = (key: any): key is keyof AttrMap => key in attrMap;

  attrs.forEach(attr => allAttrs.push({collection: "samples", attrName: attr}));

  const reqs: TCODAPRequest[] = allAttrs.map(collectionAttr => ({
    "action": "get",
    "resource": `dataContext[${kDataContextName}].collection[${collectionAttr.collection}].attribute[${collectionAttr.attrName}]`
  }));

  await codapInterface.sendRequest(reqs, (getAttrsResult: any[]) => {
    getAttrsResult.forEach((res: {success: boolean, values: Record<string, string>}) => {
      if (res.success) {
        const matchingKey = Object.keys(attrMap).find(key => isKeyOfAttrMap(key) && attrMap[key].name === res.values.name);
        if (matchingKey) {
          setGlobalState((draft => {
            draft.attrMap[matchingKey as keyof AttrMap].codapID = res.values.id;
          }));
        }
      }
    });
  });
};

// the current @concord-consortium/codap-plugin-api createTable method does not have a way to pass width (or title) options so
// this has to be done with a direct CODAP api request
const createWideTable = async () => {
  return codapInterface.sendRequest({
    action: "create",
    resource: "component",
    values: {
      type: "caseTable",
      dataContext: kDataContextName,
      title: "Sampler Data",
      dimensions: {
        width: 1000,
        height: 200
      }
    }
  }) as unknown as IResult;
};

export const hasSamplesCollection = async (): Promise<boolean> => {
  const collectionNames = getCollectionNames();
  const dataContextRes = await getDataContext(kDataContextName);
  const collections = (dataContextRes.success ? dataContextRes.values?.collections ?? [] : []) as Array<{name: string}>;
  return !!collections.find(c => c.name === collectionNames.samples);
};

export const findOrCreateDataContext = async (attrs: Array<string>, attrMap: AttrMap, setGlobalState: Updater<IGlobalState>): Promise<boolean> => {
  const collectionNames = getCollectionNames();
  const dataContextRes = await getDataContext(kDataContextName);
  if (dataContextRes.success) {
    // ensure that if a user deleted a CODAP attr representing a device column, it is reinstated
    const attrList = (await getAttributeList(kDataContextName, collectionNames.items)).values;
    const attrNames = attrList.map((attr: {id: number, name: string, title: string}) => attr.name);
    const missingAttrs = attrs.filter(attr => !attrNames.includes(attr));
    if (missingAttrs.length > 0) {
      missingAttrs.forEach(async (attr) => {
        await createNewAttribute(kDataContextName, collectionNames.items, attr);
      });
    }
    await updateAttributeIds(attrs, attrMap, setGlobalState);
    return true;
  } else {
    const createRes = await createDataContext(kDataContextName);
    const itemsAttrs: IAttribute[] = [];
    if (createRes.success) {
      setGlobalState((draft) => {
        draft.samplerContext = createRes.values;
      });
      const parentAttrs = [
        {name: attrMap.experiment.name, type: "categorical"},
        {name: attrMap.description.name, type: "categorical"},
        {name: attrMap.sample_size.name, type: "categorical"},
        {name: attrMap.experimentHash.name, type: "categorical", hidden: "true"}
      ];
      const sampleAttrs = [{name: attrMap.sample.name, type: "categorical"}];
      attrs.forEach( attr => itemsAttrs.push({name: attr}));
      const createExperimentsCollection = await createParentCollection(kDataContextName, collectionNames.experiments, parentAttrs as any);
      if (createExperimentsCollection.success) {
        const createSamplesCollection =
          await createChildCollection(kDataContextName, collectionNames.samples, collectionNames.experiments, sampleAttrs);
        if (createSamplesCollection.success) {
          const createOutputCollection =
            await createChildCollection(kDataContextName, collectionNames.items, collectionNames.samples, itemsAttrs);
          if (createOutputCollection.success) {
            const tableRes = await createWideTable();
            if (tableRes.success) {
              await updateAttributeIds(attrs, attrMap, setGlobalState);
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
};

export const deleteAll = (attrMap: AttrMap) => {
  codapInterface.sendRequest({
    action: "delete",
    resource: `dataContext[${kDataContextName}].collection[${attrMap.experiment.name}].allCases`
  });
};

export const addMeasure = (measureName: string, measureType: string, formula: string) => {
  const samplesColl = getCollectionNames().samples;

  codapInterface.sendRequest({
    action: "get",
    resource: `dataContext[${kDataContextName}].collection[${samplesColl}].attributeList`
  }).then((res: any) => {
    const attrs = res.values;
    let newAttributeName = measureName ? measureName : measureType;
    // check if attr name is already used. user could add "conditional count" twice, for example,
    // but have difference formulas (output = a, output = b)
    const attrNameAlreadyUsed = attrs.find((attr: any) => attr.name === newAttributeName);

      if (!attrNameAlreadyUsed) {
        codapInterface.sendRequest({
          action: 'create',
          resource: `dataContext[${kDataContextName}].collection[${samplesColl}].attribute`,
          values: [{
            name: newAttributeName,
            type: "numeric",
            formula
          }]
        });
      } else if (attrNameAlreadyUsed && !measureName) {
        const attrsWithSameName = attrs.filter((attr: any) => attr.name.startsWith(newAttributeName));
        const indexes = attrsWithSameName.map((attr: any) => Number(attr.name.slice(newAttributeName.length)));
        const highestIndex = Math.max(...indexes);
        if (!highestIndex) {
          newAttributeName = newAttributeName + 1;
        } else {
          for (let i = 1; i <= highestIndex; i++) {
            const nameWithIndex = newAttributeName + i;
            const isNameWithIndexUsed = attrsWithSameName.find((attr: any) => attr.name === nameWithIndex);
            if (!isNameWithIndexUsed) {
              newAttributeName = nameWithIndex;
              break;
            } else if (i === highestIndex) {
              newAttributeName = newAttributeName + (highestIndex + 1);
            }
          }
        }
        codapInterface.sendRequest({
          action: 'create',
          resource: `dataContext[${kDataContextName}].collection[${samplesColl}].attribute`,
          values: [{
            name: newAttributeName,
            type: "numeric",
            formula
          }]
        });
      } else if (attrNameAlreadyUsed && measureName) {
        codapInterface.sendRequest({
          action: 'update',
          resource: `dataContext[${kDataContextName}].collection[${samplesColl}].attribute[${measureName}]`,
          values: {
            formula
          }
        });
      }
    });
};

export const getNewExperimentInfo = async (experimentHash: string) => {
  let experimentNum = 1;
  let startingSampleNumber = 1;

  const result = await getAllItems(kDataContextName);
  if (!result.success) {
    throw new Error("Sorry, the data context was not found!");
  }

  // any cases?
  if (result.values.length > 0) {
    // check if the experiment already exists
    const matchingHashItems = result.values.filter((item: any) => item.values?.experimentHash === experimentHash);

    if (matchingHashItems.length > 0) {
      // matching experiment found
      experimentNum = matchingHashItems[0].values.experiment;

      const maxSample = matchingHashItems.reduce((acc: number, cur: any) => {
        return Math.max(acc, cur.values.sample);
      }, 0);
      startingSampleNumber = maxSample + 1;
    } else {
      // no matching experiments so add an experiment
      const maxExperimentNum = result.values.reduce((acc: number, cur: any) => {
        return Math.max(acc, cur.values.experiment);
      }, 0);
      experimentNum = maxExperimentNum + 1;
    }
  }

  return {experimentNum, startingSampleNumber};
};

/**
 * Renames an attribute in a CODAP data context by creating a new attribute with the new name,
 * copying the data, and then deleting the old attribute.
 * 
 * @param dataContextName - The name of the data context
 * @param collectionName - The name of the collection
 * @param oldName - The current name of the attribute
 * @param newName - The new name for the attribute
 * @returns A promise that resolves when the operation is complete
 */
export const renameAttribute = async (
  dataContextName: string,
  collectionName: string,
  oldName: string,
  newName: string
): Promise<void> => {
  console.log("renameAttribute called with:", { dataContextName, collectionName, oldName, newName });

  try {
    // Step 1: Get all cases with their values
    console.log("Getting all cases with values");
    const getAllCasesMsg = {
      "action": "get",
      "resource": `dataContext[${dataContextName}].collection[${collectionName}].allCases`
    };
    const allCasesResult = await codapInterface.sendRequest(getAllCasesMsg) as IResult;
    console.log("allCasesResult:", allCasesResult);

    if (!allCasesResult.success) {
      console.error("Failed to get all cases:", allCasesResult);
      return;
    }

    // Log the structure of the response to understand it better
    console.log("allCasesResult.values type:", typeof allCasesResult.values);
    
    // Extract the cases from the response
    let cases: any[] = [];
    if (allCasesResult.values && allCasesResult.values.cases && Array.isArray(allCasesResult.values.cases)) {
      cases = allCasesResult.values.cases;
      console.log(`Found ${cases.length} cases in allCasesResult.values.cases`);
    }
    
    // If we couldn't find cases in the expected location, try to log more details
    if (cases.length === 0) {
      console.log("allCasesResult.values:", JSON.stringify(allCasesResult.values).substring(0, 200) + "...");
      
      // Try to find cases in other possible locations
      if (Array.isArray(allCasesResult.values)) {
        cases = allCasesResult.values;
        console.log(`Found ${cases.length} cases in allCasesResult.values array`);
      } else if (allCasesResult.values && typeof allCasesResult.values === 'object') {
        // Log all keys to help debug
        console.log("Keys in allCasesResult.values:", Object.keys(allCasesResult.values));
        
        // Check if there's a 'case' property
        if (allCasesResult.values.case) {
          console.log("Found 'case' property in allCasesResult.values");
          if (Array.isArray(allCasesResult.values.case)) {
            cases = allCasesResult.values.case;
            console.log(`Found ${cases.length} cases in allCasesResult.values.case`);
          }
        }
      }
    }
    
    // If we still couldn't find cases, try one more approach
    if (cases.length === 0 && allCasesResult.values && typeof allCasesResult.values === 'object') {
      // The structure might be { cases: [{ case: { ... } }, ...] }
      if (allCasesResult.values.cases && Array.isArray(allCasesResult.values.cases)) {
        // Extract the 'case' property from each item
        cases = allCasesResult.values.cases.map((item: any) => item.case).filter(Boolean);
        console.log(`Extracted ${cases.length} cases from allCasesResult.values.cases[].case`);
      }
    }
    
    if (cases.length === 0) {
      console.error("Could not find any cases in the response");
      return;
    }
    
    // Step 2: Create the new attribute
    console.log(`Creating new attribute: ${newName}`);
    const createAttributeMsg = {
      "action": "create",
      "resource": `dataContext[${dataContextName}].collection[${collectionName}].attribute`,
      "values": {
        "name": newName,
        "title": newName
      }
    };
    const createAttributeResult = await codapInterface.sendRequest(createAttributeMsg) as IResult;
    console.log("createAttributeResult:", createAttributeResult);

    if (!createAttributeResult.success) {
      console.error("Failed to create new attribute:", createAttributeResult);
      return;
    }

    // Step 3: Prepare updates for each case
    console.log("Preparing updates for each case");
    
    const updates: any[] = [];
    
    // Process each case to extract the value from the old attribute
    for (const caseItem of cases) {
      console.log("Processing case:", JSON.stringify(caseItem).substring(0, 100) + "...");
      
      let caseId: string | number | null = null;
      let oldValue: any = null;
      
      // Try to extract the case ID and value based on different possible structures
      if (caseItem && caseItem.id) {
        caseId = caseItem.id;
        if (caseItem.values && caseItem.values[oldName] !== undefined) {
          oldValue = caseItem.values[oldName];
        }
      } else if (caseItem && caseItem.case) {
        // The structure might be { case: { id: ..., values: { ... } } }
        if (caseItem.case.id) {
          caseId = caseItem.case.id;
          if (caseItem.case.values && caseItem.case.values[oldName] !== undefined) {
            oldValue = caseItem.case.values[oldName];
          }
        }
      }
      
      if (caseId !== null && oldValue !== null) {
        console.log(`Case ${caseId}: ${oldName}=${oldValue}`);
        updates.push({
          id: caseId,
          values: {
            [newName]: oldValue
          }
        });
      }
    }
    
    if (updates.length > 0) {
      console.log(`Updating ${updates.length} cases with values from ${oldName} to ${newName}`);
      console.log("Sample updates:", JSON.stringify(updates.slice(0, 2)));
      
      // Update the cases with the new attribute values
      const updateMsg = {
        "action": "update",
        "resource": `dataContext[${dataContextName}].collection[${collectionName}].case`,
        "values": updates
      };
      const updateResult = await codapInterface.sendRequest(updateMsg) as IResult;
      console.log("updateResult:", updateResult);
      
      if (!updateResult.success) {
        console.error("Failed to update cases:", updateResult);
      }
    } else {
      console.log("No cases found with values to update");
    }

    // Step 4: Delete the old attribute
    console.log(`Deleting old attribute: ${oldName}`);
    const deleteAttributeMsg = {
      "action": "delete",
      "resource": `dataContext[${dataContextName}].collection[${collectionName}].attribute[${oldName}]`
    };
    const deleteAttributeResult = await codapInterface.sendRequest(deleteAttributeMsg) as IResult;
    console.log("deleteAttributeResult:", deleteAttributeResult);

    if (!deleteAttributeResult.success) {
      console.error("Failed to delete old attribute:", deleteAttributeResult);
    }
    
  } catch (error) {
    console.error("Error in renameAttribute:", error);
  }
};
