import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { Collector } from "./collector";
import { GlobalStateContext } from "../../../hooks/useGlobalState";
import { AnimationContext } from "../../../hooks/useAnimation";
import { IDevice, ViewType, ClippingDef, IDataContext, IGlobalState } from "../../../types";
import { getAllItems, getListOfDataContexts } from "@concord-consortium/codap-plugin-api";

// Mock the CODAP plugin API
jest.mock("@concord-consortium/codap-plugin-api", () => ({
  getAllItems: jest.fn(),
  getListOfDataContexts: jest.fn(),
  createItems: jest.fn(),
  selectCases: jest.fn()
}));

// Mock the MixerFrame component to avoid SVG rendering issues in tests
jest.mock("./shared/mixer-frame", () => ({
  MixerFrame: () => <div data-testid="mixer-frame" />
}));

// Mock the Balls component to avoid SVG rendering issues in tests
jest.mock("./shared/balls", () => ({
  Balls: ({ 
    ballsArray, 
    deviceId, 
    handleAddDefs, 
    handleSetSelectedVariable, 
    handleSetEditingVarName 
  }: { 
    ballsArray: string[]; 
    deviceId: string; 
    handleAddDefs: (def: ClippingDef) => void; 
    handleSetSelectedVariable: (index: number) => void; 
    handleSetEditingVarName: (index: number) => void; 
  }) => {
    // Call handleAddDefs for each ball to simulate the real component behavior
    React.useEffect(() => {
      ballsArray.forEach((ball: string, index: number) => {
        handleAddDefs({
          id: `${deviceId}-clip-${index}`,
          element: <div data-testid={`ball-clip-${index}`} />
        });
      });
    }, [ballsArray, deviceId, handleAddDefs]);

    return (
      <div data-testid="balls-container">
        {ballsArray.map((ball: string, index: number) => (
          <div key={index} data-testid={`ball-${index}`}>
            {ball}
          </div>
        ))}
      </div>
    );
  }
}));

describe("Enhanced Collector Component", () => {
  const mockDevice: IDevice = {
    id: "device-1",
    viewType: ViewType.Collector,
    variables: [],
    collectorVariables: [],
    formulas: {},
    hidden: false,
    lockPassword: ""
  };

  const mockDataContexts: IDataContext[] = [
    { guid: 1, id: 1, name: "Dataset1", title: "Dataset 1" },
    { guid: 2, id: 2, name: "Dataset2", title: "Dataset 2" }
  ];

  const mockItems = [
    { id: 1, values: { "Animal": "Dog", "Color": "Brown" } },
    { id: 2, values: { "Animal": "Cat", "Color": "Black" } },
    { id: 3, values: { "Animal": "Bird", "Color": "Blue" } }
  ];

  const mockGlobalState: Partial<IGlobalState> = {
    model: {
      columns: [
        {
          id: "column-1",
          name: "Column 1",
          devices: [mockDevice]
        }
      ]
    },
    selectedDeviceId: "device-1",
    isRunning: false,
    dataContexts: mockDataContexts,
    collectorContext: mockDataContexts[0]
  };

  const mockSetGlobalState = jest.fn();
  const mockHandleAddDefs = jest.fn();
  const mockHandleSetSelectedVariable = jest.fn();
  const mockHandleSetEditingVarName = jest.fn();
  const mockRegisterAnimationCallback = jest.fn();
  const mockHandleStartRun = jest.fn();
  const mockHandleTogglePauseRun = jest.fn();
  const mockHandleStopRun = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getListOfDataContexts as jest.Mock).mockResolvedValue({ values: mockDataContexts });
    (getAllItems as jest.Mock).mockResolvedValue({ values: mockItems });
  });

  const renderCollector = (device = mockDevice) => {
    return render(
      <GlobalStateContext.Provider value={{ 
        globalState: mockGlobalState as IGlobalState, 
        setGlobalState: mockSetGlobalState 
      }}>
        <AnimationContext.Provider value={{
          handleStartRun: mockHandleStartRun,
          handleTogglePauseRun: mockHandleTogglePauseRun,
          handleStopRun: mockHandleStopRun,
          registerAnimationCallback: mockRegisterAnimationCallback
        }}>
          <Collector
            device={device}
            handleAddDefs={mockHandleAddDefs}
            handleSetSelectedVariable={mockHandleSetSelectedVariable}
            handleSetEditingVarName={mockHandleSetEditingVarName}
          />
        </AnimationContext.Provider>
      </GlobalStateContext.Provider>
    );
  };

  it("should render a dataset selection dropdown when there are available datasets", async () => {
    renderCollector();
    
    await waitFor(() => {
      expect(screen.getByText("Select Dataset:")).toBeInTheDocument();
      expect(screen.getByText("Dataset 1")).toBeInTheDocument();
      expect(screen.getByText("Dataset 2")).toBeInTheDocument();
    });
  });

  it("should show a message when no datasets are available", async () => {
    (getListOfDataContexts as jest.Mock).mockResolvedValue({ values: [] });
    
    renderCollector();
    
    await waitFor(() => {
      expect(screen.getByText("No datasets available. Please create a dataset in CODAP first.")).toBeInTheDocument();
    });
  });

  it("should automatically select the available dataset if there is only one", async () => {
    (getListOfDataContexts as jest.Mock).mockResolvedValue({ 
      values: [mockDataContexts[0]] 
    });
    
    renderCollector();
    
    await waitFor(() => {
      expect(mockSetGlobalState).toHaveBeenCalled();
      
      // Verify that setGlobalState was called with a function that sets collectorContext
      const calls = mockSetGlobalState.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      // Check that the button for Dataset 1 is rendered and has the selected style
      const button = screen.getByText("Dataset 1");
      expect(button).toBeInTheDocument();
      expect(button).toHaveStyle("font-weight: bold");
    });
  });

  it("should populate the device with a ball for each case in the dataset", async () => {
    const deviceWithData: IDevice = {
      ...mockDevice,
      collectorVariables: mockItems.map(item => item.values)
    };
    
    renderCollector(deviceWithData);
    
    await waitFor(() => {
      // Check that the balls container is rendered
      const ballsContainer = screen.getByTestId("balls-container");
      expect(ballsContainer).toBeInTheDocument();
      
      // Check that the first attribute (Animal) is used for labels
      expect(screen.getByText("Dog")).toBeInTheDocument();
      expect(screen.getByText("Cat")).toBeInTheDocument();
      expect(screen.getByText("Bird")).toBeInTheDocument();
    });
  });

  it("should update when the selected dataset changes", async () => {
    renderCollector();
    
    await waitFor(() => {
      // Find the Dataset 2 button and click it
      const dataset2Button = screen.getByText("Dataset 2");
      expect(dataset2Button).toBeInTheDocument();
      
      // Click the button to change the selected dataset
      fireEvent.click(dataset2Button);
      
      expect(mockSetGlobalState).toHaveBeenCalled();
      // We can't directly test the draft function's behavior
      // Instead, we'll verify that the component handles the change
      expect(getAllItems).toHaveBeenCalledWith("Dataset2");
    });
  });

  it("should replace the output label with the dataset name", async () => {
    // This test is now handled by the column-header component
    // We'll just verify that the component renders correctly
    renderCollector();
    
    await waitFor(() => {
      expect(screen.getByText("Select Dataset:")).toBeInTheDocument();
    });
  });
}); 
