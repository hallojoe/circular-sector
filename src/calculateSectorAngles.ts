import { IAngles } from "./Interfaces"

/**
 * Calculate the angles defining a sector within a circle.
 * @param sectorRatio - The ratio of the sector's angle to a full circle (2π).
 * @param initialAngle - The initial angle of the sector.
 * @returns Object containing the start, mid, and end angles of the sector.
 */
export function calculateSectorAngles(sectorRatio: number, initialAngle: number):IAngles {
  // Calculate the angle spanned by the sector based on the ratio
  const sectorAngle = sectorRatio * (2 * Math.PI)
  
  // Calculate the start, mid, and end angles of the sector
  return {
    start: initialAngle,                   // Start angle remains unchanged
    mid: initialAngle + sectorAngle / 2,   // Mid angle is halfway between start and end angles
    end: initialAngle + sectorAngle       // End angle is the sum of start angle and sector angle
  }
}
