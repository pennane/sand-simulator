import { Material } from './Material'
import { Air } from './materials/Air'
import { Ant } from './materials/Ant'
import { AtomBomb } from './materials/AtomBomb'
import { Bomb } from './materials/Bomb'
import { Fire } from './materials/Fire'
import { Oil } from './materials/Oil'
import { Sand } from './materials/Sand'
import { Stone } from './materials/Stone'
import { Tunnel } from './materials/Tunnel'
import { Water } from './materials/Water'
import { WaterVapor } from './materials/WaterVapor'

export enum MaterialType {
  Air = 'air',
  Stone = 'stone',
  Sand = 'sand',
  Water = 'water',
  Ant = 'ant',
  Tunnel = 'tunnel',
  WaterVapor = 'watervapor',
  Oil = 'oil',
  Fire = 'fire',
  Bomb = 'bomb',
  AtomBomb = 'atombomb'
}

const AIR = new Air()
const STONE = new Stone()
const SAND = new Sand()
const TUNNEL = new Tunnel()
const OIL = new Oil()

const ELEMENT_FACTORIES: Record<MaterialType, () => Material> = {
  [MaterialType.Air]: () => AIR,
  [MaterialType.Stone]: () => STONE,
  [MaterialType.Sand]: () => SAND,
  [MaterialType.Water]: () => new Water(),
  [MaterialType.Ant]: () => new Ant(),
  [MaterialType.Tunnel]: () => TUNNEL,
  [MaterialType.WaterVapor]: () => new WaterVapor(),
  [MaterialType.Oil]: () => OIL,
  [MaterialType.Fire]: () => new Fire(),
  [MaterialType.Bomb]: () => new Bomb(),
  [MaterialType.AtomBomb]: () => new AtomBomb()
}
export const factory = (type: MaterialType) => {
  return ELEMENT_FACTORIES[type]()
}
