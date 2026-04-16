import { ICircularSectorViewModel } from "./Interfaces"

export type RectangularSectorPathMode = "vertical" | "horizontal"

export interface IRectangularSectorPathOptions {
  mode?: RectangularSectorPathMode
}

type CardinalSide = "right" | "bottom" | "left" | "top"
type VerticalAnchor = "top" | "bottom"
type HorizontalAnchor = "left" | "right"

interface IRect {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * Builds an SVG path for a rectangular slice or band from the circular sector view model.
 *
 * The rectangular interpretation uses the raw source values rather than circular anchor points:
 * - `radius` is the full outer span
 * - `height` is the reduction from the outer span to the inner span
 * - `ratio` fills the primary axis only
 * - `theta` selects the anchor side
 */
export function buildRectangularSectorPathByMode(
  sector: ICircularSectorViewModel,
  options: IRectangularSectorPathOptions = {}
): string {
  const mode = options.mode ?? "vertical"
  const ratio = clamp(sector.source.ratio, 0, 1)
  const outerSpan = Math.max(0, sector.source.radius)
  const thickness = clamp(
    sector.source.height > 0 ? sector.source.height : sector.source.radius,
    0,
    outerSpan
  )
  const innerSpan = Math.max(0, outerSpan - thickness)
  const filledSpan = clamp(outerSpan * ratio, 0, outerSpan)
  const outerRect = createCenteredRect(sector.center.x, sector.center.y, outerSpan, outerSpan)

  if (mode === "horizontal") {
    const anchor = resolveHorizontalAnchor(getNearestCardinalSide(sector.source.theta))
    const sliceRect = createHorizontalSliceRect(outerRect, filledSpan, anchor)

    return buildRectangularSlicePath(sliceRect, outerRect, innerSpan, anchor)
  }

  const anchor = resolveVerticalAnchor(getNearestCardinalSide(sector.source.theta))
  const sliceRect = createVerticalSliceRect(outerRect, filledSpan, anchor)

  return buildRectangularSlicePath(sliceRect, outerRect, innerSpan, anchor)
}

function buildRectangularSlicePath(
  sliceRect: IRect,
  outerRect: IRect,
  innerSpan: number,
  anchor: VerticalAnchor | HorizontalAnchor
): string {
  if (isCollapsedRect(sliceRect)) {
    return buildRectPath(sliceRect)
  }

  if (innerSpan <= 0) {
    return buildRectPath(sliceRect)
  }

  const innerRect = createCenteredRect(
    (outerRect.left + outerRect.right) / 2,
    (outerRect.top + outerRect.bottom) / 2,
    innerSpan,
    innerSpan
  )
  const overlapRect = intersectRects(sliceRect, innerRect)

  if (!overlapRect) {
    return buildRectPath(sliceRect)
  }

  if (containsRect(sliceRect, innerRect)) {
    return [
      buildRectPath(sliceRect, false),
      buildRectPath(innerRect, true)
    ].join(" ")
  }

  switch (anchor) {
    case "top":
      return buildPolygonPath([
        point(sliceRect.left, sliceRect.top),
        point(sliceRect.right, sliceRect.top),
        point(sliceRect.right, sliceRect.bottom),
        point(overlapRect.right, sliceRect.bottom),
        point(overlapRect.right, overlapRect.top),
        point(overlapRect.left, overlapRect.top),
        point(overlapRect.left, sliceRect.bottom),
        point(sliceRect.left, sliceRect.bottom)
      ])

    case "bottom":
      return buildPolygonPath([
        point(sliceRect.left, sliceRect.bottom),
        point(sliceRect.right, sliceRect.bottom),
        point(sliceRect.right, sliceRect.top),
        point(overlapRect.right, sliceRect.top),
        point(overlapRect.right, overlapRect.bottom),
        point(overlapRect.left, overlapRect.bottom),
        point(overlapRect.left, sliceRect.top),
        point(sliceRect.left, sliceRect.top)
      ])

    case "left":
      return buildPolygonPath([
        point(sliceRect.left, sliceRect.top),
        point(sliceRect.right, sliceRect.top),
        point(sliceRect.right, overlapRect.top),
        point(overlapRect.left, overlapRect.top),
        point(overlapRect.left, overlapRect.bottom),
        point(sliceRect.right, overlapRect.bottom),
        point(sliceRect.right, sliceRect.bottom),
        point(sliceRect.left, sliceRect.bottom)
      ])

    case "right":
      return buildPolygonPath([
        point(sliceRect.right, sliceRect.top),
        point(sliceRect.left, sliceRect.top),
        point(sliceRect.left, overlapRect.top),
        point(overlapRect.right, overlapRect.top),
        point(overlapRect.right, overlapRect.bottom),
        point(sliceRect.left, overlapRect.bottom),
        point(sliceRect.left, sliceRect.bottom),
        point(sliceRect.right, sliceRect.bottom)
      ])
  }
}

function createVerticalSliceRect(
  outerRect: IRect,
  filledSpan: number,
  anchor: VerticalAnchor
): IRect {
  if (anchor === "bottom") {
    return {
      left: outerRect.left,
      right: outerRect.right,
      top: outerRect.bottom - filledSpan,
      bottom: outerRect.bottom
    }
  }

  return {
    left: outerRect.left,
    right: outerRect.right,
    top: outerRect.top,
    bottom: outerRect.top + filledSpan
  }
}

function createHorizontalSliceRect(
  outerRect: IRect,
  filledSpan: number,
  anchor: HorizontalAnchor
): IRect {
  if (anchor === "right") {
    return {
      left: outerRect.right - filledSpan,
      right: outerRect.right,
      top: outerRect.top,
      bottom: outerRect.bottom
    }
  }

  return {
    left: outerRect.left,
    right: outerRect.left + filledSpan,
    top: outerRect.top,
    bottom: outerRect.bottom
  }
}

function createCenteredRect(centerX: number, centerY: number, width: number, height: number): IRect {
  const halfWidth = width / 2
  const halfHeight = height / 2

  return {
    left: centerX - halfWidth,
    top: centerY - halfHeight,
    right: centerX + halfWidth,
    bottom: centerY + halfHeight
  }
}

function intersectRects(a: IRect, b: IRect): IRect | null {
  const intersection: IRect = {
    left: Math.max(a.left, b.left),
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom)
  }

