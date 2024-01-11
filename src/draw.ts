import { WIDTH, HEIGHT, PIXEL_COLOR_MAP, BLACK } from './constants'
import { nextState } from './state'
import { Color, Pixel } from './types'

export const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')!

let canvasData = ctx.getImageData(0, 0, WIDTH, HEIGHT)

const queuedPixels: Array<{ pixel: Pixel; index: number }> = []

canvas.width = WIDTH
canvas.height = HEIGHT

export const getPixelColor = (pixel: Pixel): Color => {
  return pixel ? PIXEL_COLOR_MAP[pixel] : BLACK
}

const drawPixel = (index: number, pixel: Pixel) => {
  const rgbaIndex = index * 4

  const { r, g, b } = getPixelColor(pixel)

  canvasData.data[rgbaIndex + 0] = r
  canvasData.data[rgbaIndex + 1] = g
  canvasData.data[rgbaIndex + 2] = b
  canvasData.data[rgbaIndex + 3] = 255
}

export const draw = (grid: Pixel[]) => {
  canvasData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
  while (queuedPixels.length > 0) {
    const queued = queuedPixels.shift()!
    if (grid[queued.index]) continue
    grid[queued.index] = queued.pixel
  }

  for (let i = 0; i < grid.length; i++) {
    drawPixel(i, grid[i])
  }

  ctx.putImageData(canvasData, 0, 0)
  setTimeout(() => draw(nextState(grid)), 35)
}

export const queuePixel = (index: number, pixel: Pixel) => {
  queuedPixels.push({ index, pixel })
}
