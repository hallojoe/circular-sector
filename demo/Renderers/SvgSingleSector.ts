import { createCircularSector } from "../../src/Functions"
import { svg, svgPath } from "./Svg"

export const svgWorldGoals = () => {
  const sector = createCircularSector({
    center: {x: 200, y: 200 }, 
    ratio: .64 / 100, 
    radius: 150, 
    theta: (-Math.PI * .5) * (Math.PI * 2) 
  })
  const svgElement = svg(400, 400)
  const svgPathElement = svgPath(sector, 400)
  svgElement.appendChild(svgPathElement)
  document.body.appendChild(svgElement)
}