  if (intersection.left >= intersection.right || intersection.top >= intersection.bottom) {
    return null
  }

  return intersection
}

function containsRect(outer: IRect, inner: IRect): boolean {
  return (
    outer.left <= inner.left &&
    outer.top <= inner.top &&
    outer.right >= inner.right &&
    outer.bottom >= inner.bottom
  )
}

function isCollapsedRect(rect: IRect): boolean {
  return rect.left === rect.right || rect.top === rect.bottom
}

function buildRectPath(rect: IRect, reverse: boolean = false): string {
  const points = !reverse
    ? [
      point(rect.left, rect.top),
      point(rect.right, rect.top),
      point(rect.right, rect.bottom),
      point(rect.left, rect.bottom)
    ]
    : [
      point(rect.left, rect.top),
      point(rect.left, rect.bottom),
      point(rect.right, rect.bottom),
      point(rect.right, rect.top)
    ]

  return buildPolygonPath(points)
}

function buildPolygonPath(points: Array<{ x: number; y: number }>): string {
  const pathData: Array<string | number> = ["M", points[0].x, points[0].y]

  for (let index = 1; index < points.length; index++) {
    pathData.push("L", points[index].x, points[index].y)
  }

  pathData.push("Z")

  return pathData.join(" ")
}

function getNearestCardinalSide(theta: number): CardinalSide {
  const normalizedTheta = normalizeAngle(theta)
  const quadrantIndex = Math.round(normalizedTheta / (Math.PI / 2)) % 4

  switch (quadrantIndex) {
    case 1:
      return "bottom"
    case 2:
      return "left"
    case 3:
      return "top"
    case 0:
    default:
      return "right"
  }
}

function resolveVerticalAnchor(side: CardinalSide): VerticalAnchor {
  const mapping: Record<CardinalSide, VerticalAnchor> = {
    right: "top",
    bottom: "bottom",
    left: "bottom",
    top: "top"
  }

  return mapping[side]
}

function resolveHorizontalAnchor(side: CardinalSide): HorizontalAnchor {
  const mapping: Record<CardinalSide, HorizontalAnchor> = {
    right: "right",
    bottom: "right",
    left: "left",
    top: "left"
  }

  return mapping[side]
}

function normalizeAngle(theta: number): number {
  const fullTurn = Math.PI * 2

  return ((theta % fullTurn) + fullTurn) % fullTurn
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}

function point(x: number, y: number) {
  return { x, y }
}
