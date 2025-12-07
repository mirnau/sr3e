/**
 * Math utility functions for SR3E
 */

/**
 * Generate a random integer within a given range (inclusive)
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns A random integer between min and max
 */
export function randomInRange(min: number, max: number): number {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}
