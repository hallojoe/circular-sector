import { createCircularSector, distribute } from "../src/Functions"
import { color, colors } from "./colors"
import { svgPath, svgPathCollection } from "./Svg"

export const svgBasic = (
  values: number[], 
  size: number, 
  margin: number = 0, 
  height: number = 0, 
  strokeWidth: number,
  debug: boolean = true
): SVGSVGElement => {

  let last = 0
  const sectors = []
  const [distribution, _] = distribute(values)
  distribution.forEach((value, i) =>  {
    const ratio = value / 100
    const halfSize = size / 2
    const sector = createCircularSector({
      center: { x: halfSize, y: halfSize }, 
      ratio: ratio, 
      radius: halfSize - 10, // add some space around
      theta: (-Math.PI * .5) + last * (Math.PI * 2) 
    })
    last += ratio
    sectors.push(sector)
  })








  const adjustedFills = strokeWidth > 0 ?  colors.map((v, i) => color(i, .8)) : colors
  const svgPaths = svgPathCollection(
    sectors, 
    size, 
    margin, // sector margin
    height, // annulus sector visible height
    colors,  // strokes
    strokeWidth, 
    adjustedFills, 
    debug
  )
  
  return svgPaths

}
