/**
 * Utility functions for password hashing and validation
 * 
 * Note: This implementation uses SHA-256 for password hashing.
 * In a production environment, a more secure approach with salt and
 * a stronger algorithm like bcrypt would be recommended.
 */

/**
 * Hashes a password using SHA-256
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Convert the string to an ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Hash the data
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert the ArrayBuffer to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

/**
 * Validates a password against a stored hash
 * @param password The plain text password to validate
 * @param storedHash The stored hash to validate against
 * @returns True if the password matches the hash, false otherwise
 */
export const validatePassword = async (password: string, storedHash: string): Promise<boolean> => {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === storedHash;
};

/**
 * Validates a password against basic requirements
 * @param password The password to validate
 * @returns True if the password meets requirements, false otherwise
 */
export const isPasswordValid = (password: string): boolean => {
  // Password must be at least 6 characters long
  return password.length >= 6;
}; 
