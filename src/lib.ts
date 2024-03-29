export const randomFromArray = <T>(a: T[]): T =>
  a[Math.floor(Math.random() * a.length)]

export const uniq = <T>(a: T[]): T[] => {
  const set = new Set<T>()
  for (const item of a) {
    set.add(item)
  }
  return [...set.values()]
}

export const shuffle = <T>(arr: T[]) => {
  const newArr = arr.slice()
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[rand]] = [newArr[rand], newArr[i]]
  }
  return newArr
}

export const randomBetween = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
