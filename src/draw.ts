import { Material } from './material/Material'
import { WIDTH, HEIGHT } from './constants'
import { MaterialType, factory } from './material/materialType'
import { nextState } from './state'

export const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

export const MIN_BRUSH_SIZE = 1
export const MAX_BRUSH_SIZE = 20
export const DEFAULT_BRUSH_SIZE = 1

let canvasData = ctx.getImageData(0, 0, WIDTH, HEIGHT)

const queuedMaterials: Array<{
  type: MaterialType
  index: number | 'all'
  brushSize?: number
}> = []

canvas.width = WIDTH
canvas.height = HEIGHT

const drawPixel = (index: number, type: Material) => {
  const rgbaIndex = index * 4

  const [r, g, b] = type.color()

  canvasData.data[rgbaIndex + 0] = r
  canvasData.data[rgbaIndex + 1] = g
  canvasData.data[rgbaIndex + 2] = b
  canvasData.data[rgbaIndex + 3] = 255
}

export const draw = (grid: Material[]) => {
  canvasData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
  while (queuedMaterials.length > 0) {
    const queued = queuedMaterials.shift()!
    if (queued.index === 'all') {
      grid = grid.map(() => factory(queued.type))
    } else {
      const brushSize = Math.max(
        Math.min(queued.brushSize || DEFAULT_BRUSH_SIZE, MAX_BRUSH_SIZE),
        MIN_BRUSH_SIZE
      )
      const indices = getIndicesForBrush(queued.index, brushSize)
      for (const i of indices) {
        grid[i] = factory(queued.type)
      }
    }
  }

  for (let i = 0; i < grid.length; i++) {
    drawPixel(i, grid[i])
  }

  ctx.putImageData(canvasData, 0, 0)
  const next = nextState(grid)
  requestAnimationFrame(() => draw(next))
}

export const queueMaterial = (
  index: number,
  type: MaterialType,
  brushSize?: number
) => {
  queuedMaterials.push({ index, type, brushSize })
}

export const queueFillAll = (type: MaterialType) => {
  queuedMaterials.push({ index: 'all', type })
}

const getIndicesForBrush = (
  centerIndex: number,
  brushSize: number
): number[] => {
  if (brushSize <= 1) return [centerIndex]
  const indices = []
  const centerX = centerIndex % WIDTH
  const centerY = Math.floor(centerIndex / WIDTH)

  for (let x = -brushSize; x <= brushSize; x++) {
    for (let y = -brushSize; y <= brushSize; y++) {
      const newX = centerX + x
      const newY = centerY + y
      if (newX >= 0 && newX < WIDTH && newY >= 0 && newY < HEIGHT) {
        indices.push(newY * WIDTH + newX)
      }
    }
  }

  return indices
}
