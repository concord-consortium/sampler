import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useImmer } from "use-immer";
import { getAttribute, getAttributeList, updateAttribute } from "@concord-consortium/codap-plugin-api";
import { ColumnHeader } from "./column-header";
import { GlobalStateContext, getDefaultState } from "../../hooks/useGlobalState";
import { createDefaultDevice } from "../../models/device-model";
import { IGlobalState, IGlobalStateContext } from "../../types";

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
const mockGetAttributeList = getAttributeList as jest.Mock;
const mockUpdateAttribute = updateAttribute as jest.Mock;

const dataContextName = "Sampler";
const attributeId = "id-output";
const oldName = "output";
const newName = "choice";

const stateWithColumn = ({ withAttrMapEntry = true } = {}) => {
  const globalState: IGlobalState = getDefaultState();
  const column = globalState.model.columns[0];
  column.name = oldName;
  globalState.dataContextName = dataContextName;
  globalState.attrMap = {
    ...globalState.attrMap,
    ...(withAttrMapEntry ? { [column.id]: { codapID: attributeId, name: oldName } } : {})
  };
  return { globalState, column };
};

// Some of what the commit does is only observable in the state it writes, so these render against a
// real store rather than a stub updater, which would never run the recipe at all.
let store: IGlobalStateContext;
const StateProvider = ({ initialState, children }: { initialState: IGlobalState, children: React.ReactNode }) => {
  const [globalState, setGlobalState] = useImmer<IGlobalState>(initialState);
  store = { globalState, setGlobalState };
  return <GlobalStateContext.Provider value={store}>{children}</GlobalStateContext.Provider>;
};

const renderWithStore = () => {
  const { globalState, column } = stateWithColumn();
  render(
    <StateProvider initialState={globalState}>
      <ColumnHeader column={column} columnIndex={0} />
    </StateProvider>
  );
  return { column };
};

// Answers the way CODAP does: an attribute is found under the name it currently holds, and renaming
// one it no longer holds fails. Enough to tell a second commit from the first.
const fakeCodap = (initialName: string) => {
  let heldName = initialName;
  mockGetAttribute.mockImplementation(async (_ctx: string, _coll: string, name: string) =>
    name === heldName ? { success: true, values: { name } } : { success: false });
  mockUpdateAttribute.mockImplementation(
    async (_ctx: string, _coll: string, name: string, _attr: unknown, values: { name: string }) => {
      if (name !== heldName) return { success: false };
      heldName = values.name;
      return { success: true };
    });
  return { heldName: () => heldName };
};

const typeNewName = () => {
  const textbox = screen.getByRole("textbox");
  textbox.focus();
  fireEvent.change(textbox, { target: { value: newName } });
  return textbox;
};

