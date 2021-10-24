import { IPoint, ICircularSector, ICircularSectorParameters } from "./Interfaces"

/**
 * @description Area of circle given radius.
 * @param radius 
 * @returns Area of circle
 */
export function areaOfCircle(radius: number): number {
  // yay
  return radius ** 2 * Math.PI
}

/**
 * @description Circumfence of circle given radius
 * @param radius 
 * @returns Circumfence of circle
 */
export function circumfenceOfCircle(radius: number): number {
  // yay
  return 2 * Math.PI * radius
}

/**
 * @description Area of sector given ratio
 * @param ratio 
 * @param radius 
 * @returns Area of sector
 */
export function areaOfSector(ratio: number, radius: number): number { 
  // yay
  return ratio * areaOfCircle(radius)
}

/**
 * Mid point given start and end point
 * @param start 
 * @param end 
 * @returns Mid point
 */
export function midPoint(start: IPoint, end: IPoint): IPoint {
  // yay
  return { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }
}

/**
 * @description Distance between points given startpoinbt and end point
 * @param start 
 * @param end 
 * @returns Distance between points
 */
export function distanceBetweenPoints(start: IPoint, end: IPoint): number {
  // yay
  return Math.sqrt((Math.pow(end.x - start.x, 2)) + (Math.pow(end.y - start.y, 2)))
}

/**
 * @description Length of sector in radians given ratio
 * @param ratio 
 * @returns Length of sector
 */
export function lengthOfSectorInRadians(ratio: number): number { 
  // yay
  return ratio * (2 * Math.PI) 
}

/**
 * @description Cartesian point given polar coordinates
 * @param center 
 * @param radius 
 * @param angle 
 * @returns Point
 */
export function point(center: IPoint, radius: number, angle: number): IPoint {
  // yay
  return { 
    x: center.x + radius * Math.cos(angle), 
    y: center.y + radius * Math.sin(angle) 
  }
}

/**
 * @description Arc points given center, radius, start angle and end angle
 * @param center 
 * @param radius 
 * @param startAngle 
 * @param endAngle 
 * @returns Start point, mid point and end point
 */
export function arcPoints(center: IPoint, radius: number, startAngle: number, endAngle: number): [IPoint, IPoint, IPoint] {    
  // yay
  return [    
    point(center, radius, endAngle), 
    point(center, radius, startAngle + ((endAngle - startAngle) / 2)), 
    point(center, radius, startAngle)]
}

/**
 * @description Height of triangle with two equal sides given base length and side length
 * @param base 
 * @param side 
 * @returns Height of triangle
 */
export function heightOfIsoscelesTriangle(base: number, side: number): number {
  const half = (base + side + side) / 2
  const area = Math.sqrt(half * (half - base) * (half - side) * (half - side))
  // yay
  return 2 * area / base
}    

/**
 * @description End point of line given polar instructions 
 * @param start 
 * @param angle 
 * @param lenght 
 * @param largeAngle 
 * @returns End point
 */
export function endPointOfLine(start: IPoint, angle: number, lenght: number, largeAngle: boolean = false): IPoint {   
  // yay
  return largeAngle  
    ? { x: start.x + (Math.cos(angle ) * lenght), y: start.y + (Math.sin(angle ) * lenght) }
    : { x: start.x - (Math.cos(angle ) * lenght), y: start.y - (Math.sin(angle ) * lenght) }
}

/**
 * @description Start angle, mid angle and end angle of sector given ratio and start angle
 * @param ratio 
 * @param theta 
 * @returns Start angle, mid angle and end angle
 */
export function anglesOfSector(ratio: number, theta: number) {
  // angle covered
  const delta = ratio * (2 * Math.PI)
  // yay
  return { 
    start: theta, 
    mid: theta + delta / 2, 
    end:  theta + delta 
  }
}

/**
 * @description Creates a circular sector
 * @param input 
 * @returns Circular sector
 */
export function createCircularSector(input: ICircularSectorParameters): ICircularSector { 

  // define sector
  const sector: ICircularSector = {
    source: input,    
    ratio: input.ratio,
    radius: input.radius,
    center: input.center,
    angles: anglesOfSector(input.ratio, input.theta),
    anchors: undefined
  }

  // compute anchor points
  const [outerStartPoint, outerMidPoint, outerEndPoint] = arcPoints(
    sector.center, 
    sector.radius, 
    sector.angles.start, 
    sector.angles.end, 
  )

  // compute middle points
  const [middleStartPoint, middleMidPoint, middleEndPoint] = arcPoints(
    sector.center, 
    sector.radius / 2, 
    sector.angles.start, 
    sector.angles.end, 
  )

  // compute inner points
  const [innerStartPoint, innerMidPoint, innerEndPoint] = [
    sector.center, 
    sector.center, 
    sector.center
  ]

  // set anchors
  sector.anchors = { 
    outer: { start: outerStartPoint, mid: outerMidPoint, end: outerEndPoint },
    middle: { start: middleStartPoint, mid: middleMidPoint, end: middleEndPoint },
    inner: { start: innerStartPoint, mid: innerMidPoint, end: innerEndPoint }
  }

  // yay
  return sector

}

