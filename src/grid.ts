import { WIDTH, HEIGHT } from './constants'
import { Pixel, Point } from './types'

export const toIndex = (point: Point) => point.y * WIDTH + point.x

export const below = (index: number) => {
  const newX = index % WIDTH
  const newY = Math.floor(index / WIDTH) + 1
  return newY >= HEIGHT ? index : newY * WIDTH + newX
}

export const above = (index: number) => {
  const newX = index % WIDTH
  const newY = Math.floor(index / WIDTH) - 1
  return newY < 0 ? index : newY * WIDTH + newX
}

export const left = (index: number) => {
  const newX = (index % WIDTH) - 1
  return newX < 0 ? index : Math.floor(index / WIDTH) * WIDTH + newX
}

export const right = (index: number) => {
  const newX = (index % WIDTH) + 1
  return newX >= WIDTH ? index : Math.floor(index / WIDTH) * WIDTH + newX
}

export const downLeft = (index: number) => {
  const newX = (index % WIDTH) - 1
  const newY = Math.floor(index / WIDTH) + 1
  return newY >= HEIGHT || newX < 0 ? index : newY * WIDTH + newX
}

export const downRight = (index: number) => {
  const newX = (index % WIDTH) + 1
  const newY = Math.floor(index / WIDTH) + 1
  return newY >= HEIGHT || newX >= WIDTH ? index : newY * WIDTH + newX
}

export const upLeft = (index: number) => {
  const newX = (index % WIDTH) - 1
  const newY = Math.floor(index / WIDTH) - 1
  return newY < 0 || newX < 0 ? index : newY * WIDTH + newX
}

export const upRight = (index: number) => {
  const newX = (index % WIDTH) + 1
  const newY = Math.floor(index / WIDTH) - 1
  return newY < 0 || newX >= WIDTH ? index : newY * WIDTH + newX
}

export const swap = (grid: Pixel[], a: number, b: number) => {
  const temp = grid[a]
  grid[a] = grid[b]
  grid[b] = temp
}