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

describe('renameAttribute function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up a default mock implementation to avoid hanging
    (codapInterface.sendRequest as jest.Mock).mockImplementation(() => {
      return Promise.resolve({ success: true });
    });
  });

  it('should handle attributes without formulas', async () => {
    // Mock specific responses needed for this test
    let requestCount = 0;
    (codapInterface.sendRequest as jest.Mock).mockImplementation((request: any) => {
      requestCount++;
      
      // First request - getCollectionList
      if (requestCount === 1) {
        return Promise.resolve({
          success: true,
          values: ['samples']
        });
      } 
      // Second request - getAttributeList
      else if (requestCount === 2) {
        return Promise.resolve({
          success: true,
          values: [
            { name: 'oldAttr' },
            { name: 'otherAttr', formula: null } // Attribute without formula
          ]
        });
      } 
      // Third request - getAllCases
      else if (requestCount === 3) {
        return Promise.resolve({
          success: true,
          values: {
            cases: [
              { id: 1, values: { oldAttr: 'value1' } },
              { id: 2, values: { oldAttr: 'value2' } }
            ]
          }
        });
      } 
      // Fourth request - componentList
      else if (requestCount === 4) {
        return Promise.resolve({
          success: true,
          values: []
        });
      }
      // All other requests
      return Promise.resolve({ success: true });
    });

    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log');

    await renameAttribute(kDataContextName, 'samples', 'oldAttr', 'newAttr');

    // Verify console.log was called for attribute without formula
    expect(consoleSpy).toHaveBeenCalledWith('Attribute otherAttr does not have a formula');
    
    consoleSpy.mockRestore();
  }, 15000); // Increase timeout to 15 seconds
}); 