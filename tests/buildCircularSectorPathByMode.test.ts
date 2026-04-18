import { describe, expect, it } from "vitest"
import {
  buildCircularSectorPathByMode,
  calculatePolarToCartesian,
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

  it("builds a scalloped path with curved outer details for solid sectors", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 32,
      ratio: 0.3,
      theta: 0,
      gap: 2,
      height: 0
    })

    const arcPath = buildCircularSectorPathByMode(sector, { mode: "arc" })
    const scallopedPath = buildCircularSectorPathByMode(sector, {
      mode: "scalloped",
      scallopCount: 5
    })

    expect(scallopedPath.includes(" Q ")).toBe(true)
    expect(scallopedPath.endsWith(" Z")).toBe(true)
    expect(scallopedPath).not.toBe(arcPath)
  })

  it("starts scalloped outer details from the current outer-end anchor direction", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 100,
      ratio: 0.25,
      theta: -Math.PI / 2,
      gap: 0,
      height: 100
    })

    const scallopCount = 4
    const segmentAngle = (sector.angles.end - sector.angles.start) / scallopCount
    const firstMidAngle = sector.angles.start + (segmentAngle / 2)
    const firstEndAngle = sector.angles.start + segmentAngle
    const depth = 8
    const expectedControl = calculatePolarToCartesian(
      sector.center,
      sector.source.radius + depth,
      firstMidAngle
    )
    const expectedEnd = calculatePolarToCartesian(
      sector.center,
      sector.source.radius,
      firstEndAngle
    )

    const path = buildCircularSectorPathByMode(sector, {
      mode: "scalloped",
      scallopCount,
      scallopDepth: depth
    })

    expect(path.startsWith(
      `M ${sector.anchors.outer.end.x} ${sector.anchors.outer.end.y} Q ${expectedControl.x} ${expectedControl.y} ${expectedEnd.x} ${expectedEnd.y}`
    )).toBe(true)
  })

  it("builds a scalloped annular path while keeping the inner arc", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 36,
      ratio: 0.28,
      theta: 0,
      gap: 3,
      height: 10
    })

    const path = buildCircularSectorPathByMode(sector, {
      mode: "scalloped",
      scallopCount: 6
    })

    expect(path.includes(" Q ")).toBe(true)
    expect(path.includes(" A ")).toBe(true)
    expect(path.endsWith(" Z")).toBe(true)
  })

  it("falls back to an arc path when scallops clamp away", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 12,
      ratio: 0.2,
      theta: 0,
      gap: 0,
      height: 0
    })

    const arcPath = buildCircularSectorPathByMode(sector, { mode: "arc" })
    const scallopedPath = buildCircularSectorPathByMode(sector, {
      mode: "scalloped",
      scallopCount: 1,
      scallopDepth: 0
    })

    expect(scallopedPath).toBe(arcPath)
  })

  it("builds a stepped path with more line segments than angular", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 28,
      ratio: 0.25,
      theta: 0,
      gap: 2,
      height: 8
    })

    const angularPath = buildCircularSectorPathByMode(sector, { mode: "angular" })
    const steppedPath = buildCircularSectorPathByMode(sector, {
      mode: "stepped",
      stepCount: 4
    })

    expect(steppedPath.includes(" A ")).toBe(false)
    expect(steppedPath.includes(" Q ")).toBe(false)
    expect(steppedPath.includes(" C ")).toBe(false)
    expect(steppedPath.split(" L ").length).toBeGreaterThan(angularPath.split(" L ").length)
    expect(steppedPath.endsWith("Z")).toBe(true)
  })

  it("clamps invalid stepped counts safely", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 24,
      ratio: 0.22,
      theta: 0,
      gap: 0,
      height: 6
    })

    const path = buildCircularSectorPathByMode(sector, {
      mode: "stepped",
      stepCount: 0
    })

    expect(path.includes(" A ")).toBe(false)
    expect(path.split(" L ").length).toBeGreaterThan(8)
  })

  it("falls back to angular for pie sectors when stepped inset clamps away", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 20,
      ratio: 0.18,
      theta: 0,
      gap: 0,
      height: 0
    })

    const angularPath = buildCircularSectorPathByMode(sector, { mode: "angular" })
    const steppedPath = buildCircularSectorPathByMode(sector, {
      mode: "stepped",
      stepInset: 0
    })

    expect(steppedPath).toBe(angularPath)
  })

  it("builds a burst path with alternating spike details", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 30,
      ratio: 0.32,
      theta: 0,
      gap: 2,
      height: 9
    })

    const facetedPath = buildCircularSectorPathByMode(sector, {
      mode: "faceted",
      facetCount: 4
    })
    const burstPath = buildCircularSectorPathByMode(sector, {
      mode: "burst",
      burstCount: 4
    })

    expect(burstPath.includes(" A ")).toBe(true)
    expect(burstPath.includes(" Q ")).toBe(false)
    expect(burstPath.includes(" C ")).toBe(false)
    expect(burstPath).not.toBe(facetedPath)
    expect(burstPath.split(" L ").length).toBeGreaterThanOrEqual(10)
    expect(burstPath.endsWith(" Z")).toBe(true)
  })

  it("starts burst outer details from the current outer-end anchor direction", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 100,
      ratio: 0.25,
      theta: -Math.PI / 2,
      gap: 0,
      height: 100
    })

    const burstCount = 4
    const segmentAngle = (sector.angles.end - sector.angles.start) / burstCount
    const firstMidAngle = sector.angles.start + (segmentAngle / 2)
    const firstEndAngle = sector.angles.start + segmentAngle
    const depth = 8
    const expectedTip = calculatePolarToCartesian(
      sector.center,
      sector.source.radius + depth,
      firstMidAngle
    )
    const expectedEnd = calculatePolarToCartesian(
      sector.center,
      sector.source.radius,
      firstEndAngle
    )

    const path = buildCircularSectorPathByMode(sector, {
      mode: "burst",
      burstCount,
      burstDepth: depth
    })

    expect(path.startsWith(
      `M ${sector.anchors.outer.end.x} ${sector.anchors.outer.end.y} L ${expectedTip.x} ${expectedTip.y} L ${expectedEnd.x} ${expectedEnd.y}`
    )).toBe(true)
  })

  it("falls back to a faceted path when burst depth clamps away", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 18,
      ratio: 0.2,
      theta: 0,
      gap: 0,
      height: 4
    })

    const facetedPath = buildCircularSectorPathByMode(sector, {
      mode: "faceted",
      facetCount: 3
    })
    const burstPath = buildCircularSectorPathByMode(sector, {
      mode: "burst",
      burstCount: 3,
      burstDepth: 0
    })

    expect(burstPath).toBe(facetedPath)
  })

  it("keeps gapped sectors trimmed when building playful modes", () => {
    const sector = createCircularSectorViewModel({
      center: { x: 0, y: 0 },
      radius: 40,
      ratio: 0.25,
      theta: 0,
      gap: 10,
      height: 12
    })

    const scallopedPath = buildCircularSectorPathByMode(sector, {
      mode: "scalloped",
      scallopCount: 5
    })
    const burstPath = buildCircularSectorPathByMode(sector, {
      mode: "burst",
      burstCount: 5
    })

    expect(scallopedPath.startsWith(`M ${sector.anchors.outer.end.x} ${sector.anchors.outer.end.y}`)).toBe(true)
    expect(burstPath.startsWith(`M ${sector.anchors.outer.end.x} ${sector.anchors.outer.end.y}`)).toBe(true)
    expect(scallopedPath).toContain(`L ${sector.anchors.inner.start.x} ${sector.anchors.inner.start.y}`)
    expect(burstPath).toContain(`L ${sector.anchors.inner.start.x} ${sector.anchors.inner.start.y}`)
  })
})
