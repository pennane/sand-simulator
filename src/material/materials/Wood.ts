import { ImmovableSolid, ThermallyConductive } from '../Material'
import { Color } from '../../types'
import { Grid } from '../../grid/grid'
import { MaterialType } from '../materialType'
import { Air } from './Air'

export class Wood extends ImmovableSolid implements ThermallyConductive {
  temperature = 30
  woodAbove = false
  woodBelow: number | null = null

  color(): Color {
    return [82, 64, 38]
  }
  receiveHeat(temperatureChange: number, grid: Grid, currentIndex: number) {
    this.temperature += temperatureChange
    if (this.temperature > 100) {
      grid.replaceWith(
        currentIndex,
        Math.random() > 0.3 ? MaterialType.Fire : MaterialType.Air
      )
    }
  }

  next(grid: Grid, index: number): void {
    if (this.woodBelow === null) {
      let below = grid.below(index)
      this.woodBelow = 0
      while (below[1] instanceof Wood) {
        this.woodBelow++
        const newBelow = grid.below(below[0])
        if (newBelow[0] === below[0]) break
        below = newBelow
      }
    }
    if (!this.woodAbove) {
      const above = grid.above(index)
      if (above[1] instanceof Wood) {
        this.woodAbove = true
      } else if (
        Math.random() > 0.99 &&
        this.woodBelow < 5 &&
        above[1] instanceof Air
      ) {
        grid.replaceWith(above[0], MaterialType.Wood)
        this.woodAbove = true
      }
    }
  }
}
