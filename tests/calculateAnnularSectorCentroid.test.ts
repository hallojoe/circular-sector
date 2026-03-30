import { describe, expect, it } from "vitest"
import { calculateAnnularSectorCentroid } from "../src/calculateAnnularSectorCentroid"

describe("calculateAnnularSectorCentroid", () => {
  it("places the centroid on the bisector of a quarter-circle annular sector", () => {
    const angles = { start: 0, mid: Math.PI / 4, end: Math.PI / 2 }
    const centroid = calculateAnnularSectorCentroid({ x: 0, y: 0 }, angles, 10, 6)
    const expectedDistance = (
      (4 * Math.sin((angles.end - angles.start) / 2)) /
      (3 * (angles.end - angles.start))
    ) * (
      (10 ** 3 - 6 ** 3) /
      (10 ** 2 - 6 ** 2)
    )

    expect(centroid.x).toBeCloseTo(expectedDistance * Math.cos(Math.PI / 4), 10)
    expect(centroid.y).toBeCloseTo(expectedDistance * Math.sin(Math.PI / 4), 10)
  })
})
