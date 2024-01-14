import { MovableSolid } from '../Material'
import { Color } from '../../types'
import { Grid } from '../../grid/grid'
import { MaterialType } from '../materialType'
import { Water } from './Water'

import { Grass } from './Grass'
import { Air } from './Air'

export class Dirt extends MovableSolid {
  color(): Color {
    return [154, 74, 17]
  }

  next(grid: Grid, index: number): void {
    const around = grid.around(index)
    const waterAround = around.filter((pair) => pair[1] instanceof Water)
    const shouldConvert = Math.random() > 0.99
    const [_, above] = grid.above(index)
    if (shouldConvert && waterAround.length === 1 && above instanceof Air) {
      grid.replaceWith(index, MaterialType.Grass)
      return
    }
    if (shouldConvert && waterAround.length > 1) {
      grid.replaceWith(index, MaterialType.Mud)
      return
    }

    if (
      shouldConvert &&
      above instanceof Air &&
      around.some((p) => p[1] instanceof Grass)
    ) {
      grid.replaceWith(index, MaterialType.Grass)
      return
    }
    super.next(grid, index)
  }
}