/**
 * @description Create margin on a circular sector
 * @param sector 
 * @param margin 
 * @returns Circular sector with margin
 */
export function createCircularSectorMargin(sector: ICircularSector, margin: number): ICircularSector {

  // guard
  // todo: would be cool to have negative margins
  if(margin <= 0) return sector
  
  // get margin in radians 
  const marginInRadians =  (margin / circumfenceOfCircle(sector.radius)) * (2 * Math.PI) 

  // compute scaled arc start and end points
  const [innerStartPoint, innerMidPoint, innerEndPoint] = arcPoints(
    sector.center, 
    sector.radius, 
    sector.angles.start + marginInRadians / 2, 
    sector.angles.end - marginInRadians / 2, 
  )

  // base line(chord) length
  const baseLineLength = distanceBetweenPoints(
    sector.anchors.outer.start, 
    sector.anchors.outer.end)
  
  // scaled base line (chord) length
  const baseLineScaledLength = distanceBetweenPoints(
    innerStartPoint, 
    innerEndPoint)

  // scaled base line (chord) mid point
  const baseLineScaledMidPoint = midPoint(
    innerStartPoint, 
    innerEndPoint)

  // compute base lines ratio
  const baseLineRatio = baseLineScaledLength / baseLineLength

  // original side line length
  const sideLineLength = distanceBetweenPoints(
    sector.anchors.outer.end, 
    sector.center)

  // compute scaled side line length
  const sideLineScaledLength = (baseLineRatio *  sideLineLength)

  // compute height of scaled
  const heightScaled = heightOfIsoscelesTriangle(
    baseLineScaledLength, 
    sideLineScaledLength)

  // compute scaled end point
  const joinPoint = endPointOfLine(
    baseLineScaledMidPoint, 
    sector.angles.mid, 
    heightScaled, 
    lengthOfSectorInRadians(sector.ratio) > Math.PI)

  // compute scaled radius
  const radiusScaled = distanceBetweenPoints(
    joinPoint, 
    sector.anchors.outer.mid)
      
  // create result
  const result: ICircularSector = { ...sector }
  
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
  const [middleStartPoint, middleMidPoint, middleEndPoint] = arcPoints(
    result.center, 
    result.radius / 2, 
    sector.angles.start, 
    sector.angles.end, 
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

  // yay
  return result

}

/**
 * @description Creates an annulus sector from a circular sector
 * @param sector 
 * @param margin 
 * @param height 
 * @returns Annulus sector
 */
export function createAnnulusSector(sector: ICircularSector, margin: number, height: number): ICircularSector {
  
  // when height is zero or radius is less than or equal to height
  if(height === 0 || sector.radius <= height) return sector 

  // create annulus sector
  const annulusSector = createCircularSector({...sector.source, radius: sector.source.radius - height})

  // create annulus sector with margin
  const annulusSectorWithMargin = createCircularSectorMargin(annulusSector, margin)  

  // create annulus sector for mid descriptor
  const annulusSectorMid = createCircularSector({...sector.source, radius: sector.source.radius - height / 2})

  // create annulus sector for mid descriptor with margin
  const annulusSectorMidWithMargin = createCircularSectorMargin(annulusSectorMid, margin)  

  // set anchors
  annulusSectorWithMargin.anchors = { 
    ...sector.anchors,
    middle: { ... annulusSectorMidWithMargin.anchors.outer },
    inner: { 
      start: annulusSectorWithMargin.anchors.outer.start, 
      mid:  annulusSectorWithMargin.anchors.outer.mid, 
      end:  annulusSectorWithMargin.anchors.outer.end 
    }
  }

  // reset center to inner mid point
  annulusSectorWithMargin.center = annulusSectorWithMargin.anchors.inner.mid

  // yay
  return annulusSectorWithMargin

}

/**
 * @description Takes a distribution and nomalizes it to the total.
 * @param distribution 
 * @param total 
 * @returns Normalized distribution to total.
 */
export const distribute = (distribution: number[], total = 100): [number[], number] => { 
 
  // sum of all
  const sum = distribution.reduce((a, b) => a + b)

  // when sum exceed total normalize it
  if(sum > total) distribution.forEach((value, index) => distribution[index] = (value / sum) * 100)

  // yay
  return [distribution, sum]

}