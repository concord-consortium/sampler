/**
 * Secure Storage Utility
 * 
 * This module provides utility functions for securely storing, retrieving,
 * and clearing password hashes from local storage. It uses a simple encryption
 * approach to add a layer of security to the stored password hash.
 * 
 * Note: Client-side storage is inherently limited in its security. This implementation
 * provides basic obfuscation but should not be considered fully secure against
 * determined attackers with access to the client device.
 */

// Constants
const PASSWORD_HASH_KEY = 'sampler_password_hash';
const ENCRYPTION_KEY = 'SAMPLER_SECRET_KEY';

/**
 * Simple encryption function to obfuscate the password hash
 * Note: This is not cryptographically secure, but provides basic obfuscation
 * for client-side storage
 * 
 * @param text - The text to encrypt
 * @returns The encrypted text
 */
const encrypt = (text: string): string => {
  try {
    // Convert text to a base64 string first
    const base64 = btoa(text);
    
    // Create a result array
    const result = [];
    
    // For each character in the base64 string, shift its char code
    // by the corresponding character in the encryption key
    for (let i = 0; i < base64.length; i++) {
      const textChar = base64.charCodeAt(i);
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      
      // Use addition instead of XOR
      const encryptedChar = String.fromCharCode((textChar + keyChar) % 256);
      result.push(encryptedChar);
    }
    
    // Join the result and convert to base64 again for safe storage
    return btoa(result.join(''));
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

/**
 * Decryption function to retrieve the original password hash
 * 
 * @param encryptedText - The encrypted text to decrypt
 * @returns The decrypted text
 */
const decrypt = (encryptedText: string): string => {
  try {
    // Decode the base64 string
    const encryptedData = atob(encryptedText);
    
    // Create a result array
    const result = [];
    
    // For each character, reverse the encryption process
    for (let i = 0; i < encryptedData.length; i++) {
      const encryptedChar = encryptedData.charCodeAt(i);
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      
      // Use subtraction instead of XOR, handling potential negative values
      let decryptedChar = (encryptedChar - keyChar) % 256;
      if (decryptedChar < 0) decryptedChar += 256;
      
      result.push(String.fromCharCode(decryptedChar));
    }
    
    // Join the result and decode from base64
    return atob(result.join(''));
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

/**
 * Store the password hash in local storage with encryption
 * 
 * @param hash - The password hash to store
 * @returns A Promise that resolves when the hash is stored
 */
export const storePasswordHash = async (hash: string): Promise<void> => {
  try {
    const encryptedHash = encrypt(hash);
    localStorage.setItem(PASSWORD_HASH_KEY, encryptedHash);
  } catch (error) {
    console.error('Error storing password hash:', error);
    throw new Error('Storage failed');
  }
};

/**
 * Retrieve the password hash from local storage and decrypt it
 * 
 * @returns A Promise that resolves with the decrypted password hash or null if not found
 */
export const retrievePasswordHash = async (): Promise<string | null> => {
  try {
    const encryptedHash = localStorage.getItem(PASSWORD_HASH_KEY);
    if (!encryptedHash) return null;
    return decrypt(encryptedHash);
  } catch (error) {
    console.error('Error retrieving password hash:', error);
    throw new Error('Retrieval failed');
  }
};

/**
 * Clear the password hash from local storage
 * 
 * @returns A Promise that resolves when the hash is cleared
 */
export const clearPasswordHash = async (): Promise<void> => {
  try {
    localStorage.removeItem(PASSWORD_HASH_KEY);
  } catch (error) {
    console.error('Error clearing password hash:', error);
    throw new Error('Failed to clear password hash');
  }
};

/**
 * Check if a password hash is stored in local storage
 * 
 * @returns A Promise that resolves with true if a password hash is stored, false otherwise
 */
export const hasStoredPasswordHash = async (): Promise<boolean> => {
  try {
    const hash = localStorage.getItem(PASSWORD_HASH_KEY);
    return hash !== null;
  } catch (error) {
    console.error('Error checking for stored password hash:', error);
    return false;
  }
}; 
