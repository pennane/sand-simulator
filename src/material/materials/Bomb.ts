import { MovableSolid, ImmovableSolid, Material } from '../Material'
import { WIDTH, HEIGHT } from '../../constants'

import { below, around, toIndex } from '../../grid'
import { MaterialType, factory } from '../materialType'
import { Color } from '../../types'
import { Air } from './Air'
import { Fire } from './Fire'

export class Bomb extends MovableSolid {
  fallLastFrame: boolean = false
  power = 4
  color(): Color {
    return [50, 80, 50]
  }
  private explode(grid: Material[], index: number) {
    const testIndices = this.getBombIndices(index)

    const indicesToBlow = new Set([index])
    for (const index of testIndices) {
      if (grid[index] instanceof ImmovableSolid) {
        continue
      }
      indicesToBlow.add(index)
    }
    for (const index of indicesToBlow.values()) {
      grid[index] = factory(MaterialType.Fire)
    }
  }

  next(grid: Material[], index: number): void {
    const belowIndex = below(index)
    const indicesAround = around(index)
    const fireAround = indicesAround.some((i) => grid[i] instanceof Fire)
    if (fireAround) {
      this.explode(grid, index)
      return
    }

    if (grid[belowIndex] instanceof Air) {
      this.fallLastFrame = true
    } else {
      if (this.fallLastFrame && !(grid[belowIndex] instanceof Bomb)) {
        this.explode(grid, index)
        return
      }
      this.fallLastFrame = false
    }

    super.next(grid, index)
  }

  getBombIndices(centerIndex: number): number[] {
    if (this.power <= 1) return [centerIndex]
    const indices: number[] = []
    const centerX = centerIndex % WIDTH
    const centerY = Math.floor(centerIndex / WIDTH)

    for (let i = 0; i < WIDTH; i++) {
      for (let j = 0; j < HEIGHT; j++) {
        const x = i - centerX
        const y = j - centerY
        const distance = Math.sqrt(x * x + y * y)

        if (distance <= this.power) {
          indices.push(toIndex({ x: i, y: j }))
        }
      }
    }
    return indices
  }
}
