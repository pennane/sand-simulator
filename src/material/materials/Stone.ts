import { ImmovableSolid } from '../Material'
import { Color } from '../../types'

export class Stone extends ImmovableSolid {
  next() {}
  color(): Color {
    return [70, 70, 70]
  }
}
