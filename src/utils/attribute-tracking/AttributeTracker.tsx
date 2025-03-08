/**
 * AttributeTracker class for tracking attributes in the application
 */
export class AttributeTracker {
  private attributes: Map<string, any>;

  constructor() {
    this.attributes = new Map<string, any>();
  }

  /**
   * Set an attribute value
   * @param name Attribute name
   * @param value Attribute value
   */
  setAttribute(name: string, value: any): void {
    this.attributes.set(name, value);
  }

  /**
   * Get an attribute value
   * @param name Attribute name
   * @returns The attribute value or undefined if not found
   */
  getAttribute(name: string): any {
    return this.attributes.get(name);
  }

  /**
   * Check if an attribute exists
   * @param name Attribute name
   * @returns True if the attribute exists, false otherwise
   */
  hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }

  /**
   * Remove an attribute
   * @param name Attribute name
   * @returns True if the attribute was removed, false otherwise
   */
  removeAttribute(name: string): boolean {
    return this.attributes.delete(name);
  }

  /**
   * Get all attribute names
   * @returns Array of attribute names
   */
  getAttributeNames(): string[] {
    return Array.from(this.attributes.keys());
  }

  /**
   * Clear all attributes
   */
  clearAttributes(): void {
    this.attributes.clear();
  }
} 

