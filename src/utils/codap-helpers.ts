import {
  getDataContext,
  createDataContext,
  createNewCollection,
  createTable
} from "@concord-consortium/codap-plugin-api";

export const kDataContextName = "Sampler";

export const findOrCreateDataContext = async (attrs: Array<string>) => {
  const dataContextRes = await getDataContext(kDataContextName);
  if (dataContextRes.success) {
  } else {
    const collectionAttrs = attrs.map((attr) => { return {name: attr, type: "categorical"};});
    const createRes = await createDataContext(kDataContextName);
    if (createRes.success) {
      const collectionRes = await createNewCollection(kDataContextName, "collection", collectionAttrs);
      if (collectionRes.success) {
        const tableRes = await createTable(kDataContextName);
        if (tableRes.success) {
          return "success";
        } else {
          return "error";
        }
      }
    } else {
      return "error";
    }
  }
};