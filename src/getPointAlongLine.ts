import { IPoint } from "./Interfaces"
import { calculateDistanceBetweenPoints } from "./calculateDistanceBetweenPoints"

/**
 * Returns a point reached by moving a fixed distance from `start` toward `end`.
 */
export function getPointAlongLine(start: IPoint, end: IPoint, distance: number): IPoint {
  const totalDistance = calculateDistanceBetweenPoints(start, end)

  if (totalDistance === 0 || distance <= 0) return start

  const ratio = distance / totalDistance

  return {
    x: start.x + ((end.x - start.x) * ratio),
    y: start.y + ((end.y - start.y) * ratio)
  }
}
