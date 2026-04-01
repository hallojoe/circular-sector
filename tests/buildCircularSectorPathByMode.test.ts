import { describe, expect, it } from "vitest"
import {
  buildCircularSectorPathByMode,
  createCircularSectorViewModel
} from "../src"

describe("buildCircularSectorPathByMode", () => {
  it("builds an arc path by default", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 10,
      ratio: 0.25,
      theta: 0,
      gap: 0,
      height: 0
    })

    const path = buildCircularSectorPathByMode(sector)

    expect(path.includes(" A ")).toBe(true)
    expect(path.endsWith(" Z")).toBe(true)
  })

  it("builds a rounded path for solid sectors", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.25,
      theta: 0,
      gap: 2,
      height: 0
    })

    const path = buildCircularSectorPathByMode(sector, {
      mode: "rounded",
      cornerRadius: 3
    })

    expect(path.includes(" Q ")).toBe(true)
    expect(path.includes(" C ")).toBe(true)
    expect(path.endsWith(" Z")).toBe(true)
  })

  it("builds an angular path with only line commands", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 10,
      ratio: 0.25,
      theta: 0,
      gap: 0,
      height: 4
    })

    const path = buildCircularSectorPathByMode(sector, { mode: "angular" })

    expect(path.includes(" A ")).toBe(false)
    expect(path.includes(" Q ")).toBe(false)
    expect(path.includes(" C ")).toBe(false)
    expect(path.split(" L ").length).toBeGreaterThan(4)
  })

  it("builds a beveled path with extra corner cuts", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 18,
      ratio: 0.2,
      theta: 0,
      gap: 0,
      height: 6
    })

    const angularPath = buildCircularSectorPathByMode(sector, { mode: "angular" })
    const beveledPath = buildCircularSectorPathByMode(sector, {
      mode: "beveled",
      bevelSize: 2
    })

    expect(beveledPath.includes(" A ")).toBe(false)
    expect(beveledPath.split(" L ").length).toBeGreaterThan(angularPath.split(" L ").length)
  })

  it("builds a faceted path without arc commands", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 14,
      ratio: 0.3,
      theta: 0,
      gap: 0,
      height: 5
    })

    const path = buildCircularSectorPathByMode(sector, {
      mode: "faceted",
      facetCount: 5
    })

    expect(path.includes(" A ")).toBe(false)
    expect(path.includes(" Q ")).toBe(false)
    expect(path.includes(" C ")).toBe(false)
    expect(path.split(" L ").length).toBeGreaterThan(8)
  })
})
