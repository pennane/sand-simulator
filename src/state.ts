import { WIDTH, HEIGHT } from './constants'
import { Element, ElementType, elementFactory } from './elements'
import { toIndex } from './grid'

const createEmptyGrid = (): Element[] =>
  Array.from({ length: WIDTH * HEIGHT }, () => elementFactory(ElementType.Air))

const getShuffledArr = <T>(arr: T[]) => {
  const newArr = arr.slice()
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[rand]] = [newArr[rand], newArr[i]]
  }
  return newArr
}

let indices = getShuffledArr(
  Array.from({ length: WIDTH * HEIGHT }, (_, i) => i)
)

export const createDefaultGrid = () => {
  const grid = createEmptyGrid()
  const from = toIndex({ x: 0, y: HEIGHT - 30 })
  const to = toIndex({ x: WIDTH, y: HEIGHT - 1 })
  const air = elementFactory(ElementType.Sand)
  grid.fill(air, from, to)
  return grid
}

export const nextState = (grid: Element[]): Element[] => {
  const nextState = grid.slice()
  indices = getShuffledArr(indices)
  for (const i of indices) {
    const element = grid[i]
    element.next(nextState, i)
  }

  return nextState
}
