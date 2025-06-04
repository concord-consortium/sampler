import {
  IResult,
  codapInterface,
  createChildCollection,
  createDataContext,
  createNewAttribute,
  createParentCollection,
  getAllItems,
  getAttribute,
  getAttributeList,
  getCaseCount,
  getCollectionList,
  getDataContext,
  getListOfDataContexts,
  updateAttribute} from "@concord-consortium/codap-plugin-api";
import { AttrMap, IAttribute, IGlobalState } from "../types";
import { Updater } from "use-immer";
import { parseFormula } from "../utils/utils";
import { renameVariable, stringify } from "../utils/formula-parser";

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

export const getCollectionNames = () => {
  return {
    experiments: "experiments",
    samples: "samples",
    items: "items"
  };
};

const updateAttributeIds = async (dataContextName: string, attrs: Array<string>, attrMap: AttrMap, setGlobalState: Updater<IGlobalState>) => {
  const allAttrs = [
    {collection: "experiments", attrName: attrMap.experiment.name},
    {collection: "experiments", attrName: attrMap.description.name},
    {collection: "experiments", attrName: attrMap.sample_size.name},
    {collection: "experiments", attrName: attrMap.until_formula.name},
    {collection: "experiments", attrName: attrMap.experimentHash.name},
    {collection: "samples", attrName: attrMap.sample.name},
  ];
  const isKeyOfAttrMap = (key: any): key is keyof AttrMap => key in attrMap;

  attrs.forEach(attr => allAttrs.push({collection: "samples", attrName: attr}));

  const reqs: TCODAPRequest[] = allAttrs.map(collectionAttr => ({
    "action": "get",
    "resource": `dataContext[${dataContextName}].collection[${collectionAttr.collection}].attribute[${collectionAttr.attrName}]`
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
const createWideTable = async (dataContextName: string) => {
  return codapInterface.sendRequest({
    action: "create",
    resource: "component",
    values: {
      type: "caseTable",
      dataContext: dataContextName,
      title: "Sampler Data",
      dimensions: {
        width: 1000,
        height: 200
      }
    }
  }) as unknown as IResult;
};

export const hasSamplesCollection = async (dataContextName: string): Promise<boolean> => {
  const collectionNames = getCollectionNames();
  const dataContextRes = await getDataContext(dataContextName);
  const collections = (dataContextRes.success ? dataContextRes.values?.collections ?? [] : []) as Array<{name: string}>;
  return !!collections.find(c => c.name === collectionNames.samples);
};

export const findOrCreateDataContext = async (initialDataContextName: string, attrs: Array<string>, attrMap: AttrMap, setGlobalState: Updater<IGlobalState>, repeat: boolean, isCollector: boolean): Promise<string|null> => {
  const collectionNames = getCollectionNames();

  // if the plugin is being loaded from a CODAP document, the initialDataContextName will be provided
  // in the saved state. If not, we need to find the first non-existent data context name so
  // that we can create a new one to allow for multiple sampler plugins in the same document.
  let finalDataContextName = initialDataContextName;
  if (!finalDataContextName) {
    const listOfDataContextsRes = await getListOfDataContexts();
    if (!listOfDataContextsRes.success) {
      return null;
    }
    const names = listOfDataContextsRes.values.map((dc: {name: string}) => dc.name);

    let index = 0;
    const baseName = 'Sampler';
    finalDataContextName = baseName;
    while (names.indexOf(finalDataContextName) >= 0) {
      index++;
      finalDataContextName = `${baseName}${index}`;
    }
  }

  const experimentAttrName = repeat ? attrMap.until_formula.name : attrMap.sample_size.name;

  const dataContextRes = await getDataContext(finalDataContextName);
  if (dataContextRes.success) {
    // ensure that the sample size or repeat formula column exists based on the current experiment type
    let attrList = (await getAttributeList(finalDataContextName, collectionNames.experiments)).values;
    if (!attrList.find((attr: {name: string}) => attr.name === experimentAttrName)) {
      let createNewAttr = true;

      // special case when an old TPSampler doc is loaded - rename "sample_size" to "sample size"
      if (experimentAttrName === attrMap.sample_size.name) {
        const oldExperimentAttrName = "sample_size";
        const oldAttr = attrList.find((attr: {name: string}) => attr.name === oldExperimentAttrName);
        if (oldAttr) {
          await updateAttribute(finalDataContextName, collectionNames.experiments, oldExperimentAttrName, oldAttr, {name: experimentAttrName});
          createNewAttr = false;
        }
      }

      if (createNewAttr) {
        await createNewAttribute(finalDataContextName, collectionNames.experiments, experimentAttrName);
      }
    }

    // ensure that the experimentHash column exists (it will not exist in older TPSampler documents)
    if (!attrList.find((attr: {name: string}) => attr.name === attrMap.experimentHash.name)) {
      await codapInterface.sendRequest({
        action: "create",
        resource: `dataContext[${finalDataContextName}].collection[${collectionNames.experiments}].attribute`,
        values: [
          {
            name: attrMap.experimentHash.name,
            type: "categorical",
            hidden: true
          }
        ]
      });
    }

    attrList = (await getAttributeList(finalDataContextName, collectionNames.items)).values;
    const attrNames: string[] = attrList.map((attr: {id: number, name: string, title: string}) => attr.name);

    // ensure that if a user deleted a CODAP attr representing a device column, it is reinstated
    const missingAttrs = attrs.filter(attr => !attrNames.includes(attr));
    if (missingAttrs.length > 0) {
      missingAttrs.forEach(async (attr) => {
        await createNewAttribute(finalDataContextName, collectionNames.items, attr);
      });
    }

    // if this is a collector run and there are no existing items remove all non-collector attributes
    if (isCollector) {
      const itemCountResult = await getCaseCount(finalDataContextName, collectionNames.items);
      if (itemCountResult.success && itemCountResult.values === 0) {
        const nonCollectorAttrs = attrNames.filter(attr => !attrs.includes(attr));
        deleteItemAttrs(finalDataContextName, nonCollectorAttrs);
      }
    }

    await updateAttributeIds(finalDataContextName, attrs, attrMap, setGlobalState);
    return finalDataContextName;
  } else {
    const createRes = await createDataContext(finalDataContextName);
    const itemsAttrs: IAttribute[] = [];
    if (createRes.success) {
      setGlobalState((draft) => {
        draft.samplerContext = createRes.values;
      });
      const parentAttrs = [
        {name: attrMap.experiment.name, type: "categorical"},
        {name: attrMap.description.name, type: "categorical"},
        {name: experimentAttrName, type: "categorical"},
        {name: attrMap.experimentHash.name, type: "categorical", hidden: "true"}
      ];
      const sampleAttrs = [{name: attrMap.sample.name, type: "categorical"}];
      attrs.forEach( attr => itemsAttrs.push({name: attr}));
      const createExperimentsCollection = await createParentCollection(finalDataContextName, collectionNames.experiments, parentAttrs as any);
      if (createExperimentsCollection.success) {
        const createSamplesCollection =
          await createChildCollection(finalDataContextName, collectionNames.samples, collectionNames.experiments, sampleAttrs);
        if (createSamplesCollection.success) {
          const createOutputCollection =
            await createChildCollection(finalDataContextName, collectionNames.items, collectionNames.samples, itemsAttrs);
          if (createOutputCollection.success) {
            const tableRes = await createWideTable(finalDataContextName);
            if (tableRes.success) {
              await updateAttributeIds(finalDataContextName, attrs, attrMap, setGlobalState);
              return finalDataContextName;
            }
          }
        }
      }
    }
  }

  return null;
};

export const deleteAll = (dataContextName: string, attrMap: AttrMap) => {
  codapInterface.sendRequest({
    action: "delete",
    resource: `dataContext[${dataContextName}].collection[${attrMap.experiment.name}].allCases`
  });
};

export const deleteAllItems = async (dataContextName: string) => {
  codapInterface.sendRequest({
    action: "delete",
    resource: `dataContext[${dataContextName}].collection[${getCollectionNames().items}].allCases`
  });
};

export const getItemAttrs = async (dataContextName: string): Promise<string[]> => {
  const result = await getAttributeList(dataContextName, getCollectionNames().items);
  return result.success ? result.values.map((attr: any) => attr.name) : [];
};

export const deleteItemAttrs = async (dataContextName: string, attrs: string[]) => {
  for (const attr of attrs) {
    await codapInterface.sendRequest({
      action: "delete",
      resource: `dataContext[${dataContextName}].collection[${getCollectionNames().items}].attribute[${attr}]`
    });
  }
};

export const addMeasure = (dataContextName: string, measureName: string, measureType: string, formula: string) => {
  const samplesColl = getCollectionNames().samples;

  codapInterface.sendRequest({
    action: "get",
    resource: `dataContext[${dataContextName}].collection[${samplesColl}].attributeList`
  }).then((res: any) => {
    const attrs = res.values;
    let newAttributeName = measureName ? measureName : measureType;
    // check if attr name is already used. user could add "conditional count" twice, for example,
    // but have difference formulas (output = a, output = b)
    const attrNameAlreadyUsed = attrs.find((attr: any) => attr.name === newAttributeName);

      if (!attrNameAlreadyUsed) {
        codapInterface.sendRequest({
          action: 'create',
          resource: `dataContext[${dataContextName}].collection[${samplesColl}].attribute`,
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
          resource: `dataContext[${dataContextName}].collection[${samplesColl}].attribute`,
          values: [{
            name: newAttributeName,
            type: "numeric",
            formula
          }]
        });
      } else if (attrNameAlreadyUsed && measureName) {
        codapInterface.sendRequest({
          action: 'update',
          resource: `dataContext[${dataContextName}].collection[${samplesColl}].attribute[${measureName}]`,
          values: {
            formula
          }
        });
      }
    });
};

export const getNewExperimentInfo = async (dataContextName: string, experimentHash: string) => {
  let experimentNum = 1;
  let startingSampleNumber = 1;

  const result = await getAllItems(dataContextName);
  if (!result.success) {
    throw new Error("Sorry, the data context was not found!");
  }

  // any cases?
  if (result.values.length > 0) {
    /*
      This has been disabled due to a request to always create a new experiment in SAMPLER-82.
      If this turns out not to be the desired behavior in the future, this can be uncommented and
      the code below that sets an empty array for matchingHashItems can be removed.

    // check if the experiment already exists
    const matchingHashItems = result.values.filter((item: any) => item.values?.experimentHash === experimentHash);
    */
    const matchingHashItems: any[] = [];

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

export const renameAttributeInFormulas = async (dataContextName: string, oldName: string, newName: string) => {
  const collectionListResult = await getCollectionList(dataContextName);
  if (!collectionListResult.success) {
    return;
  }

  const collections = collectionListResult.values.map((c: any) => c.name);
  for (const collection of collections) {
    const attrListResult = await getAttributeList(dataContextName, collection);
    if (!attrListResult.success) {
      continue;
    }

    const attributes = attrListResult.values;
    for (const attr of attributes) {
      const attributeResult = await getAttribute(dataContextName, collection, attr.name);
      if (!attributeResult.success) {
        continue;
      }
      const { formula } = attributeResult.values;

      // a bug in CODAPv2 causes multiple equals signs to be added to formulas when renaming attributes
      let finalFormula = formula?.replace(/={1,}/g, "=");

      if (finalFormula?.includes(oldName)) {
        // this returns a binary expression of left: "", op: =, right: parsedFormula
        // so we only need to update the variable name in the right side
        const parsed = parseFormula(finalFormula, "");
        if (parsed.type === "BinaryExpression") {
          const renamed = renameVariable(parsed.right, oldName, newName);
          finalFormula = stringify(renamed, [newName]);
        }
      }
      if (finalFormula !== formula) {
        await updateAttribute(dataContextName, collection, attr.name, attr, {formula: finalFormula});
      }
    }
  }
};


type Dimensions = {width: number; height: number};
const getWindowDimensions = (): Dimensions => {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
};

export const ensureMinimumDimensions = async (min: Dimensions) => {
  const current = getWindowDimensions();
  if (current.width >= min.width && current.height >= min.height) {
    return;
  }

  const width = Math.max(min.width, current.width);
  const height = Math.max(min.height, current.height);
  const values = {dimensions: {width, height}};

  await codapInterface.sendRequest({ action: "update", resource: "interactiveFrame", values});
};
