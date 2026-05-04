import { describe, expect, it } from "vitest"
import { buildCircularSectorPath } from "../src/buildCircularSectorPath"
import { createCircularSectorViewModel } from "../src/createCircularSectorViewModel"

describe("buildCircularSectorPath", () => {
  it("builds a standard solid-sector path", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 10,
      ratio: 0.25,
      theta: 0,
      gap: 0,
      height: 0
    })

    const path = buildCircularSectorPath(sector)

    expect(path.startsWith("M ")).toBe(true)
    expect(path.includes(" A ")).toBe(true)
    expect(path.includes(" L 0 0")).toBe(true)
    expect(path.endsWith(" Z")).toBe(true)
  })

  it("builds an annular-sector path with an inner arc", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 10,
      ratio: 0.25,
      theta: 0,
      gap: 0,
      height: 4
    })

    const path = buildCircularSectorPath(sector)

    expect(path.split(" A ").length).toBeGreaterThan(2)
    expect(path.endsWith(" Z")).toBe(true)
  })

  it("builds a rounded path when pathRadius is provided", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.25,
      theta: 0,
      gap: 2,
      height: 0
    })

    const path = buildCircularSectorPath(sector, 3)

    expect(path.includes(" Q ")).toBe(true)
    expect(path.includes(" C ")).toBe(true)
    expect(path.endsWith(" Z")).toBe(true)
  })

  it("uses the narrowed rendered span for rounded annular arc flags", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 160, y: 160 },
      radius: 100,
      ratio: 0.51,
      theta: -Math.PI / 2,
      gap: 8,
      height: 50
    })

    const path = buildCircularSectorPath(sector, 8)

    expect(path).toContain("A 100 100 0 0 1")
    expect(path).toContain("A 50 50 1 0 0")
  })

  it("keeps large arc flags when rounded rendered spans remain over half a circle", () => {
    for (const ratio of [0.55, 0.75]) {
      const sector = createCircularSectorViewModel({
        center: { x: 160, y: 160 },
        radius: 100,
        ratio,
        theta: -Math.PI / 2,
        gap: 8,
        height: 50
      })

      const path = buildCircularSectorPath(sector, 8)

      expect(path).toContain("A 100 100 0 1 1")
      expect(path).toContain("A 50 50 1 1 0")
    }
  })
})
