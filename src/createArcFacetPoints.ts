import { IPoint } from "./Interfaces"
import { calculatePolarToCartesian } from "./convertPolarToCartesian"

/**
 * Samples evenly spaced points along an arc so it can be drawn as straight facets.
 */
export function createArcFacetPoints(
  center: IPoint,
  radius: number,
  startAngle: number,
  endAngle: number,
  facetCount: number
): IPoint[] {
  const points: IPoint[] = []

  for (let index = 0; index <= facetCount; index++) {
    const angle = startAngle + ((endAngle - startAngle) * (index / facetCount))
    points.push(calculatePolarToCartesian(center, radius, angle))
  }

  return points
}
