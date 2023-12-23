// import {
//   codapInterface,
//   createDataContext,
//   getDataContext,
//   createParentCollection,
//   createChildCollection,
//   createItems,
//   createTable,
//   getCollectionList,
//   getAttributeList,
// } from "@concord-consortium/codap-plugin-api";
// import { tr } from "../utils/localeManager.js";


// const kDataContextName = "SamplerPluginDataContext";
// const defaultDeviceName = tr("DG.plugin.Sampler.dataset.attr-output");
// const defaultTableName = tr("DG.plugin.Sampler.dataset.name") || "experiments/samples/items";
// const dataContextPhrase = `dataContext[${kDataContextName}]`;


// /**
//  * Codap communications module
//  *
//  * Additional layer of abstraction over the codap interface module to allow us
//  * to keep our lengthy communications with codap out of the way.
//  */

// // import {updateDeviceName} from './app.js';

// // export const updateUIDeviceName = (name: string) => {
// //   document.getElementById("device_name").value = name;
// //   if (document.getElementById("select-measure").value) {
// //     updateSelectOptions();
// //   }
// // }

// // export const updateDeviceName = (name: string) => {
// //   updateUIDeviceName(name);
// // };

// // let drawAttributes = null;
// // let collectionAttributes = null;

// type TAttribute = {
//   name: string;
//   formula?: string;
//   description?: string;
//   type?: string;
//   cid?: string;
//   precision?: string;
//   unit?: string;
//   editable?: boolean;
//   renameable?: boolean;
//   deleteable?: boolean;
//   hidden?: boolean;
// }

// interface IAttrMap {
//   experiment: {id: string, name: string};
//   description: {id: string, name: string};
//   sample_size: {id: string, name: string};
//   sample: {id: string, name: string};
//   output: {id: string, name: string};
// }

// const getCollectionNames = () => {
//   return {
//     experiments: tr("DG.plugin.Sampler.dataset.col-experiments"),
//     samples: tr("DG.plugin.Sampler.dataset.col-samples"),
//     items: tr("DG.plugin.Sampler.dataset.col-items")
//   }
// };

// const attrMap = {
//   experiment: {id: null, name: tr("DG.plugin.Sampler.dataset.attr-experiment")},
//   description: {id: null, name: tr("DG.plugin.Sampler.dataset.attr-description")},
//   sample_size: {id: null, name: tr("DG.plugin.Sampler.dataset.attr-sample_size")},
//   sample: {id: null, name: tr("DG.plugin.Sampler.dataset.attr-sample")},
//   output: {id: null, name: tr("DG.plugin.Sampler.dataset.attr-output")},
// };

// const findKeyById = (id: keyof typeof attrMap | null) => {
//   for (const key in attrMap) {
//     if (attrMap[key as keyof typeof attrMap].id === id) {
//       return key as keyof typeof attrMap;
//     }
//   }
//   return null; // Return null if no matching id is found
// };

//   // listen for changes to attribute names, and update internal names accordingly
// // export const updateAttributeNameListener = () => {
// //   codapInterface.on("notify", `dataContextChangeNotice[${tableName}]`, function(msg) {
// //     if (msg.values.operation === "updateAttributes") {
// //      msg.values.result.attrIDs.forEach((id: string, i: number) => {
// //        const attrName = msg.values.result.attrs[i].name;
// //        const attrKey = findKeyById(id);
// //        // update the device name if the user has changed it in the codap table
// //        if (attrKey === "output" && attrMap["output"].name !== attrName) {
// //          // setDeviceName(attrName);
// //          updateDeviceName(attrName);
// //        }
// //        if (attrKey && attrMap[attrKey]) {
// //          attrMap[attrKey].name = attrName;
// //        }
// //      });
// //    }
// //  });
// // }

