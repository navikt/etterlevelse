import {intl} from "./intl/intl";

const start = (prefix: string) => (text: string) => {
  const startIndex = text.indexOf(prefix.toLowerCase())
  return startIndex < 0 ? Number.MAX_VALUE : startIndex
}

export const prefixBiasedSort: (prefix: string, a: string, b: string) => number = (prefix, a, b) => {
  const comp = start(prefix)
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()
  const c1 = comp(aLower) - comp(bLower)
  return c1 === 0 ? aLower.localeCompare(bLower, intl.getLanguage()) : c1
}
