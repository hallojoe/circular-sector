/**
 * Calculate the length of a sector in radians given its ratio.
 * @param ratio - The ratio of the sector's angle to a full circle (2π).
 * @returns The length of the sector in radians.
 */
export function calculateSectorLengthInRadians(ratio: number): number {
  // Calculate the length of the sector in radians using the formula: length = ratio * (2 * Math.PI)
  return ratio * (2 * Math.PI)
}
