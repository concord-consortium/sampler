import { useGlobalStateContext } from "./useGlobalState";
import { getRandomElement } from "../components/helpers";
import {
  IResult,
  codapInterface,
  createChildCollection,
  createDataContext,
  createItems,
  createNewAttribute,
  createParentCollection,
  getAttributeList,
  getDataContext
} from "@concord-consortium/codap-plugin-api";
import { AttrMap, IAttribute, IExperimentResults, IExperimentResultsForAnimation, ISampleResults, Speed } from "../types";
import { extractVariablesFromFormula, formatFormula } from "../utils/utils";
import { getDeviceById } from "../models/model-model";
import { createAnimationSteps, useAnimationContext } from "./useAnimation";

export const kDataContextName = "Sampler";
type TCODAPRequest = { action: string; resource: string; };

export const useCodapAPI = () => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { model, speed, sampleSize, numSamples, replacement, createNewExperiment, attrMap } = globalState;
  const { setAnimationSteps } = useAnimationContext();

  const evaluateResult = async (formula: string, value: Record<string, string>) => {
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

  const runExperiment = async () => {
    let currentDevice = model.columns[0].devices[0];
    let outputs: ISampleResults = {};
    let outputsForAnimation: ISampleResults = {};
    let previousOutputs: Record<string, any> = {};

    while (currentDevice) {
      const selectedVariable = getRandomElement(currentDevice.variables);
      let nextDeviceId: string | null = null;
      const columnName = model.columns.find(column => column.devices.find(device => device.id === currentDevice.id))?.name || "";

      for (const [deviceId, formula] of Object.entries(currentDevice.formulas)) {
        if (formula === "*") {
          nextDeviceId = deviceId;
          break;
        }

        const neededVariables = extractVariablesFromFormula(formula);
        const values = neededVariables.reduce((acc, variable) => {
          if (variable in previousOutputs) {
              acc[variable] = previousOutputs[variable];
          }
          return acc;
        }, { [columnName]: selectedVariable });

        const formattedFormula = formatFormula(formula, columnName, Object.keys(values));
        const evaluationResult = await evaluateResult(formattedFormula, values);
        if (evaluationResult) {
          nextDeviceId = deviceId;
          break;
        }
      }

      if (columnName) {
        outputs[columnName] = selectedVariable;
        previousOutputs[columnName] = selectedVariable;
        outputsForAnimation[currentDevice.id] = selectedVariable;
      }

      if (nextDeviceId) {
        const nextDevice = getDeviceById(model, nextDeviceId);
        if (!nextDevice) break;
        currentDevice = nextDevice;
      } else {
        break;
      }
    }

    return {outputs, outputsForAnimation};
  };

  const getResults = async (experimentNum: number, startingSampleNumber: number) => {
    const results: IExperimentResults = [];
    const resultsForAnimation: IExperimentResultsForAnimation = [];
    const firstDevice = model.columns[0].devices[0];
    const endSampleNumber = startingSampleNumber + Number(numSamples);
    for (let sampleIndex = startingSampleNumber; sampleIndex < endSampleNumber; sampleIndex++) {
      const sampleResultsForAnimation = [];
      for (let i = 0; i <  Number(sampleSize); i++) {
        const sample: { [key: string]: string|number } = {};
        sample[attrMap.experiment.name] = experimentNum;
        sample[attrMap.sample.name] = sampleIndex;
        const deviceStr = firstDevice.viewType.charAt(0).toUpperCase() + firstDevice.viewType.slice(1);
        sample[attrMap.description.name] = `${deviceStr} containing ${numSamples} items${replacement ? " (with replacement)" : ""}`;
        sample[attrMap.sample_size.name] = sampleSize && parseInt(sampleSize, 10);
        const {outputs, outputsForAnimation} = await runExperiment();
        Object.keys(outputs).forEach(key => {
          sample[key] = outputs[key];
        });
        sampleResultsForAnimation.push({sampleNumber: sampleIndex, results: outputsForAnimation});
        results.push(sample);
      }
      resultsForAnimation.push(sampleResultsForAnimation);
    }

    return {results, resultsForAnimation};
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

  const findOrCreateDataContext = async (attrs: Array<string>) => {
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
      await updateAttributeIds(attrs);
      return "success";
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
              const tableRes = await createWideTable();
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
    const attrNames = model.columns.map(column => column.name);
    setGlobalState(draft => {
      draft.isRunning = true;
      draft.enableRunButton = false;
    });
    await findOrCreateDataContext(attrNames);

    const experimentNum = model.experimentNum
    ? createNewExperiment
        ? model.experimentNum + 1
        : model.experimentNum
    : 1;

    const startingSampleNumber = createNewExperiment ? 1 : model.mostRecentRunNumber + 1;
    const {results, resultsForAnimation} = await getResults(experimentNum, startingSampleNumber);

    const onEndRun = () => {
      setGlobalState(draft => {
        draft.model.experimentNum = experimentNum;
        draft.enableRunButton = true;
        draft.createNewExperiment = false;
        draft.model.mostRecentRunNumber = model.mostRecentRunNumber + Number(numSamples);
        draft.isRunning = false;
      });
    };

    if (speed === Speed.Fastest) {
      await createItems(kDataContextName, results);
      onEndRun();
    } else {
      setGlobalState(draft => {
        draft.isRunning = true;
      });
      const animationSteps = createAnimationSteps(resultsForAnimation, results, speed, onEndRun);
      setAnimationSteps(animationSteps);
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