// export const findOrCreateDataContext = async () => {
//   const existingDataContext = await getDataContext(kDataContextName);
//   if (existingDataContext.success) {
//     // get all the existing attributes in the context
//     // get the existing attributes ids
//     // map them to their appropriate collections
//     const allAttrs = [{collection: "experiments", attrName: attrMap.experiment.name},
//                       {collection: "experiments", attrName: attrMap.description.name},
//                       {collection: "experiments", attrName: attrMap.sample_size.name},
//                       {collection: "samples", attrName: attrMap.sample.name},
//                       {collection: "items", attrName: attrMap["output"].name}
//                     ];
//     const reqs = allAttrs.map(collectionAttr => ({
//                                 "action": "get",
//                                 "resource": `dataContext[${kDataContextName}].collection[${collectionAttr[0]}].attribute[${collectionAttr[1]}]`
//                               }));
//     codapInterface.sendRequest(reqs, function(getAttrsResult: any) {
//       getAttrsResult.forEach(res => {
//         if (res.success) {
//           if (res.values.name === attrMap["output"].name) { //keep track of attr ids just incase user has changed attr name.
//             attrMap["output"].id = res.values.id;
//           } else {
//             attrMap[res.values.name].id = res.values.id;
//           }
//         }
//       });
//     });
//   // DataSet already exists. If we haven't loaded in attribute ids from saved state, that means user
//   // created dataset before we were tracking attribute changes. Try to get ids, but if the user has
//   // already updated attribute names, this won't work.
//     const onlyIds = [];
//     for (const key in attrMap) {
//         onlyIds.push(attrMap[key].id);
//       }
//       if (onlyIds.indexOf(null) > -1) {
//         getAttributeIds();
//       }
//   } else
//   if (!existingDataContext.success) {
//     const createDCRes = await createDataContext(kDataContextName);
//     const collectionNames = getCollectionNames();
//     if (createDCRes.success) {
//       const parentAttrs = [
//                           {name: attrMap.experiment.name, type: 'categorical'},
//                           {name: attrMap.description.name, type: 'categorical'},
//                           {name: attrMap.sample_size.name, type: 'categorical'}
//                         ];
//       const sampleAttrs = [{name: attrMap.sample.name, type: 'categorical'}];
//       const itemsAttrs = [{name: attrMap["output"].name}];
//       const createExperimentsCollection = await createParentCollection(kDataContextName, collectionNames.experiments, parentAttrs);
//       if (createExperimentsCollection.success) {
//         const createSamplesCollection = await createChildCollection(kDataContextName, collectionNames.samples, collectionNames.experiments, sampleAttrs);
//         if (createSamplesCollection.success) {
//           const createOutputCollection = await createChildCollection(kDataContextName, collectionNames.items, collectionNames.samples, itemsAttrs);
//         }
//       }
//     }


//     // create collections with set attributes
//     //         if (deviceName && deviceName !== _this.attrMap["output"].name) {
//     //           _this.deviceName = deviceName;
//     //           _this.attrMap["output"].name = deviceName;
//     //         }
//     //         codapInterface.sendRequest({
//     //           action: 'create',
//     //           resource: 'dataContext',
//     //           values: {
//     //             name: targetDataSetName,
//     //             collections: [
//     //               {
//     //                 name: collectionNames.experiments,
//     //                 attrs: [
//     //                   {name: _this.attrMap.experiment.name, type: 'categorical'},
//     //                   {name: _this.attrMap.description.name, type: 'categorical'},
//     //                   {name:  _this.attrMap.sample_size.name, type: 'categorical'}
//     //                 ],
//     //                 // childAttrName: "experiment"
//     //               },
//     //               {
//     //                 name: collectionNames.samples,
//     //                 parent: collectionNames.experiments,
//     //                 // The parent collection has just one attribute
//     //                 attrs: [{name: _this.attrMap.sample.name, type: 'categorical'}],
//     //                 // childAttrName: "sample"
//     //               },
//     //               {
//     //                 name: collectionNames.items,
//     //                 parent: collectionNames.samples,
//     //                 // labels: {
//     //                 //   pluralCase: "items"
//     //                 // },
//     //                 // The child collection also has just one attribute
//     //                 attrs: [{name: _this.attrMap["output"].name}]
//     //               }
//     //             ]
//     //           }
//     //         }, getAttributeIds).then(
//     //             _this.openTable,
//     //             function (e) {
//     //               console.log('Sampler: findOrCreateDataContext failed: ' + e);
//     //             });
//     //       }
//   }
// };

