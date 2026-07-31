import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useImmer } from "use-immer";
import { createNewAttribute } from "@concord-consortium/codap-plugin-api";
import { DeviceFooter } from "./device-footer";
import { GlobalStateContext, getDefaultState } from "../../hooks/useGlobalState";
import { getCollectionNames } from "../../helpers/codap-helpers";
import { IGlobalState } from "../../types";

jest.mock("@concord-consortium/codap-plugin-api", () => ({
  codapInterface: {
    sendRequest: jest.fn().mockResolvedValue({ success: true, values: {} }),
    updateInteractiveState: jest.fn(),
    on: jest.fn()
  },
  addDataContextChangeListener: jest.fn(),
  createChildCollection: jest.fn(),
  createDataContext: jest.fn(),
  createNewAttribute: jest.fn(),
  createParentCollection: jest.fn(),
  getAllItems: jest.fn(),
  getAttribute: jest.fn(),
  getAttributeList: jest.fn(),
  getCaseCount: jest.fn(),
  getCollectionList: jest.fn(),
  getDataContext: jest.fn(),
  getListOfDataContexts: jest.fn(),
  initializePlugin: jest.fn(),
  updateAttribute: jest.fn()
}));

const mockCreateNewAttribute = createNewAttribute as jest.Mock;

const dataContextName = "Sampler";
const newAttributeId = "id-output2";

// The component drives real state, so the state updates its handlers make are actually applied.
const StateProvider = ({ initialState, children }: { initialState: IGlobalState, children: React.ReactNode }) => {
  const [globalState, setGlobalState] = useImmer<IGlobalState>(initialState);
  return (
    <GlobalStateContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

const renderDeviceFooter = () => {
  const initialState: IGlobalState = getDefaultState();
  const column = initialState.model.columns[0];
  initialState.dataContextName = dataContextName;
  initialState.attrMap = {
    ...initialState.attrMap,
    [column.id]: { codapID: "id-output", name: column.name }
  };

  render(
    <StateProvider initialState={initialState}>
      <DeviceFooter
        device={column.devices[0]}
        columnIndex={0}
        dataContexts={[]}
        handleUpdateVariables={jest.fn()}
        handleDeleteVariable={jest.fn()}
        handleSelectDataContext={jest.fn()}
        handleSpecifyVariables={jest.fn()}
        clearFixedVariables={jest.fn()}
      />
    </StateProvider>
  );
};

describe("DeviceFooter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateNewAttribute.mockResolvedValue({ success: true, values: { attrs: [{ id: newAttributeId }] } });
  });

  // A column added here has to reach CODAP right away. Otherwise its attribute is missing from the
  // case table until the next experiment run happens to recreate it [SAMPLER-106].
  it("creates the CODAP attribute for a newly added column", async () => {
    renderDeviceFooter();

    fireEvent.click(screen.getByRole("button", { name: "Add Device" }));

    await waitFor(() => expect(mockCreateNewAttribute).toHaveBeenCalledTimes(1));
    expect(mockCreateNewAttribute).toHaveBeenCalledWith(dataContextName, getCollectionNames().items, "output2");
  });
});
