import {
  codapInterface,
  getDataContext,
  createDataContext,
  createNewCollection,
  createTable,
  createParentCollection,
  createChildCollection
} from "@concord-consortium/codap-plugin-api";
import { tr } from "./localeManager";

interface Attribute {
  name: string;
  formula?: string;
  description?: string;
  type?: string;
  cid?: string;
  precision?: string;
  unit?: string;
  editable?: boolean;
  renameable?: boolean;
  deleteable?: boolean;
  hidden?: boolean;
}

export const kDataContextName = "Sampler";

type TCODAPRequest = { action: string; resource: string; };
type TCODAPResult = { success: boolean; value: any; };


const getCollectionNames = () => {
  return {
    experiments: "experiments",
    samples: "samples",
    items: "items"
  };
  // return {
  //   experiments: tr("DG.plugin.Sampler.dataset.col-experiments"),
  //   samples: tr("DG.plugin.Sampler.dataset.col-samples"),
  //   items: tr("DG.plugin.Sampler.dataset.col-items")
  // };
};

// const attrMap = {
//   experiment: {id: "", name: tr("DG.plugin.Sampler.dataset.attr-experiment")},
//   description: {id: "", name: tr("DG.plugin.Sampler.dataset.attr-description")},
//   sample_size: {id: "", name: tr("DG.plugin.Sampler.dataset.attr-sample_size")},
//   sample: {id: "", name: tr("DG.plugin.Sampler.dataset.attr-sample")},
//   output: {id: "", name: tr("DG.plugin.Sampler.dataset.attr-output")},
// };
const attrMap = {
  experiment: {id: "", name: "experiment"},
  description: {id: "", name: "description"},
  sample_size: {id: "", name: "sample size"},
  sample: {id: "", name: "sample"},
  output: {id: "", name: "output"},
};

export const getAttributeIds = (allAttrs: Record<string, string>[]) => {
  const reqs: TCODAPRequest[] = allAttrs.map(collectionAttr => ({
    "action": "get",
    "resource": `dataContext[${kDataContextName}].collection[${collectionAttr.collection}].attribute[${collectionAttr.attrName}]`
  }));
  codapInterface.sendRequest(reqs, (getAttrsResult: any[]) => {
    getAttrsResult.forEach((res: {success: boolean, values: Record<string, string>}) => {
      if (res.success) {
        switch (res.values.name) {
          case attrMap.output.name:
            attrMap.output.id = res.values.id;
            break;
          case attrMap.sample.name:
            attrMap.sample.id = res.values.id;
            break;
          case attrMap.sample_size.name:
            attrMap.sample_size.id = res.values.id;
            break;
          case attrMap.description.name:
            attrMap.description.id = res.values.id;
            break;
          case attrMap.experiment.name:
            attrMap.experiment.id = res.values.id;
            break;
        }
      }
    });
  });
};

export const findOrCreateDataContext = async (attrs: Array<string>) => {
  const dataContextRes = await getDataContext(kDataContextName);
  if (dataContextRes.success) {
    // get the attributes ids
    // map them to their appropriate attributes.
    // We use the ids just in case the attribute names have been changed

    // DataSet already exists. If we haven't loaded in attribute ids from saved state, that means user
    // created dataset before we were tracking attribute changes. Try to get ids, but if the user has
    // already updated attribute names, this won't work.
    const onlyIds: string[] = [];
    Object.keys(attrMap).map((key) => {
      onlyIds.push(attrMap[key as keyof typeof attrMap].id);
    });
    if (onlyIds.length <= 0) {

      const allAttrs = [{collection: "experiments", attrName: attrMap.experiment.name},
                          {collection: "experiments", attrName: attrMap.description.name},
                          {collection: "experiments", attrName: attrMap.sample_size.name},
                          {collection: "samples", attrName: attrMap.sample.name},
                        ];
      attrs.forEach(attr=>allAttrs.push({collection: "samples", attrName: attr}));
      getAttributeIds(allAttrs);
    }
    return "success";
  } else {
    const createRes = await createDataContext(kDataContextName);
    const collectionNames = getCollectionNames();
    const itemsAttrs: Attribute[] = [];
    if (createRes.success) {
      const parentAttrs = [
        {name: attrMap.experiment.name, type: "categorical"},
        {name: attrMap.description.name, type: "categorical"},
        {name: attrMap.sample_size.name, type: "categorical"}
      ];
      const sampleAttrs = [{name: attrMap.sample.name, type: "categorical"}];
      attrs.forEach(attr=> {
        itemsAttrs.push({name: attr});

      });
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

export const deleteAll = () => {
  codapInterface.sendRequest({
    action: "delete",
    resource: `dataContext[${kDataContextName}].collection[${attrMap.experiment.name}].allCases`
  });
};
