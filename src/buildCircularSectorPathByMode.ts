import { ICircularSectorViewModel, IPoint } from "./Interfaces"
import { createArcFacetPoints } from "./createArcFacetPoints"
import { createBeveledPolygon } from "./createBeveledPolygon"
import { createCircularSectorViewModel } from "./createCircularSectorViewModel"

export type CircularSectorPathMode =
  | "arc"
  | "rounded"
  | "angular"
  | "beveled"
  | "faceted"

export interface ICircularSectorPathOptions {
  mode?: CircularSectorPathMode
  cornerRadius?: number
  bevelSize?: number
  facetCount?: number
}

/**
 * Builds an SVG path for a circular or annular sector using a selectable path style.
 */
export function buildCircularSectorPathByMode(
  sector: ICircularSectorViewModel,
  options: ICircularSectorPathOptions = {}
): string {
  switch (options.mode ?? "arc") {
    case "rounded":
      return buildRoundedSectorPath(sector, options.cornerRadius ?? 0)

    case "angular":
      return buildAngularSectorPath(sector)

    case "beveled":
      return buildBeveledSectorPath(sector, options.bevelSize ?? 0)

    case "faceted":
      return buildFacetedSectorPath(sector, options.facetCount ?? 6)

    case "arc":
    default:
      return buildArcSectorPath(sector)
  }
}

function buildArcSectorPath(sector: ICircularSectorViewModel): string {
  const largeArcFlag = getLargeArcFlag(sector.ratio)
  const innerRadius = getInnerRadius(sector)
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

  if (isPieSector(sector)) {
    pathData.push(
      "L",
      sector.center.x,
      sector.center.y,
      "Z"
    )
  } else {
    pathData.push(
      "A",
      innerRadius,
      innerRadius,
      getLargeArcFlag(sector.ratio, true),
      sector.anchors.inner.end.x,
      sector.anchors.inner.end.y,
      "Z"
    )
  }

  return pathData.join(" ")
}

function buildRoundedSectorPath(sector: ICircularSectorViewModel, cornerRadius: number): string {
  if (cornerRadius < 1 || sector.source.radius <= cornerRadius) {
    return buildArcSectorPath(sector)
  }

  const sectorShort = createCircularSectorViewModel({
    ...sector.source,
    radius: sector.source.radius - cornerRadius,
    height: Math.max(0, sector.source.height - (cornerRadius * 2))
  })

  const sectorNarrow = createCircularSectorViewModel({
    ...sector.source,
    gap: sector.source.gap + (cornerRadius * 2)
  })

  const largeArcFlag = getLargeArcFlag(sector.ratio)
  const innerRadius = Math.max(0, sectorNarrow.source.radius - sector.source.height)
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
    sectorShort.anchors.inner.start.y
  ]

  if (isPieSector(sectorNarrow)) {
    pathData.push(
      "C",
      sector.anchors.inner.start.x,
      sector.anchors.inner.start.y,
      sector.anchors.inner.end.x,
      sector.anchors.inner.end.y,
      sectorShort.anchors.inner.end.x,
      sectorShort.anchors.inner.end.y
    )
  } else {
    pathData.push(
      "Q",
      sector.anchors.inner.start.x,
      sector.anchors.inner.start.y,
      sectorNarrow.anchors.inner.start.x,
      sectorNarrow.anchors.inner.start.y,
      "A",
      innerRadius,
      innerRadius,
      getLargeArcFlag(sector.ratio, true),
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

function buildAngularSectorPath(sector: ICircularSectorViewModel): string {
  return buildLinearClosedPath(createAngularPolygon(sector))
}

function buildBeveledSectorPath(sector: ICircularSectorViewModel, bevelSize: number): string {
  if (bevelSize < 1) return buildAngularSectorPath(sector)

  const beveledPolygon = createBeveledPolygon(createAngularPolygon(sector), bevelSize)
  const pathData = [
    "M",
    beveledPolygon[0].exit.x,
    beveledPolygon[0].exit.y
  ]

  for (let index = 1; index < beveledPolygon.length; index++) {
    pathData.push(
      "L",
      beveledPolygon[index].entry.x,
      beveledPolygon[index].entry.y,
      "L",
      beveledPolygon[index].exit.x,
      beveledPolygon[index].exit.y
    )
  }

  pathData.push(
    "L",
    beveledPolygon[0].entry.x,
    beveledPolygon[0].entry.y,
    "Z"
  )

  return pathData.join(" ")
}

function buildFacetedSectorPath(sector: ICircularSectorViewModel, facetCount: number): string {
  const safeFacetCount = Math.max(2, Math.floor(facetCount))
  const outerPoints = createArcFacetPoints(
    sector.center,
    sector.source.radius,
    sector.angles.start,
    sector.angles.end,
    safeFacetCount
  )

  if (isPieSector(sector)) {
    return buildLinearClosedPath([
      ...outerPoints,
      sector.center
    ])
  }

  const innerPoints = createArcFacetPoints(
    sector.center,
    getInnerRadius(sector),
    sector.angles.end,
    sector.angles.start,
    safeFacetCount
  )

  return buildLinearClosedPath([
    ...outerPoints,
    ...innerPoints
  ])
}

function createAngularPolygon(sector: ICircularSectorViewModel): IPoint[] {
  const outerPoints = [
    sector.anchors.outer.end,
    sector.anchors.outer.mid,
    sector.anchors.outer.start
  ]

  if (isPieSector(sector)) {
    return [
      ...outerPoints,
      sector.center
    ]
  }

  return [
    ...outerPoints,
    sector.anchors.inner.start,
    sector.anchors.inner.mid,
    sector.anchors.inner.end
  ]
}

function buildLinearClosedPath(points: IPoint[]): string {
  const pathData: Array<string | number> = ["M", points[0].x, points[0].y]

  for (let index = 1; index < points.length; index++) {
    pathData.push("L", points[index].x, points[index].y)
  }

  pathData.push("Z")

  return pathData.join(" ")
}

function isPieSector(sector: ICircularSectorViewModel): boolean {
  return sector.anchors.inner.mid === sector.anchors.inner.end
}

function getInnerRadius(sector: ICircularSectorViewModel): number {
  return Math.max(0, sector.source.radius - sector.source.height)
}

function getLargeArcFlag(ratio: number, invert: boolean = false): string {
  const largeArcFlag = ratio * 360 > 180 ? ["0", "1", "1"] : ["0", "0", "1"]
  return invert ? [...largeArcFlag].reverse().join(" ") : largeArcFlag.join(" ")
}
