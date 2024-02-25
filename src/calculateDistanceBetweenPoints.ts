import { IPoint } from "./Interfaces"
/**
 * @description Calculate the distance between two points in a 2D space.
 * @param start - The starting point.
 * @param end - The ending point.
 * @returns The distance between the start and end points.
 */
export function calculateDistanceBetweenPoints(start: IPoint, end: IPoint): number {
  
  // Calculate the horizontal distance (x-coordinate) between the points
  const horizontalDistance = end.x - start.x

  // Calculate the vertical distance (y-coordinate) between the points
  const verticalDistance = end.y - start.y

  // Calculate the distance between the points using the Pythagorean theorem
  const distance = Math.sqrt(Math.pow(horizontalDistance, 2) + Math.pow(verticalDistance, 2))

  // Return the calculated distance between the points
  return distance

}
