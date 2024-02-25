/**
 * Calculate the area of a circle given its radius.
 * @param radius - The radius of the circle.
 * @returns The area of the circle.
 */
export function calculateCircleArea(radius: number): number {

  // Calculate the area of the circle using the formula: area = π * radius^2
  const area = radius ** 2 * Math.PI

  // Return the calculated area of the circle
  return area
}
