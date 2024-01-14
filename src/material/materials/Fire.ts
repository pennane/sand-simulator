import {
  MovableSolid,
  isThermallyConductive,
  ThermallyConductive,
  isExtinguisher
} from '../Material'
import { randomFromArray } from '../../lib'
import { MaterialType } from '../materialType'
import { Color } from '../../types'
import { Air } from './Air'
import { Grid } from '../../grid/grid'

export class Fire extends MovableSolid {
  public lifeCount: number = 100
  color(): Color {
    return [255, 0, 0]
  }
  next(grid: Grid, index: number) {
    const indicesAround = Grid.indicesAround(index)
    const elementsAround = indicesAround.map((i) => [i, grid.get(i)] as const)
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
      grid.replaceWith(index, MaterialType.Air)
      return
    }

    const moveTarget = randomFromArray(
      indicesAround.filter((i) => grid.get(i) instanceof Air)
    )

    if (!moveTarget) return
    grid.swap(moveTarget, index)
  }
}
