import { describe, expect, it } from "vitest"
import { calculateLineIntersection } from "../src/calculateLineIntersection"

describe("calculateLineIntersection", () => {
  it("returns the intersection point when two segments cross", () => {
    const intersection = calculateLineIntersection(
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 10, y: 0 }
    )

    expect(intersection).toEqual({ x: 5, y: 5 })
  })

  it("returns null when the segments do not intersect", () => {
    const intersection = calculateLineIntersection(
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
      { x: 3, y: 1 }
    )

    expect(intersection).toBeNull()
  })
})
