import {
  Liquid,
  Extinguisher,
  ThermallyConductive,
  Material
} from '../Material'
import { MaterialType, factory } from '../materialType'
import { Color } from '../../types'

export class Water extends Liquid implements Extinguisher, ThermallyConductive {
  public density: number = 10
  public temperature: number = 10
  color(): Color {
    return [0, 0, 200]
  }
  suppressFire() {
    return 30
  }
  receiveHeat(change: number, grid: Material[], currentPosition: number) {
    this.temperature += change
    if (this.temperature >= 100) {
      grid[currentPosition] = factory(MaterialType.WaterVapor)
    }
  }
}
