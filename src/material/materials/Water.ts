import { Liquid, Extinguisher, ThermallyConductive } from '../Material'
import { MaterialType } from '../materialType'
import { Color } from '../../types'
import { Grid } from '../../grid/grid'

export class Water extends Liquid implements Extinguisher, ThermallyConductive {
  public density: number = 10
  public temperature: number = 10
  color(): Color {
    return [0, 0, 200]
  }
  suppressFire() {
    return 30
  }
  receiveHeat(change: number, grid: Grid, currentPosition: number) {
    this.temperature += change
    if (this.temperature >= 100) {
      grid.replaceWith(currentPosition, MaterialType.WaterVapor)
    }
  }
}
