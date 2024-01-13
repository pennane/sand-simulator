export const randomFromArray = <T>(a: T[]): T =>
  a[Math.floor(Math.random() * a.length)]
