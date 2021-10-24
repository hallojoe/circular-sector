import { createCircularSector, distribute } from "../../src/Functions"
import { svgPath, svgPathCollection } from "./Svg"

const wordlGoalColors = [
  "rgb(235, 28, 44, 1)",   
  "rgb(209, 159, 40, 1)",
  "rgb(38, 155, 71, 1)",
  "rgb(194, 31, 50, 1)",
  "rgb(239, 62, 42, 1)",
  "rgb(0, 173, 217, 1)",
  "rgb(252, 182, 21, 1)",
  "rgb(142, 23, 55, 1)",
  "rgb(243, 108, 36, 1)",
  "rgb(225, 21, 132, 1)",
  "rgb(248, 156, 36, 1)",
  "rgb(207, 141, 41, 1)",
  "rgb(70, 118, 59, 1)",
  "rgb(0, 124, 187, 1)",
  "rgb(62, 175, 73, 1)",
  "rgb(1, 85, 138, 1)",
  "rgb(24, 53, 103,1)",
]

export const svgWorldGoals = (): SVGSVGElement => {
  let last = 0
  const result = []
  const [distribution, distributionSum] = distribute([100, 200, 300])
  distribution.forEach((ratio, i) =>  {
    const sector = createCircularSector({
      center: {x: 200, y: 200 }, 
      ratio: ratio / 100, 
      radius: 150, 
      theta: (-Math.PI * .5) + last * (Math.PI * 2) 
    })
    last += ratio / 100
    result.push(sector)
  })

  const svgPaths = svgPathCollection(result, 400, 10, 60, wordlGoalColors, 1, wordlGoalColors.map(x => x.replace(/1\)/, ".8)")), false)
  
  return svgPaths
}
