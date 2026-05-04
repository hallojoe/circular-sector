import { ICircularSectorViewModel } from "./Interfaces"
import { createCircularSectorViewModel } from "./createCircularSectorViewModel"
import {
  getArcSpanRadians,
  getLargeArcFlagFromSpan
} from "./circularSectorGeometry"

/**
 * Builds an SVG path for a circular or annular sector.
 * Pass a positive `pathRadius` to round the corners with quadratic and cubic segments.
 */
export function buildCircularSectorPath(sector: ICircularSectorViewModel, pathRadius: number = 0): string {
  if (pathRadius > 0) return buildCircularSectorPathWithRadius(sector, pathRadius)

  const largeArcFlag = getLargeArcFlagFromSpan(getArcSpanRadians(sector))

  const pathData = [
    "M",
    sector.anchors.outer.end.x,
    sector.anchors.outer.end.y,
    "A",
    sector.source.radius,
    sector.source.radius,
    largeArcFlag,
    sector.anchors.outer.start.x,
    sector.anchors.outer.start.y,
    "L",
    sector.anchors.inner.start.x,
    sector.anchors.inner.start.y
  ]

  // Non-annular sectors close back to the center point.
  if (sector.anchors.inner.mid === sector.anchors.inner.end) {
    pathData.push(
      "L",
      sector.anchors.inner.mid.x,
      sector.anchors.inner.mid.y,
      "Z"
    )
  }
  // Annular sectors return along the inner arc before closing.
  else {
    pathData.push(
      "L",
      sector.anchors.inner.start.x,
      sector.anchors.inner.start.y,
      "A",
      sector.source.radius - sector.source.height!,
      sector.source.radius - sector.source.height!,
      getLargeArcFlagFromSpan(getArcSpanRadians(sector), true),
      sector.anchors.inner.end.x,
      sector.anchors.inner.end.y,
      "Z"
    )
  }

  return pathData.join(" ")
}

function buildCircularSectorPathWithRadius(sector: ICircularSectorViewModel, pathRadius: number = 0): string {
  if (pathRadius < 1) return buildCircularSectorPath(sector)

  // Shrink the sector to create room for the rounded corners.
  const sectorShort: ICircularSectorViewModel = createCircularSectorViewModel({
    ...sector.source,
    radius: sector.source.radius - pathRadius,
    height: sector.source.height - (pathRadius * 2)
  })

  // Narrow the sector to find the arc endpoints after rounding.
  const sectorNarrow = createCircularSectorViewModel({
    ...sector.source,
    gap: sector.source.gap + (pathRadius * 2)
  })

  const largeArcFlag = getLargeArcFlagFromSpan(getArcSpanRadians(sectorNarrow))

  const pathData = [
    "M",
    sectorShort.anchors.outer.end.x,
    sectorShort.anchors.outer.end.y,

    "Q",
    sector.anchors.outer.end.x,
    sector.anchors.outer.end.y,
    sectorNarrow.anchors.outer.end.x,
    sectorNarrow.anchors.outer.end.y,

    "A",
    sectorNarrow.source.radius,
    sectorNarrow.source.radius,
    largeArcFlag,
    sectorNarrow.anchors.outer.start.x,
    sectorNarrow.anchors.outer.start.y,

    "Q",
    sector.anchors.outer.start.x,
    sector.anchors.outer.start.y,
    sectorShort.anchors.outer.start.x,
    sectorShort.anchors.outer.start.y,

    "L",
    sectorShort.anchors.inner.start.x,
    sectorShort.anchors.inner.start.y,
  ]

  // Non-annular sectors use a cubic curve back to the shrunken center edge.
  if (sectorNarrow.anchors.inner.mid === sectorNarrow.anchors.inner.end) {
    pathData.push(
      "C",
      sector.anchors.inner.start.x,
      sector.anchors.inner.start.y,
      sector.anchors.inner.end.x,
      sector.anchors.inner.end.y,
      sectorShort.anchors.inner.end.x,
      sectorShort.anchors.inner.end.y
    )
  }
  // Annular sectors round into the inner arc and then follow it back out.
  else {
    pathData.push(
      "Q",
      sector.anchors.inner.start.x,
      sector.anchors.inner.start.y,
      sectorNarrow.anchors.inner.start.x,
      sectorNarrow.anchors.inner.start.y,
      "A",
      sectorNarrow.source.radius - sector.source.height,
      sectorNarrow.source.radius - sector.source.height,
      getLargeArcFlagFromSpan(getArcSpanRadians(sectorNarrow), true),
      sectorNarrow.anchors.inner.end.x,
      sectorNarrow.anchors.inner.end.y,
      "Q",
      sector.anchors.inner.end.x,
      sector.anchors.inner.end.y,
      sectorShort.anchors.inner.end.x,
      sectorShort.anchors.inner.end.y
    )
  }

  pathData.push(
    "L",
    sectorShort.anchors.outer.end.x,
    sectorShort.anchors.outer.end.y,
    "Z"
  )

  return pathData.join(" ")
}

