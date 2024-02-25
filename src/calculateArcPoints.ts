import { IPoint } from "./Interfaces";
import { calculatePolarToCartesian } from "./convertPolarToCartesian";
/**
 * Calculate the start, mid, and end points of an arc given the center, radius, start angle, and end angle.
 * @param center - The center point of the arc.
 * @param radius - The radius of the arc.
 * @param startAngle - The starting angle of the arc in radians.
 * @param endAngle - The ending angle of the arc in radians.
 * @returns An array containing the start, mid, and end points of the arc.
 */
export function calculateArcPoints(center: IPoint, radius: number, startAngle: number, endAngle: number): [IPoint, IPoint, IPoint] {

  // Calculate the Cartesian coordinates of the start, mid, and end points of the arc using polar coordinates
  const startPoint = calculatePolarToCartesian(center, radius, endAngle)
  const midPoint = calculatePolarToCartesian(center, radius, startAngle + ((endAngle - startAngle) / 2))
  const endPoint = calculatePolarToCartesian(center, radius, startAngle)

  // Return an array containing the start, mid, and end points of the arc
  return [startPoint, midPoint, endPoint]

}
