import { IAngles, IPoint } from "./Interfaces"
import { calculatePolarToCartesian } from "./convertPolarToCartesian";

/**
 * Compute the centroid of a circular sector.
 * @param sector - The circular sector containing information about its center, radius, and angles.
 * @returns The centroid point of the circular sector.
 */
export function calculateSectorCentroid(center:IPoint, angles:IAngles, radius:number): IPoint {

  // Extract start and end angles from the sector
  const startAngle = angles.start;
  const endAngle = angles.end;
  
  // Calculate the midpoint of the circular arc
  const arcMidpoint = calculatePolarToCartesian(center, radius, (startAngle + endAngle) / 2);

  // Calculate the area of the circular segment
  const sectorArea = 0.5 * radius ** 2 * (endAngle - startAngle - Math.sin(endAngle - startAngle));

  // Calculate the length of the circular arc
  const arcLength = radius * (endAngle - startAngle);

  // Calculate the distance from the circular arc midpoint to the centroid of the circular segment
  const distanceToSegmentCentroid = (4 * sectorArea) / (3 * arcLength);

  // Calculate the coordinates of the centroid of the circular segment
  const segmentCentroid = calculatePolarToCartesian(center, distanceToSegmentCentroid, (startAngle + endAngle) / 2);

  // Return the centroid point of the circular sector
  return segmentCentroid;
}


// export function calculateSectorCentroidX(sector: ISector): IPoint {
//   // Extract start and end angles from the sector
//   const startAngle = sector.angles.start;
//   const endAngle = sector.angles.end;

//   // Calculate the midpoint of the circular arc
//   const arcMidpoint = calculatePolarToCartesian(sector.center, sector.radius, (startAngle + endAngle) / 2);

//   // Calculate the area of the circular segment
//   const sectorArea = 0.5 * sector.radius ** 2 * (endAngle - startAngle - Math.sin(endAngle - startAngle));

//   // Calculate the length of the circular arc
//   const arcLength = sector.radius * (endAngle - startAngle);

//   // Calculate the distance from the circular arc midpoint to the centroid of the circular segment
//   const distanceToSegmentCentroid = (4 * sectorArea) / (3 * arcLength);

//   // Calculate the coordinates of the centroid of the circular segment
//   const segmentCentroid = calculatePolarToCartesian(sector.center, distanceToSegmentCentroid, (startAngle + endAngle) / 2);

//   // Return the centroid point of the circular sector
//   return segmentCentroid;

// }












// /**
//  * Compute the centroid of a circular sector.
//  * @param sector - The circular sector containing information about its center, radius, and angles.
//  * @returns The centroid point of the circular sector.
//  */
// export function sectorCentroid(sector: ISector): IPoint {

//   // Extract start and end angles from the sector
//   const startAngle = sector.angles.start
//   const endAngle = sector.angles.end

//   // Calculate the angular span of the sector
//   const alpha = endAngle - startAngle

//   // Calculate the coordinates of the centroid assuming the start angle is 0
//   const base = {
//     x: (2 / 3) * (sector.radius / alpha) * Math.sin(alpha),
//     y: (-2 / 3) * (sector.radius / alpha) * (Math.cos(alpha) - 1)
//   }

//   // Rotate the coordinates about (0, 0) by the start angle
//   const xCoord = base.x * Math.cos(startAngle) - base.y * Math.sin(startAngle)
//   const yCoord = base.y * Math.cos(startAngle) + base.x * Math.sin(startAngle)

//   // Translate the rotated coordinates to the actual center of the sector
//   const centroidX = sector.center.x + xCoord
//   const centroidY = sector.center.y + yCoord

//   // Return the centroid point of the circular sector
//   return { x: centroidX, y: centroidY }

// }


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
