import { ICircularSectorSettings, ICircularSectorViewModel } from "./Interfaces"
import { calculateArcPoints } from "./calculateArcPoints"
import { calculateCircleCircumference } from "./calculateCircleCircumference"
import { calculateDistanceBetweenPoints } from "./calculateDistanceBetweenPoints"
import { calculateEndPointOfLine } from "./calculateEndPointOfLine"
import { calculateIsoscelesTriangleHeight } from "./calculateIsoscelesTriangleHeight"
import { calculateMidpoint } from "./calculateMidpoint"
import { calculateSectorAngles } from "./calculateSectorAngles"
import { calculateSectorCentroid } from "./calculateSectorCentroid"
import { calculateSectorLengthInRadians } from "./calculateSectorLengthInRadians"

export function createCircularSectorViewModel(input: ICircularSectorSettings): ICircularSectorViewModel {
  
  // When no height is set or height exceed radius then return input
  if(!input?.height || input.radius <= input.height) return createCircularSectorGap(input) 

  // Create outer sector where outer point serve inner points for result annular sector.
  const outerSector = createCircularSectorGap(input)

  // Create mid sector where outer point serve mid points for result annular sector.
  const midSector = createCircularSectorGap({
    ...input, 
    radius: input.radius - (input.height / 2) 
  })

  // Create inner sector where outer point serve inner points for result annular sector.
  const innerSector = createCircularSectorGap({
    ...input, 
    radius: (input.radius - input.height) 
  })

  // Create annulus sector
  let annularSector = {
    ...outerSector,
    anchors: {
      ...outerSector.anchors,
      middle: { ...midSector.anchors.outer },
      inner: { ...innerSector.anchors.outer }
    }
  }

  // If sector radius is less than height then set inner points to outer sector inner points
  if(annularSector.radius < annularSector.source.height) {
    annularSector.anchors.inner = outerSector.anchors.inner    
  }

  const outerChordMidPoint = calculateMidpoint(outerSector.anchors.outer.start, outerSector.anchors.outer.end)
  const middleChordMidPoint = calculateMidpoint(midSector.anchors.outer.start, midSector.anchors.outer.end)
  const innerChordMidPoint = calculateMidpoint(innerSector.anchors.outer.start, innerSector.anchors.outer.end)

  const outerSagittaMidPoint = calculateMidpoint(outerSector.anchors.outer.mid, outerChordMidPoint)
  const middleSagittaMidPoint = calculateMidpoint(midSector.anchors.outer.mid, middleChordMidPoint)
  const innerSagittaMidPoint = calculateMidpoint(innerSector.anchors.outer.mid, innerChordMidPoint)

  annularSector = {
    ... annularSector,
    chords: {
      outer: {
        start:outerSector.anchors.outer.start,
        end: outerSector.anchors.outer.end,
        mid: outerChordMidPoint
      },
      middle: {
        start:midSector.anchors.outer.start,
        end: midSector.anchors.outer.end,
        mid: middleChordMidPoint
      },
      inner: {
        start:innerSector.anchors.outer.start,
        end: innerSector.anchors.outer.end,
        mid: innerChordMidPoint
      }
    },
    sagittas: {
      outer: {
        start:outerSector.anchors.outer.mid,
        end: outerChordMidPoint,
        mid: outerSagittaMidPoint
      },
      middle: {
        start:midSector.anchors.outer.mid,
        end: middleChordMidPoint,
        mid: middleSagittaMidPoint
      },
      inner: {
        start:innerSector.anchors.outer.mid,
        end: innerChordMidPoint,
        mid: innerSagittaMidPoint
      }
    }        
  }

  return annularSector

}


function createCircularSectorBase(input: ICircularSectorSettings): ICircularSectorViewModel {

  // Begin create sector
  const sector = {
    source: input,
    ratio: input.ratio,
    radius: input.radius,
    center: input.center,
    angles: calculateSectorAngles(input.ratio, input.theta),
  }

  // Compute anchor points
  const [outerStartPoint, outerMidPoint, outerEndPoint] = calculateArcPoints(
    sector.center,
    sector.radius,
    sector.angles.start,
    sector.angles.end
  )

  // Compute middle points
  const [middleStartPoint, middleMidPoint, middleEndPoint] = calculateArcPoints(
    sector.center,
    sector.radius / 2,
    sector.angles.start,
    sector.angles.end
  )

  // Compute inner points
  const [innerStartPoint, innerMidPoint, innerEndPoint] = [
    sector.center,
    sector.center,
    sector.center
  ]

  const outerChordMidPoint = calculateMidpoint(outerStartPoint, outerEndPoint)
  const middleChordMidPoint = calculateMidpoint(middleStartPoint, middleEndPoint)
  const innerChordMidPoint = calculateMidpoint(innerStartPoint, innerEndPoint)

  const outerSagittaMidPoint = calculateMidpoint(outerMidPoint, outerChordMidPoint)
  const middleSagittaMidPoint = calculateMidpoint(middleMidPoint, middleChordMidPoint)
  const innerSagittaMidPoint = calculateMidpoint(innerMidPoint, innerChordMidPoint)

  // Create result
  let result = {
    ...sector,
    anchors: {
      outer: { start: outerStartPoint, mid: outerMidPoint, end: outerEndPoint },
      middle: { start: middleStartPoint, mid: middleMidPoint, end: middleEndPoint },
      inner: { start: innerStartPoint, mid: innerMidPoint, end: innerEndPoint }
    },
    chords: {
      outer: {
        start:outerStartPoint,
        end: outerEndPoint,
        mid: outerChordMidPoint
      },
      middle: {
        start:middleStartPoint,
        end: middleEndPoint,
        mid: middleChordMidPoint
      },
      inner: {
        start:innerStartPoint,
        end: innerEndPoint,
        mid: innerChordMidPoint
      }
    },
    sagittas: {
      outer: {
        start:outerMidPoint,
        end: outerChordMidPoint,
        mid: outerSagittaMidPoint
      },
      middle: {
        start:middleMidPoint,
        end: middleChordMidPoint,
        mid: middleSagittaMidPoint
      },
      inner: {
        start:innerMidPoint,
        end: innerChordMidPoint,
        mid: innerSagittaMidPoint
      }
    },
    centroid: { x: 0, y: 0}
  }

  return result
}

