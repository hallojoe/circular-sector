import { describe, expect, it } from "vitest"
import { calculateSectorCentroid } from "../src/calculateSectorCentroid"

describe("calculateSectorCentroid", () => {
  it("places the centroid on the bisector of a quarter-circle sector", () => {
    const centroid = calculateSectorCentroid(
      { x: 0, y: 0 },
      { start: 0, mid: Math.PI / 4, end: Math.PI / 2 },
      10
    )
    const expectedDistance = (4 * 10 * Math.sin(Math.PI / 4)) / (3 * (Math.PI / 2))

    expect(centroid.x).toBeCloseTo(expectedDistance * Math.cos(Math.PI / 4), 10)
    expect(centroid.y).toBeCloseTo(expectedDistance * Math.sin(Math.PI / 4), 10)
  })
})
