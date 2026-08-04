import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useImmer } from "use-immer";
import { createNewAttribute } from "@concord-consortium/codap-plugin-api";
import { DeviceFooter } from "./device-footer";
import { GlobalStateContext, getDefaultState } from "../../hooks/useGlobalState";
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

// Stand in for a non-English locale, where the items collection is not named "items", so that the
// expected collection name cannot come out of the same call the code under test makes. The rest are
// named so the test reads in English; anything else resolves to its own id.
const itemsCollectionName = "objekter";
jest.mock("../../utils/localeManager", () => ({
  tr: (key: string) => {
    switch (key) {
      case "DG.Plugin.Sampler.dataset.item-collection-name": return "objekter";
      case "DG.Plugin.Sampler.dataset.attr-value": return "output";
      case "DG.Plugin.Sampler.device-add": return "Add Device";
      default: return key;
    }
  }
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

const renderDeviceFooter = ({ existingAttrNamed }: { existingAttrNamed?: string } = {}) => {
  const initialState: IGlobalState = getDefaultState();
  const column = initialState.model.columns[0];
  initialState.dataContextName = dataContextName;
  initialState.attrMap = {
    ...initialState.attrMap,
    [column.id]: { codapID: "id-output", name: column.name },
    ...(existingAttrNamed ? { "stale-column": { codapID: "id-existing", name: existingAttrNamed } } : {})
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
  // case table until the next experiment run happens to recreate it.
  it("creates the CODAP attribute for a newly added column", async () => {
    renderDeviceFooter();

    fireEvent.click(screen.getByRole("button", { name: "Add Device" }));

    await waitFor(() => expect(mockCreateNewAttribute).toHaveBeenCalledTimes(1));
    expect(mockCreateNewAttribute).toHaveBeenCalledWith(dataContextName, itemsCollectionName, "output2");
  });

  // A create CODAP answers no to leaves the column with no attribute behind it, which is worth
  // saying out loud even though the next run recreates it.
  it("reports a create CODAP refuses", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    mockCreateNewAttribute.mockResolvedValue({ success: false });
    renderDeviceFooter();

    fireEvent.click(screen.getByRole("button", { name: "Add Device" }));

    await waitFor(() => expect(warn).toHaveBeenCalledWith(expect.stringContaining("output2")));
    warn.mockRestore();
  });

  // A create that stops answering is reported by tryRequest rather than here, so this checks the
  // handler survives it rather than that it speaks up twice.
  it("survives a create that never answers", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    mockCreateNewAttribute.mockRejectedValue(new Error("connection closed"));
    renderDeviceFooter();

    fireEvent.click(screen.getByRole("button", { name: "Add Device" }));

    await waitFor(() => expect(warn).toHaveBeenCalled());
    warn.mockRestore();
  });

  // An attrMap entry already carrying the new column's name is re-keyed onto it, and the attribute
  // it names is already in CODAP, so asking for another one would be asking for a duplicate.
  it("does not create an attribute when one already answers to the new column's name", async () => {
    renderDeviceFooter({ existingAttrNamed: "output2" });

    fireEvent.click(screen.getByRole("button", { name: "Add Device" }));
    await act(async () => undefined);

    expect(mockCreateNewAttribute).not.toHaveBeenCalled();
  });
});
