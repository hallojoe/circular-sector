import { describe, expect, it } from "vitest"
import {
  buildRectangularSectorPathByMode,
  createCircularSectorViewModel
} from "../src"

describe("buildRectangularSectorPathByMode", () => {
  it("builds a closed vertical path by default", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.5,
      theta: 0,
      gap: 0,
      height: 0
    })

    const path = buildRectangularSectorPathByMode(sector)

    expect(path.includes(" A ")).toBe(false)
    expect(path.includes(" Q ")).toBe(false)
    expect(path.includes(" C ")).toBe(false)
    expect(path.endsWith(" Z")).toBe(true)
  })

  it("builds a line-only vertical slice", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 10, y: 20 },
      radius: 24,
      ratio: 0.25,
      theta: -Math.PI / 2,
      gap: 0,
      height: 0
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "vertical" })

    expect(path).toBe("M -2 8 L 22 8 L 22 14 L -2 14 Z")
  })

  it("builds a line-only horizontal slice", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 10, y: 20 },
      radius: 24,
      ratio: 0.25,
      theta: Math.PI,
      gap: 0,
      height: 0
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "horizontal" })

    expect(path).toBe("M -2 8 L 4 8 L 4 32 L -2 32 Z")
  })

  it("builds a solid slice when height is zero", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 30,
      ratio: 0.4,
      theta: 0,
      gap: 0,
      height: 0
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "horizontal" })

    expect(path).toBe("M 3 -15 L 15 -15 L 15 15 L 3 15 Z")
  })

  it("builds a band path with an inner rectangular cutout", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 30,
      ratio: 1,
      theta: -Math.PI / 2,
      gap: 0,
      height: 10
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "vertical" })

    expect(path.split(" M ").length).toBe(2)
    expect(path.endsWith(" Z")).toBe(true)
  })

  it("builds a notched partial band when the slice intersects the inner cutout", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 30,
      ratio: 0.4,
      theta: -Math.PI / 2,
      gap: 0,
      height: 10
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "vertical" })

    expect(path.split(" L ").length).toBeGreaterThan(6)
    expect(path.includes(" M ")).toBe(false)
  })

  it("returns a collapsed closed path when ratio is zero", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 30,
      ratio: 0,
      theta: 0,
      gap: 0,
      height: 8
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "horizontal" })

    expect(path).toBe("M 15 -15 L 15 -15 L 15 15 L 15 15 Z")
  })

  it("renders the full band when ratio is one", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 1,
      theta: 0,
      gap: 0,
      height: 6
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "horizontal" })

    expect(path).toContain("M -10 -10")
    expect(path).toContain("M -7 -7")
  })

  it("uses theta to select different anchor sides", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.3,
      theta: -Math.PI / 2,
      gap: 0,
      height: 0
    })

    const topAnchored = buildRectangularSectorPathByMode(sector, { mode: "vertical" })
    const bottomAnchored = buildRectangularSectorPathByMode({
      ...sector,
      source: {
        ...sector.source,
        theta: Math.PI / 2
      }
    }, { mode: "vertical" })

    expect(topAnchored.startsWith("M -10 -10")).toBe(true)
    expect(bottomAnchored.startsWith("M -10 4")).toBe(true)
  })

  it("treats radius as the long outer span", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 40,
      ratio: 0.5,
      theta: 0,
      gap: 0,
      height: 10
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "horizontal" })

    expect(path).toContain("20")
    expect(path).toContain("-20")
  })

  it("clamps height when it is larger than radius", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 1,
      theta: 0,
      gap: 0,
      height: 40
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "vertical" })

    expect(path.split(" M ").length).toBe(1)
    expect(path).toBe("M -10 -10 L 10 -10 L 10 10 L -10 10 Z")
  })

  it("clamps oversized and negative values safely", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.5,
      theta: 0,
      gap: 0,
      height: 8
    })

    const path = buildRectangularSectorPathByMode({
      ...sector,
      source: {
        ...sector.source,
        radius: -20,
        ratio: 2,
        height: -4
      }
    }, { mode: "horizontal" })

    expect(path.endsWith(" Z")).toBe(true)
    expect(path).toBe("M 0 0 L 0 0 L 0 0 L 0 0 Z")
  })
})
