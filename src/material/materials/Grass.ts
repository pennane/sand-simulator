import { MovableSolid, ThermallyConductive } from '../Material'
import { Color } from '../../types'
import { Grid } from '../../grid/grid'
import { MaterialType } from '../materialType'
import { Air } from './Air'
import { Wood } from './Wood'

export class Grass extends MovableSolid implements ThermallyConductive {
  temperature = 30
  color(): Color {
    return [63, 154, 16]
  }
  receiveHeat(temperatureChange: number, grid: Grid, currentIndex: number) {
    this.temperature += temperatureChange
    if (this.temperature > 200) {
      grid.replaceWith(currentIndex, MaterialType.Dirt)
    }
  }

  next(grid: Grid, index: number): void {
    const [aboveIndex, aboveElement] = grid.above(index)
    if (!(aboveElement instanceof Air) && Math.random() > 0.99) {
      grid.replaceWith(index, MaterialType.Dirt)
      return
    }
    const [_, belowElement] = grid.below(index)
    const around = grid.around(index)
    if (
      Math.random() > 0.99 &&
      Math.random() > 0.99 &&
      !(belowElement instanceof Air) &&
      aboveElement instanceof Air &&
      around.every((p) => !(p[1] instanceof Wood))
    ) {
      grid.replaceWith(aboveIndex, MaterialType.Wood)
      grid.replaceWith(index, MaterialType.Dirt)
      return
    }
    super.next(grid, index)
  }
}
