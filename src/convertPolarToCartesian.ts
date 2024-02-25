import { IPoint } from "./Interfaces"
/**
 * Convert polar coordinates to Cartesian coordinates, representing a point in 2D space.
 * @param center - The center point of the coordinate system.
 * @param radius - The distance from the center to the point.
 * @param angle - The angle in radians measured from the positive x-axis to the point.
 * @returns The Cartesian coordinates of the point.
 */
export function convertPolarToCartesian(center: IPoint, radius: number, angle: number): IPoint {

  // Calculate the x-coordinate using the formula: x = center.x + radius * cos(angle)
  const x = center.x + radius * Math.cos(angle)

  // Calculate the y-coordinate using the formula: y = center.y + radius * sin(angle)
  const y = center.y + radius * Math.sin(angle)

  // Return the point represented by the Cartesian coordinates
  return { x, y }

}