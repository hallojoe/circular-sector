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

  it("lays horizontal bars out from left to right using stack index", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 50, y: 50 },
      radius: 40,
      ratio: 0.25,
      theta: -Math.PI / 2,
      gap: 0,
      height: 8
    })

    const firstPath = buildRectangularSectorPathByMode(sector, {
      mode: "horizontal",
      size: 8,
      stackIndex: 0,
      stackCount: 3
    })
    const secondPath = buildRectangularSectorPathByMode(sector, {
      mode: "horizontal",
      size: 8,
      stackIndex: 1,
      stackCount: 3
    })

    expect(firstPath.startsWith("M 38 46")).toBe(true)
    expect(secondPath.startsWith("M 46 46")).toBe(true)
  })

  it("lays vertical bars out from top to bottom using stack index", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 50, y: 50 },
      radius: 40,
      ratio: 0.25,
      theta: -Math.PI / 2,
      gap: 0,
      height: 8
    })

    const firstPath = buildRectangularSectorPathByMode(sector, {
      mode: "vertical",
      size: 8,
      stackIndex: 0,
      stackCount: 3
    })
    const secondPath = buildRectangularSectorPathByMode(sector, {
      mode: "vertical",
      size: 8,
      stackIndex: 1,
      stackCount: 3
    })

    expect(firstPath.startsWith("M 46 38")).toBe(true)
    expect(secondPath.startsWith("M 46 46")).toBe(true)
  })

  it("centers the combined stack on the layer center point", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 100, y: 200 },
      radius: 40,
      ratio: 0.25,
      theta: 0,
      gap: 10,
      height: 8
    })

    const firstPath = buildRectangularSectorPathByMode(sector, {
      mode: "horizontal",
      size: 20,
      stackIndex: 0,
      stackCount: 2
    })
    const secondPath = buildRectangularSectorPathByMode(sector, {
      mode: "horizontal",
      size: 20,
      stackIndex: 1,
      stackCount: 2
    })

    expect(firstPath.startsWith("M 75 196")).toBe(true)
    expect(secondPath.startsWith("M 105 196")).toBe(true)
  })

  it("caps usable bar span by radius when height is larger than radius", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.25,
      theta: -Math.PI / 2,
      gap: 12,
      height: 30
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "vertical" })

    expect(path).toBe("M -10 -10 L -8 -10 L -8 10 L -10 10 Z M 4 -10 L 10 -10 L 10 10 L 4 10 Z")
  })

  it("splits a vertical bar into filled and remaining rectangles using height span", () => {
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
      "M -4 -4 L -3 -4 L -3 4 L -4 4 Z M 1 -4 L 4 -4 L 4 4 L 1 4 Z"
    )
  })

  it("splits a horizontal bar into filled and remaining rectangles using height span", () => {
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
      "M -4 -4 L 4 -4 L 4 -3 L -4 -3 Z M -4 1 L 4 1 L 4 4 L -4 4 Z"
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

    expect(path).toBe("M -4 -4 L 4 -4 L 4 4 L -4 4 Z")
  })

  it("uses height as the usable rectangular span instead of radius minus height", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 256,
      ratio: 0.5,
      theta: -Math.PI / 2,
      gap: 10,
      height: 200
    })

    const path = buildRectangularSectorPathByMode(sector, { mode: "vertical", size: 20 })

    expect(path).toBe("M -100 -10 L -5 -10 L -5 10 L -100 10 Z M 5 -10 L 100 -10 L 100 10 L 5 10 Z")
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

    expect(path.includes(" A ")).toBe(true)
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
