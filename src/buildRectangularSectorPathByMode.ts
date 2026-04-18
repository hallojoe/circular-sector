import { ICircularSectorViewModel } from "./Interfaces"

export type RectangularSectorPathMode = "vertical" | "horizontal"

export interface IRectangularSectorPathOptions {
  mode?: RectangularSectorPathMode
  cornerRadius?: number
}

interface IRect {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * Builds an SVG path for a rectangular bar-chart interpretation of the circular sector view model.
 *
 * Interpretation:
 * - `radius` is the total span available for the bar chart lane and the bar value length.
 * - `height` is the bar thickness when positive; otherwise the full span is used.
 * - `ratio` fills the primary value axis only.
 * - `theta` determines the bar's position along the chart lane, not its growth direction.
 * - `gap` separates the filled and remaining bar segments when both are present.
 */
export function buildRectangularSectorPathByMode(
  sector: ICircularSectorViewModel,
  options: IRectangularSectorPathOptions = {}
): string {
  const mode = options.mode ?? "vertical"
  const totalSpan = Math.max(0, sector.source.radius)
  const ratio = clamp(sector.source.ratio, 0, 1)
  const thickness = clamp(
    sector.source.height > 0 ? sector.source.height : totalSpan,
    0,
    totalSpan
  )
  const cornerRadius = clamp(options.cornerRadius ?? 0, 0, totalSpan / 2)
  const laneProgress = getLaneProgress(sector.source.theta)
  const laneOffset = (totalSpan - thickness) * laneProgress

  if (mode === "horizontal") {
    return buildHorizontalBars(
      sector,
      totalSpan,
      thickness,
      laneOffset,
      ratio,
      cornerRadius
    )
  }

  return buildVerticalBars(
    sector,
    totalSpan,
    thickness,
    laneOffset,
    ratio,
    cornerRadius
  )
}

function buildHorizontalBars(
  sector: ICircularSectorViewModel,
  totalSpan: number,
  thickness: number,
  laneOffset: number,
  ratio: number,
  cornerRadius: number
): string {
  const left = sector.source.center.x - (totalSpan / 2) + laneOffset
  const right = left + thickness
  const top = sector.source.center.y - (totalSpan / 2)
  const bottom = sector.source.center.y + (totalSpan / 2)

  return buildBarPath(
    {
      left,
      right,
      top,
      bottom
    },
    "vertical",
    totalSpan,
    thickness,
    ratio,
    sector.source.gap,
    cornerRadius
  )
}

function buildVerticalBars(
  sector: ICircularSectorViewModel,
  totalSpan: number,
  thickness: number,
  laneOffset: number,
  ratio: number,
  cornerRadius: number
): string {
  const left = sector.source.center.x - (totalSpan / 2)
  const right = sector.source.center.x + (totalSpan / 2)
  const top = sector.source.center.y - (totalSpan / 2) + laneOffset
  const bottom = top + thickness

  return buildBarPath(
    {
      left,
      right,
      top,
      bottom
    },
    "horizontal",
    totalSpan,
    thickness,
    ratio,
    sector.source.gap,
    cornerRadius
  )
}

function buildBarPath(
  laneRect: IRect,
  orientation: "horizontal" | "vertical",
  totalSpan: number,
  thickness: number,
  ratio: number,
  gap: number,
  cornerRadius: number
): string {
  if (totalSpan <= 0 || isCollapsedRect(laneRect)) {
    return buildRoundedRectPath(laneRect, cornerRadius)
  }

  if (totalSpan <= thickness) {
    return buildRoundedRectPath(laneRect, cornerRadius)
  }

  const usableSpan = Math.max(0, totalSpan - thickness)
  const clampedGap = clamp(gap, 0, usableSpan)
  const distributableSpan = Math.max(0, usableSpan - clampedGap)
  const filledSpan = clamp(distributableSpan * ratio, 0, distributableSpan)
  const remainingSpan = Math.max(0, distributableSpan - filledSpan)

  if (remainingSpan <= 0.0001) {
    return buildRoundedRectPath(laneRect, cornerRadius)
  }

  const filledRect = orientation === "horizontal"
    ? {
      left: laneRect.left,
      top: laneRect.top,
      right: laneRect.left + filledSpan,
      bottom: laneRect.bottom
    }
    : {
      left: laneRect.left,
      top: laneRect.top,
      right: laneRect.right,
      bottom: laneRect.top + filledSpan
    }

  const remainingRect = orientation === "horizontal"
    ? {
      left: filledRect.right + clampedGap,
      top: laneRect.top,
      right: filledRect.right + clampedGap + remainingSpan,
      bottom: laneRect.bottom
    }
    : {
      left: laneRect.left,
      top: filledRect.bottom + clampedGap,
      right: laneRect.right,
      bottom: filledRect.bottom + clampedGap + remainingSpan
    }

  return [
    buildRoundedRectPath(filledRect, cornerRadius),
    buildRoundedRectPath(remainingRect, cornerRadius)
  ].join(" ")
}

function buildRoundedRectPath(rect: IRect, requestedRadius: number): string {
  if (isCollapsedRect(rect)) {
    return buildRectPath(rect)
  }

  const width = Math.max(0, rect.right - rect.left)
  const height = Math.max(0, rect.bottom - rect.top)
  const radius = clamp(requestedRadius, 0, Math.min(width, height) / 2)

  if (radius <= 0) {
    return buildRectPath(rect)
  }

  const pathData: Array<string | number> = [
    "M", rect.left + radius, rect.top,
    "L", rect.right - radius, rect.top,
    "A", radius, radius, 0, 0, 1, rect.right, rect.top + radius,
    "L", rect.right, rect.bottom - radius,
    "A", radius, radius, 0, 0, 1, rect.right - radius, rect.bottom,
    "L", rect.left + radius, rect.bottom,
    "A", radius, radius, 0, 0, 1, rect.left, rect.bottom - radius,
    "L", rect.left, rect.top + radius,
    "A", radius, radius, 0, 0, 1, rect.left + radius, rect.top,
    "Z"
  ]

  return pathData.join(" ")
}

function buildRectPath(rect: IRect): string {
  return [
    "M", rect.left, rect.top,
    "L", rect.right, rect.top,
    "L", rect.right, rect.bottom,
    "L", rect.left, rect.bottom,
    "Z"
  ].join(" ")
}

function isCollapsedRect(rect: IRect): boolean {
  return rect.left === rect.right || rect.top === rect.bottom
}

function getLaneProgress(theta: number): number {
  return normalizeAngle(theta + (Math.PI / 2)) / (Math.PI * 2)
}

function normalizeAngle(theta: number): number {
  const fullTurn = Math.PI * 2

  return ((theta % fullTurn) + fullTurn) % fullTurn
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}
