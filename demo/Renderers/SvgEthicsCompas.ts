import { distribute, createCircularSector, createCircularSectorMargin, createAnnulusSector } from "../../src/Functions"
import { svg, svgPath } from "./Svg"

export function svgEthicsCompas(): SVGSVGElement {

  const colors = [
    "rgba(27, 137, 122, 1)", // green'ish
    "rgba(177, 110, 68, 1)", // brown'ish
    "rgba(241, 100, 57, 1"   // orang'ish
  ]

  const color = (index: number): string => colors[index].replace(/1\)/, ".8")

  const [distributionOuter, distributionSumOuter] = distribute([100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100])
  const [distributionInner, distributionSumInner] = distribute([1000, 700, 700])
  const [distributionInnerInner, distributionSumInnerInner] = distribute([250, 250, 250, 250])

  let collectionGreen = distributionOuter.filter((v, i) => i < 10)
  let collectionBrown = distributionOuter.filter((v, i) => i > 9 && i < 17)
  let collectionOrange = distributionOuter.filter((v, i) => i > 16)

  const resultGreen = []
  const resultBrown = []
  const resultOrange = []
  const resultMid = []

  const element = svg(200, 200)
  const margin = 4
  const height = 30

  let last = 0

  let g = false
  collectionGreen.forEach(ratio =>  {
    const sector = createCircularSector({
      center: { x: 100, y: 100 }, 
      ratio: ratio / 100, 
      radius: 90, 
      theta: (-Math.PI * .5) + last * (Math.PI * 2) 
    })
    g =  !g
    last += ratio / 100
    resultGreen.push(sector)
  })

  collectionBrown.forEach(ratio =>  {
    const sector = createCircularSector({
      center: { x: 100, y: 100 }, 
      ratio: ratio / 100, 
      radius: 90, 
      theta: (-Math.PI * .5) + last * (Math.PI * 2) 
    })
    last += ratio / 100
    resultBrown.push(sector)
  })

  collectionOrange.forEach(ratio =>  {
    const sector = createCircularSector({
      center: {x: 100, y: 100 }, 
      ratio: ratio / 100, 
      radius: 90, 
      theta: (-Math.PI * .5) + last * (Math.PI * 2) 
    })
    last += ratio / 100
    resultOrange.push(sector)
  })


  collectionGreen = distributionInner.filter((v, i) => i === 0)
  collectionBrown = distributionInner.filter((v, i) => i === 1)
  collectionOrange = distributionInner.filter((v, i) => i === 2)

  last = 0
  collectionGreen.forEach(ratio =>  {
    const sector = createCircularSector({
      center: {x: 100, y: 100 }, 
      ratio: ratio / 100, 
      radius: 90 - 34, 
      theta: (-Math.PI * .5) + last * (Math.PI * 2) 
    })
    last += ratio / 100
    resultGreen.push(sector)
  })

  collectionBrown.forEach(ratio =>  {
    const sector = createCircularSector({
      center: {x: 100, y: 100 }, 
      ratio: ratio / 100, 
      radius: 90 - 34, 
      theta: (-Math.PI * .5) + last * (Math.PI * 2) 
    })
    last += ratio / 100
    resultBrown.push(sector)
  })

  collectionOrange.forEach(ratio =>  {
    const sector = createCircularSector({
      center: {x: 100, y: 100 }, 
      ratio: ratio / 100, 
      radius: 90 - 34, 
      theta: (-Math.PI * .5) + last * (Math.PI * 2) 
    })
    last += ratio / 100
    resultOrange.push(sector)
  })


  last = 0
  distributionInnerInner.forEach(ratio =>  {
    const sector = createCircularSector({
      center: {x: 100, y: 100 }, 
      ratio: ratio / 100, 
      radius: 90 - 68, 
      theta: (-Math.PI * .25) + last * (Math.PI * 2) 
    })
    last += ratio / 100
    resultMid.push(sector)
  })



  resultGreen.forEach(sector =>  {

    let marginSector = createCircularSectorMargin(sector, margin) 

    marginSector = createAnnulusSector({...marginSector}, margin, height)

    const marginPath = svgPath(
      marginSector, 
      sector.radius, colors[0], 0, color(0)
    )    

    element.appendChild(marginPath)

  })

  resultBrown.forEach(sector =>  {

    let marginSector = createCircularSectorMargin(sector, margin) 

    marginSector = createAnnulusSector({...marginSector}, margin, height)

    const marginPath = svgPath(
      marginSector, 
      sector.radius, colors[1], 0, color(1)
    )    

    element.appendChild(marginPath)

  })

  resultOrange.forEach(sector =>  {

    let marginSector = createCircularSectorMargin(sector, margin) 

    marginSector = createAnnulusSector({...marginSector}, margin, height)

    const marginPath = svgPath(
      marginSector, 
      sector.radius, colors[2], 0, color(2)
    )    

    element.appendChild(marginPath)

  })

  resultMid.forEach(sector =>  {

    let marginSector = createCircularSectorMargin(sector, margin) 

    marginSector = createAnnulusSector({...marginSector}, margin, height)

    const marginPath = svgPath(
      marginSector, 
      sector.radius, "#ccc", 0, "#f0f0f0"
      )    

    element.appendChild(marginPath)

  })





  return element

}
