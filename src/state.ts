import { WIDTH, HEIGHT, AIR, STONE, SAND, WATER } from './constants'
import { toIndex, below, downLeft, downRight, left, right, swap } from './grid'
import { Pixel } from './types'

const createEmptyGrid = (): Pixel[] =>
  Array.from({ length: WIDTH * HEIGHT }, () => AIR)

export const createDefaultGrid = () => {
  const grid = createEmptyGrid()
  const from = toIndex({ x: 0, y: HEIGHT - 1 })
  const to = toIndex({ x: WIDTH - 1, y: HEIGHT - 1 })
  grid.fill(STONE, from, to)
  return grid
}

export const nextState = (grid: Pixel[]): Pixel[] => {
  const nextState = grid.slice()
  const handled: boolean[] = new Array(nextState.length)
  for (let index = 0; index < grid.length; index++) {
    if (handled[index]) continue
    const pixel = nextState[index]

    switch (pixel) {
      case AIR: {
        continue
      }
      case STONE: {
        handled[index] = true
        break
      }
      case SAND: {
        let next = below(index)
        if (nextState[next] === AIR || nextState[next] === WATER) {
          swap(nextState, index, next)
          handled[next] = true
          break
        }
        next = downLeft(index)
        if (nextState[next] === AIR) {
          swap(nextState, index, next)
          handled[next] = true
          break
        }
        next = downRight(index)
        if (nextState[next] === AIR) {
          swap(nextState, index, next)
          handled[next] = true
        }
        break
      }
      case WATER: {
        let next = below(index)
        if (nextState[next] === AIR) {
          swap(nextState, index, next)
          handled[next] = true
          break
        }
        let nextRight = right(index)
        let nextLeft = left(index)
        if (nextState[nextRight] === AIR && nextState[nextLeft] === AIR) {
          {
            const random = Math.random() > 0.5 ? nextLeft : nextRight
            swap(nextState, index, random)
            handled[random] = true
            break
          }
        }
        if (nextState[nextLeft] === AIR) {
          swap(nextState, index, nextLeft)
          handled[nextLeft] = true
          break
        }
        if (nextState[nextRight] === AIR) {
          swap(nextState, index, nextRight)
          handled[nextRight] = true
          break
        }
        break
      }
    }
    handled[index] = true
  }
  return nextState
}
