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

interface ThermallyConductive {
  receiveHeat: (
    temperatureChange: number,
    grid: Element[],
    currentIndex: number
  ) => void
}

interface Extinguisher {
  suppressFire: () => number
}

const isThermallyConductive = <T extends {}>(
  e: T
): e is ThermallyConductive & T => {
  return 'receiveHeat' in e
}

const isExtinguisher = <T extends {}>(e: T): e is Extinguisher & T => {
  return 'suppressFire' in e
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

export class Water extends Liquid implements Extinguisher, ThermallyConductive {
  public density: number = 10
  public temperature: number = 10
  color(): Color {
    return [0, 0, 200]
  }
  suppressFire() {
    return 30
  }
  receiveHeat(change: number, grid: Element[], currentPosition: number) {
    this.temperature += change
    if (this.temperature >= 100) {
      grid[currentPosition] = elementFactory(ElementType.WaterVapor)
    }
  }
}

export class Oil extends Liquid implements ThermallyConductive {
  public density: number = 5
  public fluidity: number = 3
  public temperature: number = 10
  color(): Color {
    return [90, 0, 90]
  }
  suppressFire() {
    return 10
  }
  receiveHeat(change: number, grid: Element[], currentPosition: number) {
    this.temperature += change
    if (this.temperature >= 100) {
      grid[currentPosition] = elementFactory(ElementType.Fire)
    }
  }
}

export class Ant extends LivingBeing implements ThermallyConductive {
  private diggingTunnel: boolean = false
  private inTunnel: boolean = false
  private temperature = 30

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

    if (around(index).every((i) => grid[i] instanceof Ant)) {
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

  receiveHeat(change: number, grid: Element[], currentIndex: number) {
    this.temperature += change

    if (this.temperature > 60) {
      grid[currentIndex] = elementFactory(
        this.inTunnel ? ElementType.Tunnel : ElementType.Air
      )
    }
  }
}

export class Tunnel extends ImmovableSolid {
  color(): Color {
    return [200, 190, 100]
  }
}

export class WaterVapor
  extends Gas
  implements Extinguisher, ThermallyConductive
{
  public temperature = 200
  color(): Color {
    return [217, 217, 253]
  }
  suppressFire() {
    return 30
  }

  next(grid: Element[], index: number): void {
    this.receiveHeat(-(Math.random() * 2), grid, index)
    if (this.temperature < 0) return

    super.next(grid, index)
  }

  receiveHeat(
    temperatureChange: number,
    grid: Element[],
    currentIndex: number
  ) {
    this.temperature += temperatureChange
    if (this.temperature > 200) {
      this.temperature = 200
    } else if (this.temperature < 0) {
      grid[currentIndex] = elementFactory(ElementType.Water)
      return
    }
  }
}

export class Fire extends MovableSolid {
  public lifeCount: number = 100
  color(): Color {
    return [255, 0, 0]
  }
  next(grid: Element[], index: number) {
    const indicesAround = around(index)
    const elementsAround = indicesAround.map((i) => [i, grid[i]] as const)
    const heatUpTargets = elementsAround.filter(([_, element]) =>
      isThermallyConductive(element)
    )

    heatUpTargets.forEach(
      ([i, e]) =>
        Math.random() > 0.4 &&
        (e as unknown as ThermallyConductive).receiveHeat(10, grid, i)
    )

    const extinguishingNeighbors = elementsAround.filter(isExtinguisher)
    for (const element of extinguishingNeighbors) {
      this.lifeCount -= element.suppressFire()
    }

    this.lifeCount -= Math.random() * 5
    if (this.lifeCount <= 0) {
      grid[index] = elementFactory(ElementType.Air)
      return
    }

    const moveTarget = randomFromArray(
      indicesAround.filter((i) => isAir(grid, i))
    )

    if (!moveTarget) return
    swap(grid, moveTarget, index)
  }
}

export class Bomb extends MovableSolid {
  fallLastFrame: boolean = false
  color(): Color {
    return [50, 80, 50]
  }
  private explode(grid: Element[], index: number) {
    const indicesAround = around(index)
    for (const index of indicesAround) {
      grid[index] = elementFactory(ElementType.Fire)
    }
    grid[index] = elementFactory(ElementType.Fire)
  }

  next(grid: Element[], index: number): void {
    const belowIndex = below(index)
    const indicesAround = around(index)
    const fireAround = indicesAround.some((i) => grid[i] instanceof Fire)
    if (fireAround) {
      this.explode(grid, index)
      return
    }

    if (isAir(grid, belowIndex)) {
      this.fallLastFrame = true
    } else {
      if (this.fallLastFrame && !(grid[belowIndex] instanceof Bomb)) {
        this.explode(grid, index)
        return
      }
      this.fallLastFrame = false
    }
    super.next(grid, index)
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
  Oil = 'oil',
  Fire = 'fire',
  Bomb = 'bomb'
}

const AIR = new Air()
const STONE = new Stone()
const WATER = new Water()
const SAND = new Sand()
const TUNNEL = new Tunnel()
const WATER_VAPOR = new WaterVapor()
const OIL = new Oil()
const FIRE = new Fire()

export const isAir = (grid: Element[], index: number) => grid[index] === AIR

const ELEMENT_FACTORIES: Record<ElementType, () => Element> = {
  [ElementType.Air]: () => AIR,
  [ElementType.Stone]: () => STONE,
  [ElementType.Sand]: () => SAND,
  [ElementType.Water]: () => new Water(),
  [ElementType.Ant]: () => new Ant(),
  [ElementType.Tunnel]: () => TUNNEL,
  [ElementType.WaterVapor]: () => new WaterVapor(),
  [ElementType.Oil]: () => OIL,
  [ElementType.Fire]: () => new Fire(),
  [ElementType.Bomb]: () => new Bomb()
}

export const elementFactory = (type: ElementType) => {
  return ELEMENT_FACTORIES[type]()
}
