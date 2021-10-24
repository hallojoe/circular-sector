import { createAnnulusSector, createCircularSectorMargin } from "../src/Functions"
import { ICircularSector, IPoint } from "../src/Interfaces"

// demo helper for demo'ing visually demos
// signatures are in demo mode o_0

export function svg(
  width: number = 200, 
  height: number = 200, 
): SVGSVGElement {
  const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svgElement.setAttribute("width", (width).toString())
  svgElement.setAttribute("height", (height).toString())
  return svgElement
}

export function svgPathData(sector: ICircularSector, radius = sector.radius ): string {

  const largeArcFlag = sector.ratio * 360 > 180 ? "0 1 1" : "0 0 1"

  const pathData = [
    "M",
    sector.anchors.outer.end.x,
    sector.anchors.outer.end.y,
    // "L",
    // sector.anchors.middle.mid.x,
    // sector.anchors.middle.mid.y,
    // "L",
    // sector.anchors.outer.start.x,
    // sector.anchors.outer.start.y
    "A",
    radius,
    radius,
    largeArcFlag,
    sector.anchors.outer.start.x,
    sector.anchors.outer.start.y
  ]

  if(sector.anchors.inner.mid === sector.anchors.inner.end) {

    pathData.push(
      "L",
      sector.center.x,
      sector.center.y,
      "Z"
    )      

  }
  else {

    pathData.push(
      "L",
      sector.anchors.inner.start.x,
      sector.anchors.inner.start.y,
      "A",
      sector.source.radius,
      sector.source.radius,
      largeArcFlag.split(" ").reverse().join(" "),
      sector.anchors.inner.end.x,
      sector.anchors.inner.end.y,
      "Z"
    )      
    
  }

  return pathData.join(" ")

}
export function svgPath(
  sector: ICircularSector, 
  radius = sector.radius, 
  stroke: string = "#ccc", 
  strokeWidth: number = 1, 
  fill: string = "rgba(0, 0, 0, 0)"
): SVGPathElement {
  const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path")
  pathElement.setAttribute("d", svgPathData(sector, radius))
  if(strokeWidth > 0) {
    pathElement.setAttribute("stroke", stroke)
    pathElement.setAttribute("stroke-width", strokeWidth.toString())  
  }
  else {
    pathElement.setAttribute("stroke", "none")
  }
  if(fill.length) pathElement.setAttribute("fill", fill)

  pathElement.dataset.cx = sector.anchors.middle.mid.x.toString()
  pathElement.dataset.cy = sector.anchors.middle.mid.y.toString()

  return pathElement
}

export function svgCircle(
  center: IPoint, 
  radius: number = 1, 
  stroke: string = "none", 
  strokeWidth: number = 1, 
  fill: string = "none"
): SVGCircleElement {
  const element = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  element.setAttribute("r", radius.toString())
  element.setAttribute("cx", center.x.toString() )
  element.setAttribute("cy", center.y.toString())
  element.setAttribute("fill", fill)
  element.setAttribute("stroke", stroke)
  element.setAttribute("stroke-width", strokeWidth.toString())
  return element
}
export function svgText(
  center: IPoint, 
  value: string
): SVGTextElement {
  const element = document.createElementNS("http://www.w3.org/2000/svg", "text")
  element.setAttribute("dominant-baseline", "middle")
  element.setAttribute("text-anchor", "middle")
  element.setAttribute("x", center.x.toString() )
  element.setAttribute("y", center.y.toString())
  element.textContent = value
  return element
}

export function svgPathCollection(
  sectors: ICircularSector[], 
  size: number = 200, 
  margin: number = 10, 
  height: number = 0, 
  stroke: string | string[] = "", 
  strokeWidth: number | number[]  = 0, 
  fill: string | string[] = "#f0f0f0",
  debug: boolean = false): SVGSVGElement {

  const svgElement = svg(size, size)

  sectors.forEach((sector, index) => {

    let sectorReContructed2 = createCircularSectorMargin({ ...sector, ratio: 1}, margin) 

    let sectorReContructed = createCircularSectorMargin(sector, margin) 

    sectorReContructed = createAnnulusSector({...sectorReContructed}, margin, height)

    const marginPath = svgPath(
      sectorReContructed, 
      sector.radius, 
      Array.isArray(stroke) ? stroke[index] : stroke, 
      Array.isArray(strokeWidth) ? strokeWidth[index] : strokeWidth, 
      Array.isArray(fill) ? fill[index] : fill, 
    )

    // const marginPath2 = svgPathData(
    //   {...sectorReContructed2, radius: sectorReContructed2.radius}, 
    //   sector.radius 
    // )
    
    // var text = svgText(sectorReContructed.anchors.middle.mid, (sectorReContructed.ratio * 100).toFixed(1) + "%")

    // marginPath.dataset.d = marginPath2

    // const handleInteraction = (event: any) => {
    //   const element = <SVGPathElement>event.target
    //   const d = element.getAttribute("d")
    //   element.setAttribute("d", event.target.dataset.d)
    //   element.dataset.d = d
    // }

    svgElement.appendChild(marginPath)

    if(debug) {

      let sw = Array.isArray(strokeWidth) ? strokeWidth[index] : strokeWidth
      if(sw <= 0) sw = 2
      const ai = Array.isArray(stroke) ? stroke[index] : stroke
      const aj = Array.isArray(fill) ? fill[index] : fill
      
      svgElement.appendChild(svgCircle(sectorReContructed.anchors.outer.start, sw, ai, 1, aj))
      svgElement.appendChild(svgCircle(sectorReContructed.anchors.outer.mid, sw, ai, 1, aj))
      svgElement.appendChild(svgCircle(sectorReContructed.anchors.outer.end, sw, ai, 1, aj))
      svgElement.appendChild(svgCircle(sectorReContructed.anchors.middle.start, sw, ai, 1, aj))
      svgElement.appendChild(svgCircle(sectorReContructed.anchors.middle.mid, sw, ai, 1, aj))
      svgElement.appendChild(svgCircle(sectorReContructed.anchors.middle.end, sw, ai, 1, aj))

      // if not annulus
      if(sectorReContructed.anchors.inner.start === sectorReContructed.anchors.inner.end)  {
        svgElement.appendChild(svgCircle(sectorReContructed.anchors.inner.mid, sw, ai, 1, aj))
      }      
      else {
        svgElement.appendChild(svgCircle(sectorReContructed.anchors.inner.start, sw, ai, 1, aj))
        svgElement.appendChild(svgCircle(sectorReContructed.anchors.inner.mid, sw, ai, 1, aj))
        svgElement.appendChild(svgCircle(sectorReContructed.anchors.inner.end, sw, ai, 1, aj))    
      }
    }

  })  

  // svgElement.appendChild(ball)

  
  return svgElement

}
