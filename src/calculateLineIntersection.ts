import { IPoint } from "./Interfaces"

/**
 * Finds the intersection point of two lines represented by their start and end points.
 * Returns null if the lines are parallel or do not intersect within the given line segments.
 * 
 * @param lineOneStart The starting point of the first line.
 * @param lineOneEnd The ending point of the first line.
 * @param lineTwoStart The starting point of the second line.
 * @param lineTwoEnd The ending point of the second line.
 * @returns The intersection point if it exists, otherwise null.
 */
export function calculateLineIntersection(lineOneStart: IPoint, lineOneEnd: IPoint, lineTwoStart: IPoint, lineTwoEnd: IPoint): IPoint | null {

  // Calculate the denominator of the formula for finding the intersection point
  const denominator = ((lineTwoEnd.y - lineTwoStart.y) * (lineOneEnd.x - lineOneStart.x)) - ((lineTwoEnd.x - lineTwoStart.x) * (lineOneEnd.y - lineOneStart.y))

  // Check if the lines are parallel
  if (denominator === 0) {
    return null // Lines are parallel, no intersection
  }

  // Calculate numerators for ua and ub
  const numeratorA = (((lineTwoEnd.x - lineTwoStart.x) * (lineOneStart.y - lineTwoStart.y)) - ((lineTwoEnd.y - lineTwoStart.y) * (lineOneStart.x - lineTwoStart.x)))
  const numeratorB = (((lineOneEnd.x - lineOneStart.x) * (lineOneStart.y - lineTwoStart.y)) - ((lineOneEnd.y - lineOneStart.y) * (lineOneStart.x - lineTwoStart.x)))

  // Calculate ua(first) and ub(last)
  const ua = numeratorA / denominator
  const ub = numeratorB / denominator

  // Check if ua and ub are within the valid range [0, 1], indicating intersection within line segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return null // Intersection point is outside the range of the line segments
  }

  // Calculate intersection point coordinates
  const intersectionX = lineOneStart.x + ua * (lineOneEnd.x - lineOneStart.x)
  const intersectionY = lineOneStart.y + ua * (lineOneEnd.y - lineOneStart.y)

  return { x: intersectionX, y: intersectionY }

}