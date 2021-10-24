import { THETA } from "./Constants"
import { distribute, createCircularSector } from "../src/Functions"
import { svgPathCollection } from "./Svg"
import { svgEthicsCompas } from "./SvgEthicsCompas"
import { svgWorldGoals } from "./SvgWorldGoals"
import { svgBasic } from "./SvgBasic"

declare const window: any

function render() {

  const [distribution, _] = distribute(Array.from({ length: Math.floor(Math.random() * 8) + 1 }, _ => Math.floor(Math.random() * 64) + 10))

  let values = distribution
  if(window.values.value.trim() !== "") {
    const [distributionFromUser, _] = distribute(window.values.value.split(",").map(v => +v.trim()))
    values = distributionFromUser
  }

  const size = +window.radius.value * 2
  const height = +window.height.value
  const margin = +window.margin.value
  const strokeWidth = +window.strokeWidth.value
  const debug = window.debug.checked

  window.demos.innerHTML = ""
  window.demos.appendChild(svgBasic(values, size, margin, height, strokeWidth, debug))

  window.demos.appendChild(svgWorldGoals()) 
  window.demos.appendChild(svgEthicsCompas())


}

render()
  

window.inputs.onchange = () => {
  render()
}