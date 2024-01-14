import { randomFromArray } from '../../lib'
import { MaterialType } from '../materialType'
import { Color } from '../../types'
import { Air } from './Air'
import { Sand } from './Sand'
import { Tunnel } from './Tunnel'
import { Grid } from '../../grid/grid'
import { LivingBeing, ThermallyConductive, Liquid } from '../Material'

export class Ant extends LivingBeing implements ThermallyConductive {
  private diggingTunnel: boolean = false
  private inTunnel: boolean = false
  private temperature = 30

  next(grid: Grid, index: number): void {
    const belowIndex = Grid.belowIndex(index)

    if (grid.get(belowIndex) instanceof Air) {
      grid.swap(index, belowIndex)
      return
    }

    if (
      grid.get(Grid.aboveIndex(index)) instanceof Liquid ||
      grid.get(Grid.belowIndex(index)) instanceof Liquid
    ) {
      grid.replaceWith(index, MaterialType.Air)
    }

    if (Grid.indicesAround(index).every((i) => grid.get(i) instanceof Ant)) {
      grid.replaceWith(index, MaterialType.Air)
    }

    if (Math.random() > 0.1) return

    if (
      !this.inTunnel &&
      grid.get(belowIndex) instanceof Tunnel &&
      Math.random() > 0.3
    ) {
      grid.replaceWith(belowIndex, grid.get(index))
      grid.replaceWith(index, MaterialType.Air)
      this.inTunnel = true
      return
    }

    const twoBelowIndex = Grid.belowIndex(belowIndex)
    if (
      !this.diggingTunnel &&
      !this.inTunnel &&
      grid.get(twoBelowIndex) instanceof Sand &&
      Grid.indicesAround(twoBelowIndex).every(
        (i) => grid.get(i) instanceof Sand
      ) &&
      Math.random() > 0.99
    ) {
      grid.replaceWith(belowIndex, MaterialType.Tunnel)
      grid.replaceWith(twoBelowIndex, grid.get(index))
      grid.replaceWith(index, MaterialType.Air)

      this.diggingTunnel = true
      this.inTunnel = true
      return
    }

    if (this.diggingTunnel && this.inTunnel) {
      const indices = Grid.indicesNextTo(index).filter(
        (i) =>
          grid.get(i) instanceof Sand &&
          Grid.indicesAround(i).every((i) => !(grid.get(i) instanceof Air))
      )
      if (indices.length === 0) {
        this.diggingTunnel = false
        return
      }
      const random = randomFromArray(indices)
      grid.replaceWith(random, index)
      grid.replaceWith(index, MaterialType.Tunnel)
    }

    if (!this.diggingTunnel && this.inTunnel) {
      const indices = Grid.indicesAround(index).filter((i) => {
        const element = grid.get(i)
        return element instanceof Air || element instanceof Tunnel
      })
      if (indices.length === 0) return
      const random = randomFromArray(indices)
      if (grid.get(random) instanceof Air) {
        grid.replaceWith(random, index)
        grid.replaceWith(index, MaterialType.Tunnel)
        this.inTunnel = false
      } else {
        grid.swap(index, random)
      }

      return
    }

    const indices = [
      Grid.leftIndex(index),
      Grid.rightIndex(index),
      Grid.upLeftIndex(index),
      Grid.upRighIndex(index),
      Grid.downLeftIndex(index),
      Grid.downRightIndex(index)
    ].filter(
      (i) =>
        grid.get(i) instanceof Air &&
        !(grid.get(Grid.belowIndex(i)) instanceof Air)
    )

    if (indices.length > 0) {
      grid.swap(index, randomFromArray(indices))
      return
    }
  }

  color(): Color {
    return [242, 84, 89]
  }

  receiveHeat(change: number, grid: Grid, currentIndex: number) {
    this.temperature += change

    if (this.temperature > 60) {
      grid.replaceWith(
        currentIndex,
        this.inTunnel ? MaterialType.Tunnel : MaterialType.Air
      )
    }
  }
}
