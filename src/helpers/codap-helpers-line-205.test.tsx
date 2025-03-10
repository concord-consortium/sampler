import { addMeasure } from './codap-helpers';
import codapInterface from '../lib/codap-interface';

// Mock the codapInterface
jest.mock('../lib/codap-interface', () => ({
  __esModule: true,
  default: {
    sendRequest: jest.fn()
  }
}));

describe('addMeasure function - line 205', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update an existing attribute when measureName is provided', async () => {
    // Create a spy to track all calls
    const sendRequestSpy = jest.spyOn(codapInterface, 'sendRequest');
    
    // First, mock the getCollectionList call
    sendRequestSpy.mockResolvedValueOnce({
      success: true,
      values: ['experiments', 'samples', 'items']
    });
    
    // Then, mock the getAttributeList call
    sendRequestSpy.mockResolvedValueOnce({
      success: true,
      values: [
        { name: 'existingMeasure' },
        { name: 'otherAttr' }
      ]
    });
    
    // Finally, mock the update call
    sendRequestSpy.mockResolvedValueOnce({
      success: true
    });
    
    // Call the function
    await addMeasure('Mean', 'mean()', 'existingMeasure');
    
    // Verify the update request was made
    expect(sendRequestSpy).toHaveBeenCalledTimes(3);
    
    // The third call should be the update request
    const updateCall = sendRequestSpy.mock.calls[2];
    expect(updateCall[0]).toEqual({
      action: 'update',
      resource: expect.stringContaining('existingMeasure'),
      values: {
        formula: 'mean()'
      }
    });
  });
}); 