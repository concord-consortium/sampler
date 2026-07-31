import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getAttribute, getCollectionList, updateAttribute } from "@concord-consortium/codap-plugin-api";
import { ColumnHeader } from "./column-header";
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

// Stand in for a non-English locale, where the items collection is not named "items". Only the
// collection name matters here, so every other string resolves to its own id.
const itemsCollectionName = "objekter";
jest.mock("../../utils/localeManager", () => ({
  tr: (key: string) => key === "DG.Plugin.Sampler.dataset.item-collection-name" ? "objekter" : key
}));

const mockGetAttribute = getAttribute as jest.Mock;
const mockGetCollectionList = getCollectionList as jest.Mock;
const mockUpdateAttribute = updateAttribute as jest.Mock;

const dataContextName = "Sampler";
const oldName = "output";
const newName = "choice";

const renderColumnHeader = () => {
  const globalState: IGlobalState = getDefaultState();
  const column = globalState.model.columns[0];
  column.name = oldName;
  globalState.dataContextName = dataContextName;
  globalState.attrMap = {
    ...globalState.attrMap,
    [column.id]: { codapID: "id-output", name: oldName }
  };

  render(
    <GlobalStateContext.Provider value={{ globalState, setGlobalState: jest.fn() }}>
      <ColumnHeader column={column} columnIndex={0} />
    </GlobalStateContext.Provider>
  );

  return { column };
};

describe("ColumnHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAttribute.mockResolvedValue({ success: true, values: { id: "id-output", name: oldName } });
    mockUpdateAttribute.mockResolvedValue({ success: true });
    // no collections to walk, so renaming the attribute in formulas is a no-op here
    mockGetCollectionList.mockResolvedValue({ success: false });
  });

  // Renaming a column has to reach CODAP. When it doesn't, the case table keeps the old attribute
  // and running the experiment adds the new one alongside it [SAMPLER-106].
  it("renames the CODAP attribute when the column is renamed", async () => {
    renderColumnHeader();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: newName } });
    fireEvent.blur(screen.getByRole("textbox"));

    await waitFor(() => expect(mockUpdateAttribute).toHaveBeenCalledTimes(1));
    expect(mockUpdateAttribute).toHaveBeenCalledWith(
      dataContextName, itemsCollectionName, oldName, expect.anything(), { name: newName }
    );
  });
});
