import { Gas, Extinguisher, ThermallyConductive } from '../Material'
import { MaterialType } from '../materialType'
import { Color } from '../../types'
import { Grid } from '../../grid/grid'

export class WaterVapor
  extends Gas
  implements Extinguisher, ThermallyConductive
{
  public temperature = 200
  color(): Color {
    return [217, 217, 253]
  }
  suppressFire() {
    return 30
  }

  next(grid: Grid, index: number): void {
    this.receiveHeat(-(Math.random() * 2), grid, index)
    if (this.temperature < 0) return

    super.next(grid, index)
  }

  receiveHeat(temperatureChange: number, grid: Grid, currentIndex: number) {
    this.temperature += temperatureChange
    if (this.temperature > 200) {
      this.temperature = 200
    } else if (this.temperature < 0) {
      grid.replaceWith(currentIndex, MaterialType.Water)
      return
    }
  }
}
