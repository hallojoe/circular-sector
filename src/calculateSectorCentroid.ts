import { ICircularSectorViewModel, IPoint } from "./Interfaces"

/**
 * Compute the centroid of a circular sector.
 * @param sector - The circular sector containing information about its center, radius, and angles.
 * @returns The centroid point of the circular sector.
 */
export function calculateSectorCentroid(sector: ICircularSectorViewModel): IPoint {

  // If sector is annular the return middle mid pint
  if(sector.source.height > 0) return sector.anchors.middle.mid

  // Extract start and end angles from the sector
  const startAngle = sector.angles.start
  const endAngle = sector.angles.end

  // Calculate the angular span of the sector
  const alpha = endAngle - startAngle

  // Calculate the coordinates of the centroid assuming the start angle is 0
  const base = {
    x: (2 / 3) * (sector.radius / alpha) * Math.sin(alpha),
    y: (-2 / 3) * (sector.radius / alpha) * (Math.cos(alpha) - 1)
  }

  // Rotate the coordinates about (0, 0) by the start angle
  const xCoord = base.x * Math.cos(startAngle) - base.y * Math.sin(startAngle)
  const yCoord = base.y * Math.cos(startAngle) + base.x * Math.sin(startAngle)

  // Translate the rotated coordinates to the actual center of the sector
  const centroidX = sector.center.x + xCoord
  const centroidY = sector.center.y + yCoord

  // Return the centroid point of the circular sector
  return { x: centroidX, y: centroidY }

}

// /**
//  *
//  * @param sector @description Compute centroid of circular sector.
//  * @returns Centroid point.
//  */

// export function centroidOfSector(sector: ISector): IPoint {

//   const startAngle = sector.angles.start
//   const endAngle = sector.angles.end

//   const alpha = endAngle - startAngle

//   // get coordinates of centroid if start angle is 0
//   const base = {
//     x: (2 / 3) * (sector.radius / alpha) * Math.sin(alpha),
//     y: (-2 / 3) * (sector.radius / alpha) * (Math.cos(alpha) - 1)
//   }
//   // rotate coordinates about (0, 0) by start angle
//   const xCoord = base.x * Math.cos(startAngle) - base.y * Math.sin(startAngle)
//   const yCoord = base.y * Math.cos(startAngle) + base.x * Math.sin(startAngle)

//   return { x: sector.center.x + xCoord, y: sector.center.y + yCoord }
// }
