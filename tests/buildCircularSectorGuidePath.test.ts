import { describe, expect, it } from "vitest"
import { buildCircularSectorGuidePath } from "../src/buildCircularSectorGuidePath"
import { createCircularSectorViewModel } from "../src/createCircularSectorViewModel"

describe("buildCircularSectorGuidePath", () => {
  it("builds an open middle guide path by default", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.25,
      theta: 0,
      gap: 2,
      height: 8
    })

    const path = buildCircularSectorGuidePath(sector)

    expect(path.startsWith("M ")).toBe(true)
    expect(path.includes(" A ")).toBe(true)
    expect(path.endsWith(" Z")).toBe(false)
  })

  it("builds an outer guide path that follows the trimmed outer anchors", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.2,
      theta: 0,
      gap: 4,
      height: 6
    })

    const path = buildCircularSectorGuidePath(sector, { ring: "outer" })

    expect(path).toContain(`M ${sector.anchors.outer.end.x} ${sector.anchors.outer.end.y}`)
    expect(path).toContain(`${sector.anchors.outer.start.x} ${sector.anchors.outer.start.y}`)
  })

  it("uses rendered span arc flags for gapped sectors over half a circle", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 160, y: 160 },
      radius: 100,
      ratio: 0.51,
      theta: -Math.PI / 2,
      gap: 8,
      height: 50
    })

    const path = buildCircularSectorGuidePath(sector, { ring: "outer" })

    expect(path).toContain("A 100 100 0 0 1")
  })

  it("builds an inner guide arc for annular sectors", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 24,
      ratio: 0.3,
      theta: 0,
      gap: 3,
      height: 10
    })

    const path = buildCircularSectorGuidePath(sector, { ring: "inner" })

    expect(path.includes(" A 14 14 ")).toBe(true)
    expect(path.endsWith(" Z")).toBe(false)
  })

  it("uses the selected ring span for inner guide arc flags", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 160, y: 160 },
      radius: 100,
      ratio: 0.51,
      theta: -Math.PI / 2,
      gap: 8,
      height: 50
    })

    const path = buildCircularSectorGuidePath(sector, { ring: "inner" })

    expect(path).toContain("A 50 50 0 0 1")
  })

  it("collapses the inner guide path to a move command for solid sectors", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 5, y: 6 },
      radius: 20,
      ratio: 0.25,
      theta: 0,
      gap: 0,
      height: 0
    })

    const path = buildCircularSectorGuidePath(sector, { ring: "inner" })

    expect(path).toBe("M 5 6")
  })
})
