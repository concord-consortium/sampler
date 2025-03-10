import { hashPassword, validatePassword, isPasswordValid } from './password-utils';

// Mock the Web Crypto API and TextEncoder
const mockDigest = jest.fn();
const mockEncode = jest.fn();

// Mock implementation for TextEncoder
global.TextEncoder = class TextEncoder {
  encoding = 'utf-8';
  
  encode(input: string) {
    mockEncode(input);
    return new Uint8Array(input.split('').map(char => char.charCodeAt(0)));
  }
  
  encodeInto(source: string, destination: Uint8Array) {
    const encoded = this.encode(source);
    encoded.forEach((value, index) => {
      if (index < destination.length) {
        destination[index] = value;
      }
    });
    return {
      read: source.length,
      written: Math.min(encoded.length, destination.length)
    };
  }
};

// Mock implementation for crypto.subtle.digest
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: mockDigest
    }
  }
});

describe('password-utils', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockDigest.mockReset();
    mockEncode.mockReset();
  });
  
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      
      // Mock digest to return a specific hash for this test
      mockDigest.mockResolvedValueOnce(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]).buffer);
      
      const hash = await hashPassword(password);
      
      // Hash should be a string
      expect(typeof hash).toBe('string');
      
      // SHA-256 produces a 64-character hex string
      expect(hash.length).toBe(64);
      
      // Verify TextEncoder was called with the password
      expect(mockEncode).toHaveBeenCalledWith(password);
      
      // Verify digest was called with SHA-256 algorithm
      expect(mockDigest).toHaveBeenCalledWith('SHA-256', expect.any(Uint8Array));
      
      // For the same input, mock the same output
      mockDigest.mockResolvedValueOnce(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]).buffer);
      
      // Hash should be consistent for the same input
      const hash2 = await hashPassword(password);
      expect(hash).toBe(hash2);
    });
    
    it('should produce different hashes for different passwords', async () => {
      const password1 = 'testPassword123';
      const password2 = 'testPassword124';
      
      // Mock digest to return different hashes for different inputs
      mockDigest.mockResolvedValueOnce(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]).buffer);
      const hash1 = await hashPassword(password1);
      
      mockDigest.mockResolvedValueOnce(new Uint8Array([32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]).buffer);
      const hash2 = await hashPassword(password2);
      
      expect(hash1).not.toBe(hash2);
    });
    
    it('should handle empty strings', async () => {
      // Mock digest for empty string
      mockDigest.mockResolvedValueOnce(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).buffer);
      
      const hash = await hashPassword('');
      
      // Hash should still be a 64-character hex string
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
      
      // Verify TextEncoder was called with empty string
      expect(mockEncode).toHaveBeenCalledWith('');
    });
  });
  
  describe('validatePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testPassword123';
      
      // Mock digest to return a specific hash
      mockDigest.mockResolvedValueOnce(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]).buffer);
      const hash = await hashPassword(password);
      
      // Reset mocks to verify they're called again
      mockDigest.mockClear();
      mockEncode.mockClear();
      
      // Mock digest to return the same hash for validation
      mockDigest.mockResolvedValueOnce(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]).buffer);
      
      const isValid = await validatePassword(password, hash);
      expect(isValid).toBe(true);
      
      // Verify TextEncoder and digest were called again
      expect(mockEncode).toHaveBeenCalledWith(password);
      expect(mockDigest).toHaveBeenCalledWith('SHA-256', expect.any(Uint8Array));
    });
    
    it('should return false for non-matching password and hash', async () => {
      const password1 = 'testPassword123';
      const password2 = 'testPassword124';
      
      // Mock digest to return a specific hash for password1
      mockDigest.mockResolvedValueOnce(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]).buffer);
      const hash = await hashPassword(password1);
      
      // Reset mocks
      mockDigest.mockClear();
      mockEncode.mockClear();
      
      // Mock digest to return a different hash for password2
      mockDigest.mockResolvedValueOnce(new Uint8Array([32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]).buffer);
      
      const isValid = await validatePassword(password2, hash);
      expect(isValid).toBe(false);
    });
    
    it('should handle empty password', async () => {
      // Mock digest for empty string
      mockDigest.mockResolvedValueOnce(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).buffer);
      const emptyHash = await hashPassword('');
      
      // Reset mocks
      mockDigest.mockClear();
      mockEncode.mockClear();
      
      // Mock digest for empty string validation (should match)
      mockDigest.mockResolvedValueOnce(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).buffer);
      const isValidEmpty = await validatePassword('', emptyHash);
      expect(isValidEmpty).toBe(true);
      
      // Reset mocks
      mockDigest.mockClear();
      mockEncode.mockClear();
      
      // Mock digest for non-empty string (should not match)
      mockDigest.mockResolvedValueOnce(new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]).buffer);
      const isValidNonEmpty = await validatePassword('somePassword', emptyHash);
      expect(isValidNonEmpty).toBe(false);
    });
  });
  
  describe('isPasswordValid', () => {
    it('should return true for passwords with 6 or more characters', () => {
      expect(isPasswordValid('123456')).toBe(true);
      expect(isPasswordValid('abcdef')).toBe(true);
      expect(isPasswordValid('abc123')).toBe(true);
      expect(isPasswordValid('longPassword123')).toBe(true);
    });
    
    it('should return false for passwords with less than 6 characters', () => {
      expect(isPasswordValid('')).toBe(false);
      expect(isPasswordValid('12345')).toBe(false);
      expect(isPasswordValid('abcde')).toBe(false);
    });
  });
}); 