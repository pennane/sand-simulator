import {
  above,
  around,
  below,
  downLeft,
  downRight,
  indicesNextTo,
  left,
  right,
  swap,
  upLeft,
  upRight
} from './grid'
import { randomFromArray } from './lib'
import { Color } from './types'

export abstract class Element {
  constructor() {}
  abstract next(grid: Element[], index: number): void
  abstract color(): Color
}

abstract class ImmovableSolid extends Element {
  next() {}
}

abstract class MovableSolid extends Element {
  public density = 20
  next(grid: Element[], index: number): void {
    const belowIndex = below(index)
    const elementBelow = grid[belowIndex]

    if (
      isAir(grid, belowIndex) ||
      ('density' in elementBelow &&
        typeof elementBelow.density === 'number' &&
        elementBelow.density < this.density)
    ) {
      swap(grid, index, belowIndex)
      return
    }

    const indices = [downLeft(index), downRight(index)].filter((i) =>
      isAir(grid, i)
    )
    if (indices.length > 0) {
      swap(grid, index, randomFromArray(indices))
      return
    }
  }
}

abstract class Gas extends Element {
  public density: number = 1
  public diffusionChance: number = 0.22
  public riseChance: number = 0.5

  private canMoveTo(grid: Element[], index: number) {
    const element = grid[index]
    return (
      isAir(grid, index) ||
      ('density' in element &&
        typeof element.density === 'number' &&
        element.density > this.density)
    )
  }

  next(grid: Element[], index: number): void {
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

abstract class Liquid extends Element {
  public density = 10
  public fluidity = 5

  next(grid: Element[], index: number): void {
    const belowIndex = below(index)

    if (isAir(grid, belowIndex)) {
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
      [left, right].filter((f) => isAir(grid, f(index)))
    )

    if (!dirFunc) return
    let testedSuccesfully = dirFunc(index)
    for (let i = 1; i < this.fluidity; i++) {
      const nextTexted = dirFunc(testedSuccesfully)
      if (isAir(grid, nextTexted)) {
        testedSuccesfully = nextTexted
      } else {
        break
      }
    }
    swap(grid, index, testedSuccesfully)
  }
}

abstract class LivingBeing extends Element {}

export class Air extends Element {
  next() {}
  color(): Color {
    return [0, 0, 0]
  }
}

export class Sand extends MovableSolid {
  color(): Color {
    return [240, 230, 140]
  }
}

export class Stone extends ImmovableSolid {
  next() {}
  color(): Color {
    return [70, 70, 70]
  }
}

export class Water extends Liquid {
  public density: number = 10
  color(): Color {
    return [0, 0, 200]
  }
}

export class Oil extends Liquid {
  public density: number = 5
  public fluidity: number = 3
  color(): Color {
    return [90, 0, 90]
  }
}

export class Ant extends LivingBeing {
  private diggingTunnel: boolean = false
  private inTunnel: boolean = false

  next(grid: Element[], index: number): void {
    const belowIndex = below(index)

    if (isAir(grid, belowIndex)) {
      swap(grid, index, belowIndex)
      return
    }

    if (
      grid[belowIndex] instanceof Liquid ||
      grid[above(index)] instanceof Liquid
    ) {
      grid[index] = elementFactory(ElementType.Air)
    }

    if (Math.random() > 0.1) return

    if (
      !this.inTunnel &&
      grid[belowIndex] instanceof Tunnel &&
      Math.random() > 0.3
    ) {
      grid[belowIndex] = grid[index]
      grid[index] = elementFactory(ElementType.Air)
      this.inTunnel = true
      return
    }

    const twoBelowIndex = below(belowIndex)
    if (
      !this.diggingTunnel &&
      !this.inTunnel &&
      grid[twoBelowIndex] instanceof Sand &&
      around(twoBelowIndex).every((i) => grid[i] instanceof Sand) &&
      Math.random() > 0.99
    ) {
      grid[belowIndex] = elementFactory(ElementType.Tunnel)
      grid[twoBelowIndex] = grid[index]
      grid[index] = elementFactory(ElementType.Air)
      this.diggingTunnel = true
      this.inTunnel = true
      return
    }

    if (this.diggingTunnel && this.inTunnel) {
      const indices = indicesNextTo(index).filter(
        (i) =>
          grid[i] instanceof Sand && around(i).every((i) => !isAir(grid, i))
      )
      if (indices.length === 0) {
        this.diggingTunnel = false
        return
      }
      const random = randomFromArray(indices)
      grid[random] = grid[index]
      grid[index] = elementFactory(ElementType.Tunnel)
    }

    if (!this.diggingTunnel && this.inTunnel) {
      const indices = around(index).filter(
        (i) => grid[i] instanceof Tunnel || isAir(grid, i)
      )
      if (indices.length === 0) return
      const random = randomFromArray(indices)
      if (grid[random] instanceof Air) {
        grid[random] = grid[index]
        grid[index] = elementFactory(ElementType.Tunnel)
        this.inTunnel = false
      } else {
        swap(grid, index, random)
      }

      return
    }

    const indices = [
      left(index),
      right(index),
      upLeft(index),
      upRight(index),
      downLeft(index),
      downRight(index)
    ].filter((i) => isAir(grid, i) && !isAir(grid, below(i)))

    if (indices.length > 0) {
      swap(grid, index, randomFromArray(indices))
      return
    }
  }

  color(): Color {
    return [242, 84, 89]
  }
}

export class Tunnel extends ImmovableSolid {
  color(): Color {
    return [200, 190, 100]
  }
}

export class WaterVapor extends Gas {
  color(): Color {
    return [217, 217, 253]
  }
}

export enum ElementType {
  Air = 'air',
  Stone = 'stone',
  Sand = 'sand',
  Water = 'water',
  Ant = 'ant',
  Tunnel = 'tunnel',
  WaterVapor = 'watervapor',
  Oil = 'oil'
}

const AIR = new Air()
const STONE = new Stone()
const WATER = new Water()
const SAND = new Sand()
const TUNNEL = new Tunnel()
const WATER_VAPOR = new WaterVapor()
const OIL = new Oil()

export const isAir = (grid: Element[], index: number) => grid[index] === AIR

const ELEMENT_FACTORIES: Record<ElementType, () => Element> = {
  [ElementType.Air]: () => AIR,
  [ElementType.Stone]: () => STONE,
  [ElementType.Sand]: () => SAND,
  [ElementType.Water]: () => WATER,
  [ElementType.Ant]: () => new Ant(),
  [ElementType.Tunnel]: () => TUNNEL,
  [ElementType.WaterVapor]: () => WATER_VAPOR,
  [ElementType.Oil]: () => OIL
}

export const elementFactory = (type: ElementType) => {
  return ELEMENT_FACTORIES[type]()
}
