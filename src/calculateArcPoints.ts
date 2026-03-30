import { IPoint } from "./Interfaces"
import { calculatePolarToCartesian } from "./convertPolarToCartesian"

/**
 * Calculates the outer anchor points for an arc.
 * The returned tuple is ordered as start, mid, end to match the sector view model.
 */
export function calculateArcPoints(center: IPoint, radius: number, startAngle: number, endAngle: number): [IPoint, IPoint, IPoint] {
  const startPoint = calculatePolarToCartesian(center, radius, endAngle)
  const midPoint = calculatePolarToCartesian(center, radius, startAngle + ((endAngle - startAngle) / 2))
  const endPoint = calculatePolarToCartesian(center, radius, startAngle)

  return [startPoint, midPoint, endPoint]
}
