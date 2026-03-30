import { IPoint } from "./Interfaces"

/**
 * Converts polar coordinates into Cartesian coordinates relative to a center point.
 */
export function calculatePolarToCartesian(center: IPoint, radius: number, angle: number): IPoint {
  const x = center.x + radius * Math.cos(angle)
  const y = center.y + radius * Math.sin(angle)

  return { x, y }
}
