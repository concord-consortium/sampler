import { renderHook, waitFor } from "@testing-library/react";
import {
  codapInterface,
  createChildCollection,
  createDataContext,
  createParentCollection,
  getDataContext,
  getListOfDataContexts,
  initializePlugin} from "@concord-consortium/codap-plugin-api";
import { useGlobalStateContextValue } from "./useGlobalState";
import { defaultOutputAttrName } from "../types";
import { getCollectionNames } from "../helpers/codap-helpers";
import { tr } from "../utils/localeManager";

jest.mock("@concord-consortium/codap-plugin-api", () => ({
  codapInterface: {
    sendRequest: jest.fn(),
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

const mockCodapInterface = codapInterface as jest.Mocked<typeof codapInterface>;
const mockCreateChildCollection = createChildCollection as jest.Mock;
const mockCreateDataContext = createDataContext as jest.Mock;
const mockCreateParentCollection = createParentCollection as jest.Mock;
const mockGetDataContext = getDataContext as jest.Mock;
const mockGetListOfDataContexts = getListOfDataContexts as jest.Mock;
const mockInitializePlugin = initializePlugin as jest.Mock;

// Every string resolves to its own id, standing in for a locale whose collection names are not the
// English "experiments"/"samples"/"items".
jest.mock("../utils/localeManager", () => ({
  tr: (key: string) => key
}));

// The name findOrCreateDataContext settles on when no data context exists yet.
const dataContextName = tr("DG.Plugin.Sampler.dataset.name");
const createdDataContext = { name: dataContextName, id: 1, title: dataContextName };

// updateAttributeIds asks CODAP for every attribute by name in one batched request. CODAP answers
// with the attribute's id, which the plugin stores in attrMap so it can recognize the attribute
// later when CODAP reports a change to it. A request naming a collection that does not exist fails,
// exactly as CODAP would answer it.
const attributeIdRequestResponse = (resource: string) => {
  const [, collection, name] = resource.match(/collection\[(.*)\]\.attribute\[(.*)\]$/) ?? [];
  if (!Object.values(getCollectionNames()).includes(collection)) {
    return { success: false };
  }
  return { success: true, values: { name, id: `id-${name}` } };
};

describe("useGlobalStateContextValue initialization", () => {
  beforeAll(() => {
    // jsdom has no Web Locks API. Match the browser: the callback runs asynchronously and the
    // caller does not await it.
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: { request: (_name: string, callback: () => Promise<void>) => Promise.resolve().then(callback) }
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // a new document: no saved plugin state and no existing data context
    mockInitializePlugin.mockResolvedValue(undefined);
    mockGetListOfDataContexts.mockResolvedValue({ success: true, values: [] });
    mockGetDataContext.mockResolvedValue({ success: false });

    mockCreateDataContext.mockResolvedValue({ success: true, values: createdDataContext });
    mockCreateParentCollection.mockResolvedValue({ success: true });
    mockCreateChildCollection.mockResolvedValue({ success: true });

    mockCodapInterface.sendRequest.mockImplementation((request: any, callback?: any) => {
      const response = Array.isArray(request)
        ? request.map((r: { resource: string }) => attributeIdRequestResponse(r.resource))
        : { success: true, values: {} };
      callback?.(response);
      return Promise.resolve(response);
    });
  });

  // The plugin matches CODAP's change notifications against these ids, so losing them means a
  // rename made in the case table is never applied to the model [SAMPLER-106].
  it("keeps the attribute ids it looked up", async () => {
    const { result } = renderHook(() => useGlobalStateContextValue());

    // init writes the data context name into state last, so this is where it has settled
    await waitFor(() => expect(result.current.globalState.dataContextName).toBe(dataContextName));

    const { attrMap, model } = result.current.globalState;
    expect(attrMap[model.columns[0].id].codapID).toBe(`id-${defaultOutputAttrName}`);
  });

  // CODAP resolves an attribute by name across the whole data context, so naming the wrong
  // collection still finds it. Ask for the collection the attribute actually belongs to anyway,
  // rather than leaning on that.
  it("looks up a column's attribute in the collection that holds it", async () => {
    renderHook(() => useGlobalStateContextValue());
    await waitFor(() => expect(mockCodapInterface.sendRequest).toHaveBeenCalled());

    const resources: string[] = [];
    mockCodapInterface.sendRequest.mock.calls.forEach(([request]: any) => {
      (Array.isArray(request) ? request : [request]).forEach((r: any) => r?.resource && resources.push(r.resource));
    });
    const columnAttrRequest = resources.find(resource =>
      resource.endsWith(`.attribute[${defaultOutputAttrName}]`));

    expect(columnAttrRequest).toContain(`collection[${getCollectionNames().items}]`);
  });
});
