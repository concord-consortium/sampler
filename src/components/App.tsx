import React, { useEffect, useState } from "react";
import {
  // createDataContext,
  // createItems,
  // createNewCollection,
  // createTable,
  // getAllItems,
  // getDataContext,
  initializePlugin,
  // addComponentListener,
  // ClientNotification,
} from "@concord-consortium/codap-plugin-api";
import { useImmer } from "use-immer";

import { AboutTab } from "./about/about";
import { MeasuresTab } from "./measures/measures";
import { ModelTab } from "./model/model-component";
import { IModel } from "../models/model-model";
import { IDevice } from "../models/device-model";
import { Id, createId } from "../utils/id";

import "./App.scss";

const kPluginName = "Sample Plugin";
const kVersion = "0.0.1";
const kInitialDimensions = {
  width: 380,
  height: 680
};
// const kDataContextName = "SamplePluginData";

const navTabs = ["Model", "Measures", "About"] as const;
type NavTab = typeof navTabs[number];

export const createDefaultDevice = (): IDevice => ({id: createId(), deviceType: "mixer", variables: "number"});

export const App = () => {
  // const [codapResponse, setCodapResponse] = useState<any>(undefined);
  // const [listenerNotification, setListenerNotification] = useState<string>();
  // const [dataContext, setDataContext] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<NavTab>("Model");
  const [model, setModel] = useImmer<IModel>({columns: []});
  const [selectedDeviceId, setSelectedDeviceId] = useState<Id|undefined>(undefined);

  useEffect(() => {
    initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions});

    /*
    // this is an example of how to add a notification listener to a CODAP component
    // for more information on listeners and notifications, see
    // https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-Plugin-API#documentchangenotice
    const createTableListener = (listenerRes: ClientNotification) => {
      if (listenerRes.values.operation === "open case table") {
        setListenerNotification("A case table has been created");
      }
    };
    addComponentListener(createTableListener);
    */
  }, []);

  // TODO: replace this with code that listens for the model state from CODAP - right now this just sets an initial model for development
  useEffect(() => {
    setModel({columns: [{devices: [createDefaultDevice()]}]});
  }, [setModel]);

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

  const handleTabSelect = (tab: NavTab) => {
    setSelectedTab(tab);
  };

  const handleAddDevice = (parentDevice: IDevice) => {
    setModel(draft => {
      const newDevice = createDefaultDevice();

      const newColumnIndex = draft.columns.findIndex(c => c.devices.find(d => d.id === parentDevice.id)) + 1;
      if (draft.columns[newColumnIndex]) {
        // column already exists so add the device
        draft.columns[newColumnIndex].devices.push(newDevice);
      } else {
        // create the column and add the device
        draft.columns.splice(newColumnIndex, 0, {devices: [newDevice]});
      }
    });
  };

  const handleDeleteDevice = (device: IDevice) => {
    setModel(draft => {
      const columnIndex = draft.columns.findIndex(c => c.devices.find(d => d.id === device.id));
      if (columnIndex !== -1) {
        const devices = draft.columns[columnIndex].devices.filter(dev => dev.id !== device.id);
        const noMoreDevicesInThisColumn = devices.length === 0;
        const hasColumnsToTheRight = draft.columns.length > columnIndex + 1;
        const question = noMoreDevicesInThisColumn && hasColumnsToTheRight ? "Delete this device and all the devices to the right of it?" : "Delete this device?";
        if (confirm(question)) {
          if (noMoreDevicesInThisColumn) {
            // when last device in a column is deleted delete this column and all the devices to the right if they exist
            draft.columns.splice(columnIndex, draft.columns.length - columnIndex);
          }
          else {
            draft.columns[columnIndex].devices = devices;
          }
        }
      } else {
        alert("Sorry, that device could not be found!");
      }
    });
  };

  return (
    <div className="App">
      <div className="navigationTabs">
        { navTabs.map((tab, index) => {
            return (
              <div key={`${index}`}
                  className={`tab ${selectedTab === tab ? "selected" : ""}`}
                  onClick={() => handleTabSelect(navTabs[index])}>
                {tab}
              </div>
            );
          })
        }
      </div>
      <div className="tab-content">
        {selectedTab === "Model" &&
          <ModelTab
            model={model}
            selectedDeviceId={selectedDeviceId}
            addDevice={handleAddDevice}
            deleteDevice={handleDeleteDevice}
            setSelectedDeviceId={setSelectedDeviceId}
          />
        }
        {selectedTab === "Measures" && <MeasuresTab />}
        {selectedTab === "About" && <AboutTab />}
      </div>
    </div>
  );
};
