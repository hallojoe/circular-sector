import { describe, expect, it } from "vitest"
import { createCircularSectorViewModel } from "../src/createCircularSectorViewModel"

describe("createCircularSectorViewModel", () => {
  it("creates a solid sector view model", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 10,
      ratio: 0.25,
      theta: 0,
      gap: 0,
      height: 0
    })

    expect(sector.center).toEqual({ x: 0, y: 0 })
    expect(sector.radius).toBe(10)
    expect(sector.anchors.inner.start).toEqual({ x: 0, y: 0 })
    expect(sector.anchors.outer.start.x).toBeCloseTo(0, 10)
    expect(sector.anchors.outer.start.y).toBeCloseTo(10, 10)
    expect(sector.anchors.outer.end.x).toBeCloseTo(10, 10)
    expect(sector.anchors.outer.end.y).toBeCloseTo(0, 10)
    expect(sector.anchors.centroid.x).toBeCloseTo(sector.anchors.centroid.y, 10)
  })

  it("creates an annular sector view model with a separate inner arc", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 10,
      ratio: 0.25,
      theta: 0,
      gap: 0,
      height: 4
    })

    expect(sector.anchors.inner.start).not.toEqual({ x: 0, y: 0 })
    expect(sector.anchors.middle.start).not.toEqual(sector.anchors.outer.start)
    expect(sector.anchors.centroid.x).toBeGreaterThan(0)
    expect(sector.anchors.centroid.y).toBeGreaterThan(0)
  })

  it("creates a gapped sector with a shifted center", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.25,
      theta: 0,
      gap: 4,
      height: 0
    })

    expect(sector.center).not.toEqual({ x: 0, y: 0 })
    expect(sector.radius).toBeLessThan(20)
    expect(sector.anchors.inner.start).toEqual(sector.center)
  })

  it("creates finite gapped full-circle geometry", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 160, y: 160 },
      radius: 100,
      ratio: 1,
      theta: -Math.PI / 2,
      gap: 8,
      height: 0
    })

    const points = [
      sector.center,
      sector.anchors.outer.start,
      sector.anchors.outer.mid,
      sector.anchors.outer.end,
      sector.anchors.inner.start,
      sector.anchors.centroid
    ]

    expect(sector.center).toEqual({ x: 160, y: 160 })
    expect(sector.radius).toBe(100)
    expect(sector.angles.end - sector.angles.start).toBeLessThan(Math.PI * 2)
    expect(points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true)
    expect(points.every((point) => Math.abs(point.x) < 300 && Math.abs(point.y) < 300)).toBe(true)
  })

  it("treats ratios above one as one full circle", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 160, y: 160 },
      radius: 100,
      ratio: 1.4,
      theta: -Math.PI / 2,
      gap: 8,
      height: 0
    })

    expect(sector.ratio).toBe(1)
    expect(sector.angles.end - sector.angles.start).toBeLessThanOrEqual(Math.PI * 2)
  })
})
