import { Material } from './Material'
import { Air } from './materials/Air'
import { Ant } from './materials/Ant'
import { AtomBomb } from './materials/AtomBomb'
import { Bomb } from './materials/Bomb'
import { Dirt } from './materials/Dirt'
import { Fire } from './materials/Fire'
import { Grass } from './materials/Grass'
import { Mud } from './materials/Mud'
import { Oil } from './materials/Oil'
import { Sand } from './materials/Sand'
import { Stone } from './materials/Stone'
import { Tunnel } from './materials/Tunnel'
import { Water } from './materials/Water'
import { WaterVapor } from './materials/WaterVapor'
import { Wood } from './materials/Wood'

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
  AtomBomb = 'atombomb',
  Grass = 'grass',
  Dirt = 'dirt',
  Mud = 'mud',
  Wood = 'wood'
}

const AIR = new Air()
const STONE = new Stone()
const SAND = new Sand()
const TUNNEL = new Tunnel()
const OIL = new Oil()
const GRASS = new Grass()
const DIRT = new Dirt()
const MUD = new Mud()

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
  [MaterialType.AtomBomb]: () => new AtomBomb(),
  [MaterialType.Grass]: () => GRASS,
  [MaterialType.Dirt]: () => DIRT,
  [MaterialType.Mud]: () => MUD,
  [MaterialType.Wood]: () => new Wood()
}
export const factory = (type: MaterialType) => {
  return ELEMENT_FACTORIES[type]()
}