//   // findOrCreateDataContext: function (deviceName) {
//   //   const _this = this;
//   //   const collectionNames = this.getCollectionNames();

//   //   this.codapConnected = true;
//   //   // Determine if CODAP already has the Data Context we need.
//   //   // If not, create it.
//   //   return codapInterface.sendRequest({
//   //         action:'get',
//   //         resource: getTargetDataSetPhrase()
//   //       }).then( function (getDatasetResult) {

//   //       function getAttributeIds() {
//   //         // need to get all the ids of the newly-created attributes, so we can notice if they change.
//   //         // we will set these ids on the attrIds object
//   //         const allAttrs = [["experiments", _this.attrMap.experiment.name],["experiments", _this.attrMap.description.name],
//   //                           ["experiments", _this.attrMap.sample_size.name], ["samples", _this.attrMap.sample.name], ["items", _this.attrMap["output"].name]];
//   //         const reqs = allAttrs.map(collectionAttr => ({
//   //             "action": "get",
//   //             "resource": `dataContext[${targetDataSetName}].collection[${collectionAttr[0]}].attribute[${collectionAttr[1]}]`
//   //         }));
//   //         codapInterface.sendRequest(reqs, function(getAttrsResult) {
//   //           getAttrsResult.forEach(res => {
//   //             if (res.success) {
//   //               if (res.values.name === _this.attrMap["output"].name) {
//   //                 _this.attrMap["output"].id = res.values.id;
//   //               } else {
//   //                 _this.attrMap[res.values.name].id = res.values.id;
//   //               }
//   //             }
//   //           });
//   //         });
//   //       }

//   //       if (getDatasetResult && !getDatasetResult.success) {
//   //         if (deviceName && deviceName !== _this.attrMap["output"].name) {
//   //           _this.deviceName = deviceName;
//   //           _this.attrMap["output"].name = deviceName;
//   //         }
//   //         codapInterface.sendRequest({
//   //           action: 'create',
//   //           resource: 'dataContext',
//   //           values: {
//   //             name: targetDataSetName,
//   //             collections: [
//   //               {
//   //                 name: collectionNames.experiments,
//   //                 attrs: [
//   //                   {name: _this.attrMap.experiment.name, type: 'categorical'},
//   //                   {name: _this.attrMap.description.name, type: 'categorical'},
//   //                   {name:  _this.attrMap.sample_size.name, type: 'categorical'}
//   //                 ],
//   //                 // childAttrName: "experiment"
//   //               },
//   //               {
//   //                 name: collectionNames.samples,
//   //                 parent: collectionNames.experiments,
//   //                 // The parent collection has just one attribute
//   //                 attrs: [{name: _this.attrMap.sample.name, type: 'categorical'}],
//   //                 // childAttrName: "sample"
//   //               },
//   //               {
//   //                 name: collectionNames.items,
//   //                 parent: collectionNames.samples,
//   //                 // labels: {
//   //                 //   pluralCase: "items"
//   //                 // },
//   //                 // The child collection also has just one attribute
//   //                 attrs: [{name: _this.attrMap["output"].name}]
//   //               }
//   //             ]
//   //           }
//   //         }, getAttributeIds).then(
//   //             _this.openTable,
//   //             function (e) {
//   //               console.log('Sampler: findOrCreateDataContext failed: ' + e);
//   //             });
//   //       } else if (getDatasetResult.success) {
//   //         // DataSet already exists. If we haven't loaded in attribute ids from saved state, that means user
//   //         // created dataset before we were tracking attribute changes. Try to get ids, but if the user has
//   //         // already updated attribute names, this won't work.
//   //         const onlyIds = [];
//   //         for (const key in _this.attrMap) {
//   //           onlyIds.push(_this.attrMap[key].id);
//   //         }
//   //         if (onlyIds.indexOf(null) > -1) {
//   //           getAttributeIds();
//   //         }
//   //       }
//   //     }
//   //   );
//   // },

