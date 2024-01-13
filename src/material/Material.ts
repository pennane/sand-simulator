import { Air } from './materials/Air'
import {
  below,
  swap,
  downLeft,
  downRight,
  left,
  right,
  around,
  above
} from '../grid'
import { randomFromArray } from '../lib'
import { Color } from '../types'

export interface ThermallyConductive {
  receiveHeat: (
    temperatureChange: number,
    grid: Material[],
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
  abstract next(grid: Material[], index: number): void
  abstract color(): Color
}

export abstract class ImmovableSolid extends Material {
  next() {}
}

export abstract class MovableSolid extends Material {
  public density = 20
  next(grid: Material[], index: number): void {
    const belowIndex = below(index)
    const elementBelow = grid[belowIndex]

    if (
      grid[belowIndex] instanceof Air ||
      ('density' in elementBelow &&
        typeof elementBelow.density === 'number' &&
        elementBelow.density < this.density)
    ) {
      swap(grid, index, belowIndex)
      return
    }

    const indices = [downLeft(index), downRight(index)].filter(
      (i) => grid[i] instanceof Air
    )
    if (indices.length > 0) {
      swap(grid, index, randomFromArray(indices))
      return
    }
  }
}

export abstract class Liquid extends Material {
  public density = 10
  public fluidity = 5

  next(grid: Material[], index: number): void {
    const belowIndex = below(index)

    if (grid[belowIndex] instanceof Air) {
      swap(grid, index, belowIndex)
      return
    }

    const liquidIndex = [below, downLeft, downRight, left, right]
      .map((f) => f(index))
      .find((i) => {
        const e = grid[i]
        if (e instanceof Liquid) {
          return e.density < this.density
        }
        return false
      })
    if (liquidIndex) {
      swap(grid, liquidIndex, index)
    }

    const dirFunc = randomFromArray(
      [left, right].filter((f) => grid[f(index)] instanceof Air)
    )

    if (!dirFunc) return
    let testedSuccesfully = dirFunc(index)
    for (let i = 1; i < this.fluidity; i++) {
      const nextTexted = dirFunc(testedSuccesfully)
      if (grid[nextTexted] instanceof Air) {
        testedSuccesfully = nextTexted
      } else {
        break
      }
    }
    swap(grid, index, testedSuccesfully)
  }
}

export abstract class LivingBeing extends Material {}

export abstract class Gas extends Material {
  public density: number = 1
  public diffusionChance: number = 0.22
  public riseChance: number = 0.5

  private canMoveTo(grid: Material[], index: number) {
    const element = grid[index]
    return (
      grid[index] instanceof Air ||
      ('density' in element &&
        typeof element.density === 'number' &&
        element.density > this.density)
    )
  }

  next(grid: Material[], index: number): void {
    const possibleNeighbors = around(index).filter((i) =>
      this.canMoveTo(grid, i)
    )
    if (possibleNeighbors.length === 0) return

    if (Math.random() < this.diffusionChance && possibleNeighbors.length > 0) {
      const randomEmptyNeighbor = randomFromArray(possibleNeighbors)
      swap(grid, index, randomEmptyNeighbor)
      return
    }

    const aboveIndex = above(index)

    if (Math.random() < this.riseChance && this.canMoveTo(grid, aboveIndex)) {
      swap(grid, index, aboveIndex)
      return
    }
  }
}
