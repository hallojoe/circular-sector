import { IPoint } from "./Interfaces";
/**
 * Calculate the midpoint between two points in 2D space.
 * @param start - The starting point.
 * @param end - The ending point.
 * @returns The midpoint between the start and end points.
 */
export function calculateMidpoint(start: IPoint, end: IPoint): IPoint {
  
  // Calculate the x-coordinate of the midpoint using the formula: x = (start.x + end.x) / 2
  const x = (start.x + end.x) / 2

  // Calculate the y-coordinate of the midpoint using the formula: y = (start.y + end.y) / 2
  const y = (start.y + end.y) / 2

  // Return the point representing the midpoint
  return { x, y }

}
