/**
 * Calculate the circumference of a circle given its radius.
 * @param radius - The radius of the circle.
 * @returns The circumference of the circle.
 */
export function calculateCircleCircumference(radius: number): number {

  // Calculate the circumference of the circle using the formula: circumference = 2 * π * radius
  const circumference = 2 * Math.PI * radius

  // Return the calculated circumference of the circle
  return circumference
}
