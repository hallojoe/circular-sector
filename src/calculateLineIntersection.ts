import { IPoint } from "./Interfaces"

/**
 * Finds the intersection point of two line segments.
 * Returns `null` when the segments are parallel or only intersect outside their segment bounds.
 */
export function calculateLineIntersection(lineOneStart: IPoint, lineOneEnd: IPoint, lineTwoStart: IPoint, lineTwoEnd: IPoint): IPoint | null {
  const intersectionRatios = calculateIntersectionRatios(lineOneStart, lineOneEnd, lineTwoStart, lineTwoEnd)

  if (!intersectionRatios) {
    return null
  }

  const { lineOneIntersectionRatio, lineTwoIntersectionRatio } = intersectionRatios

  if (lineOneIntersectionRatio < 0 || lineOneIntersectionRatio > 1 || lineTwoIntersectionRatio < 0 || lineTwoIntersectionRatio > 1) {
    return null
  }

  const intersectionX = lineOneStart.x + lineOneIntersectionRatio * (lineOneEnd.x - lineOneStart.x)
  const intersectionY = lineOneStart.y + lineOneIntersectionRatio * (lineOneEnd.y - lineOneStart.y)

  return { x: intersectionX, y: intersectionY }
}

function calculateIntersectionRatios(lineOneStart: IPoint, lineOneEnd: IPoint, lineTwoStart: IPoint, lineTwoEnd: IPoint) {
  const denominator = ((lineTwoEnd.y - lineTwoStart.y) * (lineOneEnd.x - lineOneStart.x)) - ((lineTwoEnd.x - lineTwoStart.x) * (lineOneEnd.y - lineOneStart.y))

  if (denominator === 0) {
    return null
  }

  const lineOneIntersectionNumerator = (((lineTwoEnd.x - lineTwoStart.x) * (lineOneStart.y - lineTwoStart.y)) - ((lineTwoEnd.y - lineTwoStart.y) * (lineOneStart.x - lineTwoStart.x)))
  const lineTwoIntersectionNumerator = (((lineOneEnd.x - lineOneStart.x) * (lineOneStart.y - lineTwoStart.y)) - ((lineOneEnd.y - lineOneStart.y) * (lineOneStart.x - lineTwoStart.x)))

  return {
    lineOneIntersectionRatio: lineOneIntersectionNumerator / denominator,
    lineTwoIntersectionRatio: lineTwoIntersectionNumerator / denominator
  }
}
