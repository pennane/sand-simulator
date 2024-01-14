import { Material } from './material/Material'
import { MaterialType } from './material/materialType'
import { Grid, HEIGHT, QueuedMaterial, WIDTH } from './grid/grid'

export const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

export const MIN_BRUSH_SIZE = 1
export const MAX_BRUSH_SIZE = 20
export const DEFAULT_BRUSH_SIZE = 1

let canvasData = ctx.getImageData(0, 0, WIDTH, HEIGHT)

const queuedMaterials: QueuedMaterial[] = []

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

export const draw = (grid: Grid) => {
  canvasData = ctx.getImageData(0, 0, WIDTH, HEIGHT)

  grid.addQueued(queuedMaterials)

  for (let i = 0; i < grid.size(); i++) {
    drawPixel(i, grid.get(i))
  }

  ctx.putImageData(canvasData, 0, 0)
  const next = grid.nextState()
  requestAnimationFrame(() => draw(next))
}

const parseBrushSize = (b: number | undefined) =>
  Math.max(Math.min(b || DEFAULT_BRUSH_SIZE, MAX_BRUSH_SIZE), MIN_BRUSH_SIZE)

export const queueMaterial = (
  index: number,
  type: MaterialType,
  brushSize?: number
) => {
  queuedMaterials.push({ index, type, brushSize: parseBrushSize(brushSize) })
}

export const queueFillAll = (type: MaterialType) => {
  queuedMaterials.push({
    index: 'all',
    type,
    brushSize: parseBrushSize(undefined)
  })
}
