import {
  MovableSolid,
  Material,
  isThermallyConductive,
  ThermallyConductive,
  isExtinguisher
} from '../Material'
import { around, swap } from '../../grid'
import { randomFromArray } from '../../lib'
import { MaterialType, factory } from '../materialType'
import { Color } from '../../types'
import { Air } from './Air'

export class Fire extends MovableSolid {
  public lifeCount: number = 100
  color(): Color {
    return [255, 0, 0]
  }
  next(grid: Material[], index: number) {
    const indicesAround = around(index)
    const elementsAround = indicesAround.map((i) => [i, grid[i]] as const)
    const heatUpTargets = elementsAround.filter(([_, element]) =>
      isThermallyConductive(element)
    )

    heatUpTargets.forEach(
      ([i, e]) =>
        Math.random() > 0.4 &&
        (e as unknown as ThermallyConductive).receiveHeat(10, grid, i)
    )

    const extinguishingNeighbors = elementsAround.filter(isExtinguisher)
    for (const element of extinguishingNeighbors) {
      this.lifeCount -= element.suppressFire()
    }

    this.lifeCount -= Math.random() * 5
    if (this.lifeCount <= 0) {
      grid[index] = factory(MaterialType.Air)
      return
    }

    const moveTarget = randomFromArray(
      indicesAround.filter((i) => grid[i] instanceof Air)
    )

    if (!moveTarget) return
    swap(grid, moveTarget, index)
  }
}
