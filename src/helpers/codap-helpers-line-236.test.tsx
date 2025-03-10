import { getNewExperimentInfo } from './codap-helpers';
import codapInterface from '../lib/codap-interface';

// Mock the codapInterface
jest.mock('../lib/codap-interface', () => ({
  __esModule: true,
  default: {
    sendRequest: jest.fn()
  }
}));

describe('getNewExperimentInfo function - line 236', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error when data context is not found', async () => {
    // Create a spy to track all calls
    const sendRequestSpy = jest.spyOn(codapInterface, 'sendRequest');
    
    // Mock the getAllItems response to return failure
    sendRequestSpy.mockResolvedValueOnce({
      success: false
    });
    
    // Use a try/catch block to verify the error is thrown
    let errorThrown = false;
    let errorMessage = '';
    
    try {
      await getNewExperimentInfo('hash123');
    } catch (error: any) {
      errorThrown = true;
      errorMessage = error.message;
    }
    
    // Verify the error was thrown with the correct message
    expect(errorThrown).toBe(true);
    expect(errorMessage).toBe('Sorry, the data context was not found!');
    
    // Verify the sendRequest was called with the correct parameters
    expect(sendRequestSpy).toHaveBeenCalledWith({
      action: 'get',
      resource: expect.stringContaining('allItems')
    });
  }, 10000); // Increase timeout to 10 seconds
}); 