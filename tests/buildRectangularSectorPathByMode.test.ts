import { describe, expect, it } from "vitest"
import {
  buildRectangularSectorPathByMode,
  createCircularSectorViewModel
} from "../src"

describe("buildRectangularSectorPathByMode", () => {
  it("builds line-only rectangular paths by default", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.5,
      theta: -Math.PI / 2,
      gap: 0,
      height: 10
    })

    const path = buildRectangularSectorPathByMode(sector)

    expect(path.includes(" Q ")).toBe(false)
    expect(path.includes(" C ")).toBe(false)
    expect(path.endsWith(" Z")).toBe(true)
  })

  it("lays horizontal bars out from left to right", () => {
    const first = createCircularSectorViewModel({
      center: { x: 50, y: 50 },
      radius: 40,
      ratio: 0.25,
      theta: -Math.PI / 2,
      gap: 0,
      height: 8
    })
    const second = createCircularSectorViewModel({
      center: { x: 50, y: 50 },
      radius: 40,
      ratio: 0.25,
      theta: 0,
      gap: 0,
      height: 8
    })

    const firstPath = buildRectangularSectorPathByMode(first, { mode: "horizontal" })
    const secondPath = buildRectangularSectorPathByMode(second, { mode: "horizontal" })

    expect(firstPath.startsWith("M 30 30")).toBe(true)
    expect(secondPath.startsWith("M 38 30")).toBe(true)
  })

  it("lays vertical bars out from top to bottom", () => {
    const first = createCircularSectorViewModel({
      center: { x: 50, y: 50 },
      radius: 40,
      ratio: 0.25,
      theta: -Math.PI / 2,
      gap: 0,
      height: 8
    })
    const second = createCircularSectorViewModel({
      center: { x: 50, y: 50 },
      radius: 0.25,
      theta: 0,
      gap: 0,
      height: 8
    })

    const firstPath = buildRectangularSectorPathByMode(first, { mode: "vertical" })
    const secondPath = buildRectangularSectorPathByMode({
      ...first,
      source: {
        ...first.source,
        theta: 0
      }
    }, { mode: "vertical" })

    expect(firstPath.startsWith("M 30 30")).toBe(true)
    expect(secondPath.startsWith("M 30 38")).toBe(true)
  })

  it("renders a single full bar when radius is less than or equal to height", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.25,
      theta: -Math.PI / 2,
      gap: 12,
      height: 20
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "vertical" })

    expect(path).toBe("M -10 -10 L 10 -10 L 10 10 L -10 10 Z")
  })

  it("splits a vertical bar into filled and remaining rectangles with gap applied", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 40,
      ratio: 0.25,
      theta: -Math.PI / 2,
      gap: 4,
      height: 8
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "vertical" })

    expect(path).toBe(
      "M -20 -20 L -13 -20 L -13 -12 L -20 -12 Z M -9 -20 L 12 -20 L 12 -12 L -9 -12 Z"
    )
  })

  it("splits a horizontal bar into filled and remaining rectangles with gap applied", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 40,
      ratio: 0.25,
      theta: -Math.PI / 2,
      gap: 4,
      height: 8
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "horizontal" })

    expect(path).toBe(
      "M -20 -20 L -12 -20 L -12 -13 L -20 -13 Z M -20 -9 L -12 -9 L -12 12 L -20 12 Z"
    )
  })

  it("renders a single segment when ratio is one", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 40,
      ratio: 1,
      theta: -Math.PI / 2,
      gap: 4,
      height: 8
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "vertical" })

    expect(path).toBe("M -20 -20 L 20 -20 L 20 -12 L -20 -12 Z")
  })

  it("ignores gap in the single-bar fallback", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 12,
      ratio: 0.5,
      theta: -Math.PI / 2,
      gap: 99,
      height: 20
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "horizontal" })

    expect(path).toBe("M -6 -6 L 6 -6 L 6 6 L -6 6 Z")
  })

  it("supports rounded corners for both bar segments", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 40,
      ratio: 0.25,
      theta: -Math.PI / 2,
      gap: 4,
      height: 8
    })

    const path = buildRectangularSectorPathByMode(sector, {
      mode: "vertical",
      cornerRadius: 2
    })

    expect(path.includes(" A 2 2 0 0 1 ")).toBe(true)
    expect(path.split(" M ").length).toBe(2)
  })

  it("clamps invalid values safely", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.5,
      theta: -Math.PI / 2,
      gap: 0,
      height: 8
    })

    const path = buildRectangularSectorPathByMode({
      ...sector,
      source: {
        ...sector.source,
        radius: -20,
        ratio: 2,
        gap: -4,
        height: -8
      }
    }, { mode: "vertical" })

    expect(path).toBe("M 0 0 L 0 0 L 0 0 L 0 0 Z")
  })
})
