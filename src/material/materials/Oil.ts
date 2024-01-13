import { Liquid, ThermallyConductive, Material } from '../Material'
import { MaterialType, factory } from '../materialType'
import { Color } from '../../types'

export class Oil extends Liquid implements ThermallyConductive {
  public density: number = 5
  public fluidity: number = 3
  public temperature: number = 10
  color(): Color {
    return [90, 0, 90]
  }
  suppressFire() {
    return 10
  }
  receiveHeat(change: number, grid: Material[], currentPosition: number) {
    this.temperature += change
    if (this.temperature >= 100) {
      grid[currentPosition] = factory(MaterialType.Fire)
    }
  }
}
