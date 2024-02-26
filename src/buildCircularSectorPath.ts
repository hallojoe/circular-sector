import { ICircularSectorViewModel } from "./Interfaces"
import { createCircularSectorViewModel } from "./createCircularSectorViewModel";

export function buildCircularSectorPath(sector: ICircularSectorViewModel, pathRadius:number = 0): string {

  if(pathRadius > 0) return buildCircularSectorPathWithRadius(sector, pathRadius)
  
  const largeArcFlag = getLargeArcFlag(sector.ratio)

  const pathData = [
    "M",
    sector.anchors.outer.end.x,
    sector.anchors.outer.end.y,
    "A",
    sector.source.radius,
    sector.source.radius,
    largeArcFlag,
    sector.anchors.outer.start.x,
    sector.anchors.outer.start.y,
    "L",
    sector.anchors.inner.start.x,
    sector.anchors.inner.start.y
  ]

  // If path is not annular then draw line to inner mid point and close path
  if (sector.anchors.inner.mid === sector.anchors.inner.end) {

    pathData.push(
      "L",
      sector.anchors.inner.mid.x,
      sector.anchors.inner.mid.y,
      "Z"
    )

  }
  // When path is annular draw annular path
  else {
    
    pathData.push(
      "L",
      sector.anchors.inner.start.x,
      sector.anchors.inner.start.y,
      "A",
      sector.source.radius - sector.source.height!,
      sector.source.radius - sector.source.height!,
      largeArcFlag.split(" ").reverse().join(" "),
      sector.anchors.inner.end.x,
      sector.anchors.inner.end.y,
      "Z"
    )
  }

  return pathData.join(" ")

}

function buildCircularSectorPathWithRadius(sector: ICircularSectorViewModel, pathRadius:number = 0): string {

  if(pathRadius < 1) return buildCircularSectorPath(sector, 0)

  // Create a short sector by adding substracting from height and radius
  const sectorShort:ICircularSectorViewModel = createCircularSectorViewModel({
    ...sector.source,
    radius: sector.source.radius - (pathRadius * 1),
    height: sector.source.height - (pathRadius * 2)
  })

  // Create a narrow sector by adding to gap
  const sectorNarrow = createCircularSectorViewModel({
    ...sector.source,
    gap: sector.source.gap + (pathRadius * 2)
  })

  const sectorInner = createCircularSectorViewModel({
    ...sector.source   
  })

  // const circularSectorsDebugPath = `
  //   ${buildCircularPath(sectorInner)} 
  //   ${buildCircularPath(sectorNarrow)} 
  //   ${buildCircularPath(sectorShort)} `

  const largeArcFlag = getLargeArcFlag(sector.ratio)

  const pathData = [
    "M",
    sectorShort.anchors.outer.end.x,
    sectorShort.anchors.outer.end.y,

    "Q",
    sector.anchors.outer.end.x,
    sector.anchors.outer.end.y,
    sectorNarrow.anchors.outer.end.x,
    sectorNarrow.anchors.outer.end.y,

    "A",
    sectorNarrow.source.radius,
    sectorNarrow.source.radius,
    largeArcFlag,
    sectorNarrow.anchors.outer.start.x,
    sectorNarrow.anchors.outer.start.y,

    "Q",
    sector.anchors.outer.start.x,
    sector.anchors.outer.start.y,
    sectorShort.anchors.outer.start.x,
    sectorShort.anchors.outer.start.y,

    "L",
    sectorShort.anchors.inner.start.x,
    sectorShort.anchors.inner.start.y,


  ]
  // If path is not annular then draw cubic curve directly to sector short inner end
  if (sectorNarrow.anchors.inner.mid === sectorNarrow.anchors.inner.end) {

    pathData.push(
      "C",
      sector.anchors.inner.start.x,
      sector.anchors.inner.start.y,
      sector.anchors.inner.end.x,
      sector.anchors.inner.end.y,
      sectorShort.anchors.inner.end.x,
      sectorShort.anchors.inner.end.y
    )

  }
  // As usual
  else {

    pathData.push(
      "Q",
      sector.anchors.inner.start.x,
      sector.anchors.inner.start.y,
      sectorNarrow.anchors.inner.start.x,
      sectorNarrow.anchors.inner.start.y,
      "A",
      sectorNarrow.source.radius - sector.source.height,
      sectorNarrow.source.radius - sector.source.height,
      largeArcFlag.split(" ").reverse().join(" "),
      sectorNarrow.anchors.inner.end.x,
      sectorNarrow.anchors.inner.end.y,  
      "Q",
      sector.anchors.inner.end.x,
      sector.anchors.inner.end.y,
      sectorShort.anchors.inner.end.x,
      sectorShort.anchors.inner.end.y
    )

  }

  pathData.push(
    "L",
    sectorShort.anchors.outer.end.x,
    sectorShort.anchors.outer.end.y,
    "Z"
  )

  return pathData.join(" ")


}

function getLargeArcFlag(ratio: number, invert: boolean = false) {
  const largeArcFlag = ratio * 360 > 180 ? "0 1 1" : "0 0 1";
  return !invert ? largeArcFlag : largeArcFlag.split(" ").reverse().join(" ");
}
