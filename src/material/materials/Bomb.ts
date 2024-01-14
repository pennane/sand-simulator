import {
  MovableSolid,
  ImmovableSolid,
  Material,
  isThermallyConductive
} from '../Material'

import { MaterialType } from '../materialType'
import { Color } from '../../types'
import { Air } from './Air'

import { Grid, HEIGHT, WIDTH } from '../../grid/grid'

export class Bomb extends MovableSolid {
  fallLastFrame: boolean = false
  power = 4
  color(): Color {
    return [50, 80, 50]
  }
  private explode(grid: Grid, index: number) {
    const testIndices = this.getBombIndices(index)

    const indicesToBlow = new Set([index])
    for (const index of testIndices) {
      if (grid.get(index) instanceof ImmovableSolid) {
        continue
      }
      indicesToBlow.add(index)
    }
    for (const toBlowIndex of indicesToBlow.values()) {
      const element = grid.get(toBlowIndex)
      if (index !== toBlowIndex && element instanceof Bomb) {
        element.explode(grid, toBlowIndex)
        continue
      }
      if (isThermallyConductive(element)) {
        element.receiveHeat(1000, grid, toBlowIndex)
        continue
      }
      grid.replaceWith(toBlowIndex, MaterialType.Fire)
    }
  }

  next(grid: Grid, index: number): void {
    const [_, belowElement] = grid.below(index)

    if (belowElement instanceof Air) {
      this.fallLastFrame = true
    } else {
      if (this.fallLastFrame && !(belowElement instanceof Bomb)) {
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
          indices.push(Grid.toIndex({ x: i, y: j }))
        }
      }
    }
    return indices
  }
}
