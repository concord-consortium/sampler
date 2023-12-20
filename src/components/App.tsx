import React, { useEffect, useState } from "react";
import {
  // createDataContext,
  // createItems,
  // createNewCollection,
  // createTable,
  // getAllItems,
  // getDataContext,
  initializePlugin,
  addComponentListener,
  ClientNotification,
} from "@concord-consortium/codap-plugin-api";
import "./App.scss";
import { AboutTab } from "./about/about";
import { MeasuresTab } from "./measures/measures";
import { ModelTab } from "./model/model-component";

const kPluginName = "Sample Plugin";
const kVersion = "0.0.1";
const kInitialDimensions = {
  width: 380,
  height: 680
};
// const kDataContextName = "SamplePluginData";

export const App = () => {
  // const [codapResponse, setCodapResponse] = useState<any>(undefined);
  const [listenerNotification, setListenerNotification] = useState<string>();
  // const [dataContext, setDataContext] = useState<any>(null);
  const [tabSelected, setTabSelected] = useState("Model");

  useEffect(() => {
    initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions});

    // this is an example of how to add a notification listener to a CODAP component
    // for more information on listeners and notifications, see
    // https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-Plugin-API#documentchangenotice
    const createTableListener = (listenerRes: ClientNotification) => {
      if (listenerRes.values.operation === "open case table") {
        setListenerNotification("A case table has been created");
      }
    };
    addComponentListener(createTableListener);
  }, []);

  // const handleOpenTable = async () => {
  //   const res = await createTable(dataContext, kDataContextName);
  //   setCodapResponse(res);
  // };

  // const handleCreateData = async() => {
  //   const existingDataContext = await getDataContext(kDataContextName);
  //   let createDC, createNC, createI;
  //   if (!existingDataContext.success) {
  //     createDC = await createDataContext(kDataContextName);
  //     setDataContext(createDC.values);
  //   }
  //   if (existingDataContext?.success || createDC?.success) {
  //     createNC = await createNewCollection(kDataContextName, "Pets", [{name: "type", type: "string"}, {name: "number", type: "number"}]);
  //     createI = await createItems(kDataContextName, [ {type: "dog", number: 5},
  //                                     {type: "cat", number: 4},
  //                                     {type: "fish", number: 20},
  //                                     {type: "horse", number: 1},
  //                                     {type: "bird", number: 8},
  //                                     {type: "hamster", number: 3}
  //                                   ]);
  //   }

  //   setCodapResponse(`Data context created: ${JSON.stringify(createDC)}
  //   New collection created: ${JSON.stringify(createNC)}
  //   New items created: ${JSON.stringify(createI)}`
  //                   );
  // };

  // const handleGetResponse = async () => {
  //   const result = await getAllItems(kDataContextName);
  //   setCodapResponse(result);
  // };

  const handleTabSelect = (tab: string) => {
    setTabSelected(tab);
  };

  const navTabs = ["Model", "Measures", "About"];

  return (
    <div className="App">
      <div className="navigationTabs">
        { navTabs.map((tab, index) => {
            return (
              <div key={`${index}`}
                  className={`tab ${tabSelected === tab ? "selected" : ""}`}
                  onClick={() => handleTabSelect(navTabs[index])}>
                {tab}
              </div>
            );
          })
        }
      </div>
      <div className="tab-content">
        {tabSelected === "Model" && <ModelTab />}
        {tabSelected === "Measures" && <MeasuresTab />}
        {tabSelected === "About" && <AboutTab />}
      </div>
    </div>
  );
};
