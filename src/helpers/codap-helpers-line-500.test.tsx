import { renameAttribute } from './codap-helpers';
import codapInterface from '../lib/codap-interface';

// Mock the codapInterface
jest.mock('../lib/codap-interface', () => ({
  __esModule: true,
  default: {
    sendRequest: jest.fn()
  }
}));

const kDataContextName = 'Sampler';

describe('renameAttribute function - line 500', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.log to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore console.log
    (console.log as jest.Mock).mockRestore();
  });

  it('should handle attributes without formulas', async () => {
    // Create a spy to track all calls
    const sendRequestSpy = jest.spyOn(codapInterface, 'sendRequest');
    
    // Mock the getCollectionList response
    sendRequestSpy.mockResolvedValueOnce({
      success: true,
      values: ['samples']
    });
    
    // Mock the getAttributeList response with an attribute without formula
    sendRequestSpy.mockResolvedValueOnce({
      success: true,
      values: [
        { name: 'oldAttr' },
        { name: 'otherAttr', formula: null } // Attribute without formula
      ]
    });
    
    // Mock the getAllCases response
    sendRequestSpy.mockResolvedValueOnce({
      success: true,
      values: {
        cases: [
          { id: 1, values: { oldAttr: 'value1' } },
          { id: 2, values: { oldAttr: 'value2' } }
        ]
      }
    });
    
    // Mock the componentList response
    sendRequestSpy.mockResolvedValueOnce({
      success: true,
      values: []
    });
    
    // Mock all other responses
    sendRequestSpy.mockResolvedValue({
      success: true
    });
    
    // Call the function with a short timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Test timed out')), 5000);
    });
    
    // Spy on console.log to verify it was called for the attribute without formula
    const consoleSpy = jest.spyOn(console, 'log');
    
    try {
      await Promise.race([
        renameAttribute(kDataContextName, 'samples', 'oldAttr', 'newAttr'),
        timeoutPromise
      ]);
      
      // Verify console.log was called for attribute without formula
      expect(consoleSpy).toHaveBeenCalledWith('Attribute otherAttr does not have a formula');
    } catch (error) {
      fail('Test timed out or failed: ' + error);
    }
  }, 10000); // Increase timeout to 10 seconds
}); 