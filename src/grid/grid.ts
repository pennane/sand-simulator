import { Point } from '../types'
import { shuffle, uniq } from '../lib'
import { Material } from '../material/Material'
import { MaterialType, factory } from '../material/materialType'

export type QueuedMaterial = {
  type: MaterialType
  index: number | 'all'
  brushSize: number
}
export const [WIDTH, HEIGHT] = [120, 120]

let indices = shuffle(Array.from({ length: WIDTH * HEIGHT }, (_, i) => i))

export class Grid {
  private grid: Material[]
  constructor(old?: Material[]) {
    this.grid = old ? old.slice() : Grid.createEmptyGrid()
  }

  size() {
    return this.grid.length
  }

  get(point: Point | number) {
    const index = typeof point === 'number' ? point : Grid.toIndex(point)
    return this.grid[index]
  }

  swap(a: number, b: number) {
    const temp = this.grid[a]
    this.grid[a] = this.grid[b]
    this.grid[b] = temp
  }

  replaceWith(index: number, type: MaterialType | Material | number) {
    if (typeof type === 'string') {
      this.grid[index] = factory(type)
    } else if (typeof type === 'number') {
      this.grid[index] = this.grid[type]
    } else {
      this.grid[index] = type
    }
  }

  nextState(): Grid {
    const nextState = new Grid(this.grid.slice())
    indices = shuffle(indices)
    for (const i of indices) {
      const element = this.grid[i]
      element.next(nextState, i)
    }

    return nextState
  }

  addQueued(queuedMaterials: QueuedMaterial[]) {
    while (queuedMaterials.length > 0) {
      const queued = queuedMaterials.shift()!
      if (queued.index === 'all') {
        this.grid = this.grid.map(() => factory(queued.type))
      } else {
        const indices = Grid.brushIndices(queued.index, queued.brushSize)
        for (const i of indices) {
          this.grid[i] = factory(queued.type)
        }
      }
    }
  }

  below(index: number) {
    const i = Grid.belowIndex(index)
    return [i, this.grid[i]] as const
  }

  above(index: number) {
    const i = Grid.aboveIndex(index)
    return [i, this.grid[i]] as const
  }

  left(index: number) {
    const i = Grid.leftIndex(index)
    return [i, this.grid[i]] as const
  }

  right(index: number) {
    const i = Grid.rightIndex(index)
    return [i, this.grid[i]] as const
  }

  downLeft(index: number) {
    const i = Grid.downLeftIndex(index)
    return [i, this.grid[i]] as const
  }

  downRight(index: number) {
    const i = Grid.downRightIndex(index)
    return [i, this.grid[i]] as const
  }

  upLeft(index: number) {
    const i = Grid.upLeftIndex(index)
    return [i, this.grid[i]] as const
  }

  upRight(index: number) {
    const i = Grid.upRighIndex(index)
    return [i, this.grid[i]] as const
  }

  nextTo(index: number) {
    const indices = uniq([
      Grid.belowIndex(index),
      Grid.aboveIndex(index),
      Grid.leftIndex(index),
      Grid.rightIndex(index)
    ])
    return indices.map((i) => [i, this.get(i)] as const)
  }

  around(index: number) {
    const indices = uniq([
      Grid.belowIndex(index),
      Grid.aboveIndex(index),
      Grid.leftIndex(index),
      Grid.rightIndex(index),
      Grid.downLeftIndex(index),
      Grid.downRightIndex(index),
      Grid.upLeftIndex(index),
      Grid.upRighIndex(index)
    ])
    return indices.map((i) => [i, this.get(i)] as const)
  }

  static createEmptyGrid() {
    return Array.from({ length: WIDTH * HEIGHT }, () =>
      factory(MaterialType.Air)
    )
  }

  static createDefaultGrid = () => {
    const grid = Grid.createEmptyGrid()
    const from = Grid.toIndex({ x: 0, y: HEIGHT - 30 })
    const to = Grid.toIndex({ x: WIDTH, y: HEIGHT - 1 })
    const air = factory(MaterialType.Sand)
    grid.fill(air, from, to)
    return grid
  }

  static toIndex(point: Point) {
    return point.y * WIDTH + point.x
  }

  static belowIndex(index: number) {
    const newX = index % WIDTH
    const newY = Math.floor(index / WIDTH) + 1
    return newY >= HEIGHT ? index : newY * WIDTH + newX
  }

  static aboveIndex(index: number) {
    const newX = index % WIDTH
    const newY = Math.floor(index / WIDTH) - 1
    return newY < 0 ? index : newY * WIDTH + newX
  }

  static leftIndex(index: number) {
    const newX = (index % WIDTH) - 1
    return newX < 0 ? index : Math.floor(index / WIDTH) * WIDTH + newX
  }

  static rightIndex(index: number) {
    const newX = (index % WIDTH) + 1
    return newX >= WIDTH ? index : Math.floor(index / WIDTH) * WIDTH + newX
  }

  static downLeftIndex(index: number) {
    const newX = (index % WIDTH) - 1
    const newY = Math.floor(index / WIDTH) + 1
    return newY >= HEIGHT || newX < 0 ? index : newY * WIDTH + newX
  }

  static downRightIndex(index: number) {
    const newX = (index % WIDTH) + 1
    const newY = Math.floor(index / WIDTH) + 1
    return newY >= HEIGHT || newX >= WIDTH ? index : newY * WIDTH + newX
  }

  static upLeftIndex(index: number) {
    const newX = (index % WIDTH) - 1
    const newY = Math.floor(index / WIDTH) - 1
    return newY < 0 || newX < 0 ? index : newY * WIDTH + newX
  }

  static upRighIndex(index: number) {
    const newX = (index % WIDTH) + 1
    const newY = Math.floor(index / WIDTH) - 1
    return newY < 0 || newX >= WIDTH ? index : newY * WIDTH + newX
  }

  static indicesNextTo(index: number): number[] {
    const indices = uniq([
      Grid.belowIndex(index),
      Grid.aboveIndex(index),
      Grid.leftIndex(index),
      Grid.rightIndex(index)
    ])
    return indices
  }

  static indicesAround(index: number) {
    const indices = uniq([
      Grid.belowIndex(index),
      Grid.aboveIndex(index),
      Grid.leftIndex(index),
      Grid.rightIndex(index),
      Grid.downLeftIndex(index),
      Grid.downRightIndex(index),
      Grid.upLeftIndex(index),
      Grid.upRighIndex(index)
    ])
    return indices
  }

  static brushIndices(centerIndex: number, brushSize: number): number[] {
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
}