//   // error: function(msg) {
//   //   console.log(msg || "Failed to connect to CODAP");
//   //   this.codapConnected = false;
//   // },

// // const startNewExperimentInCODAP = (experimentNumber, description, sampleSize) => {
// //   if (!codapConnected) {
// //     console.log('Not in CODAP');
// //     return;
// //   }

// //   const itemProto = {
// //     experiment: experimentNumber,
// //     description: description,
// //     sample_size: sampleSize
// //   };
// // }

//   // openTable: function() {
//   //   if (!this.codapConnected) {
//   //     return;
//   //   }

//   //   return codapInterface.sendRequest({
//   //     action: 'create',
//   //     resource: 'component',
//   //     values: {
//   //       type: 'caseTable',
//   //       dataContext: targetDataSetName,
//   //       isIndexHidden: true
//   //     }
//   //   });
//   // },

// const addMultipleSamplesToCODAP = (samples, isCollector, deviceName) => {
//     const oldDeviceName = deviceName;
//     const collectionNames = getCollectionNames();
//     if (deviceName !== attrMap["output"].name) {
//       attrMap["output"].name = deviceName;
//     };
//     const items = [];
//     samples.forEach(function (sample) {
//       var run = sample.run;
//       var item;
//       sample.values.forEach(function(v) {
//         if (!isCollector) {
//           item = Object.assign({}, {sample: run, output: v}, itemProto);
//         } else {
//           item = Object.assign({}, v, {sample: run}, itemProto);
//         }
//         items.push(item);
//       });
//     });
//     // rename all the attributes to any new names that the user has changed them to.
//     // easiest to do this all in one place here.
//     items.forEach(function (item) {
//       const attrKeys = Object.keys(item);
//       attrKeys.forEach(function (attrKey) {
//         if (Object.keys(_this.attrMap).includes(attrKey)) {
//           if (_this.attrMap[attrKey].name !== attrKey) {
//             item[_this.attrMap[attrKey].name] = item[attrKey];
//             delete item[attrKey];
//           }
//         }
//       })
//     });

//     if (oldDeviceName !== deviceName) {
//       //****  updateAttribute: (dataContextName: string, collectionName: string, attributeName: string, attribute: Attribute, values: CodapItemValues)
//       codapInterface.sendRequest({
//         action: "update",
//         resource: `dataContext[${targetDataSetName}].collection[items].attribute[${oldDeviceName}]`,
//         values: {
//           "name": deviceName
//         }
//       }, () => _this.deviceName = deviceName).then(() => {
//         //**** createItemscreateItems: (dataContextName: string, items: Array<CodapItemValues>) => Promise<IResult>
//         codapInterface.sendRequest({
//           action: 'create',
//           resource: getTargetDataSetPhrase() + '.item',
//           values: items
//         });
//       });
//     } else {
//     // user might have deleted all attributes in collection
//     // if so, create a new collection with attribute, and create items
//     // if not, check if attr exists
//     // if attr exists, update as normal, else create it first
//     //***** getCollection: (dataContextName: string, collectionName: string) => Promise<IResult> */
//       codapInterface.sendRequest({
//         action: "get",
//         resource: `dataContext[${targetDataSetName}].collection[${collectionNames.items}]`,
//       }).then((res) => {
//         if (!res.success) {
//           //***** createChildCollection: (dataContextName: string, collectionName: string, parentCollectionName: string, attrs?: Attribute[]) => Promise<IResult> */
//           codapInterface.sendRequest({
//             action: "create",
//             resource: `dataContext[${targetDataSetName}].collection`,
//             values: {
//               name: collectionNames.items,
//               parent: collectionNames.samples,
//               attrs: [{name: deviceName,title: deviceName}]
//             }
//           }).then((res) => {
//             if (res.success) {
//               //***** createItems: (dataContextName: string, items: Array<CodapItemValues>) => Promise<IResult> */
//               codapInterface.sendRequest({
//                 action: "create",
//                 resource: getTargetDataSetPhrase() + "item",
//                 values: items
//               });
//             }
//           })
//         } else {
//           /***** getAttributeList: (dataContextName: string, collectionName: string) => Promise<IResult> */
//           codapInterface.sendRequest({
//             action: "get",
//             resource: `dataContext[${targetDataSetName}].collection[items].attributeList`,
//           }).then((res) => {
//             const {values} = res;
//             if (!values.length || !values.find((attr) => attr.name === deviceName)) {
//               //*****  createNewAttribute: (dataContextName: string, collectionName: string, attributeName: string) => Promise<IResult> */
//               codapInterface.sendRequest({
//                 action: "create",
//                 resource: `dataContext[${targetDataSetName}].collection[items].attribute`,
//                 values: [
//                   {
//                     name: deviceName,
//                     title: deviceName
//                   }
//                 ]
//               }).then((res) => {
//                 if (res.success) {
//                   //***** createItems: (dataContextName: string, items: Array<CodapItemValues>) => Promise<IResult> */
//                   codapInterface.sendRequest({
//                     action: "create",
//                     resource: getTargetDataSetPhrase() + ".item",
//                     values: items
//                   });
//                 }
//               })
//             } else {
//               //***** createItems: (dataContextName: string, items: Array<CodapItemValues>) => Promise<IResult> */
//               codapInterface.sendRequest({
//                 action: "create",
//                 resource: getTargetDataSetPhrase() + ".item",
//                 values: items
//               });
//             }
//           });
//         }
//       })
//     }
// };

