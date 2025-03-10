import codapInterface from './codap-interface';

// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('codap-interface', () => {
  describe('sendRequest', () => {
    it('should send a request and return a successful response', async () => {
      const request = {
        action: 'create',
        resource: 'dataContext',
        values: {
          name: 'Test Context',
          title: 'Test Data'
        }
      };
      
      const response = await codapInterface.sendRequest(request);
      
      // Verify the response structure
      expect(response).toHaveProperty('success');
      expect(response.success).toBe(true);
      
      // Verify console.log was called with the request
      expect(console.log).toHaveBeenCalledWith('CODAP request:', request);
    });
    
    it('should handle requests without values', async () => {
      const request = {
        action: 'get',
        resource: 'dataContext'
      };
      
      const response = await codapInterface.sendRequest(request);
      
      // Verify the response structure
      expect(response).toHaveProperty('success');
      expect(response.success).toBe(true);
      
      // Verify console.log was called with the request
      expect(console.log).toHaveBeenCalledWith('CODAP request:', request);
    });
    
    it('should handle different action types', async () => {
      // Test 'update' action
      const updateRequest = {
        action: 'update',
        resource: 'dataContext',
        values: {
          name: 'Updated Context'
        }
      };
      
      const updateResponse = await codapInterface.sendRequest(updateRequest);
      expect(updateResponse.success).toBe(true);
      
      // Test 'delete' action
      const deleteRequest = {
        action: 'delete',
        resource: 'dataContext',
        values: {
          name: 'Context to Delete'
        }
      };
      
      const deleteResponse = await codapInterface.sendRequest(deleteRequest);
      expect(deleteResponse.success).toBe(true);
    });
    
    it('should handle different resource types', async () => {
      // Test 'collection' resource
      const collectionRequest = {
        action: 'create',
        resource: 'collection',
        values: {
          name: 'Test Collection'
        }
      };
      
      const collectionResponse = await codapInterface.sendRequest(collectionRequest);
      expect(collectionResponse.success).toBe(true);
      
      // Test 'attribute' resource
      const attributeRequest = {
        action: 'create',
        resource: 'attribute',
        values: {
          name: 'Test Attribute'
        }
      };
      
      const attributeResponse = await codapInterface.sendRequest(attributeRequest);
      expect(attributeResponse.success).toBe(true);
    });
    
    it('should handle errors', async () => {
      // Mock console.log to throw an error
      const originalLog = console.log;
      console.log = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const request = {
        action: 'create',
        resource: 'dataContext'
      };
      
      // The request should be rejected
      await expect(codapInterface.sendRequest(request)).rejects.toThrow('Test error');
      
      // Restore console.log
      console.log = originalLog;
    });
  });
}); 