import { ICircularSectorViewModel } from "./Interfaces"

const FULL_TURN_RADIANS = Math.PI * 2

export function getArcSpanRadians(sector: ICircularSectorViewModel): number {
  return Math.abs(sector.angles.end - sector.angles.start)
}

export function getLargeArcFlagFromSpan(span: number, invert: boolean = false): string {
  const largeArcFlag = span > Math.PI ? ["0", "1", "1"] : ["0", "0", "1"]
  return invert ? [...largeArcFlag].reverse().join(" ") : largeArcFlag.join(" ")
}

export function getEffectiveSectorRatio(ratio: number): number {
  if (!Number.isFinite(ratio)) return 0
  if (isEffectivelyFullCircle(ratio)) return 1
  return Math.max(0, ratio)
}

export function isEffectivelyFullCircle(ratio: number): boolean {
  return Number.isFinite(ratio) && ratio >= 1
}

export function clampArcSpanRadians(span: number): number {
  if (!Number.isFinite(span)) return 0
  return Math.min(FULL_TURN_RADIANS, Math.max(0, span))
}

export { FULL_TURN_RADIANS }
