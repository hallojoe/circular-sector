import { IPoint } from "./Interfaces"

/**
 * Calculates the Euclidean distance between two points.
 */
export function calculateDistanceBetweenPoints(start: IPoint, end: IPoint): number {
  const horizontalDistance = end.x - start.x
  const verticalDistance = end.y - start.y
  const distance = Math.sqrt(Math.pow(horizontalDistance, 2) + Math.pow(verticalDistance, 2))

  return distance
}
