import { addMeasure } from './codap-helpers';
import codapInterface from '../lib/codap-interface';

// Mock the codapInterface
jest.mock('../lib/codap-interface', () => ({
  __esModule: true,
  default: {
    sendRequest: jest.fn()
  }
}));

describe('addMeasure function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update an existing attribute when measureName is provided', async () => {
    // Set up a spy to track calls
    const sendRequestSpy = jest.spyOn(codapInterface, 'sendRequest');
    
    // Mock implementation to track the update call
    let updateCallMade = false;
    
    (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
      // For getCollectionList
      if (request.resource && request.resource.includes('collectionList')) {
        return Promise.resolve({
          success: true,
          values: ['experiments', 'samples', 'items']
        });
      } 
      // For getAttributeList
      else if (request.resource && request.resource.includes('attributeList')) {
        return Promise.resolve({
          success: true,
          values: [
            { name: 'existingMeasure' },
            { name: 'otherAttr' }
          ]
        });
      } 
      // For update request
      else if (request.action === 'update' && 
               request.resource && 
               request.resource.includes('existingMeasure') &&
               request.values.formula === 'mean()') {
        updateCallMade = true;
        return Promise.resolve({
          success: true
        });
      }
      
      // Default response
      return Promise.resolve({ success: true });
    });

    await addMeasure('Mean', 'mean()', 'existingMeasure');

    // Verify the update request was made
    expect(updateCallMade).toBe(true);
    
    // Additional verification
    expect(sendRequestSpy).toHaveBeenCalled();
    const updateCall = sendRequestSpy.mock.calls.find(
      call => call[0].action === 'update' && 
             call[0].resource.includes('existingMeasure') &&
             call[0].values.formula === 'mean()'
    );
    expect(updateCall).toBeDefined();
  });
}); 