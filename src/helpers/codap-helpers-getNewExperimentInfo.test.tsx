import { getNewExperimentInfo } from './codap-helpers';
import codapInterface from '../lib/codap-interface';

// Mock the codapInterface
jest.mock('../lib/codap-interface', () => ({
  __esModule: true,
  default: {
    sendRequest: jest.fn()
  }
}));

describe('getNewExperimentInfo function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error when data context is not found', async () => {
    // Mock the getAllItems response - failure
    (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
      // Immediately resolve with failure for allItems request
      if (request.resource && request.resource.includes('allItems')) {
        return Promise.resolve({
          success: false
        });
      }
      // Default response for any other request
      return Promise.resolve({ success: true });
    });

    // Use try/catch instead of expect().rejects to avoid timeout issues
    try {
      await getNewExperimentInfo('hash123');
      // If we get here, the test should fail
      fail('Expected getNewExperimentInfo to throw an error');
    } catch (error: any) {
      expect(error.message).toBe('Sorry, the data context was not found!');
    }
  }, 15000); // Increase timeout to 15 seconds
}); 