import { MovableSolid } from '../Material'
import { Color } from '../../types'

export class Sand extends MovableSolid {
  color(): Color {
    return [240, 230, 140]
  }
}
