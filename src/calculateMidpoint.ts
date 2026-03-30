import { IPoint } from "./Interfaces"

/**
 * Calculates the midpoint between two points.
 */
export function calculateMidpoint(start: IPoint, end: IPoint): IPoint {
  const x = (start.x + end.x) / 2
  const y = (start.y + end.y) / 2

  return { x, y }
}
