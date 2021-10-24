import { THETA } from "./Constants"
import { distribute, createCircularSector } from "../src/Functions"
import { svgPathCollection } from "./Renderers/Svg"
import { svgEthicsCompas } from "./Renderers/SvgEthicsCompas"
import { svgWorldGoals } from "./Renderers/SvgWorldGoals"

declare const window: any

function render() {

  let last = 0
  let result = []

  const [randomDistribution, _] = distribute(Array.from({ length: Math.floor(Math.random() * 8) + 1 }, _ => Math.floor(Math.random() * 64) + 10))

  let r = 80
  randomDistribution.forEach((ratio, i) =>  {
    const sector = createCircularSector({
      center: {x: 100, y: 100 }, 
      ratio: ratio / 100, 
      radius: 90,
      theta: THETA + last * (Math.PI * 2) 
    })
    last += ratio / 100
    result.push(sector)
  })

  console.log("RR", JSON.stringify(result, null, "  "))

  const strokes = [
    "rgb(0, 124, 187, 1)",
    "rgb(70, 118, 59, 1)",
    "rgb(207, 141, 41, 1)",
    "rgb(248, 156, 36, 1)",
    "rgb(225, 21, 132, 1)",
    "rgb(243, 108, 36, 1)",
    "rgb(142, 23, 55, 1)",
    "rgb(252, 182, 21, 1)"]
    
  const fills = strokes.map(v => v.replace(/1\)/, ".8)"))  

  last = 0
  const t6 = []
  const fillDistribution = Array.from({ length: 360 }, _ => 1)
  fillDistribution.forEach((ratio, i) =>  {
    const sector = createCircularSector({
      center: {x: 150, y: 150 }, 
      ratio: ratio / 100, 
      radius: 125,//i % 2  === 0 ?  125 : 100, 
      theta: THETA + last * (Math.PI * 2) 
    })
    last += ratio / 100
    t6.push(sector)
  })




  const clock = []
  const [seconds, _2] = distribute([10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10])
  last = 0
  seconds.forEach((ratio, i) =>  {
    const sector = createCircularSector({
      center: {x: 200, y: 200 }, 
      ratio: ratio / 100, 
      radius: 150,//i % 2  === 0 ?  125 : 100, 
      theta: THETA + last * (Math.PI * 2) 
    })
    last += (360 / 60) / 100
    clock.push(sector)
  })

  const height = +window.height.value
  const margin = +window.margin.value
  window.demos.innerHTML = ""

  window.demos.appendChild(svgWorldGoals())
  window.demos.appendChild(svgEthicsCompas())


  window.demos.appendChild(svgPathCollection(t6, 200, 0, 100))

  window.demos.appendChild(svgPathCollection(result, 200, 0, 0, strokes, 1, fills))
  window.demos.appendChild(svgPathCollection(result, 200, 0, height, strokes, 1, fills))
  window.demos.appendChild(svgPathCollection(result, 200, margin, 0, strokes, 1, fills))
  window.demos.appendChild(svgPathCollection(result, 200, margin, height, strokes, 1, fills))

}

render()

// window.height.oninput = () => {
// render()
// }

// window.margin.oninput = () => {
//   render()
//   }
  