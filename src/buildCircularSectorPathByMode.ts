import { ICircularSectorViewModel, IPoint } from "./Interfaces"
import { calculatePolarToCartesian } from "./convertPolarToCartesian"
import { createArcFacetPoints } from "./createArcFacetPoints"
import { createBeveledPolygon } from "./createBeveledPolygon"
import { createCircularSectorViewModel } from "./createCircularSectorViewModel"

export type CircularSectorPathMode =
  | "arc"
  | "rounded"
  | "angular"
  | "beveled"
  | "faceted"
  | "scalloped"
  | "stepped"
  | "burst"

export interface ICircularSectorPathOptions {
  mode?: CircularSectorPathMode
  cornerRadius?: number
  bevelSize?: number
  facetCount?: number
  scallopCount?: number
  scallopDepth?: number
  stepCount?: number
  stepInset?: number
  burstCount?: number
  burstDepth?: number
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

    case "scalloped":
      return buildScallopedSectorPath(sector, options)

    case "stepped":
      return buildSteppedSectorPath(sector, options)

    case "burst":
      return buildBurstSectorPath(sector, options)

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

  appendInnerClosure(pathData, sector, innerRadius)

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

function buildScallopedSectorPath(
  sector: ICircularSectorViewModel,
  options: ICircularSectorPathOptions
): string {
  const scallopCount = sanitizeDivisionCount(options.scallopCount ?? 6)
  const depth = clampDecorativeDepth(
    getRequestedScallopDepth(sector, options.scallopDepth),
    sector.source.radius,
    getArcSpan(sector),
    scallopCount
  )

  if (depth < 1) return buildArcSectorPath(sector)

  const boundaryAngles = createSampleAngles(sector.angles.end, sector.angles.start, scallopCount)
  const pathData: Array<string | number> = [
    "M",
    sector.anchors.outer.end.x,
    sector.anchors.outer.end.y
  ]

  for (let index = 0; index < boundaryAngles.length - 1; index++) {
    const startAngle = boundaryAngles[index]
    const endAngle = boundaryAngles[index + 1]
    const midAngle = (startAngle + endAngle) / 2
    const endPoint = calculatePolarToCartesian(sector.center, sector.source.radius, endAngle)
    const controlPoint = calculatePolarToCartesian(sector.center, sector.source.radius + depth, midAngle)

    pathData.push(
      "Q",
      controlPoint.x,
      controlPoint.y,
      endPoint.x,
      endPoint.y
    )
  }

  pathData.push(
    "L",
    sector.anchors.inner.start.x,
    sector.anchors.inner.start.y
  )

  appendInnerClosure(pathData, sector, getInnerRadius(sector))

  return pathData.join(" ")
}

function buildSteppedSectorPath(
  sector: ICircularSectorViewModel,
  options: ICircularSectorPathOptions
): string {
  const stepCount = sanitizeDivisionCount(options.stepCount ?? 5)
  const inset = clampStepInset(sector, options.stepInset, stepCount)

  if (inset < 1 && isPieSector(sector)) {
    return buildAngularSectorPath(sector)
  }

  const outerPoints = createSteppedArcPoints(
    sector.center,
    sector.angles.end,
    sector.angles.start,
    sector.source.radius,
    Math.max(0, sector.source.radius - inset),
    stepCount
  )

  if (isPieSector(sector)) {
    return buildLinearClosedPath([
      ...outerPoints,
      sector.center
    ])
  }

  const innerRadius = getInnerRadius(sector)
  const safeInnerInset = Math.min(
    inset,
    Math.max(0, (sector.source.height / 2) - 0.001),
    Math.max(0, sector.source.radius - innerRadius - 0.001)
  )

  const innerPoints = createSteppedArcPoints(
    sector.center,
    sector.angles.start,
    sector.angles.end,
    innerRadius,
    innerRadius + safeInnerInset,
    stepCount
  )

  return buildLinearClosedPath([
    ...outerPoints,
    ...innerPoints
  ])
}

function buildBurstSectorPath(
  sector: ICircularSectorViewModel,
  options: ICircularSectorPathOptions
): string {
  const burstCount = sanitizeDivisionCount(options.burstCount ?? 8)
  const depth = clampDecorativeDepth(
    getRequestedBurstDepth(sector, options.burstDepth),
    sector.source.radius,
    getArcSpan(sector),
    burstCount * 2
  )

  if (depth < 1) {
    return buildFacetedSectorPath(sector, burstCount)
  }

  const boundaryAngles = createSampleAngles(sector.angles.end, sector.angles.start, burstCount)
  const pathData: Array<string | number> = [
    "M",
    sector.anchors.outer.end.x,
    sector.anchors.outer.end.y
  ]

  for (let index = 0; index < boundaryAngles.length - 1; index++) {
    const startAngle = boundaryAngles[index]
    const endAngle = boundaryAngles[index + 1]
    const midAngle = (startAngle + endAngle) / 2
    const tipPoint = calculatePolarToCartesian(sector.center, sector.source.radius + depth, midAngle)
    const endPoint = calculatePolarToCartesian(sector.center, sector.source.radius, endAngle)

    pathData.push(
      "L",
      tipPoint.x,
      tipPoint.y,
      "L",
      endPoint.x,
      endPoint.y
    )
  }

  pathData.push(
    "L",
    sector.anchors.inner.start.x,
    sector.anchors.inner.start.y
  )

  appendInnerClosure(pathData, sector, getInnerRadius(sector))

  return pathData.join(" ")
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

function createSteppedArcPoints(
  center: IPoint,
  startAngle: number,
  endAngle: number,
  baseRadius: number,
  terraceRadius: number,
  stepCount: number
): IPoint[] {
  const sampleAngles = createSampleAngles(startAngle, endAngle, stepCount)
  const points: IPoint[] = [
    calculatePolarToCartesian(center, baseRadius, sampleAngles[0])
  ]

  for (let index = 0; index < sampleAngles.length - 1; index++) {
    const currentAngle = sampleAngles[index]
    const nextAngle = sampleAngles[index + 1]

    points.push(
      calculatePolarToCartesian(center, terraceRadius, currentAngle),
      calculatePolarToCartesian(center, terraceRadius, nextAngle),
      calculatePolarToCartesian(center, baseRadius, nextAngle)
    )
  }

  return points
}

function createSampleAngles(startAngle: number, endAngle: number, divisionCount: number): number[] {
  const safeDivisionCount = sanitizeDivisionCount(divisionCount)
  const angles: number[] = []

  for (let index = 0; index <= safeDivisionCount; index++) {
    angles.push(startAngle + ((endAngle - startAngle) * (index / safeDivisionCount)))
  }

  return angles
}

function clampStepInset(
  sector: ICircularSectorViewModel,
  requestedInset: number | undefined,
  stepCount: number
): number {
  const defaultInset = getRequestedStepInset(sector, requestedInset)
  const arcClamp = clampDecorativeDepth(defaultInset, sector.source.radius, getArcSpan(sector), stepCount)

  if (isPieSector(sector)) {
    return Math.min(arcClamp, Math.max(0, sector.source.radius - 1))
  }

  return Math.min(
    arcClamp,
    Math.max(0, (sector.source.height / 2) - 0.001)
  )
}

function clampDecorativeDepth(
  requestedDepth: number,
  radius: number,
  arcSpan: number,
  divisionCount: number
): number {
  const safeRequestedDepth = Number.isFinite(requestedDepth)
    ? Math.max(0, requestedDepth)
    : 0
  const segmentLength = radius * (arcSpan / sanitizeDivisionCount(divisionCount))

  return Math.min(
    safeRequestedDepth,
    Math.max(0, radius - 1),
    Math.max(0, segmentLength / 2)
  )
}

function getRequestedScallopDepth(sector: ICircularSectorViewModel, requestedDepth?: number): number {
  if (typeof requestedDepth === "number") return requestedDepth

  const radiusCap = sector.source.radius * 0.06

  if (isPieSector(sector)) {
    return radiusCap
  }

  return Math.min(radiusCap, Math.max(4, sector.source.height / 3))
}

function getRequestedStepInset(sector: ICircularSectorViewModel, requestedInset?: number): number {
  if (typeof requestedInset === "number") return requestedInset

  return Math.min(sector.source.radius * 0.08, Math.max(4, sector.source.height / 2))
}

function getRequestedBurstDepth(sector: ICircularSectorViewModel, requestedDepth?: number): number {
  if (typeof requestedDepth === "number") return requestedDepth

  return Math.min(sector.source.radius * 0.1, Math.max(6, sector.source.height / 2))
}

function appendInnerClosure(
  pathData: Array<string | number>,
  sector: ICircularSectorViewModel,
  innerRadius: number
) {
  if (isPieSector(sector)) {
    pathData.push(
      "L",
      sector.center.x,
      sector.center.y,
      "Z"
    )

    return
  }

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

function buildLinearClosedPath(points: IPoint[]): string {
  const pathData: Array<string | number> = ["M", points[0].x, points[0].y]

  for (let index = 1; index < points.length; index++) {
    pathData.push("L", points[index].x, points[index].y)
  }

  pathData.push("Z")

  return pathData.join(" ")
}

function sanitizeDivisionCount(count: number): number {
  return Math.max(2, Math.floor(count))
}

function getArcSpan(sector: ICircularSectorViewModel): number {
  return Math.abs(sector.angles.end - sector.angles.start)
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
