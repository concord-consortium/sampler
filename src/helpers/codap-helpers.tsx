import {
  IResult,
  codapInterface,
  createChildCollection,
  createDataContext,
  createNewAttribute,
  createParentCollection,
  getAllItems,
  getAttributeList,
  getDataContext
} from "@concord-consortium/codap-plugin-api";
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
  console.log("=== RENAME ATTRIBUTE PROCESS STARTED ===");
  console.log("renameAttribute called with:", { dataContextName, collectionName, oldName, newName });

  try {
    // Step 1: Get all cases with their values
    console.log("\n=== STEP 1: GET ALL CASES ===");
    console.log("Getting all cases with values");
    const getAllCasesMsg = {
      "action": "get",
      "resource": `dataContext[${dataContextName}].collection[${collectionName}].allCases`
    };
    console.log("Sending request:", JSON.stringify(getAllCasesMsg));
    const allCasesResult = await codapInterface.sendRequest(getAllCasesMsg) as IResult;
    console.log("allCasesResult success:", allCasesResult.success);

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

    // Step 2: Get all data contexts to check for formulas in all tables
    console.log("\n=== STEP 2: GET ALL DATA CONTEXTS ===");
    console.log("Getting all data contexts");
    const getDataContextsMsg = {
      "action": "get",
      "resource": "dataContextList"
    };
    console.log("Sending request:", JSON.stringify(getDataContextsMsg));
    const dataContextsResult = await codapInterface.sendRequest(getDataContextsMsg) as IResult;
    console.log("dataContextsResult success:", dataContextsResult.success);
    if (dataContextsResult.success) {
      console.log("dataContextsResult values:", JSON.stringify(dataContextsResult.values));
    }

    // Step 3: Find all formulas in all data contexts, collections, and attributes that reference the old attribute name
    console.log("\n=== STEP 3: FIND ALL FORMULAS THAT REFERENCE THE OLD ATTRIBUTE NAME ===");
    let formulasToUpdate: Array<{dataContext: string, collection: string, attribute: string, formula: string, updatedFormula: string}> = [];
    
    if (dataContextsResult.success && Array.isArray(dataContextsResult.values)) {
      const dataContexts = dataContextsResult.values;
      console.log(`Found ${dataContexts.length} data contexts`);
      
      for (const context of dataContexts) {
        console.log(`\nChecking data context: ${context.name}`);
        
        // Get all collections in this data context
        const getCollectionsMsg = {
          "action": "get",
          "resource": `dataContext[${context.name}].collectionList`
        };
        console.log("Sending request:", JSON.stringify(getCollectionsMsg));
        const collectionsResult = await codapInterface.sendRequest(getCollectionsMsg) as IResult;
        console.log(`Collections in data context ${context.name} success:`, collectionsResult.success);
        if (collectionsResult.success) {
          console.log(`Collections in data context ${context.name} values:`, JSON.stringify(collectionsResult.values));
        }
        
        if (collectionsResult.success && Array.isArray(collectionsResult.values)) {
          const collections = collectionsResult.values;
          console.log(`Found ${collections.length} collections in data context ${context.name}`);
          
          for (const collection of collections) {
            console.log(`\nChecking collection: ${collection.name} in data context ${context.name}`);
            
            // Get all attributes in this collection
            const getAttributesMsg = {
              "action": "get",
              "resource": `dataContext[${context.name}].collection[${collection.name}].attributeList`
            };
            console.log("Sending request:", JSON.stringify(getAttributesMsg));
            const attributesResult = await codapInterface.sendRequest(getAttributesMsg) as IResult;
            console.log(`Attributes in collection ${collection.name} in data context ${context.name} success:`, attributesResult.success);
            if (attributesResult.success) {
              console.log(`Attributes in collection ${collection.name} in data context ${context.name} values:`, JSON.stringify(attributesResult.values));
            }
            
            if (attributesResult.success && Array.isArray(attributesResult.values)) {
              const attributes = attributesResult.values;
              console.log(`Found ${attributes.length} attributes in collection ${collection.name} in data context ${context.name}`);
              
              // Find attributes with formulas that reference the old attribute name
              for (const attr of attributes) {
                console.log(`\nChecking attribute: ${attr.name} in collection ${collection.name} in data context ${context.name}`);
                console.log(`Attribute details:`, JSON.stringify(attr));
                
                // Get the full attribute details including formula
                const getAttributeMsg = {
                  "action": "get",
                  "resource": `dataContext[${context.name}].collection[${collection.name}].attribute[${attr.name}]`
                };
                console.log("Sending request for full attribute details:", JSON.stringify(getAttributeMsg));
                const attributeResult = await codapInterface.sendRequest(getAttributeMsg) as IResult;
                console.log(`Full attribute details success:`, attributeResult.success);
                if (attributeResult.success) {
                  console.log(`Full attribute details:`, JSON.stringify(attributeResult.values));
                  
                  // Check if the attribute has a formula
                  const formula = attributeResult.values?.formula;
                  if (formula) {
                    console.log(`Found formula in attribute ${attr.name}: ${formula}`);
                    
                    // Check if the formula references the old attribute name
                    // We need to be thorough in checking for references
                    const formulaLower = formula.toLowerCase();
                    const oldNameLower = oldName.toLowerCase();
                    
                    // Different ways the old name might be referenced in a formula
                    const backtickQuoted = formula.includes(`\`${oldName}\``);
                    const wordBoundary = !!formula.match(new RegExp(`\\b${oldName}\\b`));
                    const doubleQuoted = formula.includes(`"${oldName}"`);
                    const singleQuoted = formula.includes(`'${oldName}'`);
                    const backtickQuotedLower = formulaLower.includes(`\`${oldNameLower}\``);
                    const wordBoundaryLower = !!formulaLower.match(new RegExp(`\\b${oldNameLower}\\b`));
                    const doubleQuotedLower = formulaLower.includes(`"${oldNameLower}"`);
                    const singleQuotedLower = formulaLower.includes(`'${oldNameLower}'`);
                    
                    console.log("Formula reference checks:");
                    console.log(`- Backtick quoted: ${backtickQuoted}`);
                    console.log(`- Word boundary: ${wordBoundary}`);
                    console.log(`- Double quoted: ${doubleQuoted}`);
                    console.log(`- Single quoted: ${singleQuoted}`);
                    console.log(`- Backtick quoted (case insensitive): ${backtickQuotedLower}`);
                    console.log(`- Word boundary (case insensitive): ${wordBoundaryLower}`);
                    console.log(`- Double quoted (case insensitive): ${doubleQuotedLower}`);
                    console.log(`- Single quoted (case insensitive): ${singleQuotedLower}`);
                    
                    const referencesOldName = 
                      backtickQuoted || wordBoundary || doubleQuoted || singleQuoted ||
                      backtickQuotedLower || wordBoundaryLower || doubleQuotedLower || singleQuotedLower;
                    
                    console.log(`Formula references old name '${oldName}': ${referencesOldName}`);
                    
                    if (referencesOldName) {
                      console.log(`Formula in attribute ${attr.name} in collection ${collection.name} in data context ${context.name} references ${oldName}`);
                      
                      // Replace references to the old attribute name with the new name
                      let updatedFormula = formula;
                      
                      // Replace backtick-quoted references
                      const backtickRegex = new RegExp(`\`${oldName}\``, 'gi');
                      const backtickReplacement = `\`${newName}\``;
                      updatedFormula = updatedFormula.replace(backtickRegex, backtickReplacement);
                      console.log(`After backtick replacement: ${updatedFormula}`);
                      
                      // Replace unquoted references (need to be careful with word boundaries)
                      const wordBoundaryRegex = new RegExp(`\\b${oldName}\\b`, 'gi');
                      updatedFormula = updatedFormula.replace(wordBoundaryRegex, newName);
                      console.log(`After word boundary replacement: ${updatedFormula}`);
                      
                      // Replace double-quoted references
                      const doubleQuoteRegex = new RegExp(`"${oldName}"`, 'gi');
                      const doubleQuoteReplacement = `"${newName}"`;
                      updatedFormula = updatedFormula.replace(doubleQuoteRegex, doubleQuoteReplacement);
                      console.log(`After double quote replacement: ${updatedFormula}`);
                      
                      // Replace single-quoted references
                      const singleQuoteRegex = new RegExp(`'${oldName}'`, 'gi');
                      const singleQuoteReplacement = `'${newName}'`;
                      updatedFormula = updatedFormula.replace(singleQuoteRegex, singleQuoteReplacement);
                      console.log(`After single quote replacement: ${updatedFormula}`);
                      
                      console.log(`Final updated formula: ${updatedFormula}`);
                      
                      formulasToUpdate.push({
                        dataContext: context.name,
                        collection: collection.name,
                        attribute: attr.name,
                        formula,
                        updatedFormula
                      });
                    }
                  } else {
                    console.log(`Attribute ${attr.name} does not have a formula`);
                  }
                }
              }
            }
          }
        }
      }
    }

    console.log(`\nFound ${formulasToUpdate.length} formulas to update:`);
    formulasToUpdate.forEach((formula, index) => {
      console.log(`Formula ${index + 1}:`);
      console.log(`- Data Context: ${formula.dataContext}`);
      console.log(`- Collection: ${formula.collection}`);
      console.log(`- Attribute: ${formula.attribute}`);
      console.log(`- Old Formula: ${formula.formula}`);
      console.log(`- New Formula: ${formula.updatedFormula}`);
    });

    // Step 4: Create the new attribute
    console.log("\n=== STEP 4: CREATE NEW ATTRIBUTE ===");
    console.log(`Creating new attribute: ${newName}`);
    const createAttributeMsg = {
      "action": "create",
      "resource": `dataContext[${dataContextName}].collection[${collectionName}].attribute`,
      "values": {
        "name": newName,
        "title": newName
      }
    };
    console.log("Sending request:", JSON.stringify(createAttributeMsg));
    const createAttributeResult = await codapInterface.sendRequest(createAttributeMsg) as IResult;
    console.log("createAttributeResult success:", createAttributeResult.success);
    if (createAttributeResult.success) {
      console.log("createAttributeResult values:", JSON.stringify(createAttributeResult.values));
    } else {
      console.error("Failed to create new attribute:", createAttributeResult);
      return;
    }

    // Step 5: Prepare updates for each case
    console.log("\n=== STEP 5: PREPARE UPDATES FOR EACH CASE ===");
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
    
    console.log(`Prepared ${updates.length} case updates`);
    
    if (updates.length > 0) {
      console.log(`Updating ${updates.length} cases with values from ${oldName} to ${newName}`);
      console.log("Sample updates:", JSON.stringify(updates.slice(0, 2)));
      
      // Update the cases with the new attribute values
      const updateMsg = {
        "action": "update",
        "resource": `dataContext[${dataContextName}].collection[${collectionName}].case`,
        "values": updates
      };
      console.log("Sending request:", JSON.stringify(updateMsg).substring(0, 200) + "...");
      const updateResult = await codapInterface.sendRequest(updateMsg) as IResult;
      console.log("updateResult success:", updateResult.success);
      if (updateResult.success) {
        console.log("updateResult values:", JSON.stringify(updateResult.values));
      } else {
        console.error("Failed to update cases:", updateResult);
      }
    } else {
      console.log("No cases found with values to update");
    }

    // Step 6: Delete the old attribute
    console.log("\n=== STEP 6: DELETE OLD ATTRIBUTE ===");
    console.log(`Deleting old attribute: ${oldName}`);
    const deleteAttributeMsg = {
      "action": "delete",
      "resource": `dataContext[${dataContextName}].collection[${collectionName}].attribute[${oldName}]`
    };
    console.log("Sending request:", JSON.stringify(deleteAttributeMsg));
    const deleteAttributeResult = await codapInterface.sendRequest(deleteAttributeMsg) as IResult;
    console.log("deleteAttributeResult success:", deleteAttributeResult.success);
    if (deleteAttributeResult.success) {
      console.log("deleteAttributeResult values:", JSON.stringify(deleteAttributeResult.values));
    } else {
      console.error("Failed to delete old attribute:", deleteAttributeResult);
    }
    
    // Step 7: Update all formulas that reference the old attribute name
    console.log("\n=== STEP 7: UPDATE FORMULAS ===");
    console.log(`Updating ${formulasToUpdate.length} formulas that reference ${oldName}`);
    
    for (const formula of formulasToUpdate) {
      console.log(`\nUpdating formula in attribute ${formula.attribute} in collection ${formula.collection} in data context ${formula.dataContext}`);
      console.log(`Old formula: ${formula.formula}`);
      console.log(`New formula: ${formula.updatedFormula}`);
      
      const updateFormulaMsg = {
        "action": "update",
        "resource": `dataContext[${formula.dataContext}].collection[${formula.collection}].attribute[${formula.attribute}]`,
        "values": {
          "formula": formula.updatedFormula
        }
      };
      
      console.log("Sending request:", JSON.stringify(updateFormulaMsg));
      const updateFormulaResult = await codapInterface.sendRequest(updateFormulaMsg) as IResult;
      console.log(`Update formula result for attribute ${formula.attribute} success:`, updateFormulaResult.success);
      if (updateFormulaResult.success) {
        console.log(`Update formula result for attribute ${formula.attribute} values:`, JSON.stringify(updateFormulaResult.values));
      } else {
        console.error(`Failed to update formula for attribute ${formula.attribute}:`, updateFormulaResult);
      }
    }
    
    // Step 8: Check for calculator components that might contain formulas
    console.log("\n=== STEP 8: CHECK FOR CALCULATOR COMPONENTS ===");
    console.log("Checking for calculator components");
    const getComponentListMsg = {
      "action": "get",
      "resource": "componentList"
    };
    console.log("Sending request:", JSON.stringify(getComponentListMsg));
    const componentListResult = await codapInterface.sendRequest(getComponentListMsg) as IResult;
    console.log("componentListResult success:", componentListResult.success);
    if (componentListResult.success) {
      console.log("componentListResult values:", JSON.stringify(componentListResult.values));
    }
    
    if (componentListResult.success && Array.isArray(componentListResult.values)) {
      const calculatorComponents = componentListResult.values.filter((component: any) => component.type === "calculator");
      console.log(`Found ${calculatorComponents.length} calculator components`);
      
      // Unfortunately, there's no direct API to update calculator formulas
      // We can only notify the user if there are calculator components
      if (calculatorComponents.length > 0) {
        console.log("WARNING: There are calculator components that might contain formulas referencing the old attribute name.");
        console.log("These will need to be updated manually.");
      }
    }
    
    console.log("\n=== RENAME ATTRIBUTE PROCESS COMPLETED ===");
  } catch (error) {
    console.error("Error in renameAttribute:", error);
  }
};
