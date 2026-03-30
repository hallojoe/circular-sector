import { ICircularSectorSettings, ICircularSectorViewModel, IPoints } from "./Interfaces"
import { calculateArcPoints } from "./calculateArcPoints"
import { calculateAnnularSectorCentroid } from "./calculateAnnularSectorCentroid"
import { calculateCircleCircumference } from "./calculateCircleCircumference"
import { calculateDistanceBetweenPoints } from "./calculateDistanceBetweenPoints"
import { calculateEndPointOfLine } from "./calculateEndPointOfLine"
import { calculateIsoscelesTriangleHeight } from "./calculateIsoscelesTriangleHeight"
import { calculateMidpoint } from "./calculateMidpoint"
import { calculateSectorAngles } from "./calculateSectorAngles"
import { calculateSectorCentroid } from "./calculateSectorCentroid"
import { calculateSectorLengthInRadians } from "./calculateSectorLengthInRadians"

/**
 * Creates the full view model for either a circular sector or an annular circular sector.
 */
export function createCircularSectorViewModel(input: ICircularSectorSettings): ICircularSectorViewModel {
  if (!hasInnerRadius(input)) return createGappedSector(input)

  return createAnnularSector(input)
}

/**
 * Determines whether the provided settings describe a sector with an inner radius.
 */
function hasInnerRadius(input: ICircularSectorSettings): boolean {
  return !!input?.height && input.radius > input.height
}

/**
 * Builds an annular sector by composing three gapped sectors at the outer, middle, and inner radii.
 */
function createAnnularSector(input: ICircularSectorSettings): ICircularSectorViewModel {
  const { outerSector, middleSector, innerSector } = createAnnularLayers(input)

  const annularSector: ICircularSectorViewModel = {
    ...outerSector,
    anchors: {
      ...outerSector.anchors,
      middle: { ...middleSector.anchors.outer },
      inner: { ...innerSector.anchors.outer }
    }
  }

  if (annularSector.radius < annularSector.source.height) {
    annularSector.anchors.inner = outerSector.anchors.inner
  }

  annularSector.anchors.centroid = calculateAnnularSectorCentroid(
    annularSector.center,
    annularSector.angles,
    annularSector.radius,
    calculateDistanceBetweenPoints(annularSector.center, annularSector.anchors.inner.mid)
  )

  return annularSector
}

/**
 * Creates the outer, middle, and inner layer sectors used to assemble an annular sector view model.
 */
function createAnnularLayers(input: ICircularSectorSettings) {
  return {
    outerSector: createGappedSector(input),
    middleSector: createGappedSector(createRadiusVariant(input, input.radius - (input.height / 2))),
    innerSector: createGappedSector(createRadiusVariant(input, input.radius - input.height))
  }
}

/**
 * Clones the sector settings with a different radius while keeping all other inputs unchanged.
 */
function createRadiusVariant(input: ICircularSectorSettings, radius: number): ICircularSectorSettings {
  return {
    ...input,
    radius
  }
}

/**
 * Creates the base sector geometry before any gap adjustments are applied.
 */
function createSectorBase(input: ICircularSectorSettings): ICircularSectorViewModel {
  const angles = calculateSectorAngles(input.ratio, input.theta)
  const centerPointTriplet = createCenterPointTriplet(input.center)

  return {
    source: input,
    ratio: input.ratio,
    radius: input.radius,
    center: input.center,
    angles,
    anchors: {
      outer: createArcAnchorPoints(input.center, input.radius, angles.start, angles.end),
      middle: createArcAnchorPoints(input.center, input.radius / 2, angles.start, angles.end),
      inner: centerPointTriplet,
      centroid: calculateSectorCentroid(input.center, angles, input.radius)
    }
  }
}

/**
 * Applies the configured gap to a sector by trimming the outer arc and recalculating the derived geometry.
 */
function createGappedSector(input: ICircularSectorSettings): ICircularSectorViewModel {
  const sector = createSectorBase(input)

  if (!sector.source.gap || sector.source.gap <= 0) return sector

  const marginInRadians = calculateGapMarginInRadians(sector.source.gap, sector.radius)
  const trimmedOuterPoints = createArcAnchorPoints(
    sector.center,
    sector.radius,
    sector.angles.start + marginInRadians / 2,
    sector.angles.end - marginInRadians / 2
  )
  const scaledSectorGeometry = calculateScaledSectorGeometry(sector, trimmedOuterPoints)
  const scaledAngles = {
    start: sector.angles.start + (marginInRadians / 2),
    mid: sector.angles.mid,
    end: sector.angles.end - (marginInRadians / 2),
  }

  return {
    ...sector,
    center: scaledSectorGeometry.center,
    radius: scaledSectorGeometry.radius,
    angles: scaledAngles,
    anchors: {
      ...sector.anchors,
      outer: trimmedOuterPoints,
      middle: createArcAnchorPoints(
        scaledSectorGeometry.center,
        scaledSectorGeometry.radius / 2,
        sector.angles.start,
        sector.angles.end
      ),
      inner: createCenterPointTriplet(scaledSectorGeometry.center),
      centroid: calculateSectorCentroid(scaledSectorGeometry.center, scaledAngles, scaledSectorGeometry.radius)
    }
  }
}

/**
 * Creates the start, mid, and end anchor points for an arc as an `IPoints` object.
 */
function createArcAnchorPoints(center: { x: number; y: number }, radius: number, startAngle: number, endAngle: number): IPoints {
  const [start, mid, end] = calculateArcPoints(center, radius, startAngle, endAngle)

  return { start, mid, end }
}

/**
 * Creates an `IPoints` object where all three positions reference the same center point.
 */
function createCenterPointTriplet(center: { x: number; y: number }): IPoints {
  return {
    start: center,
    mid: center,
    end: center
  }
}

/**
 * Converts a linear gap distance on the arc into the corresponding angular margin in radians.
 */
function calculateGapMarginInRadians(gap: number, radius: number): number {
  return (gap / calculateCircleCircumference(radius)) * (2 * Math.PI)
}

/**
 * Recomputes the center point and radius of a sector after its outer arc has been trimmed by a gap.
 */
function calculateScaledSectorGeometry(sector: ICircularSectorViewModel, trimmedOuterPoints: IPoints) {
  const baseLineLength = calculateDistanceBetweenPoints(
    sector.anchors.outer.start,
    sector.anchors.outer.end)
  const baseLineScaledLength = calculateDistanceBetweenPoints(
    trimmedOuterPoints.start,
    trimmedOuterPoints.end)
  const baseLineScaledMidPoint = calculateMidpoint(
    trimmedOuterPoints.start,
    trimmedOuterPoints.end)
  const baseLineRatio = baseLineScaledLength / baseLineLength
  const sideLineLength = calculateDistanceBetweenPoints(
    sector.anchors.outer.end,
    sector.center)
  const sideLineScaledLength = baseLineRatio * sideLineLength
  const heightScaled = calculateIsoscelesTriangleHeight(
    baseLineScaledLength,
    sideLineScaledLength)
  const center = calculateEndPointOfLine(
    baseLineScaledMidPoint,
    sector.angles.mid,
    heightScaled,
    calculateSectorLengthInRadians(sector.ratio) > Math.PI)
  const radius = calculateDistanceBetweenPoints(
    center,
    sector.anchors.outer.mid)

  return { center, radius }
}
