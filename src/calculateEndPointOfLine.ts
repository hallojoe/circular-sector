import { IPoint } from "./Interfaces"

/**
 * Calculates the endpoint reached by travelling from a start point at a given angle and distance.
 * When `largeAngle` is false the point is mirrored back along the same axis, which matches the gap-scaling logic.
 */
export function calculateEndPointOfLine(start: IPoint, angle: number, length: number, largeAngle: boolean = false): IPoint {
  const endX = largeAngle ? start.x + (Math.cos(angle) * length) : start.x - (Math.cos(angle) * length)
  const endY = largeAngle ? start.y + (Math.sin(angle) * length) : start.y - (Math.sin(angle) * length)

  return { x: endX, y: endY }
}
