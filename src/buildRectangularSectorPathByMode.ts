import { ICircularSectorViewModel } from "./Interfaces"

export type RectangularSectorPathMode = "vertical" | "horizontal"
export type RectangularSectorPathLayout = "many" | "single"
export type RectangularSectorPathDirection = "top-down" | "bottom-up" | "left-right" | "right-left"

export interface IRectangularSectorPathOptions {
  mode?: RectangularSectorPathMode
  layout?: RectangularSectorPathLayout
  direction?: RectangularSectorPathDirection
  cornerRadius?: number
  size?: number
  stackIndex?: number
  stackCount?: number
  segmentIndex?: number
  segmentRatios?: number[]
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
 * - `layout` chooses either one bar per sector (`many`) or one segmented bar per layer (`single`).
 * - `direction` controls the flow of stacked bars or segmented parts.
 * - `gap` separates both stacked bars and inner segments.
 */
export function buildRectangularSectorPathByMode(
  sector: ICircularSectorViewModel,
  options: IRectangularSectorPathOptions = {}
): string {
  const mode = options.mode ?? "vertical"
  const layout = options.layout ?? "many"
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
  const direction = sanitizeDirection(mode, options.direction)

  if (layout === "single") {
    return mode === "horizontal"
      ? buildSingleHorizontalBand(
        sector,
        barSpan,
        thickness,
        ratio,
        direction,
        options.segmentRatios ?? [ratio],
        options.segmentIndex ?? 0,
        cornerRadius
      )
      : buildSingleVerticalBand(
        sector,
        barSpan,
        thickness,
        ratio,
        direction,
        options.segmentRatios ?? [ratio],
        options.segmentIndex ?? 0,
        cornerRadius
      )
  }

  if (mode === "horizontal") {
    return buildHorizontalBars(
      sector,
      barSpan,
      thickness,
      stackIndex,
      stackSpan,
      stackGap,
      ratio,
      direction,
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
    direction,
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
  direction: RectangularSectorPathDirection,
  cornerRadius: number
): string {
  const stackLeft = sector.source.center.x - (stackSpan / 2)
  const left = stackLeft + (stackIndex * (thickness + stackGap))
  const right = left + thickness
  const top = sector.source.center.y - (barSpan / 2)
  const bottom = sector.source.center.y + (barSpan / 2)

  return buildManyBarPath(
    {
      left,
      right,
      top,
      bottom
    },
    "vertical",
    barSpan,
    ratio,
    direction,
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
  direction: RectangularSectorPathDirection,
  cornerRadius: number
): string {
  const stackTop = sector.source.center.y - (stackSpan / 2)
  const left = sector.source.center.x - (barSpan / 2)
  const right = sector.source.center.x + (barSpan / 2)
  const top = stackTop + (stackIndex * (thickness + stackGap))
  const bottom = top + thickness

  return buildManyBarPath(
    {
      left,
      right,
      top,
      bottom
    },
    "horizontal",
    barSpan,
    ratio,
    direction,
    sector.source.gap,
    cornerRadius
  )
}

function buildManyBarPath(
  laneRect: IRect,
  orientation: "horizontal" | "vertical",
  barSpan: number,
  ratio: number,
  direction: RectangularSectorPathDirection,
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

  const [filledRect, remainingRect] = orientation === "horizontal"
    ? createHorizontalSplitRects(laneRect, filledSpan, remainingSpan, clampedGap, direction === "right-left")
    : createVerticalSplitRects(laneRect, filledSpan, remainingSpan, clampedGap, direction === "bottom-up")

  return [
    buildRoundedRectPath(filledRect, cornerRadius),
    buildRoundedRectPath(remainingRect, cornerRadius)
  ].join(" ")
}

function buildSingleHorizontalBand(
  sector: ICircularSectorViewModel,
  barSpan: number,
  thickness: number,
  ratio: number,
  direction: RectangularSectorPathDirection,
  segmentRatios: number[],
  segmentIndex: number,
  cornerRadius: number
): string {
  const laneRect = {
    left: sector.source.center.x - (thickness / 2),
    right: sector.source.center.x + (thickness / 2),
    top: sector.source.center.y - (barSpan / 2),
    bottom: sector.source.center.y + (barSpan / 2)
  }

  return buildSingleSegmentPath(laneRect, "vertical", barSpan, ratio, direction, sector.source.gap, segmentRatios, segmentIndex, cornerRadius)
}

function buildSingleVerticalBand(
  sector: ICircularSectorViewModel,
  barSpan: number,
  thickness: number,
  ratio: number,
  direction: RectangularSectorPathDirection,
  segmentRatios: number[],
  segmentIndex: number,
  cornerRadius: number
): string {
  const laneRect = {
    left: sector.source.center.x - (barSpan / 2),
    right: sector.source.center.x + (barSpan / 2),
    top: sector.source.center.y - (thickness / 2),
    bottom: sector.source.center.y + (thickness / 2)
  }

  return buildSingleSegmentPath(laneRect, "horizontal", barSpan, ratio, direction, sector.source.gap, segmentRatios, segmentIndex, cornerRadius)
}

function buildSingleSegmentPath(
  laneRect: IRect,
  orientation: "horizontal" | "vertical",
  barSpan: number,
  ratio: number,
  direction: RectangularSectorPathDirection,
  gap: number,
  segmentRatios: number[],
  segmentIndex: number,
  cornerRadius: number
): string {
  if (barSpan <= 0 || isCollapsedRect(laneRect)) {
    return buildRoundedRectPath(laneRect, cornerRadius)
  }

  const safeRatios = segmentRatios.map((value) => clamp(value, 0, 1))
  const segmentCount = Math.max(1, safeRatios.length)
  const clampedIndex = clamp(Math.floor(segmentIndex), 0, segmentCount - 1)
  const clampedGap = clamp(gap, 0, barSpan)
  const distributableSpan = Math.max(0, barSpan - (Math.max(0, segmentCount - 1) * clampedGap))
  const segmentSpan = distributableSpan * clamp(ratio, 0, 1)
  const orderedRatios = shouldReverseDirection(orientation, direction)
    ? [...safeRatios].reverse()
    : safeRatios
  const orderedIndex = shouldReverseDirection(orientation, direction)
    ? segmentCount - 1 - clampedIndex
    : clampedIndex

  let offset = 0
  for (let index = 0; index < orderedIndex; index++) {
    offset += distributableSpan * orderedRatios[index]
    offset += clampedGap
  }

  const rect = orientation === "horizontal"
    ? {
      left: laneRect.left + offset,
      top: laneRect.top,
      right: laneRect.left + offset + segmentSpan,
      bottom: laneRect.bottom
    }
    : {
      left: laneRect.left,
      top: laneRect.top + offset,
      right: laneRect.right,
      bottom: laneRect.top + offset + segmentSpan
    }

  return buildRoundedRectPath(rect, cornerRadius)
}

function createHorizontalSplitRects(
  laneRect: IRect,
  filledSpan: number,
  remainingSpan: number,
  gap: number,
  reverse: boolean
): [IRect, IRect] {
  if (!reverse) {
    return [
      {
        left: laneRect.left,
        top: laneRect.top,
        right: laneRect.left + filledSpan,
        bottom: laneRect.bottom
      },
      {
        left: laneRect.left + filledSpan + gap,
        top: laneRect.top,
        right: laneRect.left + filledSpan + gap + remainingSpan,
        bottom: laneRect.bottom
      }
    ]
  }

  return [
    {
      left: laneRect.right - filledSpan,
      top: laneRect.top,
      right: laneRect.right,
      bottom: laneRect.bottom
    },
    {
      left: laneRect.right - filledSpan - gap - remainingSpan,
      top: laneRect.top,
      right: laneRect.right - filledSpan - gap,
      bottom: laneRect.bottom
    }
  ]
}

function createVerticalSplitRects(
  laneRect: IRect,
  filledSpan: number,
  remainingSpan: number,
  gap: number,
  reverse: boolean
): [IRect, IRect] {
  if (!reverse) {
    return [
      {
        left: laneRect.left,
        top: laneRect.top,
        right: laneRect.right,
        bottom: laneRect.top + filledSpan
      },
      {
        left: laneRect.left,
        top: laneRect.top + filledSpan + gap,
        right: laneRect.right,
        bottom: laneRect.top + filledSpan + gap + remainingSpan
      }
    ]
  }

  return [
    {
      left: laneRect.left,
      top: laneRect.bottom - filledSpan,
      right: laneRect.right,
      bottom: laneRect.bottom
    },
    {
      left: laneRect.left,
      top: laneRect.bottom - filledSpan - gap - remainingSpan,
      right: laneRect.right,
      bottom: laneRect.bottom - filledSpan - gap
    }
  ]
}

function shouldReverseDirection(
  orientation: "horizontal" | "vertical",
  direction: RectangularSectorPathDirection
): boolean {
  return orientation === "horizontal"
    ? direction === "right-left"
    : direction === "bottom-up"
}

function sanitizeDirection(mode: RectangularSectorPathMode, direction?: RectangularSectorPathDirection): RectangularSectorPathDirection {
  if (mode === "vertical") {
    return direction === "right-left" ? "right-left" : "left-right"
  }

  return direction === "bottom-up" ? "bottom-up" : "top-down"
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
