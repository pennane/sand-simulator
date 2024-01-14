import { Air } from './materials/Air'
import { randomFromArray } from '../lib'
import { Color } from '../types'
import { Grid } from '../grid/grid'

export interface ThermallyConductive {
  receiveHeat: (
    temperatureChange: number,
    grid: Grid,
    currentIndex: number
  ) => void
}

export interface Extinguisher {
  suppressFire: () => number
}

export const isThermallyConductive = <T extends {}>(
  e: T
): e is ThermallyConductive & T => {
  return 'receiveHeat' in e
}

export const isExtinguisher = <T extends {}>(e: T): e is Extinguisher & T => {
  return 'suppressFire' in e
}

export abstract class Material {
  constructor() {}
  abstract next(grid: Grid, index: number): void
  abstract color(): Color
}

export abstract class ImmovableSolid extends Material {
  next() {}
}

export abstract class MovableSolid extends Material {
  public density = 20
  next(grid: Grid, index: number): void {
    const [belowIndex, elementBelow] = grid.below(index)
    if (
      elementBelow instanceof Air ||
      ('density' in elementBelow &&
        typeof elementBelow.density === 'number' &&
        elementBelow.density < this.density)
    ) {
      grid.swap(index, belowIndex)
      return
    }

    const indices = [
      Grid.downLeftIndex(index),
      Grid.downRightIndex(index)
    ].filter((i) => grid.get(i) instanceof Air)
    if (indices.length > 0) {
      grid.swap(index, randomFromArray(indices))
      return
    }
  }
}

export abstract class Liquid extends Material {
  public density = 10
  public fluidity = 5

  next(grid: Grid, index: number): void {
    const belowIndex = Grid.belowIndex(index)

    if (grid.get(belowIndex) instanceof Air) {
      grid.swap(index, belowIndex)
      return
    }

    const liquidIndex = [
      Grid.belowIndex,
      Grid.downLeftIndex,
      Grid.downRightIndex,
      Grid.leftIndex,
      Grid.rightIndex
    ]
      .map((f) => f(index))
      .find((i) => {
        const e = grid.get(i)
        if (e instanceof Liquid) {
          return e.density < this.density
        }
        return false
      })
    if (liquidIndex) {
      grid.swap(liquidIndex, index)
    }

    const dirFunc = randomFromArray(
      [Grid.leftIndex, Grid.rightIndex].filter(
        (f) => grid.get(f(index)) instanceof Air
      )
    )

    if (!dirFunc) return
    let testedSuccesfully = dirFunc(index)
    for (let i = 1; i < this.fluidity; i++) {
      const nextTexted = dirFunc(testedSuccesfully)
      if (grid.get(nextTexted) instanceof Air) {
        testedSuccesfully = nextTexted
      } else {
        break
      }
    }
    grid.swap(index, testedSuccesfully)
  }
}

export abstract class LivingBeing extends Material {}

export abstract class Gas extends Material {
  public density: number = 1
  public diffusionChance: number = 0.22
  public riseChance: number = 0.5

  private canMoveTo(grid: Grid, index: number) {
    const element = grid.get(index)
    return (
      element instanceof Air ||
      ('density' in element &&
        typeof element.density === 'number' &&
        element.density > this.density)
    )
  }

  next(grid: Grid, index: number): void {
    const possibleNeighbors = Grid.indicesAround(index).filter((i) =>
      this.canMoveTo(grid, i)
    )
    if (possibleNeighbors.length === 0) return

    if (Math.random() < this.diffusionChance && possibleNeighbors.length > 0) {
      const randomEmptyNeighbor = randomFromArray(possibleNeighbors)
      grid.swap(index, randomEmptyNeighbor)
      return
    }

    const aboveIndex = Grid.aboveIndex(index)

    if (Math.random() < this.riseChance && this.canMoveTo(grid, aboveIndex)) {
      grid.swap(index, aboveIndex)
      return
    }
  }
}
