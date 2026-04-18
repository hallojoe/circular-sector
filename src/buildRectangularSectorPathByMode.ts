import { ICircularSectorViewModel } from "./Interfaces"

export type RectangularSectorPathMode = "vertical" | "horizontal"

export interface IRectangularSectorPathOptions {
  mode?: RectangularSectorPathMode
  cornerRadius?: number
  size?: number
  stackIndex?: number
  stackCount?: number
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
 * - `radius` is the maximum span available for the bar chart lane.
 * - `height` is the intended usable bar span, capped by `radius`.
 * - `ratio` fills the primary value axis only.
 * - `size` controls the bar thickness:
 *   - width for `horizontal`
 *   - height for `vertical`
 * - `stackIndex` and `stackCount` place each bar inside a centered stack.
 * - `gap` separates both stacked bars and filled/remaining segments.
 */
export function buildRectangularSectorPathByMode(
  sector: ICircularSectorViewModel,
  options: IRectangularSectorPathOptions = {}
): string {
  const mode = options.mode ?? "vertical"
  const totalSpan = Math.max(0, sector.source.radius)
  const barSpan = clamp(sector.source.height > 0 ? sector.source.height : totalSpan, 0, totalSpan)
  const ratio = clamp(sector.source.ratio, 0, 1)
  const thickness = clamp(
    typeof options.size === "number" ? options.size : sector.source.height > 0 ? sector.source.height : totalSpan,
    0,
    totalSpan
  )
  const cornerRadius = clamp(options.cornerRadius ?? 0, 0, Math.min(totalSpan, barSpan) / 2)
  const stackCount = Math.max(1, Math.floor(options.stackCount ?? 1))
  const stackIndex = clamp(Math.floor(options.stackIndex ?? 0), 0, stackCount - 1)
  const stackGap = clamp(sector.source.gap, 0, totalSpan)
  const stackSpan = (stackCount * thickness) + (Math.max(0, stackCount - 1) * stackGap)

  if (mode === "horizontal") {
    return buildHorizontalBars(
      sector,
      barSpan,
      thickness,
      stackIndex,
      stackSpan,
      stackGap,
      ratio,
      cornerRadius
    )
  }

  return buildVerticalBars(
    sector,
    barSpan,
    thickness,
    stackIndex,
    stackSpan,
    stackGap,
    ratio,
    cornerRadius
  )
}

function buildHorizontalBars(
  sector: ICircularSectorViewModel,
  barSpan: number,
  thickness: number,
  stackIndex: number,
  stackSpan: number,
  stackGap: number,
  ratio: number,
  cornerRadius: number
): string {
  const stackLeft = sector.source.center.x - (stackSpan / 2)
  const left = stackLeft + (stackIndex * (thickness + stackGap))
  const right = left + thickness
  const top = sector.source.center.y - (barSpan / 2)
  const bottom = sector.source.center.y + (barSpan / 2)

  return buildBarPath(
    {
      left,
      right,
      top,
      bottom
    },
    "vertical",
    barSpan,
    ratio,
    sector.source.gap,
    cornerRadius
  )
}

function buildVerticalBars(
  sector: ICircularSectorViewModel,
  barSpan: number,
  thickness: number,
  stackIndex: number,
  stackSpan: number,
  stackGap: number,
  ratio: number,
  cornerRadius: number
): string {
  const stackTop = sector.source.center.y - (stackSpan / 2)
  const left = sector.source.center.x - (barSpan / 2)
  const right = sector.source.center.x + (barSpan / 2)
  const top = stackTop + (stackIndex * (thickness + stackGap))
  const bottom = top + thickness

  return buildBarPath(
    {
      left,
      right,
      top,
      bottom
    },
    "horizontal",
    barSpan,
    ratio,
    sector.source.gap,
    cornerRadius
  )
}

function buildBarPath(
  laneRect: IRect,
  orientation: "horizontal" | "vertical",
  barSpan: number,
  ratio: number,
  gap: number,
  cornerRadius: number
): string {
  if (barSpan <= 0 || isCollapsedRect(laneRect)) {
    return buildRoundedRectPath(laneRect, cornerRadius)
  }

  const clampedGap = clamp(gap, 0, barSpan)
  const distributableSpan = Math.max(0, barSpan - clampedGap)
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

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}
