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
import "./App.scss";
import { AboutTab } from "./about/about";
import { MeasuresTab } from "./measures/measures";
import { ModelTab } from "./model/model-component";
import { IModel } from "../models/model-model";
import { IDevice } from "../models/device-model";

const kPluginName = "Sample Plugin";
const kVersion = "0.0.1";
const kInitialDimensions = {
  width: 380,
  height: 680
};
// const kDataContextName = "SamplePluginData";

const navTabs = ["Model", "Measures", "About"] as const;
type NavTab = typeof navTabs[number];

export const createDefaultDevice = (id: number): IDevice => ({id, deviceType: "mixer", variables: "number"});

export const App = () => {
  // const [codapResponse, setCodapResponse] = useState<any>(undefined);
  // const [listenerNotification, setListenerNotification] = useState<string>();
  // const [dataContext, setDataContext] = useState<any>(null);
  const [tabSelected, setTabSelected] = useState<NavTab>("Model");
  const [model, setModel] = useState<IModel>({columns: []});

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
    setModel({columns: [{devices: [createDefaultDevice(1)]}]});
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

  const handleTabSelect = (tab: NavTab) => {
    setTabSelected(tab);
  };

  const handleAddDevice = (parentDevice: IDevice) => {
    // find or create the column next to the parent device
    const columns = model.columns.slice();
    const newColumnIndex = columns.findIndex(c => c.devices.includes(parentDevice)) + 1;
    if (!columns[newColumnIndex]) {
      columns[newColumnIndex] = {devices: []};
    }

    // get the max device id so we can increment it for the new device
    const maxDeviceId = model.columns.reduce<number>((acc, {devices}) => {
      return devices.reduce<number>((acc2, {id}) => {
        return Math.max(acc2, id);
      }, acc);
    }, 0);

    columns[newColumnIndex].devices.push(createDefaultDevice(maxDeviceId + 1));
    setModel(prev => ({...prev, columns}));
  };

  const handleDeleteDevice = (device: IDevice) => {
    // find the column for the device
    const columns = model.columns.slice();
    const columnIndex = columns.findIndex(c => c.devices.includes(device));
    if (columnIndex !== -1) {
      let message = "Delete this device?";
      const devices = columns[columnIndex].devices.filter(dev => dev.id !== device.id);
      if (devices.length === 0) {
        // when last device in a column is deleted delete this column and all the devices to the right
        if (columns.length > columnIndex + 1) {
          message = "Delete this device and all the devices to the right of it?";
        }
        columns.length = columnIndex;
      } else {
        columns[columnIndex].devices = devices;
      }
      if (confirm(message)) {
        setModel(prev => ({...prev, columns}));
      }
    } else {
      alert("Sorry, that device could not be found!");
    }
  };

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
        {tabSelected === "Model" && <ModelTab model={model} addDevice={handleAddDevice} deleteDevice={handleDeleteDevice} />}
        {tabSelected === "Measures" && <MeasuresTab />}
        {tabSelected === "About" && <AboutTab />}
      </div>
    </div>
  );
};
