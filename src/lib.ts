export const randomFromArray = <T>(a: T[]): T =>
  a[Math.floor(Math.random() * a.length)]

export const uniq = <T>(a: T[]): T[] => {
  const set = new Set<T>()
  for (const item of a) {
    set.add(item)
  }
  return [...set.values()]
}
