import { IAngles } from "./Interfaces"

/**
 * Calculates the start, midpoint, and end angle for a sector.
 */
export function calculateSectorAngles(sectorRatio: number, initialAngle: number): IAngles {
  const sectorAngle = sectorRatio * (2 * Math.PI)

  return {
    start: initialAngle,
    mid: initialAngle + sectorAngle / 2,
    end: initialAngle + sectorAngle
  }
}
