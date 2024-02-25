/**
 * Calculate the height of an isosceles triangle given its base length and side length.
 * @param base - The length of the base of the triangle.
 * @param side - The length of the equal side of the triangle.
 * @returns The height of the triangle.
 */
export function calculateIsoscelesTriangleHeight(base: number, side: number): number {

  // Calculate the semi-perimeter of the triangle
  const semiPerimeter = (base + side + side) / 2

  // Calculate the area of the triangle using Heron's formula
  const area = Math.sqrt(semiPerimeter * (semiPerimeter - base) * (semiPerimeter - side) * (semiPerimeter - side))

  // Calculate the height of the triangle using the formula: height = 2 * area / base
  const height = 2 * area / base

  // Return the calculated height of the triangle
  return height

}
