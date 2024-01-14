import { Grid } from '../../grid/grid'
import { randomFromArray } from '../../lib'
import { Color } from '../../types'
import {
  Liquid,
  Material,
  ThermallyConductive,
  isThermallyConductive
} from '../Material'
import { MaterialType } from '../materialType'
import { Air } from './Air'

export class Lava extends Liquid {
  public density: number = 20
  public fluidity: number = 1
  color(): Color {
    return [200, 50, 50]
  }
  next(grid: Grid, index: number): void {
    const around = grid.around(index)
    const createFire = Math.random() > 0.999
    const warmNeighbor = Math.random() > 0.9
    if (createFire) {
      const air = randomFromArray(around.filter((p) => p[1] instanceof Air))
      if (air) {
        grid.replaceWith(air[0], MaterialType.Fire)
      }
    }
    if (warmNeighbor) {
      const warmable = randomFromArray(
        around.filter((p): p is [number, ThermallyConductive & Material] =>
          isThermallyConductive(p[1])
        )
      )
      if (warmable) {
        warmable[1].receiveHeat(20, grid, warmable[0])
      }
    }

    super.next(grid, index)
  }
}
