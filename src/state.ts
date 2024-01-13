import { WIDTH, HEIGHT } from './constants'
import { Element, ElementType, elementFactory } from './elements'
import { toIndex } from './grid'

const createEmptyGrid = (): Element[] =>
  Array.from({ length: WIDTH * HEIGHT }, () => elementFactory(ElementType.Air))

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
  for (let i = 0; i < grid.length; i++) {
    const element = grid[i]
    element.next(nextState, i)
  }

  return nextState
}
