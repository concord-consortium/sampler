import { useGlobalStateContext } from "./useGlobalState";
import { getRandomElement } from "../components/helpers";
import { codapInterface, createChildCollection, createDataContext, createItems, createParentCollection, createTable, getDataContext } from "@concord-consortium/codap-plugin-api";
import { AttrMap, IAttribute } from "../types";

export const kDataContextName = "Sampler";
type TCODAPRequest = { action: string; resource: string; };

export const useCodapAPI = () => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { model, sampleSize, numSamples, replacement, createNewExperiment, attrMap } = globalState;

  const getResults = (experimentNum: number): { [key: string]: string|number }[] => {
    const results: { [key: string]: string|number }[] = [];
    for (let sampleIndex = 0; sampleIndex < Number(numSamples); sampleIndex++) {
      for (let i = 0; i < Number(sampleSize); i++) {
        const sample: { [key: string]: string|number } = {};
        model.columns.forEach(column => {
          // to-do: pick a device based on the user formula if there is one defined
          const device = column.devices.length > 1 ? getRandomElement(column.devices): column.devices[0];
          const variable = getRandomElement(device.variables);
          sample[column.name] = variable;
          sample[attrMap.experiment.name] = experimentNum;
          sample[attrMap.sample.name] = sampleIndex + 1;
          const deviceStr = device.viewType.charAt(0).toUpperCase() + device.viewType.slice(1);
          sample[attrMap.description.name] = `${deviceStr} containing ${numSamples} items${replacement ? " (with replacement)" : ""}`;
          sample[attrMap.sample_size.name] = sampleSize && parseInt(sampleSize, 10);
        });
        results.push(sample);
      }
    }
    return results;
  };


  const getCollectionNames = () => {
    return {
      experiments: "experiments",
      samples: "samples",
      items: "items"
    };
  };

  function isKeyOfAttrMap(key: any): key is keyof AttrMap {
    return key in attrMap;
  }

  const updateAttributeIds = async (attrs: Array<string>) => {
    const allAttrs = [
      {collection: "experiments", attrName: attrMap.experiment.name},
      {collection: "experiments", attrName: attrMap.description.name},
      {collection: "experiments", attrName: attrMap.sample_size.name},
      {collection: "samples", attrName: attrMap.sample.name},
    ];

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
              }
            ));
          }
        }
      });
    });
  };

  const findOrCreateDataContext = async (attrs: Array<string>) => {
    const dataContextRes = await getDataContext(kDataContextName);
    if (dataContextRes.success) {
      // get the attributes ids + map them to their appropriate attributes.
      // We use the ids just in case the attribute names have been changed
      const onlyIds: string[] = [];
      Object.keys(attrMap).map((key) => {
        const { codapID } = attrMap[key];
        if (codapID) {
          onlyIds.push(codapID);
        }
      });
      if (onlyIds.length <= 0) {
        await updateAttributeIds(attrs);
      }
      return "success";
    } else {
      const createRes = await createDataContext(kDataContextName);
      const collectionNames = getCollectionNames();
      const itemsAttrs: IAttribute[] = [];
      if (createRes.success) {
        setGlobalState((draft) => {
          draft.samplerContext = createRes.values;
        });
        const parentAttrs = [
          {name: attrMap.experiment.name, type: "categorical"},
          {name: attrMap.description.name, type: "categorical"},
          {name: attrMap.sample_size.name, type: "categorical"}
        ];
        const sampleAttrs = [{name: attrMap.sample.name, type: "categorical"}];
        attrs.forEach( attr => itemsAttrs.push({name: attr}));
        const createExperimentsCollection = await createParentCollection(kDataContextName, collectionNames.experiments, parentAttrs);
        if (createExperimentsCollection.success) {
          const createSamplesCollection =
            await createChildCollection(kDataContextName, collectionNames.samples, collectionNames.experiments, sampleAttrs);
          if (createSamplesCollection.success) {
            const createOutputCollection =
              await createChildCollection(kDataContextName, collectionNames.items, collectionNames.samples, itemsAttrs);
            if (createOutputCollection.success) {
              const tableRes = await createTable(kDataContextName);
              if (tableRes.success) {
                await updateAttributeIds(attrs);
                return "success";
              } else {
                return "error";
              }
            } else {
              return "error";
            }
          } else {
            return "error";
          }
        } else {
          return "error";
        }
      } else {
        return "error";
      }
    }
  };

  const handleStartRun = async () => {
    // proof of concept that we can "run" the model and add items to CODAP
    setGlobalState(draft => {
      draft.modelIsRunning = true;
    });
    const experimentNum = model.experimentNum
    ? createNewExperiment
        ? model.experimentNum + 1
        : model.experimentNum
    : 1;
    const results = getResults(experimentNum);
    const attrNames = model.columns.map(column => column.name);
    const ctxRes = await findOrCreateDataContext(attrNames);
    if (ctxRes === "success") {
      await createItems(kDataContextName, results);
      setGlobalState(draft => {
        draft.model.experimentNum = experimentNum;
        draft.enableRunButton = true;
      });
    }
  };

  const deleteAll = () => {
    codapInterface.sendRequest({
      action: "delete",
      resource: `dataContext[${kDataContextName}].collection[${attrMap.experiment.name}].allCases`
    });
  };

  return {
    handleStartRun,
    deleteAll
  };
};
