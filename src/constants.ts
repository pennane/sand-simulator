import { Color, Pixel } from './types'

export const [WIDTH, HEIGHT] = [120, 120]
export const AIR = null
export const STONE = 1
export const SAND = 2
export const WATER = 3

export const PIXELS = [AIR, STONE, SAND, WATER] as const

export const DEFAULT_DRAWING_PIXEL = SAND

export const PIXEL_COLOR_MAP: Record<NonNullable<Pixel>, Color> = {
  [STONE]: {
    r: 50,
    g: 50,
    b: 50
  },
  [WATER]: {
    r: 0,
    g: 0,
    b: 250
  },
  [SAND]: {
    r: 240,
    g: 230,
    b: 140
  }
}

export const BLACK: Color = { r: 0, g: 0, b: 0 }