// const addValuesToCODAP = (run, vals, isCollector, deviceName) => {
//   addMultipleSamplesToCODAP([{run: run, values: vals}], isCollector, deviceName);
// };

//   getContexts: function() {
//     var _this = this;
//     return new Promise(function(resolve, reject) {
//       if (!_this.codapConnected) {
//         // we log that CODAP is not initiated. If we are in CODAP, it will
//         // respond eventually.
//         console.log('Not in CODAP');
//       }
// //***** keep this one -- not in library */
//       codapInterface.sendRequest({
//         action: 'get',
//         resource: 'dataContextList'
//       }, function(result) {
//         if (result && result.success) {
//           resolve(result.values);
//         } else {
//           resolve([]);
//         }
//       });
//     });
//   },

//   setCasesFromContext: function(contextName, caseVariables) {
//     var _this = this;
//     return new Promise(function(resolve, reject) {

//       function setCasesGivenCount (results) {
//         if (results.success) {
//           caseVariables = [];
//           //***** Keep this*/
//           codapInterface.sendRequest({
//             action: 'get',
//             resource: _this.collectionResourceName + '.allCases'
//           }).then(function(results) {
//             caseVariables = results.values.cases.map(function(_case) {
//               return _case.case.values;
//             });
//             resolve(caseVariables);
//          });
//         }
//       }

//       function addAttributes() {
//         const requests = []
//         _this.collectionAttributes.forEach(function (attr) {
//           if (_this.drawAttributes.indexOf(attr) < 0) {
//             requests.push({
//               action: 'create',
//               resource: getTargetDataSetPhrase() + '.collection[' +
//                   _this.getCollectionNames().items + '].attribute',
//               values: [attr]
//             });
//           }
//         });


//         codapInterface.sendRequest(requests);
//       }

//       function setCollection (result) {

//         if (result.success) {
//           _this.collectionResourceName = "dataContext[" + contextName + "].collection[" +
//               result.values[0].name + "]";
//           codapInterface.sendRequest([
//             {     // get the existing columns in the draw table
//               action: 'get',
//               resource: getTargetDataSetPhrase() + '.collection[' +
//                   _this.getCollectionNames().items + '].attributeList'
//             },
//             {     // get the columns we'll be needing
//               action: 'get',
//               resource: _this.collectionResourceName
//             },
//             {     // get the number of cases
//               action: 'get',
//               resource: _this.collectionResourceName + '.caseCount'
//             }
//           ]).then(function(results) {
//             _this.drawAttributes = results[0].values.map(function (res) {
//               return res.name;
//             });
//             _this.collectionAttributes = results[1].values.attrs.map(function (attr) {
//               // we will use the attribute definitions to create new attributes
//               // so we take the precaution of removing identifiers.
//               delete attr.id; delete attr.guid; return attr;
//             });
//             addAttributes();    // throw this over the wall
//             return results[2];
//           }).then(setCasesGivenCount);
//         }
//       }

