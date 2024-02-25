import { IPoint } from "./Interfaces";
/**
 * Calculate the endpoint of a line given the starting point, angle, length, and optionally a flag indicating whether to use the large angle.
 * @param start - The starting point of the line.
 * @param angle - The angle in radians measured from the positive x-axis to the direction of the line.
 * @param length - The length of the line.
 * @param largeAngle - Optional. A boolean indicating whether to use the large angle flag (default is false).
 * @returns The endpoint of the line.
 */
export function calculateEndPointOfLine(start: IPoint, angle: number, length: number, largeAngle: boolean = false): IPoint {

  // Calculate the x-coordinate of the endpoint based on the angle and length
  const endX = largeAngle ? start.x + (Math.cos(angle) * length) : start.x - (Math.cos(angle) * length)

  // Calculate the y-coordinate of the endpoint based on the angle and length
  const endY = largeAngle ? start.y + (Math.sin(angle) * length) : start.y - (Math.sin(angle) * length)

  // Return the endpoint represented by the Cartesian coordinates
  return { x: endX, y: endY }
}
