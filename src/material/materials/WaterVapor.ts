import { Gas, Extinguisher, ThermallyConductive, Material } from '../Material'
import { factory, MaterialType } from '../materialType'
import { Color } from '../../types'

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

  next(grid: Material[], index: number): void {
    this.receiveHeat(-(Math.random() * 2), grid, index)
    if (this.temperature < 0) return

    super.next(grid, index)
  }

  receiveHeat(
    temperatureChange: number,
    grid: Material[],
    currentIndex: number
  ) {
    this.temperature += temperatureChange
    if (this.temperature > 200) {
      this.temperature = 200
    } else if (this.temperature < 0) {
      grid[currentIndex] = factory(MaterialType.Water)
      return
    }
  }
}
