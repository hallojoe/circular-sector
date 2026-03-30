import { describe, expect, it } from "vitest"
import { calculateCircleArea } from "../src/calculateCircleArea"
import { calculateCircleCircumference } from "../src/calculateCircleCircumference"
import { calculateDistanceBetweenPoints } from "../src/calculateDistanceBetweenPoints"
import { calculateEndPointOfLine } from "../src/calculateEndPointOfLine"
import { calculateIsoscelesTriangleHeight } from "../src/calculateIsoscelesTriangleHeight"
import { calculateMidpoint } from "../src/calculateMidpoint"
import { calculatePolarToCartesian } from "../src/convertPolarToCartesian"

describe("basic geometry helpers", () => {
  it("calculates circle area", () => {
    expect(calculateCircleArea(3)).toBeCloseTo(9 * Math.PI, 10)
  })

  it("calculates circle circumference", () => {
    expect(calculateCircleCircumference(3)).toBeCloseTo(6 * Math.PI, 10)
  })

  it("calculates distance between two points", () => {
    expect(calculateDistanceBetweenPoints({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })

  it("calculates a midpoint", () => {
    expect(calculateMidpoint({ x: 2, y: 4 }, { x: 6, y: 8 })).toEqual({ x: 4, y: 6 })
  })

  it("converts polar coordinates to cartesian coordinates", () => {
    const point = calculatePolarToCartesian({ x: 10, y: 20 }, 5, Math.PI / 2)

    expect(point.x).toBeCloseTo(10, 10)
    expect(point.y).toBeCloseTo(25, 10)
  })

  it("calculates the endpoint of a line for the large-angle direction", () => {
    const point = calculateEndPointOfLine({ x: 0, y: 0 }, 0, 5, true)

    expect(point).toEqual({ x: 5, y: 0 })
  })

  it("calculates the endpoint of a line for the mirrored direction", () => {
    const point = calculateEndPointOfLine({ x: 0, y: 0 }, 0, 5)

    expect(point).toEqual({ x: -5, y: 0 })
  })

  it("calculates the height of an isosceles triangle", () => {
    expect(calculateIsoscelesTriangleHeight(6, 5)).toBeCloseTo(4, 10)
  })
})
