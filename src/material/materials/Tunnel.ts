import { ImmovableSolid } from '../Material'
import { Color } from '../../types'

export class Tunnel extends ImmovableSolid {
  color(): Color {
    return [200, 190, 100]
  }
}
