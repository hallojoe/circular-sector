import { IPoint } from "./Interfaces"
import { calculateDistanceBetweenPoints } from "./calculateDistanceBetweenPoints"
import { getPointAlongLine } from "./getPointAlongLine"

export interface IBeveledCornerPoints {
  entry: IPoint
  exit: IPoint
}

/**
 * Converts a polygon into beveled edge pairs by trimming each corner along its adjacent edges.
 */
export function createBeveledPolygon(points: IPoint[], bevelSize: number): IBeveledCornerPoints[] {
  return points.map((point, index) => {
    const previousPoint = points[(index - 1 + points.length) % points.length]
    const nextPoint = points[(index + 1) % points.length]
    const maxBevelSize = Math.min(
      bevelSize,
      calculateDistanceBetweenPoints(point, previousPoint) / 2,
      calculateDistanceBetweenPoints(point, nextPoint) / 2
    )

    return {
      entry: getPointAlongLine(point, previousPoint, maxBevelSize),
      exit: getPointAlongLine(point, nextPoint, maxBevelSize)
    }
  })
}
