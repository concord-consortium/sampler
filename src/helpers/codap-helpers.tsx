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
  getCollectionList,
  getDataContext,
  updateAttribute} from "@concord-consortium/codap-plugin-api";
import { AttrMap, IAttribute, IGlobalState } from "../types";
import { Updater } from "use-immer";
import { parseFormula } from "../utils/utils";
import { renameVariable, stringify } from "../utils/formula-parser";

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

      if (formula?.includes(oldName)) {
        // this returns a binary expression of left: "", op: =, right: parsedFormula
        // so we only need to update the variable name in the right side
        const parsed = parseFormula(formula, "");
        if (parsed.type === "BinaryExpression") {
          const renamed = renameVariable(parsed.right, oldName, newName);
          const newFormula = stringify(renamed, [newName]);
          await updateAttribute(dataContextName, collection, attr.name, attr, {formula: newFormula});
        }
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
