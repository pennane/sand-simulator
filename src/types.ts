import { AIR, STONE, SAND, WATER } from './constants'

export type Pixel = typeof AIR | typeof STONE | typeof SAND | typeof WATER
export type Point = {
  x: number
  y: number
}
export type Color = {
  r: number
  g: number
  b: number
}
