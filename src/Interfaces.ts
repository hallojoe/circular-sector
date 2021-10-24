
export interface IPoint {
  x: number
  y: number
}

export interface IPoints { 
  start: IPoint
  mid: IPoint
  end: IPoint
}

export interface IAngles { 
  start: number
  mid: number
  end: number
}

export interface IAnchorPoints { 
  outer: IPoints
  middle: IPoints
  inner: IPoints
}

export interface ICircularSectorParameters { 
  center: IPoint 
  ratio: number 
  radius: number 
  theta: number 
}

export interface ICircularSector {   
  source: ICircularSectorParameters
  ratio: number
  radius: number
  center: IPoint
  angles: IAngles
  anchors: IAnchorPoints    
}