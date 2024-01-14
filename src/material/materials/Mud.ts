import { MovableSolid, ThermallyConductive } from '../Material'
import { Color } from '../../types'
import { Grid } from '../../grid/grid'
import { MaterialType } from '../materialType'

export class Mud extends MovableSolid implements ThermallyConductive {
  public temperature = 30
  color(): Color {
    return [85, 30, 0]
  }
  receiveHeat(temperatureChange: number, grid: Grid, currentIndex: number) {
    this.temperature += temperatureChange
    if (this.temperature > 100) {
      grid.replaceWith(currentIndex, MaterialType.Dirt)
    }
  }
}
