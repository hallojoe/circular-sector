import { createAnnulusSector, createCircularSectorMargin } from "../../src/Functions"
import { ICircularSector, IPoint } from "../../src/Interfaces"

export function svg(
  width: number = 200, 
  height: number = 200, 
): SVGSVGElement {
  const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svgElement.setAttribute("width", (width).toString())
  svgElement.setAttribute("height", (height).toString())
  return svgElement
}

export function svgPathData2(sector: ICircularSector, radius = sector.radius ): string {

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
  // svgElement.style.background = "black"
  const ball = svgCircle({x: 0, y: 0 }, 5, "deeppink", 2)




  sectors.forEach((sector, index) => {

    let sectorReContructed2 = createCircularSectorMargin({ ...sector, ratio: 1}, margin) 

    let sectorReContructed = createCircularSectorMargin(sector, margin) 

    sectorReContructed = createAnnulusSector({...sectorReContructed}, margin, height)

    const marginPath = svgPath(
      sectorReContructed, 
      sector.radius, 
      "", 
      0, 
      Array.isArray(fill) ? fill[index] : fill, 
    )

    const marginPath2 = svgPathData(
      {...sectorReContructed2, radius: sectorReContructed2.radius}, 
      sector.radius 
    )
    
    var text = svgText(sectorReContructed.anchors.middle.mid, (sectorReContructed.ratio * 100).toFixed(1) + "%")

    marginPath.dataset.d = marginPath2

    const handleInteraction = (event: any) => {
      const element = <SVGPathElement>event.target
      const d = element.getAttribute("d")
      element.setAttribute("d", event.target.dataset.d)
      element.dataset.d = d
    }

    // marginPath.onmouseover = (event: any) => {
    //   handleInteraction(event)
    // }

    // marginPath.onmouseout = (event: any) => {
    //   handleInteraction(event)      
    // }


    // marginPath.onmouseover = (event: any) => {
    //   const element = <SVGPathElement>event.target
    //   const cx = element.dataset.cx
    //   const cy = element.dataset.cy 
    //   ball.setAttribute("cx", cx)
    //   ball.setAttribute("cy", cy)
    // }


    svgElement.appendChild(marginPath)

    //svgElement.appendChild(m)






    if(debug) {

      var ai = Array.isArray(stroke) ? stroke[index] : stroke
      var aj = Array.isArray(fill) ? fill[index] : fill
      //aj = aj.replace(/1\)/, ".8)")

      svgElement.appendChild(svgCircle(sectorReContructed.anchors.outer.start, 2, ai, 1, aj))
      svgElement.appendChild(svgCircle(sectorReContructed.anchors.outer.mid, 2, ai, 1, aj))
      svgElement.appendChild(svgCircle(sectorReContructed.anchors.outer.end, 2, ai, 1, aj))
      svgElement.appendChild(svgCircle(sectorReContructed.anchors.middle.start, 2, ai, 1, aj))
      svgElement.appendChild(svgCircle(sectorReContructed.anchors.middle.mid, 2, ai, 1, aj))
      svgElement.appendChild(svgCircle(sectorReContructed.anchors.middle.end, 2, ai, 1, aj))
      // if not annulus
      if(sectorReContructed.anchors.inner.start === sectorReContructed.anchors.inner.end)  {
        svgElement.appendChild(svgCircle(sectorReContructed.anchors.inner.mid, 2, ai, 1, aj))
      }      
      else {
        svgElement.appendChild(svgCircle(sectorReContructed.anchors.inner.start, 2, ai, 1, aj))
        svgElement.appendChild(svgCircle(sectorReContructed.anchors.inner.mid, 2, ai, 1, aj))
        svgElement.appendChild(svgCircle(sectorReContructed.anchors.inner.end, 2, ai, 1, aj))    
      }
    }

  })  

  // svgElement.appendChild(ball)

  
  return svgElement

}
