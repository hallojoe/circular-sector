import { IAngles, IPoint } from "./Interfaces"
import { calculatePolarToCartesian } from "./convertPolarToCartesian"

/**
 * Calculates the centroid of a filled annular sector.
 * The returned point lies on the sector bisector measured from the provided center.
 */
export function calculateAnnularSectorCentroid(center: IPoint, angles: IAngles, outerRadius: number, innerRadius: number): IPoint {
  const sectorAngle = angles.end - angles.start
  const bisectorAngle = (angles.start + angles.end) / 2
  const distanceFromCenter = (
    (4 * Math.sin(sectorAngle / 2)) /
    (3 * sectorAngle)
  ) * (
    (outerRadius ** 3 - innerRadius ** 3) /
    (outerRadius ** 2 - innerRadius ** 2)
  )

  return calculatePolarToCartesian(center, distanceFromCenter, bisectorAngle)
}