//       _this.findOrCreateDataContext().then(function () {
//         return codapInterface.sendRequest({
//           action: 'get',
//           resource: 'dataContext[' + contextName + '].collectionList'
//         })
//       }).then(setCollection);
//     });
//   },

//   logAction: function( iMsg, iReplaceArgs) {
//     codapInterface.sendRequest({
//       action: 'notify',
//       resource: 'logMessage',
//       values: {
//         formatStr: iMsg,
//         replaceArgs: iReplaceArgs
//       }
//     });
//   },

//   myCODAPId: null,
//   selectSelf: function () {
//     function selectSelf(id) {
//         return codapInterface.sendRequest({
//           action: 'notify',
//           resource: `component[${id}]`,
//           values: {
//             request: 'select'
//           }
//         });
//     }
//     if (this.myCODAPId == null) {
//       codapInterface.sendRequest({action: 'get', resource: 'interactiveFrame'}).then(function (resp) {
//         if (resp.success) {
//           this.myCODAPId = resp.values.id;
//           selectSelf(this.myCODAPId);
//         }
//       }.bind(this));
//     } else {
//       selectSelf(this.myCODAPId);
//     }
//   },

//   register: function (action, resource, operation, callback) {
//     codapInterface.on(action, resource, operation, callback);
//   },

//   sendFormulaToTable: async function (measureName, measureType, selections) {
//     var samplesColl = this.getCollectionNames().samples;

//     function getFormula() {
//       switch (measureType) {
//         case "sum":
//           return `sum(\`${selections.output}\`)`;
//         case "conditional_count":
//           return `count(\`${selections.output}\`${selections.operator}'${selections.value}')`;
//         case "conditional_percentage":
//           return `100 * count(\`${selections.output}\`${selections.operator} '${selections.value}')/count()`;
//         case "mean":
//           return `mean(\`${selections.output}\`)`;
//         case "median":
//           return `median(\`${selections.output}\`)`;
//         case "conditional_sum":
//           return `sum(\`${selections.output}\`, \`${selections.output2}\`${selections.operator}'${selections.value}')`;
//         case "conditional_mean":
//           return `mean(\`${selections.output}\`, \`${selections.output2}\`${selections.operator}'${selections.value}')`;
//         case "conditional_median":
//           return `median(\`${selections.output}\`, \`${selections.output2}\`${selections.operator}'${selections.value}')`;
//         case "difference_of_means":
//           return `min(mean(\`${selections.outputPt1}\`, \`${selections.outputPt12}\`${selections.operatorPt1}'${selections.valuePt1}'), mean(\`${selections.outputPt2}\`, \`${selections.outputPt22}\`${selections.operatorPt2}'${selections.valuePt2}'))`;
//         case "difference_of_medians":
//           return `min(median(\`${selections.outputPt1}\`, \`${selections.outputPt12}\`${selections.operatorPt1}'${selections.valuePt1}'), mean(\`${selections.outputPt2}\`, \`${selections.outputPt22}\`${selections.operatorPt2}'${selections.valuePt2}'))`;
//         default:
//           return "";
//       }
//     }

//     codapInterface.sendRequest({
//       action: "get",
//       resource: `${getTargetDataSetPhrase()}.collection[${samplesColl}].attributeList`
//     }).then((res) => {
//       const attrs = res.values;
//       let newAttributeName = measureName ? measureName : measureType;
//       // check if attr name is already used. user could add "conditional count" twice, for example,
//       // but have difference formulas (output = a, output = b)
//       const attrNameAlreadyUsed = attrs.find((attr) => attr.name === newAttributeName);

