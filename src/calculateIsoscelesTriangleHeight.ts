/**
 * Calculates the height of an isosceles triangle from its base and equal side length.
 */
export function calculateIsoscelesTriangleHeight(base: number, side: number): number {
  const semiPerimeter = (base + side + side) / 2
  const area = Math.sqrt(semiPerimeter * (semiPerimeter - base) * (semiPerimeter - side) * (semiPerimeter - side))
  const height = 2 * area / base

  return height
}