const renderColumnHeader = (options?: { withAttrMapEntry?: boolean }) => {
  const { globalState, column } = stateWithColumn(options);
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
    mockGetAttribute.mockResolvedValue({ success: true, values: { id: attributeId, name: oldName } });
    mockUpdateAttribute.mockResolvedValue({ success: true });
  });

  // Renaming a column has to reach CODAP. When it doesn't, the case table keeps the old attribute
  // and running the experiment adds the new one alongside it.
  it("renames the CODAP attribute when the column is renamed", async () => {
    renderColumnHeader();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: newName } });
    fireEvent.blur(screen.getByRole("textbox"));

    await waitFor(() => expect(mockUpdateAttribute).toHaveBeenCalledTimes(1));
    expect(mockUpdateAttribute).toHaveBeenCalledWith(
      dataContextName, itemsCollectionName, oldName, expect.anything(), { name: newName }
    );
  });

  // Carrying on with the new name when CODAP kept the old one is how the column and its attribute
  // drift apart, which is what leaves a stale attribute behind on the next run.
  it("keeps the old name when CODAP refuses the rename", async () => {
    mockUpdateAttribute.mockResolvedValue({ success: false });
    renderColumnHeader();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: newName } });
    fireEvent.blur(screen.getByRole("textbox"));

    await waitFor(() => expect(mockUpdateAttribute).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Column name" })).toHaveValue(oldName));
    expect(screen.getByRole("status")).toHaveTextContent(`Could not rename ${oldName}.`);
  });

  // A request that times out or meets a closed connection rejects rather than reporting failure, so
  // the answer has to be the same as a refusal or the column and its attribute drift apart anyway.
  it("keeps the old name when the rename request never answers", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    mockUpdateAttribute.mockRejectedValue(new Error("connection closed"));
    renderColumnHeader();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: newName } });
    fireEvent.blur(screen.getByRole("textbox"));

    await waitFor(() => expect(mockUpdateAttribute).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue(oldName));
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  // The attribute may be gone -- deleted in the case table -- in which case there is nothing to
  // rename and carrying on would leave the column naming an attribute that does not exist.
  it("keeps the old name when the attribute is no longer in CODAP", async () => {
    mockGetAttribute.mockResolvedValue({ success: false });
    renderColumnHeader();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: newName } });
    fireEvent.blur(screen.getByRole("textbox"));

    await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue(oldName));
    expect(mockUpdateAttribute).not.toHaveBeenCalled();
  });

  // The entry naming the attribute goes with the column, so an edit committed after the column is
  // gone has nothing to rename from and must not go looking.
  it("does not ask CODAP anything when the column's attrMap entry is already gone", async () => {
    renderColumnHeader({ withAttrMapEntry: false });

    fireEvent.blur(typeNewName());

    await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue(oldName));
    expect(mockGetAttribute).not.toHaveBeenCalled();
    expect(mockUpdateAttribute).not.toHaveBeenCalled();
  });

  // Finishing with Enter has to leave the name where the user put it. Enter blurs, and blurring is
  // what commits, so the commit runs once from there. A second commit would be stood down by the
  // same latch the leave-return-leave test pins, so this pins the outcome rather than that branch.
  it("keeps the new name when the edit is finished with Enter", async () => {
    renderColumnHeader();

    const textbox = typeNewName();
    fireEvent.keyDown(textbox, { code: "Enter" });

    await waitFor(() => expect(mockUpdateAttribute).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue(newName));
  });

  // Leaving the field, returning to it and leaving again commits twice over. The second commit asks
  // for a name the first has already renamed away, which reads as a refusal and puts the old name
  // back -- the same undoing as committing on Enter, by a route Enter is not involved in.
  it("does not undo itself when the field is left, returned to and left again", async () => {
    const codap = fakeCodap(oldName);
    renderColumnHeader();

    const textbox = typeNewName();
    fireEvent.blur(textbox);
    textbox.focus();
    fireEvent.blur(textbox);

    await waitFor(() => expect(codap.heldName()).toBe(newName));
    await act(async () => undefined);
    expect(screen.getByRole("textbox")).toHaveValue(newName);
  });

  // A commit stands down while one is under way. The edit typed in the meantime is not made, so the
  // field goes back to the name that is actually being committed and says why.
  it("says so rather than silently dropping an edit made while a commit is in flight", async () => {
    const codap = fakeCodap(oldName);
    renderWithStore();

    const textbox = typeNewName();
    fireEvent.blur(textbox);
    textbox.focus();
    fireEvent.change(textbox, { target: { value: "pick" } });
    fireEvent.blur(textbox);

    await waitFor(() => expect(codap.heldName()).toBe(newName));
    await act(async () => undefined);
    expect(screen.getByRole("status")).toHaveTextContent(`Still renaming to ${newName}.`);
    expect(screen.getByRole("textbox")).toHaveValue(newName);
  });

  // Escape abandons the edit, and since blurring commits, cancelling has to reach the commit too.
  it("does not rename anything when the edit is abandoned with Escape", async () => {
    renderColumnHeader();

    const textbox = typeNewName();
    fireEvent.keyDown(textbox, { code: "Escape" });

    await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue(oldName));
    expect(mockUpdateAttribute).not.toHaveBeenCalled();
  });

  // A request that stops answering has not necessarily failed, so what became of the attribute
  // decides it. The header already shows the typed name, so only the store settles whether the
  // rename was adopted.
  it("takes the new name when CODAP turns out to have renamed the attribute after all", async () => {
    mockUpdateAttribute.mockRejectedValue(new Error("connection closed"));
    mockGetAttributeList.mockResolvedValue({ success: true, values: [{ id: attributeId, name: newName }] });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const { column } = renderWithStore();

    fireEvent.blur(typeNewName());

    await waitFor(() => expect(store.globalState.model.columns[0].name).toBe(newName));
    expect(store.globalState.attrMap[column.id].name).toBe(newName);
    expect(mockGetAttributeList).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("keeps the old name when the attribute turns out still to carry it", async () => {
    mockUpdateAttribute.mockRejectedValue(new Error("connection closed"));
    mockGetAttributeList.mockResolvedValue({ success: true, values: [{ id: attributeId, name: oldName }] });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const { column } = renderWithStore();

    fireEvent.blur(typeNewName());

    await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue(oldName));
    expect(store.globalState.model.columns[0].name).toBe(oldName);
    expect(store.globalState.attrMap[column.id].name).toBe(oldName);
    warn.mockRestore();
  });

  // Deleting a column leaves an attribute that holds data behind, so something else can already
  // answer to the new name. Only this column's attribute having taken it counts as a rename.
  it("keeps the old name when the new name belongs to some other attribute", async () => {
    mockUpdateAttribute.mockRejectedValue(new Error("connection closed"));
    mockGetAttributeList.mockResolvedValue({ success: true, values: [
      { id: attributeId, name: oldName },
      { id: "id-orphan", name: newName }
    ] });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const { column } = renderWithStore();

    fireEvent.blur(typeNewName());

    await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue(oldName));
    expect(store.globalState.model.columns[0].name).toBe(oldName);
    expect(store.globalState.attrMap[column.id].name).toBe(oldName);
    warn.mockRestore();
  });

  // Deleting a column takes its attrMap entry with it, so a commit that outlives the entry it was
  // opened on must not write through it. Writing through it throws inside the recipe, which escapes
  // as far as the error boundary.
  it("survives the column's attrMap entry being deleted while the rename is in flight", async () => {
    let finishRename = (result: unknown) => { /* replaced below */ };
    mockUpdateAttribute.mockImplementation(() => new Promise(resolve => { finishRename = resolve; }));
    const { column } = renderWithStore();

    fireEvent.blur(typeNewName());
    await waitFor(() => expect(mockUpdateAttribute).toHaveBeenCalledTimes(1));

    act(() => {
      store.setGlobalState(draft => { delete draft.attrMap[column.id]; });
    });
    await act(async () => { finishRename({ success: true }); });

    expect(store.globalState.attrMap[column.id]).toBeUndefined();
    expect(store.globalState.model.columns[0].name).toBe(newName);
  });

  // Columns are addressed by index everywhere else, but an index means something different once a
  // column to the left is gone, and a commit can outlive that too.
  it("renames the column it was opened on rather than whatever now sits at its index", async () => {
    let finishRename = (result: unknown) => { /* replaced below */ };
    mockUpdateAttribute.mockImplementation(() => new Promise(resolve => { finishRename = resolve; }));
    renderWithStore();

    fireEvent.blur(typeNewName());
    await waitFor(() => expect(mockUpdateAttribute).toHaveBeenCalledTimes(1));

    act(() => {
      store.setGlobalState(draft => {
        draft.model.columns.unshift({ name: "first", id: "other-column", devices: [createDefaultDevice()] });
      });
    });
    await act(async () => { finishRename({ success: true }); });

    expect(store.globalState.model.columns[0].name).toBe("first");
    expect(store.globalState.model.columns[1].name).toBe(newName);
  });
});
