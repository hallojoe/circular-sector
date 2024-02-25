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
  centroid: IPoint
}

export interface ICircularSectorSettings { 
  center: IPoint 
  ratio: number 
  radius: number 
  theta: number 
  gap:number
  height:number
  borderRadius?: number 
}

export interface ICircularSectorViewModel {   
  source: ICircularSectorSettings
  ratio: number
  radius: number
  center: IPoint
  angles: IAngles
  anchors: IAnchorPoints
}
