import { Material } from '../Material'
import { Color } from '../../types'

export class Air extends Material {
  next() {}
  color(): Color {
    return [0, 0, 0]
  }
}
