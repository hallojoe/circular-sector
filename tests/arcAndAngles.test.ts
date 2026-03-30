import { describe, expect, it } from "vitest"
import { calculateArcPoints } from "../src/calculateArcPoints"
import { calculateSectorAngles } from "../src/calculateSectorAngles"
import { calculateSectorLengthInRadians } from "../src/calculateSectorLengthInRadians"

describe("arc and angle helpers", () => {
  it("calculates sector angles from a ratio and initial angle", () => {
    const angles = calculateSectorAngles(0.25, Math.PI / 2)

    expect(angles.start).toBeCloseTo(Math.PI / 2, 10)
    expect(angles.mid).toBeCloseTo(3 * Math.PI / 4, 10)
    expect(angles.end).toBeCloseTo(Math.PI, 10)
  })

  it("converts a ratio to radians", () => {
    expect(calculateSectorLengthInRadians(0.5)).toBeCloseTo(Math.PI, 10)
  })

  it("calculates arc points in start-mid-end order", () => {
    const [start, mid, end] = calculateArcPoints({ x: 0, y: 0 }, 10, 0, Math.PI / 2)

    expect(start.x).toBeCloseTo(0, 10)
    expect(start.y).toBeCloseTo(10, 10)
    expect(mid.x).toBeCloseTo(Math.sqrt(50), 10)
    expect(mid.y).toBeCloseTo(Math.sqrt(50), 10)
    expect(end.x).toBeCloseTo(10, 10)
    expect(end.y).toBeCloseTo(0, 10)
  })
})
