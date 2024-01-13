import { LivingBeing, ThermallyConductive, Material, Liquid } from '../Material'
import {
  below,
  above,
  around,
  indicesNextTo,
  left,
  right,
  upLeft,
  upRight,
  downLeft,
  downRight,
  swap
} from '../../grid'
import { randomFromArray } from '../../lib'
import { MaterialType, factory } from '../materialType'
import { Color } from '../../types'
import { Air } from './Air'
import { Sand } from './Sand'
import { Tunnel } from './Tunnel'

export class Ant extends LivingBeing implements ThermallyConductive {
  private diggingTunnel: boolean = false
  private inTunnel: boolean = false
  private temperature = 30

  next(grid: Material[], index: number): void {
    const belowIndex = below(index)

    if (grid[belowIndex] instanceof Air) {
      swap(grid, index, belowIndex)
      return
    }

    if (
      grid[belowIndex] instanceof Liquid ||
      grid[above(index)] instanceof Liquid
    ) {
      grid[index] = factory(MaterialType.Air)
    }

    if (around(index).every((i) => grid[i] instanceof Ant)) {
      grid[index] = factory(MaterialType.Air)
    }

    if (Math.random() > 0.1) return

    if (
      !this.inTunnel &&
      grid[belowIndex] instanceof Tunnel &&
      Math.random() > 0.3
    ) {
      grid[belowIndex] = grid[index]
      grid[index] = factory(MaterialType.Air)
      this.inTunnel = true
      return
    }

    const twoBelowIndex = below(belowIndex)
    if (
      !this.diggingTunnel &&
      !this.inTunnel &&
      grid[twoBelowIndex] instanceof Sand &&
      around(twoBelowIndex).every((i) => grid[i] instanceof Sand) &&
      Math.random() > 0.99
    ) {
      grid[belowIndex] = factory(MaterialType.Tunnel)
      grid[twoBelowIndex] = grid[index]
      grid[index] = factory(MaterialType.Air)
      this.diggingTunnel = true
      this.inTunnel = true
      return
    }

    if (this.diggingTunnel && this.inTunnel) {
      const indices = indicesNextTo(index).filter(
        (i) =>
          grid[i] instanceof Sand &&
          around(i).every((i) => !(grid[i] instanceof Air))
      )
      if (indices.length === 0) {
        this.diggingTunnel = false
        return
      }
      const random = randomFromArray(indices)
      grid[random] = grid[index]
      grid[index] = factory(MaterialType.Tunnel)
    }

    if (!this.diggingTunnel && this.inTunnel) {
      const indices = around(index).filter(
        (i) => grid[i] instanceof Tunnel || grid[i] instanceof Air
      )
      if (indices.length === 0) return
      const random = randomFromArray(indices)
      if (grid[random] instanceof Air) {
        grid[random] = grid[index]
        grid[index] = factory(MaterialType.Tunnel)
        this.inTunnel = false
      } else {
        swap(grid, index, random)
      }

      return
    }

    const indices = [
      left(index),
      right(index),
      upLeft(index),
      upRight(index),
      downLeft(index),
      downRight(index)
    ].filter((i) => grid[i] instanceof Air && !(grid[below(i)] instanceof Air))

    if (indices.length > 0) {
      swap(grid, index, randomFromArray(indices))
      return
    }
  }

  color(): Color {
    return [242, 84, 89]
  }

  receiveHeat(change: number, grid: Material[], currentIndex: number) {
    this.temperature += change

    if (this.temperature > 60) {
      grid[currentIndex] = factory(
        this.inTunnel ? MaterialType.Tunnel : MaterialType.Air
      )
    }
  }
}