//         if (!attrNameAlreadyUsed) {
//           codapInterface.sendRequest({
//             action: 'create',
//             resource: `${getTargetDataSetPhrase()}.collection[${samplesColl}].attribute`,
//             values: [{
//               "name": newAttributeName,
//               "type": "numerical",
//               "formula": getFormula()
//             }]
//           });
//         } else if (attrNameAlreadyUsed && !measureName) {
//           const attrsWithSameName = attrs.filter((attr) => attr.name.startsWith(newAttributeName));
//           const indexes = attrsWithSameName.map((attr) => Number(attr.name.slice(newAttributeName.length)));
//           const highestIndex = Math.max(...indexes);
//           if (!highestIndex) {
//             newAttributeName = newAttributeName + 1;
//           } else {
//             for (let i = 1; i <= highestIndex; i++) {
//               const nameWithIndex = newAttributeName + i;
//               const isNameWithIndexUsed = attrsWithSameName.find((attr) => attr.name === nameWithIndex);
//               if (!isNameWithIndexUsed) {
//                 newAttributeName = nameWithIndex;
//                 break;
//               } else if (i === highestIndex) {
//                 newAttributeName = newAttributeName + (highestIndex + 1);
//               }
//             }
//           }
//           codapInterface.sendRequest({
//             action: 'create',
//             resource: `${getTargetDataSetPhrase()}.collection[${samplesColl}].attribute`,
//             values: [{
//               "name": newAttributeName,
//               "type": "numerical",
//               "formula": getFormula()
//             }]
//           });
//         } else if (attrNameAlreadyUsed && measureName) {
//           codapInterface.sendRequest({
//             action: 'update',
//             resource: `${getTargetDataSetPhrase()}.collection[${samplesColl}].attribute[${measureName}]`,
//             values: {
//               "formula": getFormula()
//             }
//           });
//         }
//       })
//   },

//   updateDeviceNameInTable: function (name) {
//     const _this = this;
//     codapInterface.sendRequest({
//       action: "get",
//       resource: getTargetDataSetPhrase()
//     }).then((res) => {
//       if (res.success) {
//         codapInterface.sendRequest({
//           action: "update",
//           resource: `dataContext[${targetDataSetName}].collection[items].attribute[${_this.deviceName}]`,
//           values: {
//             "name": name
//           }
//         }).then((res) => {
//           if (res.success) {
//             _this.attrMap["output"].name = name;
//             _this.deviceName = name;
//           } else {
//             console.log(`Error: Could not update the CODAP attribute ${_this.deviceName}`);
//           }
//         });
//       } else {
//         console.log("Error: Could not find the CODAP table");
//       }
//     });
//   },

//   getAttributesFromTable: function () {
//     var _this = this;
//     return new Promise(function(resolve, reject) {
//       if (!_this.codapConnected) {
//         // we log that CODAP is not initiated. If we are in CODAP, it will
//         // respond eventually.
//         console.log('Not in CODAP');
//       }

//       codapInterface.sendRequest({
//         action: "get",
//         resource: `dataContext[${targetDataSetName}].collection[${_this.getCollectionNames().items}].attributeList`,
//       }, function(result) {
//         if (result && result.success) {
//           resolve(result.values);
//         } else {
//           resolve([]);
//         }
//       });
//     });
//   },

//   getAllItems: function () {
//     var _this = this;
//     return new Promise(function(resolve, reject) {
//       if (!_this.codapConnected) {
//         // we log that CODAP is not initiated. If we are in CODAP, it will
//         // respond eventually.
//         console.log('Not in CODAP');
//       }

//       codapInterface.sendRequest({
//         "action": "get",
//         "resource": `dataContext[${targetDataSetName}].itemSearch[*]`
//       }, function (result) {
//         if (result.success) {
//           resolve(result.values);
//         } else {
//           resolve([]);
//         }
//       });
//     });
//   },
// };

// export { CodapCom };