function createCircularSectorGap(input: ICircularSectorSettings): ICircularSectorViewModel {

  // Create sector base
  const sector = createCircularSectorBase(input)

  // Guard gap
  if (!sector.source.gap || sector.source.gap <= 0) return sector

  // Get margin in radians 
  const marginInRadians = (sector.source.gap / calculateCircleCircumference(sector.radius)) * (2 * Math.PI)

  // Compute scaled arc start and end points
  const [innerStartPoint, innerMidPoint, innerEndPoint] = calculateArcPoints(
    sector.center,
    sector.radius,
    sector.angles.start + marginInRadians / 2,
    sector.angles.end - marginInRadians / 2
  )

  // Base line(chord) length
  const baseLineLength = calculateDistanceBetweenPoints(
    sector.anchors.outer.start,
    sector.anchors.outer.end)

  // Scaled base line (chord) length
  const baseLineScaledLength = calculateDistanceBetweenPoints(
    innerStartPoint,
    innerEndPoint)

  // Scaled base line (chord) mid point
  const baseLineScaledMidPoint = calculateMidpoint(
    innerStartPoint,
    innerEndPoint)

  // compute base lines ratio
  const baseLineRatio = baseLineScaledLength / baseLineLength

  // original side line length
  const sideLineLength = calculateDistanceBetweenPoints(
    sector.anchors.outer.end,
    sector.center)

  // compute scaled side line length
  const sideLineScaledLength = (baseLineRatio * sideLineLength)

  // compute height of scaled
  const heightScaled = calculateIsoscelesTriangleHeight(
    baseLineScaledLength,
    sideLineScaledLength)

  // compute scaled end point
  const joinPoint = calculateEndPointOfLine(
    baseLineScaledMidPoint,
    sector.angles.mid,
    heightScaled,
    calculateSectorLengthInRadians(sector.ratio) > Math.PI)

  // compute scaled radius
  const radiusScaled = calculateDistanceBetweenPoints(
    joinPoint,
    sector.anchors.outer.mid)

  // create result
  const result: ICircularSectorViewModel = { ...sector }

  // set new center point
  result.center = joinPoint

  // set new radius
  result.radius = radiusScaled

  // set new angles 
  result.angles = {
    start: sector.angles.start + (marginInRadians / 2),
    mid: sector.angles.mid,
    end: sector.angles.end - (marginInRadians / 2),
  }

  // compute new middle anchor points
  const [middleStartPoint, middleMidPoint, middleEndPoint] = calculateArcPoints(
    result.center,
    result.radius / 2,
    sector.angles.start,
    sector.angles.end
  )

  
  // set new anchor points
  result.anchors = {
    ...sector.anchors,
    outer: {
      start: innerStartPoint,
      mid: innerMidPoint,
      end: innerEndPoint
    },
    middle: {
      start: middleStartPoint,
      mid: middleMidPoint,
      end: middleEndPoint
    },
    inner: {
      start: result.center,
      mid: result.center,
      end: result.center
    }
  }

  const outerChordMidPoint = calculateMidpoint(result.anchors.outer.start, result.anchors.outer.end)
  const middleChordMidPoint = calculateMidpoint(result.anchors.middle.start, result.anchors.middle.end)
  const innerChordMidPoint = calculateMidpoint(result.anchors.inner.start, result.anchors.inner.end)

  const outerSagittaMidPoint = calculateMidpoint(result.anchors.outer.mid, outerChordMidPoint)
  const middleSagittaMidPoint = calculateMidpoint(result.anchors.middle.mid, middleChordMidPoint)
  const innerSagittaMidPoint = calculateMidpoint(result.anchors.inner.mid, innerChordMidPoint)

  result.chords = {
    outer: {
      start: result.anchors.outer.start,
      mid: outerChordMidPoint,
      end: result.anchors.outer.end
    },
    middle: {
      start: result.anchors.middle.start,
      mid: middleChordMidPoint,
      end: result.anchors.middle.end
    },
    inner: {
      start: result.anchors.inner.start,
      mid: innerChordMidPoint,
      end: result.anchors.inner.end
    }
  }

  result.sagittas = {
    outer: {
      start: result.anchors.outer.mid,
      mid: outerSagittaMidPoint,
      end: outerChordMidPoint
    },
    middle: {
      start: result.anchors.middle.mid,
      mid: middleSagittaMidPoint,
      end: middleChordMidPoint
    },
    inner: {
      start: result.anchors.inner.mid,
      mid: innerSagittaMidPoint,
      end: innerChordMidPoint
    }
  }

  return result
}

