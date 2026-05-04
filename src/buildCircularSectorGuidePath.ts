import { ICircularSectorViewModel, IPoints } from "./Interfaces"
import {
  FULL_TURN_RADIANS,
  clampArcSpanRadians,
  getArcSpanRadians,
  getEffectiveSectorRatio,
  getLargeArcFlagFromSpan
} from "./circularSectorGeometry"

export type CircularSectorGuideRing = "outer" | "middle" | "inner"

export interface ICircularSectorGuidePathOptions {
  ring?: CircularSectorGuideRing
}

/**
 * Builds an open SVG guide path for attaching text to a sector ring.
 */
export function buildCircularSectorGuidePath(
  sector: ICircularSectorViewModel,
  options: ICircularSectorGuidePathOptions = {}
): string {
  const ring = options.ring ?? "middle"
  const anchors = getRingAnchors(sector, ring)
  const radius = getRingRadius(sector, ring)
  const arcSpan = getRingArcSpan(sector, ring, radius)

  if (radius <= 0) {
    return ["M", anchors.mid.x, anchors.mid.y].join(" ")
  }

  return [
    "M",
    anchors.end.x,
    anchors.end.y,
    "A",
    radius,
    radius,
    getLargeArcFlagFromSpan(arcSpan),
    anchors.start.x,
    anchors.start.y
  ].join(" ")
}

function getRingAnchors(sector: ICircularSectorViewModel, ring: CircularSectorGuideRing): IPoints {
  switch (ring) {
    case "outer":
      return sector.anchors.outer

    case "inner":
      return sector.anchors.inner

    case "middle":
    default:
      return sector.anchors.middle
  }
}

function getRingRadius(sector: ICircularSectorViewModel, ring: CircularSectorGuideRing): number {
  switch (ring) {
    case "outer":
      return sector.source.radius

    case "inner":
      return isPieSector(sector)
        ? 0
        : Math.max(0, sector.source.radius - sector.source.height)

    case "middle":
    default:
      return sector.source.height > 0
        ? sector.source.radius - (sector.source.height / 2)
        : sector.source.radius / 2
  }
}

function getRingArcSpan(
  sector: ICircularSectorViewModel,
  ring: CircularSectorGuideRing,
  radius: number
): number {
  if (radius <= 0) return 0
  if (ring === "outer") return getArcSpanRadians(sector)
  if (!sector.source.gap || sector.source.gap <= 0) return getArcSpanRadians(sector)

  return clampArcSpanRadians(
    (getEffectiveSectorRatio(sector.ratio) * FULL_TURN_RADIANS) -
    (sector.source.gap / radius)
  )
}

function isPieSector(sector: ICircularSectorViewModel): boolean {
  return sector.anchors.inner.mid === sector.anchors.inner.end
}
